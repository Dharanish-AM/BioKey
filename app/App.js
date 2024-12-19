import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AppNavigator from "./src/navigation/AppNavigator";

import useLoadFonts from "./src/hooks/useLoadFonts";
import colors from "./src/constants/colors";

export default function App() {
  const fontsLoaded = useLoadFonts();

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator
          style={{ alignSelf: "center" }}
          color={colors.primaryColor}
          size="large"
        />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" backgroundColor={colors.secondaryColor1} />
        <View style={styles.container}>
          <AppNavigator />
        </View>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.lightColor2,
  },
});
