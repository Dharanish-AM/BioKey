import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import colors from "../../constants/colors";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

import FingyIcon from "../../assets/images/FINGY.png";
import Logo from "../../assets/images/BioKey_Logo.png";
import SupportIcon from "../../assets/images/support_icon.png";

export default function DevicePairingScreen({ navigation }) {
  const [isConnected, setIsConnected] = useState(true);

  const handlePress = () => {
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
          <TouchableOpacity style={styles.supportContainer}>
            <Image style={styles.SupportIcon} source={SupportIcon} />
          </TouchableOpacity>
        </View>
        <View style={styles.center}>
          <View style={styles.deviceContainer}>
            <Image source={FingyIcon} style={styles.fingyIcon} />
            <Text style={styles.instructionText}>
              Plug-in Device to Continue
            </Text>
          </View>
        </View>
        <View style={styles.bottom}>
          <TouchableOpacity style={[styles.button, isConnected
            ? styles.deviceConnected
            : styles.deviceNotConnected,
          ]} disabled={
            !isConnected
          }
            onPress={handlePress}
          >
            <Text
              style={
                styles.buttonText
              }
            >
              {isConnected ? "Ready to Go..." : "Waiting for Device..."}
            </Text>
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
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  deviceContainer: {
    width: "90%",
    height: "63%",
    alignItems: "center",
    justifyContent: "space-between",
  },
  fingyIcon: {
    height: hp("30%"),
    aspectRatio: 1,
  },
  instructionText: {
    fontSize: hp("3%"),
    color: colors.textColor2,
    fontFamily: "Afacad-SemiBold",
  },
  bottom: {
    width: wp("100%"),
    height: hp("20%"),
    justifyContent: "center",
    flexDirection: "column",
    alignItems: "center",
  },
  button: {
    width: "65%",
    height: "35%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: hp("5%"),
  },
  buttonText: {
    fontSize: hp("3%"),
    color: colors.textColor3,
    fontFamily: "Afacad-SemiBold",
  },
  deviceConnected: {
    backgroundColor: colors.primaryColor
  },
  deviceNotConnected: {
    backgroundColor: "rgba(211, 211, 211,0.3)"
  }
});
