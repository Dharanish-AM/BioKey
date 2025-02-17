import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import colors from "../../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import AntDesign from '@expo/vector-icons/AntDesign';
import { useSelector } from "react-redux";

export default function SettingsScreen({ navigation }) {
  const version = useSelector((state) => state.appConfig.version)
  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.container}>
      <View style={styles.innerContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>
        <View style={styles.content}>
          <View style={styles.settingsOptions}>
            {options.map((option, index) => (
              <TouchableOpacity onPress={() => {
                if (option == "Support") {
                  navigation.navigate('Support')
                }
                else if (option == "App Preferences") {
                  navigation.navigate('AppPreferences')
                }
                else if (option == "Security & Privacy") {
                  navigation.navigate('SecurityPrivacy')
                }
              }} key={index} style={styles.option}>
                <Text style={styles.text}>{option}</Text>
                <AntDesign name="right" size={hp("2.5%")} color={colors.textColor2} />
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.versionText}>v{version}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const options = [
  "App Preferences",
  "Security & Privacy",
  "Support"
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondaryColor1,
    alignItems: "center",
    justifyContent: "center",
  },
  innerContainer: {
    flex: 1,
    width: wp("100%"),
  },
  header: {
    flexDirection: "row",
    width: wp("100%"),
    alignItems: "center",
    paddingHorizontal: wp("5%"),
    marginBottom: hp("3%")
  },
  title: {
    fontSize: hp("4%"),
    color: colors.textColor3,
    fontFamily: "Afacad-SemiBold",
  },
  content: {
    flex: 1,
    width: wp("100%"),
    paddingHorizontal: wp("5%"),
    justifyContent: "space-between",
  },
  settingsOptions: {
    gap: hp("3%")
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp("2%"),

  },
  text: {
    fontSize: hp("2.5%"),
    fontFamily: "Afacad-Regular",
    color: colors.textColor2,
  },
  versionText: {
    color: colors.textColor2,
    fontFamily: "Afacad-Regular",
    fontSize: hp("2.2%"),
    alignSelf: "center",
    marginBottom: hp("2%")
  }
});