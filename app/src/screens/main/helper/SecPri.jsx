import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import colors from "../../../constants/colors";
import { Entypo } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import FingyIcon from "../../../assets/images/FINGY.png";

export default function SecPri({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Entypo
              name="chevron-thin-left"
              size={hp("4%")}
              color={colors.textColor3}
            />
          </TouchableOpacity>
          <Text style={styles.headerText}>Security & Privacy</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.contentText}>
            At Biokey, the security and privacy of your data is our utmost
            priority. We understand the value of your personal information and
            strive to implement the highest standards of data protection. Biokey
            utilizes advanced encryption technologies to ensure that your
            biometric data, personal details, and all other sensitive
            information remain secure at all times.
            {"\n\n"}Our platform leverages RSA key encryption to protect your
            login credentials, including your user ID and password. This
            encryption ensures that your information is safe from unauthorized
            access, both during storage and transmission. Additionally, your
            fingerprint data is never transmitted over the internet and is
            stored securely on your device, providing an added layer of
            protection against potential threats.
            {"\n\n"}We use secure WebSocket connections to communicate between
            the app and devices, ensuring that all data exchanged is encrypted
            and cannot be intercepted. This secure communication protocol
            provides real-time updates while maintaining your privacy.
            {"\n\n"}Biokey's privacy policy is designed to be transparent and
            user-friendly, so you can have full control over your data. We do
            not share or sell your personal information to third parties. Any
            data collected is used exclusively to enhance your experience with
            the Biokey platform, providing you with a seamless and secure
            service.
            {"\n\n"}We are committed to continuously improving our security
            measures to meet evolving standards. With Biokey, you can rest
            assured knowing that your personal information is safeguarded with
            the highest level of security and privacy.
            {"\n\n"}Thank you for choosing Biokey. We are dedicated to providing
            you with a safe and reliable platform.
          </Text>
        </ScrollView>
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
    flexDirection: "row",
    alignItems: "center",
    width: wp("100%"),
    paddingHorizontal: wp("3%"),
    marginBottom: hp("3%"),
  },
  headerText: {
    fontSize: hp("3.5%"),
    color: colors.textColor3,
    marginLeft: wp("1%"),
    fontFamily: "Afacad-SemiBold",
  },
  content: {
    width: wp("100%"),
    paddingHorizontal: wp("5%"),
    paddingVertical: hp("2%"),
  },
  contentText: {
    fontSize: hp("2.2%"),
    color: colors.textColor3,
    lineHeight: hp("3.2%"),
    fontFamily: "Afacad-Regular",
  },
});
