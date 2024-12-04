import React, { useEffect, useState } from "react";
import { StyleSheet, View, StatusBar, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import { checkUserStatus } from "./utils/userStatus";
import AppNavigator from "./navigation/AppNavigator";
import colors from "./src/constants/Color";

export default function App() {
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(null);
  const [isNewUser, setIsNewUser] = useState(null);

  useEffect(() => {
    const getUserStatus = async () => {
      const { isUserLoggedIn, isNewUser } = await checkUserStatus();
      setIsUserLoggedIn(isUserLoggedIn);
      setIsNewUser(isNewUser);
    };

    getUserStatus();
  }, [isUserLoggedIn, isNewUser]);

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
