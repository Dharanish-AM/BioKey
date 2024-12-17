import { View, Text } from "react-native";
import React from "react";
import DrawerNavigator from "./DrawerNavigator";
import { AuthStack, NewUserStack } from "./StackNavigator";

const isNewUser = false;
const isLoggedIn = true;

export default function AppNavigator() {
  if (isNewUser == true && isLoggedIn == false) {
    return <NewUserStack />;
  } else {
    return <DrawerNavigator />;
  }
}
