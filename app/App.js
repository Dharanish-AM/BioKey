import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LandingScreen from "./screens/LandingScreen";
import SignupScreen from "./screens/SignupScreen";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { useFonts } from "expo-font";
import colors from "./constants/Color";

const Stack = createNativeStackNavigator();

export default function App() {
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);
  const [fontsLoaded] = useFonts({
    AfacadFluxBlack: require("./assets/fonts/AfacadFlux-Black.ttf"),
    AfacadFluxBold: require("./assets/fonts/AfacadFlux-Bold.ttf"),
    AfacadFluxExtraBold: require("./assets/fonts/AfacadFlux-ExtraBold.ttf"),
    AfacadFluxExtraLight: require("./assets/fonts/AfacadFlux-ExtraLight.ttf"),
    AfacadFluxLight: require("./assets/fonts/AfacadFlux-Light.ttf"),
    AfacadFluxMedium: require("./assets/fonts/AfacadFlux-Medium.ttf"),
    AfacadFluxRegular: require("./assets/fonts/AfacadFlux-Regular.ttf"),
    AfacadFluxSemiBold: require("./assets/fonts/AfacadFlux-SemiBold.ttf"),
    AfacadFluxThin: require("./assets/fonts/AfacadFlux-Thin.ttf"),
  });

  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        const hasLaunched = await SecureStore.getItemAsync("hasLaunched");
        if (hasLaunched === null) {
          await SecureStore.setItemAsync("hasLaunched", "true");
          setIsFirstLaunch(true);
        } else {
          setIsFirstLaunch(false);
        }
      } catch (error) {
        console.error("Error checking first launch:", error);
      }
    };

    checkFirstLaunch();
  }, []);

  if (isFirstLaunch === null || !fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.primaryColor} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={isFirstLaunch ? "Landing" : "Signup"}>
        <Stack.Screen
          name="Landing"
          component={LandingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Signup"
          component={SignupScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
