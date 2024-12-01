import React from "react";
import { NewUserStack } from "./StackNavigators";
import AuthNavigator from "./AuthNavigator";
import TabNavigator from "./TabNavigator";

import { createStackNavigator } from "@react-navigation/stack";

const Stack = createStackNavigator();

const AppNavigator = ({ isNewUser, isUserLoggedIn }) => {
  return (
    <Stack.Navigator>
      {isNewUser ? (
        <Stack.Screen
          name="NewUserStack"
          options={{
            headerShown: false,
          }}
          component={NewUserStack}
        />
      ) : isUserLoggedIn ? (
        <Stack.Screen
          name="TabNavigator"
          options={{
            headerShown: false,
          }}
          component={TabNavigator}
        />
      ) : (
        <Stack.Screen
          name="AuthNavigator"
          options={{
            headerShown: false,
          }}
          component={AuthNavigator}
        />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
