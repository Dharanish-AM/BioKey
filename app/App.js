import React from "react";
import { StyleSheet, Text, View, StatusBar } from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { enableScreens } from "react-native-screens";

import LandingScreen from "./src/screens/LandingScreen";
import colors from "./src/constants/Color";
import DevicePlugin from "./src/screens/DevicePlugin";
import AuthScreen from "./src/screens/AuthScreen";
import FPScanningScreen from "./src/screens/FpScanningScreen";
import SuccessScreen from "./src/screens/SuccessScreen";
import FailureScreen from "./src/screens/FailureScreen";

enableScreens();
const Stack = createStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <View style={styles.OuterContainer}>
        <SafeAreaView style={styles.InnerContainer}>
          <NavigationContainer>
            <Stack.Navigator initialRouteName="LandingScreen">
              <Stack.Screen
                name="LandingScreen"
                component={LandingScreen}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="DevicePluginScreen"
                component={DevicePlugin}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="AuthScreen"
                component={AuthScreen}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="FPScanningScreen"
                component={FPScanningScreen}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="SuccessScreen"
                component={SuccessScreen}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="FailureScreen"
                component={FailureScreen}
                options={{
                  headerShown: false,
                }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </SafeAreaView>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  OuterContainer: {
    flex: 1,
    backgroundColor: colors.secondaryColor2,
  },
  InnerContainer: {
    flex: 1,
  },
});
