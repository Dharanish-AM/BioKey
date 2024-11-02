import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import Illustration from "../assets/svg/Illustration";
import Logo from "../assets/svg/Logo";
import CustomerCare from "../assets/svg/CustomerCare";
import colors from "../constants/Color";

const LandingScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.top}>
          <View style={styles.header}>
            <Logo style={styles.logo} />
            <CustomerCare style={styles.customerCare} />
          </View>
        </View>
        <View style={styles.center}>
          <Illustration style={styles.Illustration} />
        </View>
        <View style={styles.bottom}>
          <Text style={styles.quotes}>
            “Your identity, your access, your security”
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              navigation.push("AuthScreen", {
                signup: true,
              });
            }}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
          <Text style={styles.terms}>Terms and Conditions apply</Text>
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
    width: "100%",
    height: "100%",
  },
  top: {
    height: "17%",
    justifyContent: "start",
    alignItems: "center",
    width: "100%",
  },
  header: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    height: "100%",
  },
  logo: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "50%",
    height: "70%",
  },
  customerCare: {
    flex: 1,
    alignItems: "flex-end",
    alignSelf: "center",
    justifyContent: "center",
    width: "10%",
    height: "35%",
    marginTop: 40,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
    alignContent: "center",
    height: "60%",
  },
  bottom: {
    height: "27%",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
  quotes: {
    color: "#E0E3F8",
    fontFamily: "AfacadFlux-SemiBold",
    fontSize: 22,
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
    textAlign: "center",
    fontFamily: "AfacadFlux-Bold",
    fontSize: 22,
  },
  terms: {
    color: "#A6ADBA",
    fontFamily: "AfacadFlux-Medium",
    fontSize: 15,
  },
});

export default LandingScreen;
