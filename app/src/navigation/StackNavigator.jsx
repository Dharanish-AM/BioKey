import { View, Text } from "react-native";
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import LandingScreen from "../screens/auth/LandingScreen";
import AuthScreen from "../screens/auth/AuthScreen";
import DevicePairingScreen from "../screens/auth/DevicePairingScreen";
import FingerprintScanScreen from "../screens/auth/FingerprintScanScreen";
import SuccessScreen from "../screens/auth/SuccessScreen";
import FailureScreen from "../screens/auth/FailureScreen";

import HomeScreen from "../screens/main/HomeScreen";
import FoldersScreen from "../screens/main/FoldersScreen";
import SettingsScreen from "../screens/main/SettingsScreen";
import PhotosScreen from "../screens/main/media/PhotosScreen";
import VideosScreen from "../screens/main/media/VideosScreen";
import AudiosScreen from "../screens/main/media/AudiosScreen";
import OthersScreen from "../screens/main/media/OthersScreen";
import FilePreviewScreen from "../screens/main/helper/FilePreview";
import PasswordsScreen from "../screens/main/media/PasswordsScreen";
import PasswordPreview from "../screens/main/helper/PasswordPreview";
import UserFormScreen from "../screens/auth/UserFormScreen";
import FavouritesScreen from "../screens/main/media/FavouriteScreen";
import FolderPreviewScreen from "../screens/main/helper/FolderPreviewScreen";
import RecycleBin from "../screens/main/utility/RecycleBin";
import ManageStorage from "../screens/main/helper/ManageStorage";
import LoginCreds from "../screens/auth/LoginCreds";
import Support from "../screens/main/helper/Support";
import AppPreferences from "../screens/main/helper/AppPreferences";
import SecPri from "../screens/main/helper/SecPri";

const Stack = createStackNavigator();

function NewUserStack() {
  return (
    <Stack.Navigator initialRouteName="LandingScreen">
      <Stack.Screen
        name="LandingScreen"
        component={LandingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="UserFormScreen"
        component={UserFormScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DevicePairingScreen"
        component={DevicePairingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="FingerprintScanScreen"
        component={FingerprintScanScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SuccessScreen"
        component={SuccessScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="FailureScreen"
        component={FailureScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="LoginCreds"
        component={LoginCreds}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AuthScreen"
        component={AuthScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SupportScreen"
        component={Support}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator initialRouteName="AuthScreen">
      <Stack.Screen
        name="AuthScreen"
        component={AuthScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="LoginCreds"
        component={LoginCreds}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DevicePairingScreen"
        component={DevicePairingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="UserFormScreen"
        component={UserFormScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="FingerprintScanScreen"
        component={FingerprintScanScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SuccessScreen"
        component={SuccessScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="FailureScreen"
        component={FailureScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SupportScreen"
        component={Support}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

function HomeStack() {
  return (
    <Stack.Navigator
      initialRouteName="HomeScreen"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="PhotosScreen" component={PhotosScreen} />
      <Stack.Screen name="FilePreviewScreen" component={FilePreviewScreen} />
      <Stack.Screen name="VideosScreen" component={VideosScreen} />
      <Stack.Screen name="AudiosScreen" component={AudiosScreen} />
      <Stack.Screen name="OthersScreen" component={OthersScreen} />
      <Stack.Screen name="PasswordsScreen" component={PasswordsScreen} />
      <Stack.Screen name="PasswordPreview" component={PasswordPreview} />
      <Stack.Screen name="FavouritesScreen" component={FavouritesScreen} />
      <Stack.Screen name="RecycleBin" component={RecycleBin} />
      <Stack.Screen name="ManageStorage" component={ManageStorage} />
    </Stack.Navigator>
  );
}

function FoldersStack() {
  return (
    <Stack.Navigator
      initialRouteName="FoldersScreen"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="FoldersScreen" component={FoldersScreen} />
      <Stack.Screen name="FolderPreviewScreen" component={FolderPreviewScreen} />
      <Stack.Screen name="FilePreviewScreen" component={FilePreviewScreen} />
    </Stack.Navigator>
  );
}

function SettingsStack() {
  return (
    <Stack.Navigator
      initialRouteName="SettingsScreen"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
      <Stack.Screen name="AppPreferences" component={AppPreferences} />
      <Stack.Screen name="SecurityPrivacy" component={SecPri} />
      <Stack.Screen name="Support" component={Support} />
    </Stack.Navigator>
  );
}

export { NewUserStack, AuthStack, HomeStack, FoldersStack, SettingsStack };
