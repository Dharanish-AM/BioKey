import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { HomeStack, FolderStack, SettingsStack } from "./StackNavigators";
import { StyleSheet } from "react-native";
import ProfileView from "../src/components/ProfileView";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

import Dummy from "../src/components/Dummy";
import colors from "../src/constants/Color";

const Drawer = createDrawerNavigator();

export const HomeDrawer = () => (
  <Drawer.Navigator
    initialRouteName="Home"
    screenOptions={{
      headerShown: false,
      swipeEnabled: false,
      drawerType: "front",
      overlayColor: "rgba(0, 0, 0, 0.5)",
      drawerStyle: {
        backgroundColor: colors.secondaryColor2,
        width: wp("70%"),
      },
      drawerPosition: "left",
    }}
    drawerContent={(props) => <ProfileView {...props} />}
  >
    <Drawer.Screen name="Home" component={HomeStack} />
  </Drawer.Navigator>
);

export const FolderDrawer = () => (
  <Drawer.Navigator
    initialRouteName="Folders"
    screenOptions={{
      headerShown: false,
    }}
    drawerContent={(props) => <ProfileView {...props} />}
  >
    <Drawer.Screen name="Folders" component={FolderStack} />
  </Drawer.Navigator>
);

export const SettingsDrawer = () => (
  <Drawer.Navigator
    initialRouteName="Settings"
    screenOptions={{
      headerShown: false,
    }}
    drawerContent={(props) => <ProfileView {...props} />}
  >
    <Drawer.Screen name="Settings" component={SettingsStack} />
  </Drawer.Navigator>
);

module.exports = {
  HomeDrawer,
  FolderDrawer,
  SettingsDrawer,
};
