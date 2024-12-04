import React from "react";
import { NewUserStack, AuthStack } from "./StackNavigators";
import MainAppDrawer from "./DrawerNavigator";

const AppNavigator = ({ isNewUser, isUserLoggedIn }) => {
  if (isUserLoggedIn) {
    return <MainAppDrawer />;
  }

  if (isNewUser) {
    return <NewUserStack />;
  } else {
    return <AuthStack />;
  }
};

export default AppNavigator;
