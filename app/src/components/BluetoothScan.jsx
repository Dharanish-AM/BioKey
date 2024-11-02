import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import colors from "../constants/Color.js";
import DeviceLogo from "../assets/svg/DeviceLogo.js";
import BluetoothOff from "../assets/svg/BluetoothOff.js";
import Logo from "../assets/svg/Logo.js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Bluetooth from "../assets/svg/Bluetooth.js";
import CustomerCare from "../assets/svg/CustomerCare.js";
import UserForm from "./UserForm.jsx";

const BluetoothScan = ({ navigation }) => {
  const [foundDeviceDetails, setFoundDeviceDetails] = useState([
    { deviceName: "FINGY_4573676" },
  ]);
  const [isScanning, setIsScanning] = useState(true);
  const [selectedDevice, setDevice] = useState({});
  const [isDeviceFound, setIsDeviceFound] = useState(true);
  const [DeviceSelected, setDeviceSelected] = useState({});
  const [isShowForm, setIsShowForm] = useState(false);

  const handleDeviceSelect = (eachDevice) => {
    setDeviceSelected(eachDevice);
    setIsShowForm(true);
  };

  return (
    <View style={styles.container}>
      {isShowForm ? (
        <UserForm device={DeviceSelected} navigation={navigation} />
      ) : (
        <>
          <View style={styles.top}>
            <View style={styles.header}>
              <Logo style={styles.logo} />
              <CustomerCare style={styles.customerCare} />
            </View>
          </View>

          <View style={styles.center}>
            <View style={styles.scanning}>
              {isScanning && (
                <Text style={styles.title}>Scanning for devices . . .</Text>
              )}
              <View style={styles.bluetooth}>
                <Bluetooth />
              </View>
            </View>
            <View style={styles.devicecontainer}>
              <View style={styles.devices}>
                <Text style={styles.devicesfound}>Device Found</Text>
                {isDeviceFound ? (
                  foundDeviceDetails.map((eachDevice, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.deviceWrapper}
                      onPress={() => handleDeviceSelect(eachDevice)}
                    >
                      <View style={styles.device}>
                        <DeviceLogo />
                        <Text style={styles.deviceid}>
                          {eachDevice.deviceName}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={styles.nodevicefound}>No devices found!</Text>
                )}
              </View>
            </View>
          </View>

          <View style={styles.bottom}>
            <TouchableOpacity
              style={styles.button}
              // onPress={() => handleDeviceSelect(selectedDevice)}
            >
              <Text style={styles.buttonText}>Select Device</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    flexDirection: "column",
  },
  top: {
    height: "17%",
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
    height: "70%",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },
  scanning: {
    gap: 10,
    alignItems: "center",
    width: "100%",
  },
  devicecontainer: {
    width: "100%",
    height: "45%",
    justifyContent: "center",
    alignItems: "center",
  },
  devices: {
    width: "80%",
    height: "50%",
    backgroundColor: colors.lightColor1,
    borderRadius: 30,
    padding: 10,
    alignItems: "center",
    gap: 20,
  },
  devicesfound: {
    fontSize: 24,
    color: colors.textColor2,
    textDecorationLine: "underline",
    fontFamily: "AfacadFlux-SemiBold",
    alignContent: "center",
    justifyContent: "center",
  },
  deviceWrapper: {
    height: "100%",
    width: "100%",
    alignItems: "center",
  },
  device: {
    flexDirection: "row",
    width: "70%",
    height: "40%",
    backgroundColor: colors.lightColor2,
    borderRadius: 25,
    padding: 10,
    gap: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  nodevicefound: {
    fontSize: 20,
    color: colors.textColor3,
    fontFamily: "AfacadFlux-Medium",
  },
  deviceid: {
    fontSize: 17,
    color: colors.textColor3,
    fontFamily: "AfacadFlux-Medium",
  },
  title: {
    fontSize: 24,
    color: colors.textColor2,
    fontFamily: "AfacadFlux-SemiBold",
  },
  bluetooth: {
    paddingTop: 10,
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

export default BluetoothScan;
