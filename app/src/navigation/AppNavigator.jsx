import React, { useEffect, useState, useRef } from "react";
import { View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSelector, useDispatch } from "react-redux";
import { setAuthState, setUser } from "../redux/actions";
import DrawerNavigator from "./DrawerNavigator";
import { AuthStack, NewUserStack } from "./StackNavigator";
import { checkTokenIsValid } from "../services/authOperations";
import SpinnerOverlay from "../components/SpinnerOverlay";
import { loadUser } from "../services/userOperations";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

export default function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    registerForPushNotifications();

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("Foreground Notification Received:", notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("User Tapped Notification:", response);
      });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current,
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  const registerForPushNotifications = async () => {
    try {
      if (!Device.isDevice) {
        // Push notifications only work on physical devices
        return;
      }

      const existingToken = await AsyncStorage.getItem("expoPushToken");
      if (existingToken) {
        return;
      }

      const { status } = await Notifications.getPermissionsAsync();
      let finalStatus = status;

      if (status !== "granted") {
        const { status: newStatus } =
          await Notifications.requestPermissionsAsync();
        finalStatus = newStatus;
      }

      if (finalStatus !== "granted") {
        return;
      }

      const pushTokenData = await Notifications.getExpoPushTokenAsync();
      const token = pushTokenData?.data;
      if (token) {
        await AsyncStorage.setItem("expoPushToken", token);
      }
    } catch (error) {
      // Push notifications are optional - silently fail in development
      // This commonly fails in Expo Go due to EAS project ID issues
    }
  };

  useEffect(() => {
    const fetchAuthStatus = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        const storedIsNewUser = await AsyncStorage.getItem("isNewUser");

        if (storedIsNewUser === null) {
          setIsNewUser(true);
          await AsyncStorage.setItem("isNewUser", "false");
        } else {
          setIsNewUser(storedIsNewUser === "true");
        }

        if (token) {
          const response = await checkTokenIsValid(token);
          if (response.success) {
            // Set auth state FIRST so token is available in Redux for subsequent API calls
            dispatch(setAuthState(true, token));
            
            const user = await loadUser(response.user.userId);
            if (user) {
              dispatch(setUser(user));
            } else {
              dispatch(setAuthState(false, ""));
            }
          } else {
            dispatch(setAuthState(false, ""));
          }
        } else {
          dispatch(setAuthState(false, ""));
        }
      } catch (error) {
        console.error("Error loading auth state:", error);
        dispatch(setAuthState(false, ""));
      } finally {
        setLoading(false);
      }
    };

    fetchAuthStatus();
  }, [dispatch, isAuthenticated]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <SpinnerOverlay visible={loading} />
      </View>
    );
  }

  if (isNewUser && !isAuthenticated) {
    return <NewUserStack />;
  } else if (!isNewUser && isAuthenticated) {
    return <DrawerNavigator />;
  } else {
    return <AuthStack />;
  }
}
