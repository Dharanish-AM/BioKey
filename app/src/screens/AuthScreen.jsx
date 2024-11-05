import { useEffect, useState } from "react";
import { StyleSheet, StatusBar, ActivityIndicator } from "react-native";
import BluetoothOffView from "../components/BluetoothOffView";
import BluetoothScan from "../components/BluetoothScan";
import colors from "../constants/Color";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import BleManager from "react-native-ble-manager";

const AuthScreen = ({ navigation }) => {
  const [isBluetoothEnabled, setIsBluetoothEnabled] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const route = useRoute();

  const { login = false, signup = true } = route.params || {};

  useEffect(() => {
    if (signup === true && login === false) {
      setIsSignup(true);
    } else if (login === true && signup === false) {
      setIsSignup(false);
    } else if (login == null && signup == null) {
      setIsSignup(true);
    }

    const clearFirstSetup = async () => {
      await AsyncStorage.removeItem("hasLaunched");
    };

    const checkBluetooth = async () => {
      await BleManager.start({ showAlert: false });

      const state = await BleManager.checkState();
      if (state === "on") {
        setIsBluetoothEnabled(true);
      } else {
        setIsBluetoothEnabled(false);
      }
      setIsLoading(false);
    };

    checkBluetooth();

    //clearFirstSetup();
  }, [signup, login]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color={colors.primaryColor} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      {isBluetoothEnabled ? (
        <BluetoothScan signup={signup} navigation={navigation} />
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
