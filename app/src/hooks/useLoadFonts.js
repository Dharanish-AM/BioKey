import { useFonts } from "expo-font";

const useCustomFonts = () => {
  const [fontsLoaded] = useFonts({
    "Afacad-Regular": require("../assets/fonts/Afacad-Regular.ttf"),
    "Afacad-Medium": require("../assets/fonts/Afacad-Medium.ttf"),
    "Afacad-SemiBold": require("../assets/fonts/Afacad-SemiBold.ttf"),
    "Afacad-Bold": require("../assets/fonts/Afacad-Bold.ttf"),
    "Afacad-Italic": require("../assets/fonts/Afacad-Italic.ttf"),
    "Afacad-MediumItalic": require("../assets/fonts/Afacad-MediumItalic.ttf"),
    "Afacad-SemiBoldItalic": require("../assets/fonts/Afacad-SemiBoldItalic.ttf"),
    "Afacad-BoldItalic": require("../assets/fonts/Afacad-BoldItalic.ttf"),
  });

  return fontsLoaded;
};

export default useCustomFonts;
