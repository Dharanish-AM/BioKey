import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import colors from "../constants/Color.js";
import Logo from "../assets/svg/Logo.js";
import CustomerCare from "../assets/svg/CustomerCare.js";
import { useEffect, useState } from "react";
import FingerprintScan from "../assets/svg/FingerprintScan.js";
import DeviceLogo from "../assets/svg/DeviceLogo.js";
import { SafeAreaView } from "react-native-safe-area-context";

const FingerprintLoginScanScreen = ({ navigation }) => {
  const [isSuccess, setIsSuccess] = useState(null);
  const [deviceDetails, setDeviceDetails] = useState({
    deviceName: "FINGY_4573676",
  });

  useEffect(() => {
    if (isSuccess == null) {
      return;
    } else if (isSuccess) {
      navigation.navigate("Success");
    } else {
      navigation.navigate("Failed");
    }
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.top}>
          <View style={styles.header}>
            <Logo style={styles.logo} />
            <CustomerCare style={styles.customerCare} />
          </View>
        </View>
        <View style={styles.center}>
          <Text style={styles.title}>Getting Your Fingerprint</Text>
          <View style={styles.scancontainer}>
            <Text style={styles.instructionText}>
              Place your finger on the sensor
            </Text>
            <FingerprintScan />
            <View style={styles.devicedetails}>
              <DeviceLogo style={styles.devicelogo} />
              <Text style={styles.devicename}>{deviceDetails.deviceName}</Text>
            </View>
          </View>
        </View>
        <View style={styles.bottom}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => [navigation.goBack()]}
          >
            <Text style={styles.buttonText}>Back</Text>
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
    alignItems: "center",
    backgroundColor: colors.secondaryColor1,
  },
  top: {
    width: "100%",
    height: "13%",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    height: "100%",
    paddingHorizontal: 15,
  },
  logo: {
    width: "50%",
    height: "70%",
  },
  customerCare: {
    width: "10%",
    height: "35%",
    marginTop: 40,
  },
  center: {
    height: "70%",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    gap: 80,
  },
  devicedetails: {
    height: "15%",
    backgroundColor: colors.lightColor2,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    borderRadius: 30,
    paddingHorizontal: 30,
    gap: 10,
  },
  devicelogo: {
    width: "20%",
    height: "100%",
  },
  devicename: {
    color: colors.textColor1,
    fontFamily: "AfacadFlux-Medium",
    fontSize: 16,
  },
  title: {
    fontSize: 32,
    color: colors.textColor1,
    fontFamily: "AfacadFlux-SemiBold",
  },
  scancontainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.lightColor1,
    borderRadius: 20,
    gap: 25,
    paddingHorizontal: 25,
    paddingVertical: 20,
  },
  instructionText: {
    fontSize: 24,
    color: colors.textColor1,
    fontFamily: "AfacadFlux-Medium",
  },
  terms: {
    fontSize: 18,
    width: "90%",
    color: colors.textColor2,
    fontFamily: "AfacadFlux-Medium",
    textAlign: "center",
  },
  bottom: {
    width: "100%",
    height: "17%",
    justifyContent: "center",
    alignItems: "center",
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
    fontSize: 22,
    fontFamily: "AfacadFlux-Bold",
  },
});

export default FingerprintLoginScanScreen;
