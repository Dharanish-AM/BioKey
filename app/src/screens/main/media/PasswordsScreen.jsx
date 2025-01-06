import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Easing,
  TextInput,
  FlatList,
  RefreshControl,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import colors from "../../../constants/colors";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

import SearchIcon from "../../../assets/images/new_search_icon.png";
import FilterIcon from "../../../assets/images/filter_icon.png";
import BackIcon from "../../../assets/images/back_icon.png";
import MoreIcon from "../../../assets/images/more_icon.png";

import InstagramIcon from "../../../assets/icons/instagram.png";
import GoogleIcon from "../../../assets/icons/google.png";
import TwitterIcon from "../../../assets/icons/twitter.png";
import LinkedInIcon from "../../../assets/icons/linkedin.png";
import FacebookIcon from "../../../assets/icons/facebook.png";
import SnapchatIcon from "../../../assets/icons/snapchat.png";
import RedditIcon from "../../../assets/icons/reddit.png";

export default function PasswordsScreen({ navigation }) {
  const [width] = useState(new Animated.Value(0));
  const [opacity] = useState(new Animated.Value(0));
  const [iconsOpacity] = useState(new Animated.Value(1));
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [passwords] = useState(
    [
      { name: "Instagram", email: "user1@example.com" },
      { name: "Facebook", email: "user2@example.com" },
      { name: "Twitter", email: "user3@example.com" },
      { name: "Google", email: "user4@example.com" },
      { name: "LinkedIn", email: "user5@example.com" },
      { name: "Snapchat", email: "user6@example.com" },
      { name: "Reddit", email: "user7@example.com" },
      { name: "Pinterest", email: "user8@example.com" },
      { name: "Netflix", email: "user9@example.com" },
      { name: "Amazon", email: "user10@example.com" },
    ].sort((a, b) => a.name.localeCompare(b.name))
  );

  const [filteredPasswords, setFilteredPasswords] = useState(passwords);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setFilteredPasswords(passwords);
      setIsRefreshing(false);
    }, 1000);
  };

  const handleSearchIconClick = () => {
    setIsSearchActive(true);
    Animated.parallel([
      Animated.timing(width, {
        toValue: hp("22%"),
        duration: 400,
        useNativeDriver: false,
        easing: Easing.inOut(Easing.ease),
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: false,
        easing: Easing.inOut(Easing.ease),
      }),
      Animated.timing(iconsOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: false,
        easing: Easing.inOut(Easing.ease),
      }),
    ]).start();
  };

  const handleCancelSearch = () => {
    Animated.parallel([
      Animated.timing(width, {
        toValue: 0,
        duration: 400,
        useNativeDriver: false,
        easing: Easing.inOut(Easing.ease),
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: false,
        easing: Easing.inOut(Easing.ease),
      }),
      Animated.timing(iconsOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: false,
        easing: Easing.inOut(Easing.ease),
      }),
    ]).start(() => setIsSearchActive(false));
  };

  const handleSearchChange = (text) => {
    setSearchTerm(text);
    const filteredData = passwords.filter((password) =>
      password.toString().includes(text)
    );
    setFilteredPasswords(filteredData);
  };

  const handleSubmitEditing = () => {
    handleCancelSearch();
  };

  const handlePress = (item) => {
    navigation.navigate("PasswordPreview");
  };

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={() => handlePress(item)}
        style={styles.passwordContainer}
      >
        <View style={styles.iconContainer}></View>
        <View style={styles.passwordDetails}>
          <Text style={styles.passwordName}>{item.name}</Text>
          <Text style={styles.passwordEmail}>{item.email}</Text>
        </View>
        <View style={styles.moreIconContainer}>
          <Image source={MoreIcon} style={styles.moreIcon} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView edges={["right", "left", "top"]} style={styles.container}>
      <View style={styles.innerContainer}>
        <View style={styles.top}>
          <TouchableOpacity
            style={styles.backIconContainer}
            onPress={() => navigation.goBack()}
          >
            <Image source={BackIcon} style={styles.backIcon} />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>Passwords</Text>

          <View style={styles.filterContainer}>
            <Animated.View
              style={[styles.filterContainer, { opacity: iconsOpacity }]}
            >
              {!isSearchActive && (
                <TouchableOpacity style={styles.filterIconContainer}>
                  <Image source={FilterIcon} style={styles.filterIcon} />
                </TouchableOpacity>
              )}

              {!isSearchActive && (
                <TouchableOpacity
                  style={styles.searchIconContainer}
                  onPress={handleSearchIconClick}
                >
                  <Image source={SearchIcon} style={styles.searchIcon} />
                </TouchableOpacity>
              )}
            </Animated.View>

            {isSearchActive && (
              <Animated.View
                style={[styles.inputContainer, { width, opacity }]}
              >
                <TextInput
                  style={styles.textInput}
                  placeholder="Search..."
                  value={searchTerm}
                  onChangeText={handleSearchChange}
                  autoFocus={true}
                  onSubmitEditing={handleSubmitEditing}
                  returnKeyType="done"
                />
              </Animated.View>
            )}
          </View>
        </View>
        <View style={styles.center}>
          <FlatList
            data={filteredPasswords}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No passwords found.</Text>
            }
            contentContainerStyle={{
              flexGrow: 1,
              paddingHorizontal: wp("3.5%"),
              paddingBottom: hp("3%"),
            }}
            style={{
              width: wp("100%"),
            }}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
              />
            }
          />
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
    height: hp("10%"),
    width: wp("100%"),
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp("1%"),
    justifyContent: "space-between",
  },
  titleContainer: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    textAlignVertical: "center",
    alignSelf: "center",
    height: "80%",
  },
  backIconContainer: {
    height: hp("4.5%"),
    width: hp("4.5%"),
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    flex: 1,
    aspectRatio: 1,
    resizeMode: "contain",
  },
  screenTitle: {
    fontSize: hp("4%"),
    fontFamily: "Afacad-SemiBold",
    color: colors.textColor3,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: wp("4%"),
    flex: 1,
    alignItems: "center",
    marginRight: wp("1%"),
    height: "80%",
  },
  searchIconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  searchIcon: {
    height: hp("3.5%"),
    aspectRatio: 1,
    resizeMode: "contain",
    tintColor: colors.textColor3,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.secondaryColor2,
    borderRadius: hp("2%"),
    paddingHorizontal: hp("2%"),
    overflow: "hidden",
    height: "70%",
  },
  textInput: {
    height: "100%",
    fontSize: hp("1.7%"),
    flex: 1,
    fontFamily: "Afacad-Medium",
    color: colors.textColor3,
  },
  filterIconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  filterIcon: {
    height: hp("4.7%"),
    aspectRatio: 1,
    resizeMode: "contain",
    tintColor: colors.textColor3,
  },
  center: {
    flexDirection: "column",
    flex: 1,
    width: wp("100%"),
    alignItems: "center",
    justifyContent: "flex-start",
  },
  passwordContainer: {
    width: "100%",
    height: hp("10%"),
    marginVertical: hp("1%"),
    borderBottomColor: "rgba(166, 173, 186, 0.25)",
    borderBottomWidth: wp("0.1%"),
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: "3%",
    justifyContent: "space-between",
  },
  iconContainer: {
    width: "20%",
    aspectRatio: 1,
    backgroundColor: colors.lightColor2,
    borderRadius: hp("50%"),
  },
  passwordDetails: {
    justifyContent: "center",
    marginRight: "25%",
  },
  passwordName: {
    fontSize: hp("2.5%"),
    color: colors.textColor3,
    fontFamily: "Afacad-Medium",
  },
  passwordEmail: {
    fontSize: hp("1.9%"),
    color: colors.textColor2,
    fontFamily: "Afacad-Regular",
  },
  emptyText: {
    fontSize: hp("2%"),
    color: colors.textColor3,
    textAlign: "center",
    marginTop: hp("5%"),
  },
  moreIconContainer: {
    height: "40%",
    aspectRatio: 1,
    opacity: 0.5,
  },
  moreIcon: {
    width: "100%",
    height: "100%",
  },
});
