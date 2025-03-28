import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Pressable,
} from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import colors from "../../constants/colors";
import LottieView from "lottie-react-native";
import Logo from "../../assets/images/BioKey_Logo.png";
import SupportIcon from "../../assets/images/support_icon.png";
import Animation from "../../assets/animations/mock_animation.json";
import PassIcon from "../../assets/images/auth-pass.png";
import FpIcon from "../../assets/images/auth-gp.png";

export default function AuthScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <View style={styles.header}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-end",
              gap: wp("2%"),
            }}
          >
            <Image source={Logo} style={styles.logoImage} />
            <Text style={styles.logoText}>BioKey</Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate("SupportScreen");
            }}
          >
            <Image source={SupportIcon} style={styles.supportIcon} />
          </TouchableOpacity>
        </View>
        <View style={styles.center}>
          <View
            style={{
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Text style={styles.heroText1}>Welcome to BioKey</Text>
            <Text style={styles.heroText2}>
              Where security meets your identity.
            </Text>
          </View>
          <LottieView
            source={Animation}
            resizeMode="contain"
            autoPlay
            loop
            style={styles.animation}
          />
        </View>
        <View style={styles.bottom}>
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("LoginCreds");
              }}
              style={[
                styles.button,
                {
                  backgroundColor: "#E2EBFF",
                },
              ]}
            >
              <Image source={PassIcon} style={styles.buttonIcons} />

              <Text
                style={[
                  styles.buttonText,
                  {
                    color: colors.secondaryColor1,
                  },
                ]}
              >
                Login with Credentials
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("DevicePairingScreen", {
                  type: "login",
                });
              }}
              style={[styles.button]}
            >
              <Text
                style={[
                  styles.buttonText,
                  {
                    color: colors.textColor1,
                  },
                ]}
              >
                Login with Fingerprint
              </Text>

              <Image
                source={FpIcon}
                style={[
                  styles.buttonIcons,
                  {
                    width: wp("8%"),
                    height: hp("8%"),
                    aspectRatio: 1,
                  },
                ]}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.footer}>
            <Text style={styles.bottomText}>Don't have an account? </Text>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("UserFormScreen");
              }}
            >
              <Text
                style={{
                  color: "#9366E2",
                  textDecorationLine: "underline",
                  fontFamily: "Afacad-Medium",
                  fontSize: hp("2.2%"),
                }}
              >
                Click here
              </Text>
            </TouchableOpacity>
          </View>
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
    alignItems: "center",
  },
  header: {
    width: wp("100%"),
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    paddingHorizontal: wp("3.5%"),
  },
  logoImage: {
    width: wp("18%"),
    height: hp("18%"),
    aspectRatio: 1,
    resizeMode: "contain",
  },
  logoText: {
    fontSize: hp("4.2%"),
    color: "#E0E3F8",
    fontFamily: "Afacad-Bold",
  },
  supportIcon: {
    width: wp("4%"),
    height: hp("4%"),
    aspectRatio: 1,
    marginTop: hp("3%"),
  },
  center: {
    flex: 1,
    width: wp("100%"),
    paddingHorizontal: wp("3.5%"),
    alignItems: "center",
    paddingTop: hp("4%"),
  },
  heroText1: {
    fontSize: hp("4%"),
    color: colors.textColor3,
    fontFamily: "Afacad-Bold",
  },
  heroText2: {
    fontSize: hp("3%"),
    color: colors.textColor2,
    fontFamily: "Afacad-Medium",
  },
  animation: {
    height: hp("45%"),
    width: wp("45%"),
    aspectRatio: 1,
  },
  bottom: {
    width: wp("100%"),
    alignItems: "center",
  },
  buttonIcons: {
    width: wp("7%"),
    height: hp("7%"),
    aspectRatio: 1,
  },
  buttonsContainer: {
    flexDirection: "column",
    gap: hp("3%"),
  },
  button: {
    flexDirection: "row",
    padding: hp("1.5%"),
    backgroundColor: colors.primaryColor,
    width: wp("75%"),
    borderRadius: hp("2.5%"),
    alignItems: "center",
    justifyContent: "space-evenly",
  },
  buttonText: {
    fontSize: hp("2.5%"),

    fontFamily: "Afacad-SemiBold",
  },
  bottomText: {
    fontSize: hp("2.2%"),
    color: colors.textColor3,
    fontFamily: "Afacad-Medium",
    alignItems: "center",
  },
  footer: {
    alignItems: "center",
    flexDirection: "row",
    marginTop: hp("5.5%"),
  },
});
