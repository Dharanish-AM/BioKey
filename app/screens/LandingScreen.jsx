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
              navigation.push("Signup");
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
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1F242D",
  },
  loadingText: {
    color: "#A6ADBA",
  },
  top: {
    justifyContent: "center",
    alignItems: "center",
    height: "17%",
  },
  header: {
    flexDirection: "row",
    width: "95%",
    height: "95%",
    paddingLeft: 5,
    paddingRight:5,
    justifyContent: "space-between",
    alignContent: "center",
    alignItems: "center",
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
    fontFamily: "AfacadFluxSemiBold",
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
    fontFamily: "AfacadFluxBold",
    fontSize: 22,
  },
  terms: {
    color: "#A6ADBA",
    fontFamily: "AfacadFluxMedium",
    fontSize: 15,
  },
});

export default LandingScreen;
