import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import LandingScreen from "../src/screens//LandingScreen";
import HomeScreen from "../src/screens/HomeScreen";
import FolderScreen from "../src/screens/FolderScreen";
import SettingsScreen from "../src/screens/SettingsScreen";
import DevicePluginScreen from "../src/screens/DevicePlugin";
import FPScanningScreen from "../src/screens/FpScanningScreen";
import SuccessScreen from "../src/screens/SuccessScreen";
import FailureScreen from "../src/screens/FailureScreen";
import Dummy from "../src/components/Dummy";

const Stack = createStackNavigator();

export const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HomeScreen" component={HomeScreen} />
    <Stack.Screen name="Dummy" component={Dummy} />
  </Stack.Navigator>
);

export const FolderStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="FolderScreen" component={FolderScreen} />
  </Stack.Navigator>
);

export const SettingsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
  </Stack.Navigator>
);

export const NewUserStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="LandingScreen" component={LandingScreen} />
    <Stack.Screen name="DevicePluginScreen" component={DevicePluginScreen} />
    <Stack.Screen name="FPScanningScreen" component={FPScanningScreen} />
    <Stack.Screen name="SuccessScreen" component={SuccessScreen} />
    <Stack.Screen name="FailureScreen" component={FailureScreen} />
  </Stack.Navigator>
);
