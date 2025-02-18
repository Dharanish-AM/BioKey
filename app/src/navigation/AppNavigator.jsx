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


    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log("Foreground Notification Received:", notification);
    });


    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log("User Tapped Notification:", response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  const registerForPushNotifications = async () => {
    try {
      if (!Device.isDevice) {
        console.log("Must use a physical device for push notifications");
        return;
      }


      const existingToken = await AsyncStorage.getItem("expoPushToken");
      if (existingToken) {
        console.log("Push token already exists:", existingToken);
        return;
      }

      const { status } = await Notifications.getPermissionsAsync();
      let finalStatus = status;

      if (status !== "granted") {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        finalStatus = newStatus;
      }

      if (finalStatus !== "granted") {
        console.log("Push notifications permission denied");
        return;
      }


      const pushTokenData = await Notifications.getExpoPushTokenAsync();
      console.log("Full Token Data:", pushTokenData);

      const token = pushTokenData?.data;
      if (!token) {
        console.log("Failed to retrieve push token");
        return;
      }

      console.log("Expo Push Token:", token);
      await AsyncStorage.setItem("expoPushToken", token);


    } catch (error) {
      console.error("Error registering for push notifications:", error);
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
            const user = await loadUser(response.user.userId);
            if (user) {
              dispatch(setUser(user));
              dispatch(setAuthState(true, token));
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
  }, [dispatch]);

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
