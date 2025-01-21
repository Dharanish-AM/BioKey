import { View, Text } from "react-native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import TabNavigator from "./TabNavigator";
import {
  widthPercentageToDP,
  heightPercentageToDP,
} from "react-native-responsive-screen";
import colors from "../constants/colors";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import DrawerView from "../components/DrawerView";
import Notifications from "../screens/main/drawer/Notifications";
import MapView from "react-native-maps";

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {

  
  return (
    <Drawer.Navigator
      initialRouteName="TabNavigator"
      drawerContent={(props) => <DrawerView {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: "front",

        drawerPosition: "left",
        drawerStyle: {
          backgroundColor: "transparent",
          width: widthPercentageToDP("70%"),
        },
        overlayColor: "rgba(0,0,0,0.5)",
        drawerLockMode: "unlocked",
        keyboardDismissMode: "on-drag",
        backBehavior: "history",
      }}
    >
      <Drawer.Screen name="TabNavigator" component={TabNavigator} />
      <Drawer.Screen name="ActivityLogs" component={MapView} />
      <Drawer.Screen name="Notifications" component={Notifications} />
    </Drawer.Navigator>
  );
}
