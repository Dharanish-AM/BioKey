import { View, StyleSheet, TouchableOpacity, Text, Image } from "react-native";
import colors from "../constants/Color";
import Logo from "../assets/svg/Logo.js";
import CustomerCare from "../assets/svg/CustomerCare.js";
import { SafeAreaView } from "react-native-safe-area-context";
import LottieView from "lottie-react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const LoginScreen = ({ navigation }) => {
  function handleloginclick() {
    navigation.push("AuthScreen", {
      login: true,
      signup: false,
    });
  }

  function handleregisterclick() {
    navigation.push("AuthScreen", {
      login: false,
      signup: true,
    });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.top}>
          <View style={styles.header}>
            <Logo style={styles.logo} />
            <Image
              source={require("../assets/images/support.png")}
              style={styles.customerCare}
            />
          </View>
        </View>
        <View style={styles.center}>
          <Text style={styles.title}>Welcome to BioKey</Text>
          <Text style={styles.belowtitle}>
            Secure access with your fingerprint
          </Text>
          <LottieView
            key="login-animation"
            source={require("../assets/animation/Login-Animation.json")}
            autoPlay
            loop
            style={styles.animation}
          />
          <Text style={styles.terms}>
            *By using the BioKey app, you agree to our Terms and Conditions and
            Privacy Policy.
          </Text>
        </View>
        <View style={styles.bottom}>
          <TouchableOpacity style={styles.button} onPress={handleloginclick}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
          <View style={styles.registerContainer}>
            <Text style={styles.register}>Not yet registered?</Text>
            <TouchableOpacity
              style={styles.route}
              onPress={handleregisterclick}
            >
              <Text style={styles.routetext}> Click here</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.secondaryColor1,
  },
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: colors.secondaryColor1,
  },
  top: {
    width: "100%",
    height: "15%",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    width: "90%",
    height: "200%",
  },
  customerCare: {
    width: "10%",
    height: "100%",
    marginTop: 40,
  },
  title: {
    color: colors.textColor3,
    fontFamily: "AfacadFlux-Bold",
    fontSize: 40,
    marginTop: 15,
  },
  belowtitle: {
    color: colors.textColor2,
    fontFamily: "AfacadFlux-SemiBold",
    fontSize: 28,
  },
  center: {
    width: "100%",
    justifyContent: "flex-start",
    alignItems: "center",
    height: "65%",
    paddingHorizontal: 5,
  },
  animation: {
    width: "90%",
    height: "50%",
    marginVertical: 70,
  },
  terms: {
    color: colors.textColor3,
    fontFamily: "AfacadFlux-Medium",
    textAlign: "center",
    fontSize: 18,
  },
  bottom: {
    width: "100%",
    height: "23%",
    justifyContent: "center",
    alignItems: "center",
    gap: 23,
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
  registerContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  register: {
    color: colors.textColor1,
    fontFamily: "AfacadFlux-SemiBold",
    fontSize: 20,
  },
  route: {
    padding: 0,
    margin: 0,
  },
  routetext: {
    color: colors.primaryColor,
    fontSize: 20,
    fontFamily: "AfacadFlux-SemiBold",
    textDecorationLine: "underline",
  },
});

export default LoginScreen;
