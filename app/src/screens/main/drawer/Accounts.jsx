import { View, Text, StyleSheet, StatusBar, Image, TouchableOpacity, TouchableWithoutFeedback, ImageBackground } from 'react-native'
import React, { useRef, useState } from 'react'
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
import { useSelector } from 'react-redux';
import { BlurView } from 'expo-blur';
import RBSheet from 'react-native-raw-bottom-sheet';
import FallBackProfileImage from '../../../assets/images/profile_icon.png';

export default function Accounts({ navigation }) {
    const [isMoreOption, setIsMoreOption] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const user = useSelector((state) => state.user);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const RBSheetRef = useRef()

    const handleOpenProfile = () => {
        setIsProfileOpen(!isProfileOpen);
    }



    return (
        <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
            <StatusBar backgroundColor={colors.lightColor1} barStyle="light-content" />

            <View style={styles.innerContainer}>
                <TouchableOpacity onPress={() => {
                    RBSheetRef.current.open()
                }} style={styles.editContainer}>
                    <MaterialCommunityIcons name="pencil-outline" size={hp("2.5%")} color={colors.secondaryColor1} />
                </TouchableOpacity>

                <TouchableOpacity onPress={handleOpenProfile} style={styles.profileContainer}>
                    {
                        user.profileImage ?
                            <Image style={styles.profileImage} source={user.profileImage} />
                            :
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

                <View style={styles.bottom}>
                    <View style={styles.accountDetails}>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Name:</Text>
                            <TextInput editable={isEditing} style={styles.input} value={user.userName} placeholder="Enter Name" />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Email:</Text>
                            <TextInput editable={isEditing} style={styles.input} value={user.userEmail} placeholder="Enter Email" keyboardType="email-address" />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Phone:</Text>
                            <TextInput editable={isEditing} style={styles.input} value={user?.userPhone?.toString() ?? ""} placeholder="Enter Phone" keyboardType="phone-pad" />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Gender:</Text>
                            <TextInput editable={isEditing} style={styles.input} value={user.userGender} placeholder="Enter Gender" />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Location:</Text>
                            <TextInput editable={isEditing} style={styles.input} value={user.userLocation} placeholder="Enter Location" />
                        </View>
                    </View>

                    <View style={styles.optionsContainer}>
                        <Pressable onPress={() => {
                            setIsEditing((prev) => !prev);
                        }}>
                            <Text style={styles.option} >{
                                isEditing ? "Save Changes" : "Edit Profile"
                            }</Text>
                        </Pressable>
                        <Pressable>
                            <Text style={styles.option}>Change Password</Text>
                        </Pressable>
                    </View>
                </View>
            </View>

            {isMoreOption && (
                <TouchableWithoutFeedback onPress={() => setIsMoreOption(false)}>
                    <View style={styles.overlay}>
                        <View style={styles.moreOptionsContainer}>
                            <TouchableOpacity onPress={() => setIsMoreOption(false)}>
                                <Text style={[styles.option,
                                {
                                    color: colors.red
                                }
                                ]}>Delete Account</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            )}
            {
                isProfileOpen &&
                <BlurView onTouchEnd={() => {
                    setIsProfileOpen(false);
                }} style={styles.blurryContainer}>
                    <Image style={styles.fullProfileImage} source={ProfileIcon} />
                </BlurView>


            }
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
                    <Text style={
                        styles.sheetHeader
                    }>Choose from</Text>
                    <View style={styles.sheetOptions}>
                        <TouchableOpacity><Text style={
                            styles.sheetOption
                        }>Take Photo</Text></TouchableOpacity>
                        <TouchableOpacity><Text style={
                            styles.sheetOption
                        }>Choose from Gallery</Text></TouchableOpacity>
                    </View>
                </View>
            </RBSheet>

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
        backgroundColor: colors.darkColor,
        position: "absolute",
        zIndex: 1,
        top: hp("10%"),
        borderRadius: hp("1000%"),
        borderColor: "#5F2ABD",
        borderWidth: hp('0.2%'),
        padding: hp("0.5%"),
    },
    profileImage: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
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
    overlay: {
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
        height: "40%",
        aspectRatio: 1,
        resizeMode: "contain",
        borderRadius: hp("2%"),
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
    }
});
