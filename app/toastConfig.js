import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { BlurView } from "expo-blur";
import colors from "./src/constants/colors";

const toastConfig = {
  success: ({ text1, text2 }) => (
    <View style={[styles.toastContainer, styles.success]}>
      <Feather name="check-circle" size={wp("6%")} color="#22C55E" style={styles.icon} />
      <View>
        <Text style={styles.title}>{text1}</Text>
        {text2 && <Text style={styles.message}>{text2}</Text>}
      </View>
    </View>
  ),
  error: ({ text1, text2 }) => (
    <View style={[styles.toastContainer, styles.error]}>
      <Feather name="x-circle" size={wp("6%")} color="#EF4444" style={styles.icon} />
      <View>
        <Text style={styles.title}>{text1}</Text>
        {text2 && <Text style={styles.message}>{text2}</Text>}
      </View>
    </View>
  ),
  warning: ({ text1, text2 }) => (
    <View style={[styles.toastContainer, styles.warning]}>
      <Feather name="alert-circle" size={wp("6%")} color="#FACC15" style={styles.icon} />
      <View>
        <Text style={styles.title}>{text1}</Text>
        {text2 && <Text style={styles.message}>{text2}</Text>}
      </View>
    </View>
  ),
};

const styles = StyleSheet.create({
  toastContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: wp("90%"),
    paddingVertical: hp("1.5%"),
    paddingHorizontal: wp("4%"),
    borderRadius: wp("3%"),
    backgroundColor: colors.lightColor1,
    marginTop: hp("2%"),
  },
  success: {
    borderLeftWidth: wp("1%"),
    borderLeftColor: "#22C55E",
  },
  error: {
    borderLeftWidth: wp("1%"),
    borderLeftColor: "#EF4444",
  },
  warning: {
    borderLeftWidth: wp("1%"),
    borderLeftColor: "#FACC15",
  },
  icon: {
    marginRight: wp("3%"),
  },
  title: {
    fontSize: wp("4.5%"),
    color: colors.textColor1,
    fontFamily: "Afacad-Medium"
  },
  message: {
    fontSize: wp("4%"),
    color: colors.textColor1,
    fontFamily: "Afacad-Regular"
  },
});

export default toastConfig;
