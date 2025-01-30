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
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import colors from "../../../constants/colors";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useSelector, useDispatch } from "react-redux";
import RBSheet from "react-native-raw-bottom-sheet";

import SearchIcon from "../../../assets/images/new_search_icon.png";
import FilterIcon from "../../../assets/images/filter_icon.png";
import BackIcon from "../../../assets/images/back_icon.png";
import MoreIcon from "../../../assets/images/more_icon.png";
import PlusIcon from "../../../assets/images/plus_icon.png";

import InstagramIcon from "../../../assets/icons/instagram.png";
import GoogleIcon from "../../../assets/icons/google.png";
import TwitterIcon from "../../../assets/icons/twitter.png";
import LinkedInIcon from "../../../assets/icons/linkedin.png";
import FacebookIcon from "../../../assets/icons/facebook.png";
import SnapchatIcon from "../../../assets/icons/snapchat.png";
import RedditIcon from "../../../assets/icons/reddit.png";
import NetflixIcon from "../../../assets/icons/netflix.png";
import PinterestIcon from "../../../assets/icons/pintrest.png";
import AmazonIcon from "../../../assets/icons/amazon.png";
import FlipkartIcon from "../../../assets/icons/flipkart.png";
import { getAllPasswords } from "../../../services/passwordOperations";
import AddPasswordSheet from "../../../components/AddPasswordSheet";
import { shallowEqual } from "react-redux";
import { setFirstRender } from "../../../redux/actions";

