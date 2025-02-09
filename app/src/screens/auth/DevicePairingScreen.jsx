import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  Button,
  TextInput
} from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import colors from "../../constants/colors";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

import FingyIcon from "../../assets/images/FINGY.png";
import Logo from "../../assets/images/BioKey_Logo.png";
import SupportIcon from "../../assets/images/support_icon.png";
import { checkTokenIsValid, loginFp, registerUser } from "../../services/authOperations";
import { loadUser } from "../../services/userOperations";
import { setAuthState, setUser } from "../../redux/actions";
import Toast from "react-native-toast-message";

export default function DevicePairingScreen({ navigation, route }) {
  const form = route.params?.form || null;
  const type = route.params?.type || "";

  const [isConnected, setIsConnected] = useState(false);
  const [ws, setWs] = useState(null);
  const [fingerprintId, setFingerprintId] = useState(null);
  const [fingerprintName, setFingerprintName] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [uniqueKeyEncrypted, setUniqueKeyEncrypted] = useState("");

  useEffect(() => {
    if (form) {
      console.log(form);
    }
  }, []);

  useEffect(() => {
    const socket = new WebSocket("ws://192.168.1.11:81");

    socket.onopen = () => {
      console.log("WebSocket connected!");
      setIsConnected(true);
    };

    socket.onmessage = (event) => {
      console.log("Message from server:", event.data);

      if(event.data.includes("Device not registered.")){
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Device not registered.",
        })
      }

      if (event.data.includes("Fingerprint ID:")) {
        const id = event.data.split("Fingerprint ID: ")[1].trim();
        setFingerprintId(id);
        setModalVisible(true);
      }

      if (event.data.includes("Serial:")) {
        const serial = event.data.split("Serial: ")[1].split(",")[0].trim();
        setSerialNumber(serial);
      }

      if (event.data.includes("Encrypted Key:") && event.data.includes("Serial Number:")) {
        const parts = event.data.split("Encrypted Key: ")[1];
        const [encryptedKey, serialPart] = parts.split(" Serial Number: ");

        if (encryptedKey && serialPart) {
          const serialNumber = serialPart.trim();

          console.log("Received Encrypted Key:", encryptedKey);
          console.log("Received Serial Number:", serialNumber);

          setUniqueKeyEncrypted(encryptedKey);
          setSerialNumber(serialNumber);

          handleFpLogin();
        }
      }

    };

    socket.onerror = (error) => {
      console.log("WebSocket Error:", error);
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
      setIsConnected(false);
    };

    setWs(socket);

    return () => {
      socket.close();
    };
  }, []);

  useEffect(() => {
    if (serialNumber && fingerprintId && fingerprintName) {
      registerUserWithDevice();
    }
  }, [serialNumber, fingerprintId, fingerprintName]);

  const handlePress = () => {
    if (!ws || !isConnected) {
      console.log("WebSocket not connected");
      return;
    }

    if (type === "login") {
      console.log("Login request sent");
      ws.send("login");
    } else {
      console.log("Register request sent");
      ws.send("register");
    }
  };

  const handleFpLogin = async () => {
    if (!uniqueKeyEncrypted || !serialNumber) return;

    const response = await loginFp(uniqueKeyEncrypted, serialNumber);
    if (response?.success) {
      console.log("Login Success");
      const token = response.token;
      await AsyncStorage.setItem("authToken", token);

      const tokenValidationResponse = await checkTokenIsValid(token);
      if (tokenValidationResponse?.success) {
        const user = await loadUser(tokenValidationResponse.user.userId);
        if (user) {
          dispatch(setUser(user));
          dispatch(setAuthState(true, token));
        }
        Toast.show({
          type: "success",
          text1: "Login success!"
        });

      } else {
        Toast.show({
          type: "error",
          text1: "Login failed!",
          text2: tokenValidationResponse.message || "Unknown error occurred"
        });
      }

    } else {
      console.log("Login Failed");
      Toast.show({
        type: "error",
        text1: "Login failed!",
        text2: loginResponse.message || "Unknown error occurred"
      });
    }
  };

  const registerUserWithDevice = async () => {
    if (!serialNumber || !fingerprintId || !fingerprintName) {
      console.log("Device or fingerprint details are missing.");
      return;
    }

    const formData = {
      name: form?.name || "",
      email: form?.email || "",
      phone: form?.phone || "",
      password: form?.password || "",
      confirmPassword: form?.confirmPassword || "",
      location: form?.location || "",
      gender: form?.gender || "",
      serialNumber,
      fingerPrint: { id: fingerprintId, name: fingerprintName },
    };

    try {
      const response = await registerUser(formData);
      if (response?.success) {
        console.log("User registered successfully:", response);

        const { publicKey, uniqueKey } = response;
        const keyData = `${uniqueKey}|${publicKey}`;

        ws.send(`setKey ${keyData}`);
      } else {
        console.log("Registration failed:", response.message);
      }
    } catch (error) {
      console.log("Error registering user:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <View style={styles.top}>
          <View style={styles.logoContainer}>
            <Image source={Logo} style={styles.logo} resizeMode="contain" />
            <Text style={styles.logoText}>BioKey</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate("SupportScreen")}
            style={styles.supportContainer}
          >
            <Image style={styles.SupportIcon} source={SupportIcon} />
          </TouchableOpacity>
        </View>
        <View style={styles.center}>
          <View style={styles.deviceContainer}>
            <Image source={FingyIcon} style={styles.fingyIcon} />
            <Text style={styles.instructionText}>
              {isConnected ? "Device Connected!" : "Plug-in Device to Continue"}
            </Text>
          </View>
        </View>
        <View style={styles.bottom}>
          <TouchableOpacity
            style={[
              styles.button,
              isConnected ? styles.deviceConnected : styles.deviceNotConnected,
            ]}
            disabled={!isConnected}
            onPress={handlePress}
          >
            <Text style={styles.buttonText}>
              {isConnected ? "Ready to Go..." : "Waiting for Device..."}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text>Enter Name for Fingerprint ID: {fingerprintId}</Text>
            <TextInput
              placeholder="Enter Name"
              value={fingerprintName}
              onChangeText={setFingerprintName}
              style={styles.input}
            />
            <Button title="Save" onPress={() => {
              if (fingerprintName.trim()) {
                setModalVisible(false);
                registerUserWithDevice();
              } else {
                console.log("Please enter a valid fingerprint name.");
              }
            }} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondaryColor1,
  },
  innerContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
  },
  top: {
    width: wp("100%"),
    height: hp("10%"),
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp("3%"),
  },
  logoContainer: {
    height: "100%",
    width: "50%",
    flexDirection: "row",
    alignItems: "flex-end",
    gap: wp("1%"),
  },
  logo: {
    height: "100%",
    width: "40%",
  },
  logoText: {
    fontSize: hp("4%"),
    fontFamily: "Afacad-Bold",
    color: "#E0E3F8",
  },
  supportContainer: {
    height: "100%",
    width: "50%",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    marginBottom: "2%",
  },
  SupportIcon: {
    height: "40%",
    width: "20%",
    opacity: 0.7,
    resizeMode: "contain",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  deviceContainer: {
    width: "90%",
    height: "63%",
    alignItems: "center",
    justifyContent: "space-between",
  },
  fingyIcon: {
    height: hp("30%"),
    aspectRatio: 1,
  },
  instructionText: {
    fontSize: hp("3%"),
    color: colors.textColor2,
    fontFamily: "Afacad-SemiBold",
  },
  bottom: {
    width: wp("100%"),
    height: hp("20%"),
    justifyContent: "center",
    flexDirection: "column",
    alignItems: "center",
  },
  button: {
    width: "60%",
    height: "33%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: hp("5%"),
  },
  buttonText: {
    fontSize: hp("2.5%"),
    color: colors.textColor3,
    fontFamily: "Afacad-Medium",
  },
  deviceConnected: {
    backgroundColor: colors.primaryColor,
  },
  deviceNotConnected: {
    backgroundColor: "rgba(211, 211, 211,0.3)",
  },
});
