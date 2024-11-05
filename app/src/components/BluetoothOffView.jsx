import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import BleManager from "react-native-ble-manager";
import colors from "../constants/Color";
import BluetoothOff from "../assets/svg/BluetoothOff";
import CustomerCare from "../assets/svg/CustomerCare.js";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const BluetoothOffView = ({ setBle }) => {
  const [isBleOn, setIsBleOn] = useState(false);

  const handleBleOn = async () => {
    try {
      await BleManager.enableBluetooth();
      console.log("Bluetooth is enabled");
      setIsBleOn(true);
      setBle(true); // Notify AuthScreen that BLE is now enabled
    } catch (error) {
      console.log("The user refused to enable Bluetooth: " + error);
      Alert.alert("Bluetooth", "Please enable Bluetooth to use this feature.");
    }
  };

  return (
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
        <View style={styles.bleoffcontainer}>
          <Image
            source={require("../assets/images/deactivate.png")}
            style={styles.bleoff}
          />
        </View>
        <Text style={styles.wtforble}>Waiting for bluetooth . . .</Text>
      </View>

      <View style={styles.bottom}>
        {!isBleOn ? (
          <TouchableOpacity style={styles.button} onPress={handleBleOn}>
            <Text style={styles.buttonText}>Turn on Bluetooth</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.buttonText}>Bluetooth is ON</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    width: wp("100%"),
    height: hp("100%"),
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
    width: wp("100%"),
    height: hp("70%"),
    justifyContent: "center",
    alignItems: "center",
  },
  bleoffcontainer: {
    backgroundColor: "rgba(166, 173, 186, 0.6)",
    width: wp("35%"),
    height: wp("35%"),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: wp("22.5%"),
  },
  bleoff: {
    width: "50%",
    height: "50%",
  },
  wtforble: {
    color: colors.textColor3,
    fontSize: 24,
    fontFamily: "AfacadFlux-Bold",
    marginTop: "5%",
  },
  bottom: {
    width: wp("100%"),
    height: hp("15%"),
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    width: "60%",
    height: "45%",
    backgroundColor: colors.primaryColor,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontFamily: "AfacadFlux-Bold",
  },
});

export default BluetoothOffView;
