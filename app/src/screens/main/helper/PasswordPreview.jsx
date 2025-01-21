import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Linking,
  Clipboard,
  Alert,
  Platform,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import colors from "../../../constants/colors";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

import BackIcon from "../../../assets/images/back_icon.png";
import EyeIcon from "../../../assets/images/eye.png";
import EyeOffIcon from "../../../assets/images/eye-crossed.png";
import EditIcon from "../../../assets/images/pencil.png";
import LinkIcon from "../../../assets/images/link.png";
import BinIcon from "../../../assets/images/trash_bottom_icon.png";
import { useDispatch } from "react-redux";
import { deletePassword } from "../../../services/passwordOperations";

export default function PasswordPreview({ navigation, route }) {
  const { passwordData } = route.params;

  const [username, setUsername] = useState(passwordData.userName);
  const [email, setEmail] = useState(passwordData.email);
  const [password, setPassword] = useState(passwordData.password);
  const [website, setWebsite] = useState(passwordData.website);
  const [note, setNote] = useState(passwordData.note);
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.user.userId);

  const handleEditPress = () => {
    setIsEditing(!isEditing);
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
              passwordData._id,
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
    Clipboard.setString(text);
  };

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
                style={[styles.inputField, isEditing && styles.editableInput]}
                value={username || ""}
                onChangeText={setUsername}
                placeholder={username ? "" : "No Username"}
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
                placeholder={email ? "" : "No Email"}
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
                  secureTextEntry={showPassword ? false : true}
                  autoCompleteType="off"
                  textContentType="none"
                  editable={isEditing}
                  onTouchStart={() => handleCopyText(password)}
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
                style={[styles.inputField, isEditing && styles.editableInput]}
                value={website || ""}
                onChangeText={setWebsite}
                placeholder={website ? "" : "No Website"}
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
                placeholder={note ? "" : "No Note"}
                editable={isEditing}
                onTouchStart={() => handleCopyText(note)}
              />
            </View>
          </View>

          <View style={styles.securityContainer
          }></View>

          <View style={[styles.optionsContainer,
          {
            marginBottom: Platform.OS == "android" ? hp("2%") : 0
          }]}>
            <TouchableOpacity
              style={styles.editContainer}
              onPress={handleEditPress}
            >
              <View style={styles.editIconContainer}>
                <Image source={EditIcon} style={styles.editIcon} />
              </View>

              <Text style={styles.editText}>{isEditing ? "Save" : "Edit"}</Text>
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
  height: hp("6%"),
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
    padding: hp("2.5%"),
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
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
    width: wp("2.8%"),
    height: hp("2.8%"),
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
