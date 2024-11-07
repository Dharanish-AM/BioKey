import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  Image,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import Illustration from "../assets/svg/Illustration";
import Logo from "../assets/svg/Logo";
import CustomerCare from "../assets/svg/CustomerCare";
import colors from "../constants/Color";
import { check, request, PERMISSIONS, RESULTS } from "react-native-permissions";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const LandingScreen = ({ navigation }) => {
  const handleGetStarted = async () => {
    try {
      const permissions = [
        PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
        PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
        PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      ];

      if (Platform.OS === "android" && parseInt(Platform.Version, 10) < 31) {
        permissions.splice(0, 2);
      }

      const requestPermission = async (permission) => {
        const result = await check(permission);
        if (result !== RESULTS.GRANTED) {
          const requestResult = await request(permission);
          return requestResult === RESULTS.GRANTED;
        }
        return true;
      };

      for (const permission of permissions) {
        const isGranted = await requestPermission(permission);
        if (!isGranted) {
          Alert.alert(
            "Permission Required",
            `${permission} is needed to continue. Please allow this permission in your settings if denied.`
          );
          return;
        }
      }

      navigation.push("AuthScreen", { signup: true, login: false });
    } catch (error) {
      console.error("Permission error:", error);
      Alert.alert("Error", "Unable to request Bluetooth permissions.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.logocontainer}>
            <Image
              source={require("../assets/images/BioKey_Logo.png")}
              style={styles.logo}
            />
            <View style={styles.ltextcontainer}>
              <Text style={styles.logotext}>BioKey</Text>
            </View>
          </View>
          <View style={styles.customerCareContainer}>
            <Image
              source={require("../assets/images/support.png")}
              style={styles.customerCare}
            />
          </View>
        </View>
        <View style={styles.center}>
          <Illustration style={styles.Illustration} />
        </View>
        <View style={styles.bottom}>
          <Text style={styles.quotes}>
            “Your identity, your access, your security”
          </Text>

          <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
          <Text style={styles.terms}>Terms and Conditions apply</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.secondaryColor1,
  },
  container: {
    flex: 1,
    flexDirection: "column",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: hp("10%"),
    paddingHorizontal: wp("3%"),
    marginTop: hp("1%"),
  },
  logocontainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    width: "50%",
  },
  logo: {
    width: "40%",
    height: undefined,
    aspectRatio: 1,
  },
  ltextcontainer: {
    flexDirection: "column",
    alignItems: "flex-end",
    height: "100%",
    marginLeft: 6,
  },
  logotext: {
    fontSize: 36,
    fontFamily: "AfacadFlux-Bold",
    color: "#E0E3F8",
  },
  customerCareContainer: {
    justifyContent: "flex-end",
    alignItems: "flex-end",
    width: "50%",
    height: "100%",
    marginBottom: "1%",
  },
  customerCare: {
    width: "20%",
    height: undefined,
    aspectRatio: 1,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
    height: hp("59%"),
  },
  Illustration: {
    width: "95%",
    height: "100%",
  },
  bottom: {
    height: hp("25%"),
    width: wp("100%"),
    justifyContent: "space-evenly",
    alignItems: "center",
    flexDirection: "column",
    gap: 15,
  },
  quotes: {
    color: "#E0E3F8",
    fontFamily: "AfacadFlux-SemiBold",
    fontSize: 23,
  },
  button: {
    width: "60%",
    height: "25%",
    backgroundColor: colors.primaryColor,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontFamily: "AfacadFlux-Bold",
    fontSize: 24,
  },
  terms: {
    color: "#A6ADBA",
    fontFamily: "AfacadFlux-Medium",
    fontSize: 16,
  },
});

export default LandingScreen;
