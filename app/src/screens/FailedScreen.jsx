import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import colors from "../constants/Color";
import Logo from "../assets/svg/Logo.js";
import CustomerCare from "../assets/svg/CustomerCare.js";
import Failed from "../assets/svg/Failed.js";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const FailedScreen = ({ navigation }) => {
  const [isRegister, setisRegister] = useState(true);

  function handleRetry() {
    if (isRegister) {
      navigation.push("FingerprintRegisterScan");
    } else {
      navigation.push("FingerprintLoginScan");
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.top}>
          <View style={styles.header}>
            <Logo style={styles.logo} />
            <CustomerCare style={styles.customerCare} />
          </View>
        </View>
        <View style={styles.center}>
          <View style={styles.resultcontainer}>
            <Failed />
            {isRegister ? (
              <Text style={styles.resulttext}>
                Error While Registering Fingerprint!
              </Text>
            ) : (
              <Text style={styles.resulttext}>Invalid Authentication !</Text>
            )}
          </View>
        </View>
        <View style={styles.bottom}>
          <TouchableOpacity style={styles.button} onPress={handleRetry}>
            <Text style={styles.buttonText}>Try Again!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.secondaryColor1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },

  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: colors.secondaryColor1,
  },
  top: {
    width: "100%",
    height: "13%",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    height: "100%",
    paddingHorizontal: 15,
  },
  logo: {
    width: "50%",
    height: "70%",
  },
  customerCare: {
    width: "10%",
    height: "35%",
    marginTop: 40,
  },
  center: {
    height: "70%",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    gap: 80,
  },
  resultcontainer: {
    width: "85%",
    height: "80%",
    justifyContent: "space-between",
    borderRadius: 25,
    backgroundColor: colors.lightColor1,
    alignItems: "center",
    paddingVertical: 80,
  },
  resulttext: {
    fontSize: 26,
    color: colors.textColor1,
    fontFamily: "AfacadFlux-Medium",
    textAlign: "center",
    width: "70%",
  },
  bottom: {
    width: "100%",
    height: "17%",
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    width: 250,
    height: 50,
    backgroundColor: colors.primaryColor,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontFamily: "AfacadFlux-Bold",
  },
});

export default FailedScreen;
