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
import Fingerprint from "../assets/images/fingerprint.png";
import ScanAnimation from "../assets/animations/scananimation.json";

const FPScanningScreen = ({ navigation }) => {
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
        <TouchableOpacity
          style={styles.CustomerCarePngContainer}
          onPress={() => navigation.navigate("SuccessScreen")}
        >
          <Image
            resizeMode="contain"
            style={styles.CustomerCarePng}
            source={CustomerCarePng}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.center}>
        <Text style={styles.title}>Register Your Fingerprint</Text>
        <View style={styles.contentContainer}>
          <Text style={styles.instructionText}>
            Place your finger on the sensor
          </Text>
          <View style={styles.scanContainer}>
            <LottieView
              style={styles.scanAnimation}
              source={ScanAnimation}
              autoPlay
              loop
            />
            <Image style={styles.fingerprint} source={Fingerprint} />
          </View>
          <Text style={styles.progressText}>Scanning...</Text>
        </View>
      </View>
      <View style={styles.bottom}>
        <Text style={styles.bottomText}>
          Your fingerprint will be securely stored and used only for
          authentication purposes.
        </Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
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
    flex: 1,
    width: wp("100%"),
    alignItems: "center",
    justifyContent: "center",
    gap: hp("5%"),
  },
  title: {
    fontSize: hp("4%"),
    color: colors.textColor1,
    fontFamily: "Afacad-SemiBold",
  },
  contentContainer: {
    width: wp("80%"),
    height: hp("35%"),
    backgroundColor: colors.lightColor1,
    borderRadius: wp("5%"),
    justifyContent: "center",
    alignItems: "center",
    gap: hp("3%"),
    flexDirection: "column",
  },
  instructionText: {
    fontSize: hp("2.5%"),
    color: colors.textColor1,
    fontFamily: "Afacad-SemiBold",
  },
  scanContainer: {
    width: wp("40%"),
    height: hp("20%"),
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  scanAnimation: {
    position: "absolute",
    width: "100%",
    height: "100%",
    zIndex: 1000,
  },
  fingerprint: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  progressText: {
    fontSize: wp("5%"),
    color: colors.textColor3,
    fontFamily: "Afacad-Medium",
    display: "none", // Hide by default
  },
  bottom: {
    width: wp("100%"),
    height: hp("23%"),
    alignItems: "center",
    justifyContent: "space-evenly",
  },
  bottomText: {
    fontSize: hp("2%"),
    width: wp("90%"),
    color: colors.textColor3,
    fontFamily: "Afacad-SemiBold",
    textAlign: "center",
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
});

export default FPScanningScreen;
