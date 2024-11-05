import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import BleManager from "react-native-ble-manager";
import { NativeEventEmitter, NativeModules } from "react-native";
import colors from "../constants/Color.js";
import DeviceLogo from "../assets/svg/DeviceLogo.js";
import Bluetooth from "../assets/svg/Bluetooth.js";
import Logo from "../assets/svg/Logo.js";
import CustomerCare from "../assets/svg/CustomerCare.js";
import UserForm from "./UserForm.jsx";

const BluetoothScan = ({ navigation, signup }) => {
  const [foundDeviceDetails, setFoundDeviceDetails] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isShowForm, setIsShowForm] = useState(false);
  const [deviceSelected, setDeviceSelected] = useState({});
  const [loading, setLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const bleManagerEmitter = new NativeEventEmitter(NativeModules.BleManager);

  useEffect(() => {
    const initializeBleManager = async () => {
      setLoading(true);
      try {
        await BleManager.start({ showAlert: false });
        console.log("BLE Manager initialized");

        const bondedDevices = await BleManager.getBondedPeripherals();
        setFoundDeviceDetails((prevDevices) => [
          ...prevDevices,
          ...bondedDevices.map((device) => ({
            id: device.id,
            deviceName: device.name || "Unnamed Device (Paired)",
            rssi: device.rssi,
            paired: true,
          })),
        ]);

        scanForDevices();
      } catch (error) {
        console.error("BLE Manager initialization failed:", error);
        Alert.alert(
          "Error",
          "BLE Manager initialization failed. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    initializeBleManager();

    return () => {
      BleManager.stopScan();
      bleManagerEmitter.removeAllListeners("BleManagerDiscoverPeripheral");
    };
  }, []);

  const scanForDevices = async () => {
    if (isScanning) return;
    setIsScanning(true);
    setLoading(true);

    try {
      await BleManager.scan([], 5, true);
      console.log("Scanning...");

      bleManagerEmitter.addListener(
        "BleManagerDiscoverPeripheral",
        handleDiscoverPeripheral
      );

      setTimeout(() => {
        setIsScanning(false);
        BleManager.stopScan();
        setLoading(false);
      }, 6000);
    } catch (error) {
      console.error("Scanning failed:", error);
      Alert.alert("Error", "Scanning failed. Please check Bluetooth settings.");
      setIsScanning(false);
      setLoading(false);
    }
  };

  const handleDiscoverPeripheral = (peripheral) => {
    if (peripheral && peripheral.id) {
      setFoundDeviceDetails((prevDevices) => {
        const alreadyExists = prevDevices.find(
          (device) => device.id === peripheral.id
        );
        if (!alreadyExists) {
          return [
            ...prevDevices,
            {
              id: peripheral.id,
              deviceName: peripheral.name || "Unnamed Device",
              rssi: peripheral.rssi,
              paired: false,
            },
          ];
        }
        return prevDevices;
      });
    }
  };

  useEffect(() => {
    if (!isScanning) {
      setLoading(false);
    }
  }, [isScanning]);

  const handleDeviceSelect = (eachDevice) => {
    console.log("Selected device:", eachDevice);
    setDeviceSelected({
      id: eachDevice.id,
      deviceName: eachDevice.deviceName,
      rssi: eachDevice.rssi,
    });

    connectToDevice(eachDevice.id);
  };

  const connectToDevice = async (deviceId) => {
    try {
      setIsConnecting(true);
      console.log(`Attempting to connect to device ${deviceId}`);

      await BleManager.connect(deviceId);
      console.log(`Connected to device ${deviceId}`);
    } catch (error) {
      console.error("Failed to connect:", error);
      Alert.alert("Connection Error", error.message || "Unknown error.");
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <View style={styles.container}>
      {isShowForm ? (
        <UserForm device={deviceSelected} navigation={navigation} />
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
              <Text style={styles.title}>
                {isScanning
                  ? "Scanning for devices . . ."
                  : "Scanning Stopped!"}
              </Text>
              <View style={styles.bluetooth}>
                <Bluetooth style={styles.blescan} />
              </View>
            </View>
            <View style={styles.deviceContainer}>
              <View style={styles.devices}>
                <Text style={styles.devicesFound}>Devices</Text>
                {loading ? (
                  <ActivityIndicator size="large" color={colors.primaryColor} />
                ) : (
                  <ScrollView style={styles.scrollView}>
                    {foundDeviceDetails.length > 0 ? (
                      foundDeviceDetails.map((eachDevice, index) => (
                        <TouchableOpacity
                          key={`${eachDevice.id}-${index}`}
                          style={styles.deviceWrapper}
                          onPress={() => handleDeviceSelect(eachDevice)}
                          disabled={isConnecting}
                        >
                          <View style={styles.device}>
                            <DeviceLogo />
                            <Text style={styles.deviceId}>
                              {eachDevice.deviceName}{" "}
                              {eachDevice.paired ? "(Paired)" : ""}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))
                    ) : isScanning ? (
                      <View style={styles.loadingIndicator}>
                        <ActivityIndicator
                          size="large"
                          color={colors.primaryColor}
                        />
                      </View>
                    ) : (
                      <Text style={styles.noDeviceFound}>
                        No devices found!
                      </Text>
                    )}
                  </ScrollView>
                )}
              </View>
            </View>
          </View>

          <View style={styles.bottom}>
            <TouchableOpacity style={styles.button} onPress={scanForDevices}>
              <Text style={styles.buttonText}>Retry</Text>
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
    justifyContent: "flex-start",
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
    width: "85%",
    height: "70%",
  },
  customerCare: {
    marginTop: 30,
    height: 35,
    width: 35,
  },
  center: {
    flex: 1,
    justifyContent: "space-evenly",
    alignItems: "center",
    width: "100%",
    flexDirection: "column",
    paddingTop: "5%",
  },
  scanning: {
    gap: 10,
    alignItems: "center",
    width: "100%",
  },
  deviceContainer: {
    width: "100%",
    height: "45%",
    justifyContent: "center",
    alignItems: "center",
  },
  devices: {
    width: "85%",
    height: "73%",
    backgroundColor: colors.lightColor1,
    borderRadius: 20,
    padding: 15,
    alignItems: "center",
  },
  scrollView: {
    width: "100%",
    paddingTop: "5%",
  },
  devicesFound: {
    fontSize: 22,
    color: colors.textColor2,
    textDecorationLine: "underline",
    fontFamily: "AfacadFlux-SemiBold",
    textAlign: "center",
  },
  deviceWrapper: {
    width: "100%",
    marginBottom: 10,
  },
  device: {
    flexDirection: "row",
    backgroundColor: colors.lightColor2,
    borderRadius: 15,
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  noDeviceFound: {
    fontSize: 20,
    color: colors.textColor3,
    fontFamily: "AfacadFlux-Medium",
    textAlign: "center",
    marginTop: 20,
  },
  loadingIndicator: {
    alignItems: "center",
    justifyContent: "center",
    height: 100,
    width: "100%",
  },
  deviceId: {
    fontSize: 16,
    color: colors.textColor1,
    fontFamily: "AfacadFlux-Regular",
  },
  bottom: {
    height: "15%",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  button: {
    backgroundColor: colors.primaryColor,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  buttonText: {
    fontSize: 18,
    color: "white",
    fontFamily: "AfacadFlux-SemiBold",
  },
  title: {
    fontSize: 20,
    color: colors.textColor1,
    fontFamily: "AfacadFlux-Bold",
  },
  bluetooth: {
    marginVertical: 10,
  },
  blescan: {
    width: 50,
    height: 50,
  },
});

export default BluetoothScan;
