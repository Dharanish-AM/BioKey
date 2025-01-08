import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import colors from "../constants/colors";
import { addPassword } from "../services/passwordOperations";
import { useDispatch } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AddPasswordSheet({ bottomSheetRef }) {
  const [name, setName] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [website, setWebsite] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch();

  const userId = "676aee09b3f0d752bbbe58f7";

  const handleSubmit = async () => {
    const trimmedEmail = email.trim();

    if (!name || !password || (!userName && !trimmedEmail)) {
      Alert.alert(
        "Notice",
        "Name and Password are required, and either Username or Email must be provided. Please fill out all fields.",
        [{ text: "OK" }]
      );
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (trimmedEmail && !emailRegex.test(trimmedEmail)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.", [
        { text: "OK" },
      ]);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await addPassword(
        userId,
        name,
        userName,
        trimmedEmail,
        password,
        website,
        note,
        dispatch
      );

      if (response.status) {
        console.log("Password added successfully. Closing bottom sheet.");

        if (bottomSheetRef.current) {
          bottomSheetRef.current.close();
          console.log("Bottom sheet closed.");
        } else {
          console.warn("Bottom sheet reference is undefined.");
        }

        Alert.alert("Success", "Password added successfully!", [
          { text: "OK" },
        ]);
      } else {
        Alert.alert("Error", "Failed to add password. Please try again.", [
          { text: "OK" },
        ]);
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      Alert.alert("Error", "An error occurred. Please try again later.", [
        { text: "OK" },
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
      }}
    >
      <KeyboardAwareScrollView
        style={styles.container}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollViewContainer}
        extraHeight={hp("5%")}
        keyboardVerticalOffset={hp("2%")}
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
          style={[
            styles.buttonContainer,
            isSubmitting && styles.buttonDisabled,
          ]}
          onPress={handleSubmit}
        >
          <Text style={styles.button}>
            {isSubmitting ? "Saving..." : "Save Password"}
          </Text>
        </TouchableOpacity>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollViewContainer: {
    flexGrow: 1,
    justifyContent: "flex-start",
    paddingBottom: hp("5%"),
    width: wp("100%"),
    paddingHorizontal: wp("3.5%"),
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
    marginLeft: wp("23%"),
  },
  button: {
    fontSize: hp("2.2%"),
    color: colors.textColor3,
    fontFamily: "Afacad-Medium",
  },
  buttonDisabled: {
    backgroundColor: "rgba(101, 48, 194, 0.5)",
  },
});
