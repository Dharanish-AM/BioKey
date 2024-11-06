import { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  SafeAreaView,
  StatusBar,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import CustomerCare from "../assets/svg/CustomerCare.js";
import DeviceLogoBig from "../assets/svg/DeviceLogoBig.js";
import colors from "../constants/Color.js";

const UserForm = ({ navigation, device }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deviceDetails, setDeviceDetails] = useState({});

  useEffect(() => {
    if (deviceDetails) {
      setDeviceDetails(deviceDetails);
    }
  });

  const [foundDeviceDetails, setFoundDeviceDetails] = useState({
    deviceName: "FINGY_4573676",
  });

  const handleSubmit = () => {
    console.log({
      name,
      email,
      phone,
      password,
      confirmPassword,
    });
    navigation.push("FingerprintRegisterScan");
  };

  return (
    <KeyboardAvoidingView
      style={styles.formContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={StatusBar.currentHeight || 0}
    >
      <View style={styles.formHeader}>
        <View style={styles.deviceheader}>
          <DeviceLogoBig />
          <Text style={styles.devicename}>{foundDeviceDetails.deviceName}</Text>
        </View>
        <CustomerCare style={styles.customerCare} />
      </View>
      <View style={styles.formdetails}>
        <Text style={styles.detailtext}>Enter your details</Text>
        <View style={styles.form}>
          <Text style={styles.label}>Name:</Text>
          <TextInput
            style={styles.input}
            onChangeText={setName}
            value={name}
            placeholder="Enter your name..."
            placeholderTextColor={colors.textColor2}
          />
          <Text style={styles.label}>Email:</Text>
          <TextInput
            style={styles.input}
            onChangeText={setEmail}
            value={email}
            placeholder="Enter your email..."
            keyboardType="email-address"
            placeholderTextColor={colors.textColor2}
          />
          <Text style={styles.label}>Phone:</Text>
          <TextInput
            style={styles.input}
            onChangeText={setPhone}
            value={phone}
            placeholder="Enter your phone number..."
            keyboardType="phone-pad"
            placeholderTextColor={colors.textColor2}
          />
          <Text style={styles.label}>Password:</Text>
          <TextInput
            style={styles.input}
            onChangeText={setPassword}
            value={password}
            placeholder="Enter your password..."
            secureTextEntry={true}
            placeholderTextColor={colors.textColor2}
          />
          <Text style={styles.label}>Confirm Password:</Text>
          <TextInput
            style={styles.input}
            onChangeText={setConfirmPassword}
            value={confirmPassword}
            placeholder="Confirm your password..."
            secureTextEntry={true}
            placeholderTextColor={colors.textColor2}
          />
        </View>
      </View>
      <View style={styles.bottom}>
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    flexDirection: "column",
  },
  formHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 15,
    height: "15%",
  },
  deviceheader: {
    width: "45%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  devicename: {
    fontFamily: "AfacadFlux-Bold",
    color: colors.textColor3,
    fontSize: 24,
  },
  customerCare: {
    width: "10%",
    height: "50%",
    marginTop: "8%",
  },
  formdetails: {
    alignItems: "flex-start",
    width: "90%",
    height: "75%",
    justifyContent: "center",
  },
  detailtext: {
    fontSize: 32,
    marginBottom: 15,
    color: colors.textColor3,
    fontFamily: "AfacadFlux-Bold",
  },
  form: {
    width: "100%",
    gap: 3,
  },
  label: {
    fontFamily: "AfacadFlux-SemiBold",
    fontSize: 24,
    marginBottom: 5,
    color: colors.textColor3,
  },
  input: {
    height: "10%",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
    width: "100%",
    backgroundColor: colors.lightColor1,
    color: colors.textColor1,
  },
  bottom: {
    width: "100%",
    height: "7%",
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

export default UserForm;
