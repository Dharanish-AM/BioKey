import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import colors from "../constants/Color";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import useCustomFonts from "../hooks/useLoadFonts";
import LottieView from "lottie-react-native";

import Logo from "../assets/images/BioKey_Logo.png";
import CustomerCarePng from "../assets/images/Headset.png";
import Fingy from "../assets/images/FINGY.png";
import LoginAnimation from "../assets/animations/LoginAnimations.json";

const AuthScreen = ({ navigation }) => {
  const fontsLoaded = useCustomFonts();

  if (!fontsLoaded) {
    return (
      <ActivityIndicator
        size="large"
        color="#0000ff"
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <View style={styles.logoContainer}>
          <Image style={styles.logo} source={Logo} resizeMode="contain" />
          <Text style={styles.logotext}>BioKey</Text>
        </View>
        <TouchableOpacity style={styles.CustomerCarePngContainer}>
          <Image
            resizeMode="contain"
            style={styles.CustomerCarePng}
            source={CustomerCarePng}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.center}>
        <View style={styles.mainTexts}>
          <Text style={styles.title}>Welcome to BioKey</Text>
          <Text style={styles.subTitle}>
            Secure access with your fingerprint
          </Text>
        </View>
        <View style={styles.animationContainer}>
          <LottieView
            style={styles.loginAnimation}
            source={LoginAnimation}
            autoPlay
            loop
          />
        </View>
      </View>
      <View style={styles.bottom}>
        <Text style={styles.tacText}>
          *By using the BioKey app, you agree to our Terms and Conditions and
          Privacy Policy.
        </Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <Text style={styles.signUpText}>
          Not yet registered? <Text style={styles.clickHere}>Click here</Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondaryColor1,
    flexDirection: "column",
    alignItems: "center",
  },
  top: {
    width: wp("100%"),
    height: hp("13%"),
    paddingHorizontal: wp("5%"),
    paddingVertical: hp("2%"),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoContainer: {
    height: "100%",
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
  },
  logo: {
    height: hp("9%"),
    width: hp("9%"),
    marginRight: "2%",
  },
  logotext: {
    fontSize: hp("4%"),
    color: "#E0E3F8",
    fontFamily: "Afacad-Bold",
  },
  CustomerCarePngContainer: {
    height: hp("4%"),
    width: hp("4%"),
  },
  CustomerCarePng: {
    height: "100%",
    width: "100%",
    marginTop: hp("2.5%"),
  },
  center: {
    width: wp("100%"),
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
  },
  mainTexts: {
    marginTop: hp("2%"),
    alignItems: "center",
  },
  title: {
    fontSize: hp("5%"),
    fontFamily: "Afacad-Bold",
    color: colors.textColor3,
  },
  subTitle: {
    fontSize: hp("3%"),
    fontFamily: "Afacad-Medium",
    color: colors.textColor2,
  },
  animationContainer: {
    width: wp("100%"),
    flex: 1,
  },
  loginAnimation: {
    width: "100%",
    height: "100%",
  },
  bottom: {
    width: wp("100%"),
    height: hp("25%"),
    alignItems: "center",
    justifyContent: "space-evenly",
  },
  tacText: {
    fontSize: hp("2%"),
    color: colors.textColor3,
    width: wp("100%"),
    textAlign: "center",
    fontFamily: "Afacad-Medium",
  },
  button: {
    width: wp("65%"),
    height: hp("7%"),
    borderRadius: wp("11%"),
    backgroundColor: colors.primaryColor,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: hp("3%"),
    color: colors.textColor1,
    fontFamily: "Afacad-SemiBold",
  },
  signUpText: {
    fontSize: hp("2.4%"),
    color: colors.textColor3,
    textAlign: "center",
    fontFamily: "Afacad-SemiBold",
  },
  clickHere: {
    color: "#7E4CD6",
    textDecorationLine: "underline",
  },
});

export default AuthScreen;
