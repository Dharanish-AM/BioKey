import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import React from "react";
import colors from "../../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale } from "react-native-size-matters";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import AntDesign from "react-native-vector-icons/AntDesign";

import Logo from "../../assets/images/BioKey_Logo.png";
import illustration from "../../assets/images/landing-illustration.png";

export default function LandingScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <View style={styles.top}>
          <View style={styles.logoContainer}>
            <Image source={Logo} style={styles.logo} resizeMode="contain" />
            <Text style={styles.logoText}>BioKey</Text>
          </View>
          <TouchableOpacity style={styles.supportContainer}>
            <AntDesign
              name="customerservice"
              size={moderateScale(33)}
              color={colors.textColor2}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.center}>
          <Image source={illustration} style={styles.illustration} />
        </View>
        <View style={styles.bottom}>
          <Text style={styles.quoteText}>
            “Your identity, your access, your security”
          </Text>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
          <Text style={styles.tcText}>Terms and Conditions </Text>
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
    fontSize: moderateScale(34),
    fontFamily: "Afacad-Bold",
    color: "#E0E3F8",
  },
  supportContainer: {
    height: "100%",
    width: "50%",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    marginBottom: "1%",
  },
  center: {
    width: wp("100%"),
    flex: 1,
    paddingHorizontal: wp("2%"),
    alignItems: "center",
    justifyContent: "center",
  },
  illustration: {
    width: "98%",
    height: "90%",
    resizeMode: "stretch",
  },
  bottom: {
    width: wp("100%"),
    height: hp("20%"),
    paddingHorizontal: wp("2%"),
    flexDirection: "column",
    alignItems: "center",
  },
  quoteText: {
    fontSize: moderateScale(21.5),
    textAlign: "center",
    color: colors.textColor3,
    fontFamily: "Afacad-SemiBoldItalic",
  },
  button: {
    width: "60%",
    height: "35%",
    marginTop: "6%",
    backgroundColor: colors.primaryColor,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: hp("5%"),
  },
  buttonText: {
    fontSize: moderateScale(22),
    color: colors.textColor3,
    fontFamily: "Afacad-SemiBold",
  },
  tcText: {
    fontSize: moderateScale(15),
    marginTop: "7%",
    color: colors.textColor3,
    fontFamily: "Afacad-Regular",
  },
});
