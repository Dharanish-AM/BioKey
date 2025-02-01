import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Linking,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import colors from "../../../constants/colors";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import * as Clipboard from "expo-clipboard";
import PullToRefresh from 'react-native-pull-to-refresh';

import BackIcon from "../../../assets/images/back_icon.png";
import EyeIcon from "../../../assets/images/eye.png";
import EyeOffIcon from "../../../assets/images/eye-crossed.png";
import EditIcon from "../../../assets/images/pencil.png";
import LinkIcon from "../../../assets/images/link.png";
import BinIcon from "../../../assets/images/trash_bottom_icon.png";
import { useDispatch } from "react-redux";
import { deletePassword, getPassword, getPasswordBreachStatus, handlePasswordUpdate } from "../../../services/passwordOperations";
import { useSelector } from "react-redux";
import LottieView from "lottie-react-native"

import NotBreachedAnimation from "../../../assets/animations/safe-notbreached.json";
import BreachedAnimation from "../../../assets/animations/breached.json";

export default function PasswordPreview({ navigation, route }) {
  const [passwordId, setPasswordId] = useState(route.params.passwordId);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [website, setWebsite] = useState("");
  const [note, setNote] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const dispatch = useDispatch();
  const [breachStatus, setBreachStatus] = useState();
  const [animationSource, setAnimationSource] = useState(null);
  const userId = useSelector((state) => state.user.userId);
  const [passwordData, setPasswordData] = useState(null);
  const [isBreachStatusLoading, setIsBreachStatusLoading] = useState(true);

  useEffect(() => {
    fetchPassword();
  }, [passwordId]);

  const fetchPassword = async () => {
    try {
      const response = await getPassword(userId, passwordId);
      const fetchedPasswordData = response.data;

      setName(fetchedPasswordData.name);
      setUsername(fetchedPasswordData.userName);
      setEmail(fetchedPasswordData.email);
      setPassword(fetchedPasswordData.password);
      setWebsite(fetchedPasswordData.website);
      setNote(fetchedPasswordData.note);

      setPasswordData(fetchedPasswordData);

      await fetchPasswordBreachStatus(fetchedPasswordData.password);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSavePress = async () => {
    if (isEditing && passwordData) {
      const changes = {};

      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (email.trim() !== passwordData.email) {
        if (!emailPattern.test(email.trim())) {
          Alert.alert("Invalid Email", "Please enter a valid email address.", [{ text: "OK" }]);
          return;
        }
        changes.email = email.trim();
      }

      if (username.trim() !== passwordData.userName) changes.userName = username.trim();
      if (password.trim() !== passwordData.password) changes.password = password.trim();
      if (website.trim() !== passwordData.website) changes.website = website.trim();
      if (note.trim() !== passwordData.note) changes.note = note.trim();

      if (Object.keys(changes).length > 0) {
        const response = await handlePasswordUpdate(userId, passwordId, changes,dispatch);
        if (response.status) {
          await fetchPassword();
          Alert.alert("Success", response.message || "Password updated successfully", [{ text: "OK" }]);
        } else {
          Alert.alert("Error", response.message || "Failed to update password. Please try again.", [{ text: "OK" }]);
        }
      } else {
        console.log("No changes detected.");
      }
    }

    setIsEditing(false);
  };




  const handleOpenLink = () => {
    let url = website;

    if (!url || typeof url !== "string" || url.trim() === "") {
      Alert.alert("No Website Provided", "", [{ text: "OK" }]);
      return;
    }

    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }

    Linking.openURL(url).catch((err) => {
      console.error("An error occurred while opening the URL:", err);
      Alert.alert(
        "Error",
        "An error occurred while opening the link. Please try again.",
        [{ text: "OK" }]
      );
    });
  };

  const handleDelete = async () => {
    Alert.alert(
      "Are you sure?",
      "Do you really want to delete this password?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const response = await deletePassword(
              userId,
              passwordId,
              dispatch
            );

            if (response.status) {
              Alert.alert(
                "Success",
                response.message || "Password has been deleted successfully",
                [{ text: "OK", onPress: () => navigation.goBack() }]
              );
            } else {
              Alert.alert(
                "Error",
                response.message ||
                "Failed to delete the password. Please try again.",
                [{ text: "OK" }]
              );
            }
          },
        },
      ]
    );
  };

  const handleCopyText = (text) => {
    Clipboard.setStringAsync(text);
  };

  const fetchPasswordBreachStatus = async (password) => {
    if (password) {
      setIsBreachStatusLoading(true);
      const response = await getPasswordBreachStatus(password);
      setBreachStatus(response);
      setIsBreachStatusLoading(false);
    }
  };


  const getBreachAnimation = () => {
    if (breachStatus) {
      if (breachStatus.breached) {
        return BreachedAnimation; 1
      } else {
        return NotBreachedAnimation;
      }
    }
    return null;
  };

  useEffect(() => {
    if (passwordData && passwordData.password) {
      fetchPasswordBreachStatus(passwordData.password);
    }
  }, [passwordData]);

  useEffect(() => {

    if (breachStatus) {
      const animation = getBreachAnimation();
      setAnimationSource(animation);
    }
  }, [breachStatus]);


  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.innerContainer}>
        <PullToRefresh offset={
          0
        } onRefresh={fetchPassword}>
          <View style={styles.top}>
            <TouchableOpacity
              onPress={() => {
                navigation.goBack();
              }}
              style={styles.backIconContainer}
            >
              <Image source={BackIcon} style={styles.backIcon} />
            </TouchableOpacity>
            <Text style={styles.titleText}>{name}</Text>
          </View>
          <View style={styles.center}>
            <View style={styles.passwordDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailTitle}>Username:</Text>
                <TextInput
                  style={[styles.inputField, isEditing && styles.editableInput]}
                  value={username || ""}
                  onChangeText={setUsername}
                  editable={isEditing}
                  onTouchStart={() => handleCopyText(username)}
                />
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailTitle}>Email:</Text>
                <TextInput
                  style={[styles.inputField, isEditing && styles.editableInput]}
                  value={email || ""}
                  onChangeText={setEmail}
                  editable={isEditing}
                  onTouchStart={() => handleCopyText(email)}
                />
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailTitle}>Password:</Text>
                <View style={styles.passwordFieldContainer}>
                  <TextInput
                    style={[styles.inputField, isEditing && styles.editableInput]}
                    value={password || ""}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    editable={isEditing}
                    onTouchStart={() => handleCopyText(password)}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIconContainer}>
                    <Image source={showPassword ? EyeIcon : EyeOffIcon} style={styles.eyeIcon} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailTitle}>Website:</Text>
                <TextInput
                  style={[styles.inputField, isEditing && styles.editableInput]}
                  value={website || ""}
                  onChangeText={setWebsite}
                  editable={isEditing}
                  onTouchStart={() => handleCopyText(website)}
                />
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailTitle}>Note:</Text>
                <TextInput
                  style={[styles.inputField, isEditing && styles.editableInput]}
                  value={note || ""}
                  onChangeText={setNote}
                  editable={isEditing}
                  onTouchStart={() => handleCopyText(note)}
                />
              </View>
            </View>

            <View style={styles.securityContainer}>
              <View style={styles.securityLeft}>
                {isBreachStatusLoading ? (
                  <ActivityIndicator size="small" />
                ) : (
                  <LottieView
                    autoPlay
                    loop={false}
                    style={{
                      width: animationSource === NotBreachedAnimation ? '100%' : '75%',
                      height: animationSource === NotBreachedAnimation ? '100%' : '75%',
                      aspectRatio: 1,
                    }}
                    source={animationSource || ""}
                  />
                )}
              </View>
              <View style={styles.sepView}></View>
              <View style={styles.securityRight}>
                <Text style={styles.securityTitle}>Breach Status</Text>
                <Text style={styles.securityText}>
                  {breachStatus ? (
                    breachStatus.breached ? (
                      <Text style={styles.breachedText}>
                        Password found in <Text style={styles.breachValue}>{breachStatus.breachCount}</Text> breaches.
                      </Text>
                    ) : (
                      <Text style={styles.safeText}>Password is safe, not found in any breach.</Text>
                    )
                  ) : (
                    <Text style={styles.noBreachText}>No breach status available</Text>
                  )}

                </Text>

                <Text style={styles.tipText}>Tip: Use a unique password for each service to minimize risk.</Text>

              </View>
            </View>


            <View style={[styles.optionsContainer,
            {
              marginBottom: Platform.OS == "android" ? hp("2%") : 0
            }]}>
              <TouchableOpacity
                style={styles.editContainer}
                onPress={() => {
                  if (isEditing) {
                    handleSavePress();
                  } else {
                    setIsEditing(true);
                  }
                }}
              >
                <Image source={isEditing ? null : EditIcon} style={styles.editIcon} />
                <Text style={styles.editText}>
                  {isEditing ? "Save" : "Edit"}
                </Text>
              </TouchableOpacity>


              <TouchableOpacity
                style={styles.linkContainer}
                onPress={handleOpenLink}
              >
                <Image source={LinkIcon} style={styles.iconTwo} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteContainer}
                onPress={handleDelete}
              >
                <Image source={BinIcon} style={styles.iconTwo} />
              </TouchableOpacity>
            </View>
          </View>
        </PullToRefresh>
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
    justifyContent: "space-between",
  },
  top: {
    width: wp("100%"),
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp("1%"),
    marginBottom: hp("1.5%"),
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
    gap: hp("2.5%"),
  },
  passwordDetails: {
    backgroundColor: colors.lightColor2,
    borderRadius: hp("3%"),
    padding: hp("3%"),
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: hp("51%")
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
  },
  inputField: {
    width: "100%",
    fontSize: hp("2.2%"),
    color: colors.textColor2,
    borderBottomColor: "rgba(166, 173, 186, 0.25)",
    borderBottomWidth: wp("0.2%"),
    padding: hp("0.5%"),
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
    bottom: hp("0%"),
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
    flexDirection: "row",
    alignItems: "center",
    maxHeight: hp("20%"),

  },
  securityLeft: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    width: "40%",
    borderTopLeftRadius: hp("3%"),
    borderBottomLeftRadius: hp("3%"),
  },
  sepView: {
    width: 0.7,
    height: "85%",
    backgroundColor: colors.textColor3,
    opacity: 0.1
  },
  securityRight: {
    flexDirection: "column",
    alignItems: "center",
    height: "100%",
    flex: 1,
    backgroundColor: colors.lightColor2,
    borderTopRightRadius: hp("3%"),
    borderBottomRightRadius: hp("3%"),
    padding: wp("4.5%"),
    justifyContent: "center",
    gap: hp("1%")
  },
  securityTitle: {
    fontSize: hp("2.5%"),
    color: colors.textColor3,
    fontFamily: "Afacad-Medium",
  },
  securityText: {
    fontSize: hp("2%"),
    color: colors.textColor3,
    fontFamily: "Afacad-Italic",
    color: "green",
    textAlign: "center"
  },
  breachedText: {
    color: "red"
  },
  breachValue: {
    textDecorationLine: 'underline',
    fontSize: hp("2.2%"),
  },
  tipText: {
    fontSize: hp("2%"),
    color: colors.textColor3,
    fontFamily: "Afacad-Italic",
    display: "none"
  },
  optionsContainer: {
    height: "9%",
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  editContainer: {
    height: "100%",
    width: "50%",
    backgroundColor: "rgba(103, 39, 212, 0.6)",
    borderRadius: hp("2%"),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: wp("5%"),
  },
  editIconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  editIcon: {
    width: wp("5.5%"),
    height: hp("5.5%"),
    aspectRatio: 1,
    resizeMode: "contain",
    tintColor: colors.textColor3,

  },
  editText: {
    fontSize: hp("2.8%"),
    color: colors.textColor3,
    fontFamily: "Afacad-Medium",
  },
  editableInput: {
    borderBottomColor: colors.textColor3,
  },
  linkContainer: {
    height: "100%",
    width: "20%",
    backgroundColor: colors.lightColor2,
    borderRadius: hp("2%"),
    alignItems: "center",
    justifyContent: "center",
  },
  deleteContainer: {
    height: "100%",
    width: "20%",
    backgroundColor: colors.lightColor2,
    borderRadius: hp("2%"),
    alignItems: "center",
    justifyContent: "center",
  },
  iconTwo: {
    width: "45%",
    height: "45%",
    resizeMode: "contain",
    tintColor: colors.textColor3,
  },
});
