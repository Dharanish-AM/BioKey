import React from "react";
import {
  Text,
  View,
  StyleSheet,
  Image,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import colors from "../constants/Color";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import useCustomFonts from "../hooks/useLoadFonts";
import { useNavigation } from "@react-navigation/native";

import Logo from "../assets/images/BioKey_Logo.png";
import CustomerCarePng from "../assets/images/Headset.png";
import LottieView from "lottie-react-native";
import FailureAnimation from "../assets/animations/Failure.json";

const FailureScreen = () => {
  const fontsLoaded = useCustomFonts();
  const navigation = useNavigation();

  if (!fontsLoaded) {
    return (
      <ActivityIndicator
        size="large"
        color="#0000ff"
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      />
    );
  }

  const handleTryAgain = () => {};

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
        <View style={styles.contentConatiner}>
          <LottieView
            style={styles.failureAnimation}
            source={FailureAnimation}
            autoPlay={true}
            loop={false}
            speed={0.7}
          />
          <Text style={styles.text}>Error While Registering Fingerprint!</Text>
        </View>
      </View>
      <View style={styles.bottom}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText} onPress={handleTryAgain}>
            Try again
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default FailureScreen;

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
    marginRight: wp("1.5%"),
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
  },
  contentConatiner: {
    width: "80%",
    height: "80%",
    backgroundColor: colors.lightColor1,
    borderRadius: hp("3%"),
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-evenly",
  },
  failureAnimation: {
    width: "75%",
    aspectRatio: 1,
  },
  text: {
    fontSize: hp("3%"),
    color: colors.textColor1,
    fontFamily: "Afacad-SemiBold",
    textAlign: "center",
  },
  bottom: {
    width: wp("100%"),
    height: hp("20%"),
    flexDirection: "column",
    justifyContent: "space-evenly",
    alignItems: "center",
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
