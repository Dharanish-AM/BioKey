import React, { useEffect, useState } from "react";
import { StyleSheet, View, StatusBar, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import colors from "./src/constants/Color";
import AppNavigator from "./navigation/AppNavigator";

export default function App() {
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(null);
  const [isNewUser, setIsNewUser] = useState(null);

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const isNew = await AsyncStorage.getItem("isNew");

        if (isNew === null) {
          setIsNewUser(true);
          setIsUserLoggedIn(false);
          await AsyncStorage.setItem("isNew", "false");
        } else {
          const isLoggedIn = await AsyncStorage.getItem("isLoggedIn");
          setIsUserLoggedIn(isLoggedIn === "true");
          setIsNewUser(false);
        }
      } catch (error) {
        console.error("Error retrieving user status:", error);
      }
    };

    checkUserStatus();
    // AsyncStorage.removeItem("isLoggedIn")
    // AsyncStorage.removeItem("isNew")
  }, []);

  if (isUserLoggedIn === null || isNewUser === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primaryColor} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar
        backgroundColor={colors.secondaryColor1}
        barStyle="light-content"
      />
      <View style={styles.container}>
        <SafeAreaView style={styles.innerContainer}>
          <NavigationContainer>
            <AppNavigator
              isNewUser={isNewUser}
              isUserLoggedIn={isUserLoggedIn}
            />
          </NavigationContainer>
        </SafeAreaView>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondaryColor1,
  },
  innerContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.secondaryColor1,
  },
});
