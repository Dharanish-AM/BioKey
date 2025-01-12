import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import React from "react";
import colors from "../constants/colors";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useSelector } from "react-redux";
import { shallowEqual } from "react-redux";

import ProfileIcon from "../assets/images/profile_icon.png";
import DownArrow from "../assets/images/down_arrow.png";
import LogoutIcon from "../assets/images/logout_icon.png";
import AccountsIcon from "../assets/images/drawer_support.png";
import NotificationsIcon from "../assets/images/drawer_noti.png";
import LogsIcon from "../assets/images/drawer_history.png";
import SupportIcon from "../assets/images/drawer_accounts.png";

export default function DrawerView() {
  const user = useSelector((state) => state.user, shallowEqual);
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileContent}>
          <View style={styles.profileImageContainer}>
            {user.profileImage && user.profileImage !== "" ? (
              <Image
                source={{ uri: user.profileImage }}
                style={styles.profileIcon}
                resizeMode="cover"
              />
            ) : (
              <Image
                source={ProfileIcon}
                style={styles.profileIcon}
                resizeMode="cover"
              />
            )}
          </View>

          <View style={styles.bottomDetails}>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{user.userName}</Text>
              <Text style={styles.userEmail}>{user.userEmail}</Text>
            </View>
            <Image source={DownArrow} style={styles.downArrow} />
          </View>
        </View>
      </View>
      <View style={styles.border}></View>
      <View style={styles.center}>
        <TouchableOpacity style={styles.optionsButton}>
          <Image source={AccountsIcon} style={styles.optionsIcon} />
          <Text style={styles.optionsText}>Accounts</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionsButton}>
          <Image source={NotificationsIcon} style={styles.optionsIcon} />
          <Text style={styles.optionsText}>Notifications</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionsButton}>
          <Image source={LogsIcon} style={styles.optionsIcon} />
          <Text style={styles.optionsText}>Activity Logs</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionsButton}>
          <Image source={SupportIcon} style={styles.optionsIcon} />
          <Text style={styles.optionsText}>Support</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.bottom}>
        <TouchableOpacity style={styles.logout}>
          <Image source={LogoutIcon} style={styles.logoutIcon} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    flexDirection: "column",
    backgroundColor: colors.lightColor2,
  },
  header: {
    height: "20%",
    width: "100%",

    justifyContent: "space-evenly",
    marginTop: hp("7%"),
    flexDirection: "column",
    alignItems: "center",
    marginBottom: hp("1%"),
  },
  profileContent: {
    height: "100%",
    width: "100%",
    flexDirection: "column",
    paddingHorizontal: wp("4%"),
    justifyContent: "center",
  },

  profileImageContainer: {
    height: hp("10%"),
    width: hp("10%"),
    borderRadius: hp("5%"),
    backgroundColor: colors.secondaryColor2,
    justifyContent: "center",
    alignItems: "center",
  },

  profileIcon: {
    height: "100%",
    width: "100%",
    borderRadius: hp("5%"),
    resizeMode: "cover",
  },
  bottomDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userDetails: {
    flexDirection: "column",
  },
  downArrow: {
    width: wp("4.5%"),
    height: wp("4.5%"),
    resizeMode: "contain",
    tintColor: colors.textColor2,
  },
  profileImage: {
    height: hp("10%"),
    width: hp("10%"),
    resizeMode: "contain",
  },
  userName: {
    fontSize: hp("3%"),
    color: colors.textColor3,
    fontFamily: "Afacad-Medium",
    marginTop: hp("1.2%"),
  },
  userEmail: {
    fontSize: hp("1.8%"),
    color: colors.textColor2,
    fontFamily: "Afacad-Regular",
  },
  center: {
    flex: 1,
    width: "100%",
    paddingTop: hp("2%"),
    paddingHorizontal: wp("4%"),
  },
  optionsButton: {
    width: "100%",
    height: "10%",
    marginBottom: hp("2.5%"),
    flexDirection: "row",
    alignItems: "center",
    gap: wp("3%"),
  },
  optionsIcon: {
    width: wp("5%"),
    height: wp("5%"),
    resizeMode: "contain",
    tintColor: colors.textColor2,
  },
  optionsText: {
    fontSize: hp("2.3%"),
    color: colors.textColor3,
    fontFamily: "Afacad-Regular",
  },
  border: {
    width: "90%",
    height: "0.1%",
    backgroundColor: colors.textColor2,
    opacity: 0.2,
  },
  bottom: {
    height: "10%",
    width: "100%",
    marginBottom: hp("3%"),
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: wp("5%"),
  },
  logout: {
    flexDirection: "row",
    gap: wp("2.5%"),
    alignItems: "center",
  },
  logoutIcon: {
    aspectRatio: 1,
    width: wp("7%"),
    height: hp("7%"),
    resizeMode: "contain",
    tintColor: colors.textColor2,
  },
  logoutText: {
    fontSize: hp("2.5%"),
    color: colors.textColor2,
    fontFamily: "Afacad-Regular",
  },
});
