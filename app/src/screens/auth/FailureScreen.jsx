import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import colors from "../../constants/colors";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

import Logo from "../../assets/images/BioKey_Logo.png";
import SupportIcon from "../../assets/images/support_icon.png";
import LottieView from "lottie-react-native";
import FailureAnimation from "../../assets/animations/failure_animation.json"


export default function FailureScreen({ navigation }) {


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <View style={styles.top}>
          <View style={styles.logoContainer}>
            <Image source={Logo} style={styles.logo} resizeMode="contain" />
            <Text style={styles.logoText}>BioKey</Text>
          </View>
          <TouchableOpacity style={styles.supportContainer}>
            <Image style={styles.SupportIcon} source={SupportIcon} />
          </TouchableOpacity>
        </View>
        <View style={styles.center}>

          <View style={styles.failureContainer}>
            <LottieView style={styles.failureAnimation} source={FailureAnimation} autoPlay={true} loop={false} />
            <Text style={styles.infoText}>Error While Registering
              Fingerprint!</Text>
          </View>

        </View>
        <View style={styles.bottom}>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    width: wp("100%"),
    flex: 1,
    paddingHorizontal: wp("2%"),
    alignItems: "center",
    justifyContent: "center"
  },
  title: {
    fontSize: hp("3.7%"),
    fontFamily: "Afacad-SemiBold",
    color: colors.textColor1,
  },
  failureContainer: {
    width: "90%",
    height: "75%",
    backgroundColor: colors.lightColor1,
    borderRadius: hp("2.5%"),
    alignItems: "center",
    justifyContent: "center",
    gap: hp("3%")
  },
  failureAnimation: {
    aspectRatio: 1,
    height: "50%",
  },
  scanAnimation: {
    width: "50%",
    height: "50%",
    position: "absolute",
    top: hp("12%")
  },
  fpScanner: {
    width: "50%",
    height: "50%",
    resizeMode: "contain"
  },
  infoText: {
    fontSize: hp("3%"),
    fontFamily: "Afacad-Medium",
    color: colors.textColor1,
    textAlign: "center",
    width: "90%"
  },
  bottom: {
    width: wp("100%"),
    height: hp("10%"),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    width: "55%",
    height: "70%",
    backgroundColor: colors.primaryColor,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: hp("5%"),
  },
  buttonText: {
    fontSize: hp("3%"),
    color: colors.textColor3,
    fontFamily: "Afacad-SemiBold",
  },

});
