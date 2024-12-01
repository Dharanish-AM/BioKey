import React from "react";
import { useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { HomeDrawer, FolderDrawer, SettingsDrawer } from "./DrawerNavigator";
import colors from "../src/constants/Color";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Image, View, Animated } from "react-native";

import HomeIcon from "../src/assets/images/home.png";
import FolderIcon from "../src/assets/images/folder.png";
import SettingsIcon from "../src/assets/images/settings.png";

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const [hideTabBar, setHideTabBar] = useState(false);

  const handleDrawerShow = (i) => {
    setHideTabBar(i);
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.lightColor2,
          height: hp("8%"),
          borderTopWidth: 0,
          elevation: 0,
          alignItems: "center",
          flexDirection: "row",
          display: hideTabBar ? "none" : "flex",
        },

        tabBarIcon: ({ focused }) => {
          let iconSource;
          const scale = new Animated.Value(focused ? 1.1 : 1);

          if (route.name === "HomeTab") {
            iconSource = HomeIcon;
          } else if (route.name === "FolderTab") {
            iconSource = FolderIcon;
          } else if (route.name === "SettingsTab") {
            iconSource = SettingsIcon;
          }

          Animated.spring(scale, {
            toValue: focused ? 1.1 : 1,
            useNativeDriver: true,
            friction: 3,
            tension: 80,
          }).start();

          return (
            <View
              style={{
                width: wp("13%"),
                aspectRatio: 1,
                borderRadius: wp("6.5%"),
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: focused ? colors.darkColor : "transparent",
              }}
            >
              <Animated.Image
                source={iconSource}
                style={{
                  height: hp("4%"),
                  aspectRatio: 1,
                  tintColor: focused ? colors.textColor3 : colors.textColor2,
                  transform: [{ scale }],
                }}
              />
            </View>
          );
        },
        tabBarShowLabel: false,
        tabBarActiveTintColor: "#6200EE",
        tabBarInactiveTintColor: "#A8A8A8",
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeDrawer} />
      <Tab.Screen name="FolderTab" component={FolderDrawer} />
      <Tab.Screen name="SettingsTab" component={SettingsDrawer} />
    </Tab.Navigator>
  );
};

export default TabNavigator;
