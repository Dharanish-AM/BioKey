import { View, ActivityIndicator } from "react-native";
import React, { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DrawerNavigator from "./DrawerNavigator";
import { AuthStack, NewUserStack } from "./StackNavigator";

export default function AppNavigator() {
  const [isNewUser, setIsNewUser] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuthStatus = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        const newUser = await AsyncStorage.getItem("isNewUser");

        setIsLoggedIn(!!token);
        setIsNewUser(newUser === "true");
      } catch (error) {
        console.error("Error fetching auth status:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAuthStatus();
  }, []);


  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (isNewUser && !isLoggedIn) {
    return <NewUserStack />;
  } else if (!isNewUser && isLoggedIn) {
    return <DrawerNavigator />;
  } else {
    return <AuthStack />;
  }
}
