import { useEffect, useState } from "react";
import { StyleSheet, StatusBar } from "react-native";
import BluetoothOffView from "../components/BluetoothOffView";
import BluetoothScan from "../components/BluetoothScan";
import colors from "../constants/Color";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRoute } from "@react-navigation/native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

const AuthScreen = ({ navigation }) => {
  const [isBluetoothEnabled, setIsBluetoothEnabled] = useState(false);
  const [isSignup, setIsSignup] = useState(null);
  const route = useRoute();
  const { signup } = route.params;

  useEffect(() => {
    if (signup === true) {
      setIsSignup(true);
    }
    const clearFirstSetup = async () => {
      await AsyncStorage.removeItem("hasLaunched");
    };
    //clearFirstSetup();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      {isBluetoothEnabled ? (
        <BluetoothScan navigation={navigation} />
      ) : (
        <BluetoothOffView
          setBle={(x) => {
            setIsBluetoothEnabled(x);
          }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.secondaryColor1,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default AuthScreen;
