import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
    Pressable,
} from "react-native";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { Dropdown } from 'react-native-element-dropdown';
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import colors from "../../constants/colors";
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from "react-native-responsive-screen";


import { Entypo } from "@expo/vector-icons";
import { registerUser } from "../../services/authOperations";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function UserFormScreen({ navigation }) {
    const [isDevice, setIsDevice] = useState(false);
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        gender: "",
        location: "",
    });

    const [isFormFilled, setIsFormFilled] = useState(false);
    const [formError, setFormError] = useState("");

    const genderData = [
        { label: 'Male', value: 'Male' },
        { label: 'Female', value: 'Female' },
        { label: 'Others', value: 'Others' },
    ];


    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        const allFieldsFilled = Object.values(form).every((field) => field.trim() !== "");

        const isPasswordValid = form.password.length >= 8 &&
            /[A-Z]/.test(form.password) &&
            /\d/.test(form.password);

        const isPasswordMatching = form.password === form.confirmPassword;

        setIsFormFilled(allFieldsFilled && isPasswordValid && isPasswordMatching);
    }, [form]);

    const handleChange = (key, value) => {
        setForm((prevForm) => ({ ...prevForm, [key]: value }));
    };

    const handleSubmit = () => {
        setSubmitted(true);
        Keyboard.dismiss();

        const allFieldsFilled = Object.values(form).every((field) => field.trim() !== "");
        const isPasswordValid = form.password.length >= 8 &&
            /[A-Z]/.test(form.password) &&
            /\d/.test(form.password);
        const isPasswordMatching = form.password === form.confirmPassword;
        const isEmailValid = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(form.email);

        if (!allFieldsFilled) {
            setFormError("Please fill all fields.");
        } else if (!isEmailValid) {
            setFormError("Please enter a valid email address.");
        } else if (!isPasswordValid) {
            setFormError("Password must be at least 8 characters long, with at least one uppercase letter and one number.");
        } else if (!isPasswordMatching) {
            setFormError("Passwords do not match.");
        } else {
            setFormError("");
            if (allFieldsFilled && isPasswordValid && isPasswordMatching) {
                if (!isDevice) {
                    handleRegisterNoDevice()
                }
                else {
                    console.log("device")
                    navigation.navigate("DevicePairingScreen", {
                        form: form
                    })
                }
            }
        }
    };


    const handleRegisterNoDevice = async () => {
        try {
            const response = await registerUser(form);

            if (response.success) {
                Toast.show({
                    text1: "Account created successfully!",
                    type: "success",
                });

                await AsyncStorage.setItem("isNewUser", "false");

            } else {
                Toast.show({
                    type: "error",
                    text1: "Error while creating account!",
                    text2: response.message || "Please try again later.",
                });
            }
        } catch (err) {
            console.error("Registration Error:", err);

            Toast.show({
                type: "error",
                text1: "Something went wrong!",
                text2: "Please check your internet connection and try again.",
            });
        }
    };


    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={styles.innerContainer}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >

                <View
                    style={styles.top}
                >
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Entypo name="chevron-thin-left" size={hp('4%')} color={colors.textColor3} />
                    </TouchableOpacity>
                    <Text style={styles.formTitle}>Enter your details</Text>

                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.center} keyboardShouldPersistTaps="handled">

                    {submitted && formError ? (
                        <Text style={styles.errorText}>{formError}</Text>
                    ) : null}
                    <View style={styles.inputContainer}>

                        <Text style={styles.label}>Name:</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your name"
                            value={form.name}
                            onChangeText={(value) => handleChange("name", value)}
                        />

                        <Text style={styles.label}>Email:</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your email"
                            keyboardType="email-address"
                            value={form.email}
                            onChangeText={(value) => handleChange("email", value)}
                        />

                        <Text style={styles.label}>Phone:</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your phone number"
                            keyboardType="phone-pad"
                            value={form.phone}
                            onChangeText={(value) => handleChange("phone", value)}
                        />

                        <Text style={styles.label}> Gender:</Text>
                        <Dropdown
                            style={styles.dropdown}
                            placeholderStyle={{
                                color: colors.textColor2,
                                fontFamily: "Afacad-Regular",
                                fontSize: hp("2.1%"),
                                opacity: 0.45

                            }}
                            selectedTextStyle={{
                                color: colors.textColor2,
                                fontFamily: "Afacad-Regular",
                                fontSize: hp("2.1%"),
                            }}
                            iconStyle={styles.iconStyle}
                            data={genderData}
                            labelField="label"
                            valueField="value"
                            placeholder="Select Gender"
                            value={form.gender}
                            onChange={item => {
                                handleChange("gender", item.value)
                            }}
                            itemTextStyle={{
                                color: colors.textColor3,
                                fontFamily: "Afacad-Regular",
                                fontSize: hp("2.1%"),
                            }}
                            searchPlaceholderTextColor={colors.textColor2}
                            containerStyle={{
                                backgroundColor: colors.lightColor2,
                                border: 0,
                                borderColor: "transparent",
                                borderRadius: hp("2%")
                            }}


                        />

                        <Text style={styles.label}>Location:</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your location"
                            value={form.location}
                            onChangeText={(value) => handleChange("location", value)}
                        />

                        <Text style={styles.label}>Password:</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your password"
                            secureTextEntry
                            value={form.password}
                            onChangeText={(value) => handleChange("password", value)}
                        />


                        <Text style={styles.label}>Confirm Password:</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Confirm your password"
                            secureTextEntry
                            value={form.confirmPassword}
                            onChangeText={(value) => handleChange("confirmPassword", value)}
                        />



                    </View>
                    <View style={{
                        flexGrow: 1,
                        justifyContent: "flex-end",
                        alignItems: "center"
                    }}>
                        <BouncyCheckbox
                            fillColor={colors.primaryColor}
                            unfillColor={colors.textColor2}
                            disableBuiltInState
                            isChecked={isDevice}
                            onPress={() => setIsDevice((prev) => !prev)}
                            text="Pair Fingy ?"
                            textStyle={{
                                color: colors.textColor3,
                                fontFamily: "Afacad-Regular",
                                fontSize: hp("2.2%"),
                                textDecorationLine: "none",
                            }}
                            style={{
                                alignSelf: "flex-end",

                            }}
                            focusable


                        />
                    </View>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleSubmit}
                    >
                        <Text style={styles.buttonText}>Create Account</Text>
                    </TouchableOpacity>
                    <View style={{
                        flexDirection: 'row',
                        alignItems: "center",
                        alignSelf: "center",
                        marginTop: hp("2.5%")
                    }}>
                        <Text style={styles.text}>Already have account?  </Text>
                        <TouchableOpacity onPress={() => {
                            navigation.navigate('AuthScreen')
                        }} ><Text style={styles.link}>Login</Text></TouchableOpacity>
                    </View>
                </ScrollView>

            </KeyboardAvoidingView>
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.secondaryColor1,
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
        paddingHorizontal: wp("3%"),
        marginBottom: hp("2%")
    },
    deviceDetails: {
        flexDirection: "row",
        alignItems: "center",
        gap: wp("2%"),
        flex: 1,
    },
    supportContainer: {
        height: hp("3.7%"),
        aspectRatio: 1,
    },
    SupportIcon: {
        height: "100%",
        width: "100%",
        opacity: 0.7,
        resizeMode: "contain",
    },
    center: {
        width: wp("100%"),
        paddingHorizontal: wp("4%"),
    },
    formTitle: {
        fontSize: hp("3.5%"),
        color: colors.textColor1,
        fontFamily: "Afacad-SemiBold",
        marginLeft: wp("1%")
    },
    inputContainer: {
        marginBottom: hp("1.5%")
    },
    label: {
        fontSize: hp("2.5%"),
        color: colors.textColor1,
        marginBottom: hp("1%"),
        fontFamily: "Afacad-Medium",
    },
    input: {
        backgroundColor: "rgba(42,48,60,0.5)",
        borderRadius: hp("1.6%"),
        paddingHorizontal: wp("3%"),
        paddingVertical: hp("1.7%"),
        fontSize: hp("2.1%"),
        marginBottom: hp("1%"),
        fontFamily: "Afacad-Regular",
        color: colors.textColor3,
        borderColor: "rgba(161,161,161,0.2)",
        borderWidth: hp("0.1%"),
    },
    dropdown: {
        backgroundColor: "rgba(42,48,60,0.5)",
        borderRadius: hp("1.6%"),
        paddingHorizontal: wp("3%"),
        paddingVertical: hp("1.7%"),
        fontSize: hp("2.1%"),
        marginBottom: hp("1%"),
        fontFamily: "Afacad-Regular",
        color: colors.textColor3,
        borderColor: "rgba(161,161,161,0.2)",
        borderWidth: hp("0.1%"),
    },
    button: {
        paddingVertical: hp("1.5%"),
        paddingHorizontal: wp("7%"),
        justifyContent: "center",
        alignItems: "center",
        borderRadius: hp("5%"),
        alignSelf: "center",
        backgroundColor: colors.primaryColor,
        marginTop: hp("3%")
    },
    buttonText: {
        fontSize: hp("2.5%"),
        color: colors.textColor3,
        fontFamily: "Afacad-SemiBold",
    },
    formNotFilledButton: {
        backgroundColor: "rgba(211, 211, 211,0.3)",
    },
    formFilledButton: {
        backgroundColor: colors.primaryColor,
    },
    errorText: {
        fontSize: hp("2%"),
        color: "red",
        marginBottom: hp("1%"),
        fontFamily: "Afacad-Medium",
    },
    text: {
        fontSize: hp("2.2%"),
        color: colors.textColor3,
        fontFamily: "Afacad-Medium",

    },
    link: {
        fontSize: hp("2.2%"),
        color: "#9366E2",
        fontFamily: "Afacad-Medium",
        textDecorationLine: "underline"
    }
});
