import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableHighlight,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import useCustomFonts from "../hooks/useLoadFonts";

import LogoutIcon from "../assets/images/logout.png";
import colors from "../constants/Color";
import ProfileIcon from "../assets/images/Profile.png";

import AccountIcon from "../assets/images/account.png";
import DeviceIcon from "../assets/images/deviceicon.png";
import SupportIcon from "../assets/images/support.png";

const ProfileView = ({ navigation }) => {
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
        <View style={styles.topProfileContainer}>
          <View style={styles.profileContainer}>
            <Image
              source={ProfileIcon}
              style={styles.profileImage}
              resizeMode="contain"
            />
            <View style={styles.profileDetailsContainer}>
              <Text style={styles.name}>Ajay</Text>
              <Text style={styles.email}>ajay@example.com</Text>
            </View>
          </View>
          <View style={styles.seperator}></View>
        </View>
      </View>
      <View style={styles.middle}>
        <View style={styles.optionsContainer}>
          <TouchableOpacity style={styles.accountContainer}>
            <Image
              source={AccountIcon}
              style={styles.accountImage}
              resizeMode="contain"
            />
            <Text style={styles.optionsText}>Accounts</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.manageDeviceContainer}>
            <Image
              source={DeviceIcon}
              style={styles.DeviceImage}
              resizeMode="contain"
            />
            <Text style={styles.optionsText}>Manage Device</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.supportContainer}>
            <Image
              source={SupportIcon}
              style={styles.supportImage}
              resizeMode="contain"
            />
            <Text style={styles.optionsText}>Recovery</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.bottom}>
        <TouchableOpacity style={styles.logoutContainer}>
          <Image
            source={LogoutIcon}
            style={styles.logoutIcon}
            resizeMode="contain"
          />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    flexDirection: "column",
  },
  top: {
    //backgroundColor: "red",
    height: hp("15%"),
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  profileContainer: {
    height: "70%",
    width: "100%",
    //backgroundColor: "blue",
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    paddingLeft: wp("5.5%"),
  },
  topProfileContainer: {
    height: "100%",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    gap: hp("1%"),
  },
  profileImage: {
    height: hp("6.5%"),
    width: hp("6.5%"),
    //backgroundColor: "red",
    alignSelf: "center",
  },
  profileDetailsContainer: {
    height: "100%",
    width: "70%",
    //backgroundColor: "green",
    justifyContent: "center",
    textAlign: "left",
    flexDirection: "column",
  },
  name: {
    fontSize: hp("3%"),
    color: colors.textColor3,
    fontFamily: "Afacad-Medium",
  },
  email: {
    fontSize: hp("2%"),
    color: colors.textColor2,
    fontFamily: "Afacad-Medium",
  },
  seperator: {
    height: "1%",
    width: "90%",
    backgroundColor: colors.lightColor1,
  },
  middle: {
    //backgroundColor: "blue",
    width: "100%",
    flex: 1,
    alignItems: "center",
    paddingTop: hp("2%"),
    flexDirection: "column",
  },
  optionsContainer: {
    width: "100%",
    height: "50%",
    alignItems: "center",
    flexDirection: "column",
    gap: hp("2.5%"),
  },
  accountImage: {
    height: hp("3.5%"),
    width: hp("3.5%"),
  },
  DeviceImage: {
    height: hp("3.5%"),
    width: hp("3.5%"),
  },
  supportImage: {
    height: hp("3.5%"),
    width: hp("3.5%"),
  },
  accountContainer: {
    width: "90%",
    height: hp("6%"),
    gap: wp("2%"),
    alignItems: "center",
    backgroundColor: "rgba(36, 41, 51, 0.3)",
    flexDirection: "row",
    borderRadius: hp("15%"),
    paddingLeft: wp("3%"),
  },
  manageDeviceContainer: {
    width: "90%",
    height: hp("6%"),
    gap: wp("2%"),
    alignItems: "center",
    backgroundColor: "rgba(36, 41, 51, 0.3)",
    flexDirection: "row",
    borderRadius: hp("15%"),
    paddingLeft: wp("3%"),
  },
  supportContainer: {
    width: "90%",
    height: hp("6%"),
    gap: wp("2%"),
    alignItems: "center",
    backgroundColor: "rgba(36, 41, 51, 0.3)",
    flexDirection: "row",
    borderRadius: hp("15%"),
    paddingLeft: wp("3%"),
  },
  optionsText: {
    fontSize: hp("2%"),
    color: colors.textColor3,
    fontFamily: "Afacad-Regular",
  },
  bottom: {
    //backgroundColor: "green",
    width: "100%",
    height: hp("10%"),
    alignItems: "flex-start",
    justifyContent: "center",
    paddingLeft: wp("5.5%"),
  },
  logoutContainer: {
    flexDirection: "row",
    width: "50%",
    height: "auto",
    gap: wp("1%"),
    alignItems: "center",
    //backgroundColor: "red",
  },
  logoutIcon: {
    width: wp("9%"),
    height: wp("9%"),
  },
  logoutText: {
    fontSize: hp("2.5%"),
    fontFamily: "Afacad-Medium",
    color: colors.textColor2,
  },
});

export default ProfileView;
