import { View, Image, Platform } from "react-native";
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { moderateScale } from "react-native-size-matters";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";

import { FoldersStack, HomeStack, SettingsStack } from "./StackNavigator";
import colors from "../constants/colors";

import HomeIcon from "../assets/images/home_icon.png";
import FolderIcon from "../assets/images/folder_icon.png";
import SettingsIcon from "../assets/images/settings_icon.png";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="HomeStack"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarIcon: ({ focused, color, size }) => {
          let icon;

          if (route.name === "HomeStack") {
            icon = focused ? HomeIcon : HomeIcon;
          } else if (route.name === "FoldersStack") {
            icon = focused ? FolderIcon : FolderIcon;
          } else if (route.name === "SettingsStack") {
            icon = focused ? SettingsIcon : SettingsIcon;
          }

          return (
            <View
              style={{
                width: wp("13%"),
                aspectRatio: 1,
                borderRadius: wp("7%"),
                backgroundColor: focused ? colors.darkColor : "transparent",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Image
                source={icon}
                style={{
                  width: "70%",
                  height: "70%",
                  tintColor: focused ? colors.textColor3 : color,
                }}
              />
            </View>
          );
        },
        tabBarHideOnKeyboard: true,
        lazy: true,
      })}
    >
      <Tab.Screen
        name="HomeStack"
        component={HomeStack}
        options={({ route }) => ({
          tabBarStyle: {
            display: getTabBarDisplay(route),
            backgroundColor: colors.lightColor2,
            borderTopColor: "transparent",
            borderTopWidth: 0,
            height: Platform.OS === "android" ? hp("7.5%") : hp("10.5%"),
            paddingTop: Platform.OS === "android" ? hp("1.7%") : hp("2.2%"),
          },
        })}
      />
      <Tab.Screen
        name="FoldersStack"
        component={FoldersStack}
        options={({ route }) => ({
          tabBarStyle: {
            display: getTabBarDisplay(route),
            backgroundColor: colors.lightColor2,
            borderTopColor: "transparent",
            borderTopWidth: 0,
            height: Platform.OS === "android" ? hp("7.5%") : hp("10.5%"),
            paddingTop: Platform.OS === "android" ? hp("1.7%") : hp("2.2%"),
          },
        })}
      />
      <Tab.Screen
        name="SettingsStack"
        component={SettingsStack}
        options={({ route }) => ({
          tabBarStyle: {
            display: getTabBarDisplay(route),
            backgroundColor: colors.lightColor2,
            borderTopColor: "transparent",
            borderTopWidth: 0,
            height: Platform.OS === "android" ? hp("7.5%") : hp("10.5%"),
            paddingTop: Platform.OS === "android" ? hp("1.7%") : hp("2.2%"),
          },
        })}
      />
    </Tab.Navigator>
  );
}

const getTabBarDisplay = (route) => {
  const routeName = getFocusedRouteNameFromRoute(route);

  if (
    routeName === "PhotosScreen" ||
    routeName === "FilePreviewScreen" ||
    routeName === "VideosScreen" ||
    routeName === "AudiosScreen"
  ) {
    return "none";
  }
  return "flex";
};
