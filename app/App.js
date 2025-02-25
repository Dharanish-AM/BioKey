import { NavigationContainer } from "@react-navigation/native";
import "setimmediate"
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import AppNavigator from "./src/navigation/AppNavigator";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { enableFreeze } from "react-native-screens";
import Toast from 'react-native-toast-message';
import toastConfig from './toastConfig';

import useLoadFonts from "./src/hooks/useLoadFonts";
import colors from "./src/constants/colors";
import store from "./src/redux/store";

enableFreeze(true);

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
    <GestureHandlerRootView>
      <SafeAreaProvider>
        <Provider store={store}>
          <NavigationContainer>
            <StatusBar style="light" backgroundColor={colors.secondaryColor1} />
            <View style={styles.container}>
              <AppNavigator />
            </View>
            <Toast config={toastConfig} />
          </NavigationContainer>
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
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