export default function PasswordsScreen({ navigation }) {
  const [width] = useState(new Animated.Value(0));
  const [opacity] = useState(new Animated.Value(0));
  const [iconsOpacity] = useState(new Animated.Value(1));
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dispatch = useDispatch();
  const bottomSheetRef = useRef();
  const [filteredPasswords, setFilteredPasswords] = useState(passwords);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const userId = useSelector((state) => state.user.userId);

  const passwords = useSelector((state) => state.passwords.passwords);

  const isFirstRender = useSelector(
    (state) => state.appConfig.isFirstRender.passwordsScreen
  );

  useEffect(() => {
    if (!isFirstRender) return;
    getAllPasswords(userId, dispatch);
    dispatch(setFirstRender("passwordsScreen"));
  }, []);

  useEffect(() => {
    setFilteredPasswords(passwords);
  }, [passwords]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    getAllPasswords(userId, dispatch);
    setIsRefreshing(false);
  };

  const handleAddPassword = () => {
    bottomSheetRef.current.open();
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
    const filteredData = passwords.filter(
      (password) =>
        password.name.toLowerCase().includes(text.toLowerCase()) ||
        password.email.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredPasswords(filteredData);
  };

  const handleSubmitEditing = () => {
    handleCancelSearch();
  };

  const handlePress = (item) => {
    navigation.navigate("PasswordPreview", {
      passwordId: item._id,
    });
  };

  const renderItem = ({ item }) => {
    let iconSource;

    switch (item.name.toLowerCase()) {
      case "amazon":
        iconSource = AmazonIcon;
        break;
      case "instagram":
        iconSource = InstagramIcon;
        break;
      case "facebook":
        iconSource = FacebookIcon;
        break;
      case "twitter":
        iconSource = TwitterIcon;
        break;
      case "google":
        iconSource = GoogleIcon;
        break;
      case "linkedin":
        iconSource = LinkedInIcon;
        break;
      case "snapchat":
        iconSource = SnapchatIcon;
        break;
      case "reddit":
        iconSource = RedditIcon;
        break;
      case "netflix":
        iconSource = NetflixIcon;
        break;
      case "pinterest":
        iconSource = PinterestIcon;
        break;
      case "flipkart":
        iconSource = FlipkartIcon;
        break;
      default:
        iconSource = item.name.charAt(0).toUpperCase();
    }

    return (
      <TouchableOpacity
        onPress={() => handlePress(item)}
        style={styles.passwordContainer}
      >
        <View style={styles.parentPassword}>
          <View style={styles.iconContainer}>
            {typeof iconSource === "string" ? (
              <View style={styles.iconTextContainer}>
                <Text style={styles.iconText}>{iconSource}</Text>
              </View>
            ) : (
              <Image
                source={iconSource}
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: hp("50%"),
                }}
              />
            )}
          </View>
          <View style={styles.passwordDetails}>
            <Text style={styles.passwordName}>{item.name}</Text>
            <Text style={styles.passwordEmail}>
              {item.email || item.userName}
            </Text>
          </View>
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
          {
            !filteredPasswords ? (
              <Text style={styles.noPasswordsText}>No passwords found</Text>
            ) : (
              <FlatList
                data={filteredPasswords}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
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
              />)
          }
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            handleAddPassword();
          }}
        >
          <Image source={PlusIcon} style={styles.plusIcon} />
        </TouchableOpacity>

        <RBSheet
          ref={bottomSheetRef}
          height={hp("85%")}
          openDuration={250}
          draggable={true}
          animationType="slide"
          closeOnPressMask={true}
          closeOnDragDown={true}
          keyboardAvoidingViewEnabled={true}
          customStyles={{
            container: {
              borderTopLeftRadius: hp("3%"),
              borderTopRightRadius: hp("3%"),
              backgroundColor: colors.lightColor2,
            },
            mask: {
              backgroundColor: "rgba(0, 0, 0, 0.5)",
            },
          }}
        >
          <AddPasswordSheet bottomSheetRef={bottomSheetRef} />
        </RBSheet>
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
    width: wp("100%"),
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp("1%"),
    justifyContent: "space-between",

  },
  backIconContainer: {
    height: hp("6%"),
    width: hp("4.5%"),
    flexDirection: "row",
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
  },
  searchIconContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: hp("3.2%"),
    aspectRatio: 1,
  },
  searchIcon: {
    width: "100%",
    height: "100%",
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
    height: hp("6%"),
  },
  textInput: {
    height: "100%",
    fontSize: hp("1.7%"),
    flex: 1,
    fontFamily: "Montserrat-Medium",
    color: colors.textColor3,
  },
  filterIconContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: hp("3.2%"),
    aspectRatio: 1,
  },
  filterIcon: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
    tintColor: colors.textColor3,
  },
  center: {
    flexDirection: "column",
    flex: 1,
    width: wp("100%"),
    alignItems: "center",
    justifyContent: "flex-start",
  }, noPasswordsText: {
    fontSize: hp("2.5%"),
    color: colors.textColor3,
    textAlign: "center",
    top: "50%",
    bottom: "50%",
    fontFamily: "Afacad-Italic",
    alignSelf: "center",
  },
  parentPassword: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: wp("5%"),
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
    width: wp("15%"),
    aspectRatio: 1,
    borderRadius: hp("50%"),
  },
  iconTextContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.lightColor1,
    borderRadius: hp("50%"),
  },
  iconText: {
    fontSize: hp("3%"),
    color: colors.textColor3,
    fontFamily: "Afacad-Medium",
    textAlign: "center",
  },
  passwordDetails: {
    justifyContent: "center",
    marginRight: wp("5%"),
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
    fontSize: hp("2.5%"),
    color: colors.textColor3,
    textAlign: "center",
    marginTop: hp("5%"),
    fontFamily: "Afacad-Italic",
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
  addButton: {
    position: "absolute",
    right: wp("7%"),
    bottom: hp("3%"),
    width: hp("8%"),
    aspectRatio: 1,
    backgroundColor: "rgba(101, 48, 194, 0.95)",
    borderRadius: hp("100%"),
    alignItems: "center",
    justifyContent: "center",
  },
  plusIcon: {
    width: "50%",
    height: "50%",
    opacity: 0.9,
  },
});
