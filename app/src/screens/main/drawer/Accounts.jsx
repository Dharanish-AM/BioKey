import { View, Text, StyleSheet, StatusBar, Image, TouchableOpacity, TouchableWithoutFeedback, ImageBackground, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, Modal, Keyboard } from 'react-native';
import React, { useRef, useState, useEffect } from 'react';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import colors from '../../../constants/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProfileIcon from '../../../assets/images/profile_icon_1.png';
import Feather from '@expo/vector-icons/Feather';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Pressable, TextInput } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from 'react-redux';
import { BlurView } from 'expo-blur';
import RBSheet from 'react-native-raw-bottom-sheet';
import FallBackProfileImage from '../../../assets/images/profile_icon.png';
import Toast from 'react-native-toast-message';
import { changePassword, handleProfileImageSet, loadUser, updateUserProfile } from '../../../services/userOperations';
import * as ImagePicker from "expo-image-picker";
import { setUser } from '../../../redux/actions';
import { Ionicons } from '@expo/vector-icons';

export default function Accounts({ navigation }) {
    const [isMoreOption, setIsMoreOption] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const user = useSelector((state) => state.user);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [userData, setUserData] = useState({
        name: user.userName,
        email: user.userEmail,
        phone: user.userPhone?.toString() ?? "",
        gender: user.userGender,
        location: user.userLocation
    });
    const [initialData, setInitialData] = useState({
        name: user.userName,
        email: user.userEmail,
        phone: user.userPhone?.toString() ?? "",
        gender: user.userGender,
        location: user.userLocation
    });
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(false);
    const [isChangePassword, setIsChangePassword] = useState(false);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [modalError, setModalError] = useState("");
    const token = useSelector((state) => state.auth.token)
    const userId = useSelector((state) => state.user.userId)
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const RBSheetRef = useRef()
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => setIsKeyboardVisible(true));
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => setIsKeyboardVisible(false));


        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    const handleOpenProfile = () => {
        setIsProfileOpen(!isProfileOpen);
    }

    const handleOptionSelect = async (option) => {
        setLoading(true)

        const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (mediaStatus !== "granted") {
            console.log("Permission to access media library is required!");
            return null;
        }


        let pickerResult;
        if (option === 'camera') {
            const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
            if (cameraStatus !== "granted") {
                console.log("Permission to access camera is required!");
                return null;
            }

            pickerResult = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                quality: 1,
                allowsEditing: true
            });
        } else if (option === 'gallery') {
            pickerResult = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ["images"],
                allowsMultipleSelection: false,
                quality: 1,
                allowsEditing: true
            });
        }

        if (!pickerResult.canceled) {
            try {
                const formData = new FormData();
                formData.append('userId', user.userId);

                formData.append('profileImage', {
                    uri: pickerResult.assets[0].uri,
                    type: pickerResult.assets[0].mimeType,
                    name: pickerResult.assets[0].fileName
                });


                const response = await handleProfileImageSet(user.userId, formData, dispatch);

                if (response?.success) {
                    try {
                        const userResponse = await loadUser(user.userId);

                        if (userResponse && typeof userResponse === "object") {
                            dispatch(setUser(userResponse));
                        } else {
                            console.error("Invalid userResponse format:", userResponse);
                        }

                        RBSheetRef.current.close();
                        Toast.show({
                            text1: "Profile picture updated successfully",
                            type: "success",
                        });
                    } catch (error) {
                        console.error("Error loading user:", error);
                        Toast.show({
                            text1: "Failed to update profile picture",
                            text2: "Error fetching user details",
                            type: "error",
                        });
                    }
                } else {
                    Toast.show({
                        text1: "Failed to update profile picture",
                        text2: response.message,
                        type: "error",
                    });
                }

            } catch (err) {
                console.log("Error", err);
            }
        }
        setLoading(false)
    };



    const handleSaveChanges = async () => {
        const isDataChanged = JSON.stringify(userData) !== JSON.stringify(initialData);

        if (isDataChanged) {
            const response = await updateUserProfile(user.userId, userData, dispatch)

            if (response.success) {
                const userResponse = await loadUser(user.userId);
                if (userResponse && typeof userResponse === "object") {
                    dispatch(setUser(userResponse));
                }
                Toast.show({
                    type: 'success',
                    text1: 'Profile Updated',
                })
                console.log('Changes saved');
            }
            else {
                Toast.show({
                    type: 'error',
                    text1: 'Failed to update profile',
                    text2: response.message
                })
            }
        } else {
            console.log('No changes made');
        }

        setIsEditing(false);
        setInitialData(userData);
    };

    const handleCancelChanges = () => {
        setUserData(initialData);
        setIsEditing(false);
    };

    const handleEditProfile = () => {
        setIsEditing((prev) => !prev);
        if (isEditing) {
            const isDataChanged = JSON.stringify(userData) !== JSON.stringify(initialData);
            if (isDataChanged) {
                console.log('Changes saved');
            } else {
                console.log('No changes made');
            }
        }
    };

    const handleChangePassword = async () => {
        if (!oldPassword || !newPassword || !confirmPassword) {
            setModalError("Please fill all fields");
            return;
        }


        const passwordRegex = /^(?=.*[A-Z])(?=.*[\W_]).{9,}$/;

        if (!passwordRegex.test(newPassword)) {
            setModalError(
                "New password must be at least 9 characters long, contain at least one uppercase letter, and one special character."
            );
            return;
        }

        if (newPassword !== confirmPassword) {
            setModalError("New password and confirm password do not match.");
            return;
        }

        if (!userId || !token) {
            setModalError("User authentication is required.");
            return;
        }

        try {
            const response = await changePassword(userId, oldPassword, newPassword, token);

            if (response?.success) {
                Toast.show({
                    text1: "Password changed successfully",
                    type: "success",
                });

                setOldPassword("");
                setNewPassword("");
                setConfirmPassword("");
                setModalError(null);
                setIsChangePassword(false);
            } else {
                Toast.show({
                    text1: "Failed to change password",
                    type: "error",
                    text2: response?.message || "An error occurred",
                });
            }
        } catch (error) {
            console.error("Change password error:", error);
            Toast.show({
                text1: "Error",
                type: "error",
                text2: "Something went wrong. Please try again.",
            });
        }
    };



    useEffect(() => {
        setInitialData({
            name: user.userName,
            email: user.userEmail,
            phone: user.userPhone?.toString() ?? "",
            gender: user.userGender,
            location: user.userLocation
        });
    }, [user]);

    const keyboardShouldPersistTaps = "handled";
    const keyboardVerticalOffset = Platform.OS === "ios" ? hp("10%") : 0;

    const renderInputField = (label, value, onChange, placeholder, keyboardType) => (
        <View style={styles.inputContainer}>
            <Text style={styles.label}>{label}:</Text>
            <TextInput
                editable={isEditing}
                style={[styles.input, isEditing && styles.inputEditing]}
                value={value}
                onChangeText={onChange}
                placeholder={placeholder}
                keyboardType={keyboardType}
            />
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
            <StatusBar backgroundColor={colors.lightColor1} barStyle="light-content" />

            <View style={styles.innerContainer}>
                {
                    loading && <ActivityIndicator size="large" style={{
                        position: 'absolute',
                        top: hp('50%'),
                        left: 0,
                        right: 0,

                    }} />
                }
                <TouchableOpacity onPress={() => RBSheetRef.current.open()} style={styles.editContainer}>
                    <MaterialCommunityIcons name="pencil-outline" size={hp("2.5%")} color={colors.secondaryColor1} />
                </TouchableOpacity>

                <TouchableOpacity onPress={handleOpenProfile} style={styles.profileContainer}>
                    {
                        user.profileImage ? <Image style={styles.profileImageOg} source={{
                            uri: user.profileImage
                        }} /> :
                            <Image style={styles.profileImage} source={FallBackProfileImage} />
                    }
                </TouchableOpacity>

                <View style={styles.top}>
                    <View style={styles.header}>
                        <TouchableOpacity style={styles.backIconContainer} onPress={() => navigation.goBack()}>
                            <Entypo name="chevron-thin-left" size={hp("4%")} color={colors.textColor3} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.moreIconContainer} onPress={() => setIsMoreOption(true)}>
                            <Feather name="more-vertical" size={hp("4%")} color={colors.textColor3} />
                        </TouchableOpacity>
                    </View>
                </View>

                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : null} style={styles.bottom}>
                    <FlatList
                        data={["name", "email", "phone", "gender", "location"]}
                        renderItem={({ item }) => renderInputField(item.charAt(0).toUpperCase() + item.slice(1), userData[item], (text) => setUserData((prev) => ({ ...prev, [item]: text })), `Enter ${item.charAt(0).toUpperCase() + item.slice(1)}`, item === "email" ? "email-address" : item === "phone" ? "phone-pad" : "default")}
                        keyExtractor={(item) => item}
                        keyboardShouldPersistTaps={keyboardShouldPersistTaps}

                        style={{
                            flexGrow: 1,
                            width: wp("90%"),
                        }}
                    />
                </KeyboardAvoidingView>
                <View style={styles.optionsContainer}>
                    {
                        isEditing ?
                            <Pressable onPress={handleSaveChanges}>
                                <Text style={styles.option}>Save Changes</Text>
                            </Pressable> :
                            <Pressable onPress={handleEditProfile}>
                                <Text style={styles.option}>Edit Profile</Text>
                            </Pressable>
                    }
                    {isEditing && (
                        <Pressable onPress={handleCancelChanges}>
                            <Text style={styles.option}>Cancel</Text>
                        </Pressable>
                    )}
                    {!isEditing && (
                        <Pressable onPress={() => {
                            setIsChangePassword(true)
                        }}>
                            <Text style={styles.option}>Change Password</Text>
                        </Pressable>
                    )}
                </View>
            </View>

            {isMoreOption && (
                <TouchableWithoutFeedback onPress={() => setIsMoreOption(false)}>
                    <View style={styles.overlay1}>
                        <View style={styles.moreOptionsContainer}>
                            <TouchableOpacity onPress={() => setIsMoreOption(false)}>
                                <Text style={[styles.option, { color: colors.red }]}>Delete Account</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            )}

            {isProfileOpen && (
                <BlurView onTouchEnd={() => setIsProfileOpen(false)} style={styles.blurryContainer}>
                    {
                        user.profileImage ? <Image style={styles.fullProfileImage} source={{
                            uri: user.profileImage
                        }} /> :
                            <Image style={styles.fullProfileImage} source={FallBackProfileImage} />
                    }
                </BlurView>
            )}

            <RBSheet
                ref={RBSheetRef}
                closeOnDragDown={true}
                closeOnPressMask={true}
                draggable={true}
                height={hp("30%")}
                customStyles={{
                    container: {
                        backgroundColor: colors.secondaryColor1,
                        borderTopLeftRadius: hp("5%"),
                        borderTopRightRadius: hp("5%"),
                    }
                }}
            >
                <View style={styles.sheetContainer}>
                    <Text style={styles.sheetHeader}>Choose from</Text>
                    <View style={styles.sheetOptions}>
                        <Pressable onPress={() => handleOptionSelect('camera')}>
                            <Text style={styles.sheetOption}>Take Photo</Text>
                        </Pressable>
                        <Pressable onPress={() => handleOptionSelect('gallery')}>
                            <Text style={styles.sheetOption}>Choose from Gallery</Text>
                        </Pressable>
                    </View>
                </View>

            </RBSheet>
            <Modal visible={isChangePassword} transparent={true} animationType="fade">
                <View style={styles.overlay}>
                    <View style={[styles.modalContainer, isKeyboardVisible && { marginBottom: hp("25%") }]}>
                        {modalError && <Text style={styles.errorText}>{modalError}</Text>}

                        <View>
                            <Text style={styles.modalLabel}>Old Password:</Text>
                            <View >
                                <TextInput
                                    value={oldPassword}
                                    onChangeText={setOldPassword}
                                    style={styles.modalInput}
                                    placeholder="Enter your old password"
                                    secureTextEntry={!showOldPassword}
                                />
                                <TouchableOpacity onPress={() => setShowOldPassword(!showOldPassword)}>
                                    <Ionicons
                                        name={showOldPassword ? "eye-off" : "eye"}
                                        size={hp("2.5%")}
                                        color="gray"
                                        style={styles.eyeIcon}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View>
                            <Text style={styles.modalLabel}>New Password:</Text>
                            <View >
                                <TextInput
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    style={styles.modalInput}
                                    placeholder="Enter your new password"
                                    secureTextEntry={!showNewPassword}
                                />
                                <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                                    <Ionicons
                                        name={showNewPassword ? "eye-off" : "eye"}
                                        size={hp("2.5%")}
                                        color="gray"
                                        style={styles.eyeIcon}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>


                        <View>
                            <Text style={styles.modalLabel}>Confirm New Password:</Text>
                            <View >
                                <TextInput
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    style={styles.modalInput}
                                    placeholder="Enter your new password"
                                    secureTextEntry={!showConfirmPassword}
                                />
                                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                    <Ionicons
                                        name={showConfirmPassword ? "eye-off" : "eye"}
                                        size={hp("2.5%")}
                                        color="gray"
                                        style={styles.eyeIcon}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>


                        <View style={styles.buttonContainer}>
                            <Text onPress={() => {
                                setIsChangePassword(false);
                                setOldPassword("");
                                setNewPassword("");
                                setConfirmPassword("");
                            }} style={styles.modalOptions}>Cancel</Text>

                            <Text style={[styles.modalOptions, { color: "#9366E2" }]} onPress={handleChangePassword}>
                                Change Password
                            </Text>
                        </View>
                    </View>
                </View>
            </Modal>

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
    top: {
        width: wp('100%'),
        height: hp("20%"),
        backgroundColor: colors.lightColor1,
    },
    header: {
        width: wp('100%'),
        justifyContent: "space-between",
        alignItems: "center",
        flexDirection: "row",
        marginTop: hp('7%'),
        paddingHorizontal: wp("3%"),
    },
    profileContainer: {
        aspectRatio: 1,
        height: hp('18%'),
        width: hp('18%'),
        backgroundColor: colors.darkColor,
        position: "absolute",
        zIndex: 1,
        top: hp("10%"),
        borderRadius: hp("1000%"),
        borderColor: "#5F2ABD",
        borderWidth: hp('0.2%'),
        padding: hp("0.5%"),
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    profileImage: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
        borderRadius: hp("1000%"),
    },
    profileImageOg: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
        borderRadius: hp("1000%"),
    },
    bottom: {
        width: wp('100%'),
        flex: 1,
        alignItems: "center",
        paddingTop: hp("12%"),
        justifyContent: 'space-between',
    },
    accountDetails: {
        width: wp('100%'),
        gap: hp("2.5%"),
        paddingHorizontal: wp("5%"),
    },
    inputContainer: {
        width: "100%",
        gap: hp("1%"),
        paddingVertical: hp("1%")
    },
    label: {
        fontSize: hp('2.4%'),
        fontFamily: "Afacad-Medium",
        color: colors.textColor3,
    },
    input: {
        fontSize: hp('2.3%'),
        fontFamily: "Afacad-Regular",
        color: colors.textColor2,
        borderBottomColor: "rgba(166, 173, 186, 0.1)",
        borderBottomWidth: hp('0.1%'),
        paddingBottom: hp("1%"),
    },
    inputEditing: {
        borderBottomColor: "#ddd",
    },
    optionsContainer: {
        width: wp('100%'),
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: wp("5%"),
        marginBottom: hp("2%"),
    },
    option: {
        color: "#9366E2",
        fontFamily: "Afacad-Regular",
        fontSize: hp("2.2%"),
    },
    editContainer: {
        position: 'absolute',
        backgroundColor: colors.textColor3,
        top: hp('12%'),
        height: hp("3.5%"),
        zIndex: 2,
        aspectRatio: 1,
        borderRadius: hp("100%"),
        right: wp("30%"),
        justifyContent: "center",
        alignItems: "center",
    },
    moreOptionsContainer: {
        backgroundColor: colors.secondaryColor2,
        padding: hp("1.5%"),
        width: wp("50%"),
        borderRadius: hp("1%"),
        alignItems: "center",
        left: wp("43%"),
        top: hp("12%")
    },
    overlay1: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 2
    },
    blurryContainer: {
        position: 'absolute',
        justifyContent: "center",
        alignItems: "center",
        zIndex: 4,
        width: wp("100%"),
        height: hp("100%"),
    },
    fullProfileImage: {
        width: wp("100%"),
        aspectRatio: 1,
        resizeMode: "cover",
    },
    sheetContainer: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: "space-between",
        alignItems: 'flex-start',
        padding: hp("2%"),
    },
    sheetHeader: {
        fontFamily: "Afacad-Medium",
        color: colors.textColor3,
        fontSize: hp("2.7%")
    },
    sheetOptions: {
        flex: 1,
        justifyContent: "space-evenly",
        width: "100%"
    },
    sheetOption: {
        color: colors.textColor3,
        fontFamily: "Afacad-Regular",
        fontSize: hp("2.3%"),
        borderBottomColor: "rgba(166, 173, 186, 0.1)",
        borderBottomWidth: hp("0.1%"),
        paddingBottom: hp("1%")
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '80%',
        backgroundColor: colors.lightColor1,
        borderRadius: hp("2%"),
        padding: hp("2%")
    },
    modalHeader: {
        fontFamily: "Afacad-Medium",
        fontSize: hp("2.5%"),
        color: colors.textColor3,
        marginBottom: hp("1%")
    },
    modalLabel: {
        fontFamily: "Afacad-Regular",
        fontSize: hp("2.3%"),
        color: colors.textColor3,
        marginTop: hp("1%")
    },
    modalInput: {
        height: hp("5.5%"),
        width: "100%",
        borderColor: "rgba(161,161,161,0.2)",
        borderWidth: hp("0.1%"),
        borderRadius: hp("1%"),
        padding: hp("1.2%"),
        fontSize: hp("2.1%"),
        color: colors.textColor3,
        fontFamily: "Afacad-Regular",
        marginTop: hp("1%")
    },
    eyeIcon: {
        position: "absolute",
        right: hp("2%"),
        bottom: hp("1.5%"),
        opacity: 0.7
    },
    modalOptions: {
        fontFamily: "Afacad-Regular",
        fontSize: hp("2.1%"),
        color: colors.textColor3,
    },
    errorText: {
        fontFamily: "Afacad-Regular",
        fontSize: hp("2.1%"),
        color: "#F93827",
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: hp("2.5%")
    }
});
