import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import AuthScreen from "../src/screens/AuthScreen";

const Stack = createStackNavigator();

const AuthNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AuthScreen" component={AuthScreen} />
  </Stack.Navigator>
);

export default AuthNavigator;
