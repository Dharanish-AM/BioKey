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

import Logo from "../assets/images/BioKey_Logo.png";
import CustomerCarePng from "../assets/images/Headset.png";
import Illustration from "../assets/images/illustration-landing.png";

const LandingScreen = ({ navigation }) => {
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
        <Image
          style={styles.illustration}
          source={Illustration}
          resizeMode="stretch"
        />
      </View>
      <View style={styles.bottom}>
        <View style={styles.quotesContainer}>
          <Text style={styles.quotesText}>
            “Your identity, your access, your security”
          </Text>
        </View>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("DevicePluginScreen")}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tacConatiner}>
          <Text style={styles.tacText}>Terms and Conditions</Text>
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
  },
  illustration: {
    width: wp("90%"),
    height: "90%",
  },
  bottom: {
    width: wp("100%"),
    height: hp("20%"),
    flexDirection: "column",
    justifyContent: "space-evenly",
    alignItems: "center",
  },
  quotesContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: wp("100%"),
    color: colors.textColor1,
  },
  quotesText: {
    fontSize:hp("2.5%"),
    color: colors.textColor1,
    fontFamily: "Afacad-SemiBoldItalic",
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
  tacConatiner: {
    alignItems: "center",
    justifyContent: "center",
    width: wp("100%"),
  },
  tacText: {
    fontSize: hp("2%"),
    color: colors.textColor2,
    fontFamily: "Afacad-SemiBold",
    opacity: 0.5,
    textDecorationLine: "underline",
  },
});

export default LandingScreen;
