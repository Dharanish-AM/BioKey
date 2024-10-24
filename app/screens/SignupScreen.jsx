import { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import * as SecureStore from "expo-secure-store";
import { SafeAreaView } from "react-native-safe-area-context";
import colors from "../constants/Color";
import BluetoothOff from "../assets/svg/BluetoothOff";
import Logo from "../assets/svg/Logo";
import CustomerCare from "../assets/svg/CustomerCare";
import { StatusBar } from "expo-status-bar";

const SignupScreen = () => {
  useEffect(() => {
    //SecureStore.deleteItemAsync("hasLaunched");
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
    <StatusBar style="light" />
      <View style={styles.container}>
        <View style={styles.top}>
          <View style={styles.header}>
            <Logo style={styles.logo} />
            <CustomerCare style={styles.customerCare} />
          </View>
        </View>
        <View style={styles.center}>
          <View style={styles.BluetoothOff}>
            <BluetoothOff />
          </View>
        </View>
        <View style={styles.bottom}>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Turn on bluetooth</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.secondaryColor1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "",
    width: "100%",
    height: "100%",
    flexDirection: "column",
  },
  top: {
    justifyContent: "center",
    alignItems: "center",
    height: "17%",
  },
  header: {
    flexDirection: "row",
    width: "95%",
    height: "95%",
    paddingLeft: 3,
    paddingRight: 3,
    justifyContent: "space-between",
    alignContent: "center",
    alignItems: "center",
  },
  logo: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "50%",
    height: "70%",
  },
  customerCare: {
    flex: 1,
    alignItems: "flex-end",
    alignSelf: "center",
    justifyContent: "center",
    width: "10%",
    height: "35%",
    marginTop: 40,
  },
  center: {
    width: "100%",
    height: "60%",
    justifyContent: "center",
    alignItems: "center",
  },
  bottom: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "30%",
  },
  button: {
    width: 250,
    height: 50,
    backgroundColor: colors.primaryColor,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontFamily: "AfacadFluxBold",
    fontSize: 22,
  },
});

export default SignupScreen;
