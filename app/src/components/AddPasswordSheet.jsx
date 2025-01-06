import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import colors from "../constants/colors";

export default function AddPasswordSheet() {
  const [name, setName] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [website, setWebsite] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setMessage("Password saved successfully!");
      setIsSubmitting(false);
    }, 2000);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Text style={styles.title}>Add Password</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Platform</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter platform"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          value={userName}
          onChangeText={setUserName}
          placeholder="Enter username"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter email"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Enter password"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Website</Text>
        <TextInput
          style={styles.input}
          value={website}
          onChangeText={setWebsite}
          placeholder="Enter website"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Note</Text>
        <TextInput
          style={styles.input}
          value={note}
          onChangeText={setNote}
          placeholder="Enter note"
        />
      </View>

      <TouchableOpacity
        style={[styles.buttonContainer, isSubmitting && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        <Text style={styles.button}>
          {isSubmitting ? "Saving..." : "Save Password"}
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: wp("3.5%"),
    justifyContent: "flex-start",
  },
  title: {
    fontSize: hp("3%"),
    color: colors.textColor3,
    fontFamily: "Afacad-SemiBold",
    marginBottom: hp("2%"),
    marginTop: hp("1.5%"),
  },
  inputContainer: {
    marginBottom: hp("2.5%"),
    width: "100%",
  },
  label: {
    fontSize: hp("2.5%"),
    fontFamily: "Afacad-Medium",
    color: colors.textColor3,
  },
  input: {
    borderBottomColor: "rgba(166, 173, 186, 0.25)",
    borderBottomWidth: wp("0.1%"),
    height: hp("4.5%"),
    width: "100%",
    fontFamily: "Afacad-Regular",
    color: colors.textColor2,
    fontSize: hp("2%"),
  },
  buttonContainer: {
    width: wp("45%"),
    height: hp("6%"),
    borderRadius: hp("3%"),
    backgroundColor: "rgba(101, 48, 194, 0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    fontSize: hp("2.2%"),
    color: colors.textColor3,
    fontFamily: "Afacad-Medium",
  },
  buttonDisabled: {
    backgroundColor: "rgba(101, 48, 194, 0.5)",
  },
  message: {
    marginTop: hp("2%"),
    fontSize: hp("2%"),
    color: "green",
    fontFamily: "Afacad-Regular",
  },
});
