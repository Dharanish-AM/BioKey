import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import React from "react";
import colors from "../../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

import Logo from "../../assets/images/BioKey_Logo.png";
import illustration from "../../assets/images/landing-illustration.png";
import SupportIcon from "../../assets/images/support_icon.png";

export default function LandingScreen({navigation}) {

  const handleGetStarted = () => {
      navigation.navigate("UserFormScreen")
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <View style={styles.top}>
          <View style={styles.logoContainer}>
            <Image source={Logo} style={styles.logo} resizeMode="contain" />
            <Text style={styles.logoText}>BioKey</Text>
          </View>
          <TouchableOpacity onPress={()=>{
            navigation.navigate("SupportScreen")
          }} style={styles.supportContainer}>
            <Image style={styles.SupportIcon} source={SupportIcon} />
          </TouchableOpacity>
        </View>
        <View style={styles.center}>
          <Image source={illustration} style={styles.illustration} />
        </View>
        <View style={styles.bottom}>
          <Text style={styles.quoteText}>
            “Your identity, your access, your security”
          </Text>
          <TouchableOpacity onPress={handleGetStarted} style={styles.button}>
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
    justifyContent: "center",
  },
  illustration: {
    width: "98%",
    height: "90%",
    resizeMode: "contain",
  },
  bottom: {
    width: wp("100%"),
    height: hp("20%"),
    justifyContent: "space-between",
    flexDirection: "column",
    alignItems: "center",
  },
  quoteText: {
    fontSize: hp("2.7%"),
    textAlign: "center",
    color: colors.textColor3,
    fontFamily: "Afacad-SemiBoldItalic",
    width: "100%",
  },
  button: {
    width: "55%",
    height: "35%",
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
  tcText: {
    fontSize: hp("2%"),
    //marginTop: "7%",
    color: colors.textColor3,
    fontFamily: "Afacad-Regular",
  },
});
