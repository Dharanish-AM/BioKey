import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
} from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import colors from "../constants/colors";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

import BackIcon from "../assets/images/back_icon.png";
import EyeIcon from "../assets/images/eye.png";
import EyeOffIcon from "../assets/images/eye-crossed.png";

export default function PasswordPreview({ navigation, route }) {
  const { passwordData } = route.params;

  const [username, setUsername] = useState(passwordData.userName);
  const [email, setEmail] = useState(passwordData.email);
  const [password, setPassword] = useState(passwordData.password);
  const [website, setWebsite] = useState(passwordData.website);
  const [note, setNote] = useState(passwordData.note);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <View style={styles.top}>
          <TouchableOpacity
            onPress={() => {
              navigation.goBack();
            }}
            style={styles.backIconContainer}
          >
            <Image source={BackIcon} style={styles.backIcon} />
          </TouchableOpacity>
          <Text style={styles.titleText}>{passwordData.name}</Text>
        </View>
        <View style={styles.center}>
          <View style={styles.passwordDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailTitle}>Username:</Text>
              <TextInput
                style={styles.inputField}
                value={username || ""}
                onChangeText={setUsername}
                placeholder={username ? "" : "No Username"}
              />
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailTitle}>Email:</Text>
              <TextInput
                style={styles.inputField}
                value={email || ""}
                onChangeText={setEmail}
                placeholder={email ? "" : "No Email"}
              />
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailTitle}>Password:</Text>
              <View style={styles.passwordFieldContainer}>
                <TextInput
                  style={styles.inputField}
                  value={password || ""}
                  onChangeText={setPassword}
                  secureTextEntry={showPassword ? false : true}
                  autoCompleteType="off"
                  textContentType="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIconContainer}
                >
                  <Image
                    source={showPassword ? EyeIcon : EyeOffIcon}
                    style={styles.eyeIcon}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailTitle}>Website:</Text>
              <TextInput
                style={styles.inputField}
                value={website || ""}
                onChangeText={setWebsite}
                placeholder={website ? "" : "No Website"}
              />
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailTitle}>Note:</Text>
              <TextInput
                style={styles.inputField}
                value={note || ""}
                onChangeText={setNote}
                placeholder={note ? "" : "No Note"}
              />
            </View>
          </View>

          <View style={styles.securityContainer}></View>

          <View style={styles.optionsContainer}>
            <View style={styles.editContainer}></View>
            <View style={styles.linkContainer}></View>
            <View style={styles.deleteContainer}></View>
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
    alignItems: "center",
    justifyContent: "center",
  },
  innerContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
  },
  top: {
    height: hp("8%"),
    width: wp("100%"),
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp("1%"),
  },
  backIconContainer: {
    height: hp("5%"),
    width: hp("5%"),
  },
  backIcon: {
    flex: 1,
    aspectRatio: 1,
    resizeMode: "contain",
  },
  titleText: {
    fontSize: hp("4%"),
    color: colors.textColor3,
    fontFamily: "Afacad-SemiBold",
  },
  center: {
    width: wp("100%"),
    flex: 1,
    alignItems: "center",
    flexDirection: "column",
    paddingHorizontal: wp("3.5%"),
    justifyContent: "space-between",
    gap: hp("2.5%"),
  },
  passwordDetails: {
    height: "65%",
    width: "100%",
    backgroundColor: colors.lightColor2,
    borderRadius: hp("3%"),
    padding: wp("4%"),
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  detailRow: {
    flexDirection: "column",
    width: "100%",
    marginBottom: hp("2%"),
  },
  detailTitle: {
    fontSize: hp("2.5%"),
    fontFamily: "Afacad-Medium",
    color: colors.textColor3,
    marginBottom: hp("1%"),
  },
  inputField: {
    width: "100%",
    fontSize: hp("2.2%"),
    color: colors.textColor2,
    borderBottomColor: "rgba(166, 173, 186, 0.25)",
    borderBottomWidth: wp("0.2%"),
    padding: 0,
    marginBottom: hp("0%"),
    fontFamily: "Afacad-Regular",
  },
  passwordFieldContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  eyeIconContainer: {
    width: hp("5%"),
    height: hp("5%"),
    position: "absolute",
    right: wp("0%"),
    bottom: hp("1%"),
    alignItems: "center",
    justifyContent: "center",
  },
  eyeIcon: {
    width: "45%",
    height: "45%",
    resizeMode: "contain",
    tintColor: colors.textColor3,
    opacity: 0.7,
  },
  securityContainer: {
    flex: 1,
    width: "100%",
    backgroundColor: colors.lightColor2,
    borderRadius: hp("3%"),
  },
  optionsContainer: {
    height: "10%",
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  editContainer: {
    height: "100%",
    width: "50%",
    backgroundColor: colors.lightColor2,
    borderRadius: hp("2%"),
  },
  linkContainer: {
    height: "100%",
    width: "20%",
    backgroundColor: colors.lightColor2,
    borderRadius: hp("2%"),
  },
  deleteContainer: {
    height: "100%",
    width: "20%",
    backgroundColor: colors.lightColor2,
    borderRadius: hp("2%"),
  },
});
