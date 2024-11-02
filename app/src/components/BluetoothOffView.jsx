import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import colors from "../constants/Color";
import BluetoothOff from "../assets/svg/BluetoothOff";
import Logo from "../assets/svg/Logo";
import CustomerCare from "../assets/svg/CustomerCare.js";
import { useState } from "react";

const BluetoothOffView = ({ setBle }) => {
  const [isBleOn, setIsBleOn] = useState(null);

  function handleBleOn() {
    console.log("Bluetooth is on");
    setIsBleOn(true);
    setBle(true);
  }

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <View style={styles.header}>
          <Logo style={styles.logo} />
          <CustomerCare style={styles.customerCare} />
        </View>
      </View>

      <View style={styles.center}>
        <BluetoothOff />
      </View>

      <View style={styles.bottom}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText} onPress={handleBleOn}>
            Turn on Bluetooth
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: "100%",
    width: "100%",
    alignItems: "center",
    flexDirection: "column",
  },
  top: {
    height: "12%",
    justifyContent: "start",
    alignItems: "center",
    width: "100%",
  },
  header: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    height: "100%",
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
    width: "100%",
    height: "75%",
    justifyContent: "center",
    alignItems: "center",
  },
  bottom: {
    width: "100%",
    height: "10%",
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

export default BluetoothOffView;
