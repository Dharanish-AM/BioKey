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

import Logo from "../assets/images/BioKey_Logo.png";
import CustomerCarePng from "../assets/images/Headset.png";
import Fingy from "../assets/images/FINGY.png";

const DevicePlugin = ({ navigation }) => {
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
        <View style={styles.fingyPngContainer}>
          <Image style={styles.fingyPng} source={Fingy} />
        </View>
        <View style={styles.instructionTextContainer}>
          <Text style={styles.instructionText}>Waiting for FINGY!</Text>
        </View>
      </View>
      <View style={styles.bottom}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("FPScanningScreen")}
        >
          <Text style={styles.buttonText}>Plugin the device</Text>
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
    gap: hp("2%"),
  },
  fingyPngContainer: {
    height: hp("30%"),
    width: hp("30%"),
  },
  fingyPng: {
    height: "100%",
    width: "100%",
  },
  instructionTextContainer: {
    alignItems: "center",
    width: wp("100%"),
  },
  instructionText: {
    fontSize: hp("3%"),
    fontFamily: "Afacad-SemiBold",
    color: colors.textColor3,
  },
  bottom: {
    width: wp("100%"),
    height: hp("20%"),
    alignItems: "center",
    justifyContent: "center",
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

export default DevicePlugin;
