import React, { useEffect, useState } from "react";
import { View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSelector, useDispatch } from "react-redux";
import { setAuthState, setUser } from "../redux/actions";
import DrawerNavigator from "./DrawerNavigator";
import { AuthStack, NewUserStack } from "./StackNavigator";
import { checkTokenIsValid } from "../services/authOperations";
import SpinnerOverlay from "../components/SpinnerOverlay";
import { loadUser } from "../services/userOperations";

export default function AppNavigator() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);

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
