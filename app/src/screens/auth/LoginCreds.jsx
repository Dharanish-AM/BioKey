import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import colors from "../../constants/colors";
import { Entypo, Feather, Fontisto } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import LoginAnimation4 from "../../assets/animations/login-4.json";
import { Pressable, ScrollView } from "react-native-gesture-handler";
import { checkTokenIsValid, loginCreds } from "../../services/authOperations";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch } from "react-redux";
import Toast from "react-native-toast-message";
import { setAuthState, setUser } from "../../redux/actions";
import { loadUser } from "../../services/userOperations";
import useLocation from "../../hooks/useLocation";

export default function LoginCreds({ navigation }) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState("");
  const dispatch = useDispatch();
  const activityLog = useLocation();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please fill all fields!");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Invalid email address!");
      return;
    }

    setError("");

    const loginResponse = await loginCreds(email, password, activityLog);

    if (loginResponse?.success) {
      const token = loginResponse.token;
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
          text1: "Login success!",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Login failed!",
          text2: tokenValidationResponse.message || "Unknown error occurred",
        });
      }
    } else {
      Toast.show({
        type: "error",
        text1: "Login failed!",
        text2: loginResponse.message || "Unknown error occurred",
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.innerContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={hp("3%")}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Entypo
              name="chevron-thin-left"
              size={hp("4%")}
              color={colors.textColor3}
            />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
          <LottieView
            loop={false}
            autoPlay
            source={LoginAnimation4}
            style={styles.animation}
          />

          <View style={styles.loginForm}>
            <View style={styles.formRow}>
              <Text style={styles.label}>Email:</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="Enter your email"
                placeholderTextColor="#aaa"
              />
            </View>

            <View style={styles.formRow}>
              <Text style={styles.label}>Password:</Text>
              <View>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  placeholder="Enter your password"
                  placeholderTextColor="#aaa"
                />
                <Pressable
                  style={{
                    position: "absolute",
                    right: wp("5%"),
                    bottom: hp("3.2%"),

                    opacity: 0.6,
                  }}
                  onPress={() => setShowPassword((prev) => !prev)}
                >
                  <Feather
                    name={showPassword ? "eye-off" : "eye"}
                    size={hp("2.5%")}
                    color={colors.textColor2}
                  />
                </Pressable>
              </View>
              <View
                style={{
                  width: "100%",
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: hp("0.5%"),
                  justifyContent: "space-between",
                }}
              >
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                <TouchableOpacity style={styles.forgotPassContainer}>
                  <Text style={styles.forgotPassText}>Forgot password?</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleLogin}
              style={styles.buttonContainer}
            >
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-start",
    width: wp("100%"),
    paddingHorizontal: wp("3.5%"),
  },
  content: {
    flex: 1,
    width: wp("100%"),
    paddingHorizontal: wp("3.5%"),
  },
  animation: {
    width: wp("85%"),
    aspectRatio: 1,
    resizeMode: "cover",
    alignSelf: "center",
  },
  loginForm: {
    flexDirection: "column",
    alignItems: "center",
    gap: hp("1%"),
  },
  formRow: {
    flexDirection: "column",
    alignItems: "flex-start",
    width: wp("90%"),
  },
  label: {
    fontSize: hp("2.7%"),
    color: colors.textColor3,
    fontFamily: "Afacad-Medium",
  },

  input: {
    backgroundColor: "rgba(42,48,60,0.5)",
    borderRadius: hp("1.6%"),
    paddingHorizontal: wp("4%"),
    paddingVertical: hp("2%"),
    fontSize: hp("2.1%"),
    marginBottom: hp("1%"),
    fontFamily: "Afacad-Regular",
    color: colors.textColor3,
    width: wp("90%"),
    marginTop: hp("1%"),
    borderColor: "rgba(161,161,161,0.2)",
    borderWidth: hp("0.1%"),
  },
  forgotPassContainer: {
    alignSelf: "flex-end",
  },
  forgotPassText: {
    fontSize: hp("2.2%"),
    color: "#9366E2",
    fontFamily: "Afacad-Regular",
    alignSelf: "flex-end",
  },
  buttonContainer: {
    paddingVertical: hp("1.1%"),
    backgroundColor: "#E2EBFF",
    borderRadius: hp("3%"),
    paddingHorizontal: wp("20%"),
    marginTop: hp("3%"),
  },
  buttonText: {
    fontSize: hp("2.9%"),
    fontFamily: "Afacad-SemiBold",
  },
  errorText: {
    color: "#BE3144",
    fontSize: hp("2.2%"),
    fontFamily: "Afacad-Regular",
  },
});
