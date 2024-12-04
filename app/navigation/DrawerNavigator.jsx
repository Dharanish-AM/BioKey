import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import MainTabNavigator from "./TabNavigator";
import SideDrawer from "../src/components/SideDrawer";

import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import colors from "../src/constants/Color";

const Drawer = createDrawerNavigator();

function MainAppDrawer() {
  return (
    <Drawer.Navigator
      initialRouteName="MainTabs"
      screenOptions={{
        headerShown: false,
        swipeEnabled: false,
        drawerType: "front",
        overlayColor: "rgba(0, 0, 0, 0.5)",
        drawerStyle: {
          backgroundColor: colors.secondaryColor2,
          width: wp("75%"),
        },
        drawerPosition: "left",
      }}
      drawerContent={(props) => <SideDrawer {...props} />}
    >
      <Drawer.Screen name="MainTabs" component={MainTabNavigator} />
    </Drawer.Navigator>
  );
}

export default MainAppDrawer;
