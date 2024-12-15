import { useFonts } from "expo-font";

export const useLoadFonts = () => {
  const [fontsLoaded] = useFonts({
    "Afacad-Bold": require("../assets/fonts/Afacad-Bold.ttf"),
    "Afacad-BoldItalic": require("../assets/fonts/Afacad-BoldItalic.ttf"),
    "Afacad-Italic": require("../assets/fonts/Afacad-Italic.ttf"),
    "Afacad-Medium": require("../assets/fonts/Afacad-Medium.ttf"),
    "Afacad-MediumItalic": require("../assets/fonts/Afacad-MediumItalic.ttf"),
    "Afacad-Regular": require("../assets/fonts/Afacad-Regular.ttf"),
    "Afacad-SemiBold": require("../assets/fonts/Afacad-SemiBold.ttf"),
    "Afacad-SemiBoldItalic": require("../assets/fonts/Afacad-SemiBoldItalic.ttf"),
  });

  return fontsLoaded;
};
