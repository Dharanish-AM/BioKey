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
import AuthScreen from "../src/screens/AuthScreen";
import Dummy from "../src/components/Dummy";

const Stack = createStackNavigator();

export const NewUserStack = () => (
  <Stack.Navigator
    screenOptions={{ headerShown: false }}
    initialRouteName="LandingScreen"
  >
    <Stack.Screen name="LandingScreen" component={LandingScreen} />
    <Stack.Screen name="DevicePluginScreen" component={DevicePluginScreen} />
    <Stack.Screen name="FPScanningScreen" component={FPScanningScreen} />
    <Stack.Screen name="SuccessScreen" component={SuccessScreen} />
    <Stack.Screen name="FailureScreen" component={FailureScreen} />
  </Stack.Navigator>
);

export const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{ headerShown: false }}
    initialRouteName="AuthScreen"
  >
    <Stack.Screen name="AuthScreen" component={AuthScreen} />
  </Stack.Navigator>
);

//MAIN STACKS
export const HomeStack = () => (
  <Stack.Navigator
    screenOptions={{ headerShown: false }}
    initialRouteName="HomeScreen"
  >
    <Stack.Screen name="HomeScreen" component={HomeScreen} />
    <Stack.Screen name="Dummy" component={Dummy} />
  </Stack.Navigator>
);

export const FolderStack = () => (
  <Stack.Navigator
    screenOptions={{ headerShown: false }}
    initialRouteName="FolderScreen"
  >
    <Stack.Screen name="FolderScreen" component={FolderScreen} />
  </Stack.Navigator>
);

export const SettingsStack = () => (
  <Stack.Navigator
    screenOptions={{ headerShown: false }}
    initialRouteName="SettingsScreen"
  >
    <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
  </Stack.Navigator>
);
