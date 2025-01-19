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
    Keyboard
} from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import colors from "../../constants/colors";
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from "react-native-responsive-screen";

import SupportIcon from "../../assets/images/support_icon.png";
import DeviceIcon from "../../assets/images/device-form-icon.png";

export default function UserFormScreen({ navigation }) {
    const [device, setDevice] = useState({
        name: "FINGY_456765"
    });
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
    });

    const [isFormFilled, setIsFormFilled] = useState(false);
    const [formError, setFormError] = useState("");


    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        const allFieldsFilled = Object.values(form).every((field) => field.trim() !== "");

        const isPasswordValid = form.password.length >= 8;
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
        const isPasswordValid = form.password.length >= 8;
        const isPasswordMatching = form.password === form.confirmPassword;

        if (!allFieldsFilled) {
            setFormError("Please fill all fields.");
        } else if (!isPasswordValid) {
            setFormError("Password must be at least 8 characters.");
        } else if (!isPasswordMatching) {
            setFormError("Passwords do not match.");
        } else {
            setFormError("");

            if (allFieldsFilled && isPasswordValid && isPasswordMatching) {
                console.log("Account created:", form);
                navigation.navigate("FingerprintScanScreen");
            }
        }
    };




    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={styles.innerContainer}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >

                <View
                    style={[
                        styles.top,
                        {
                            height: formError ? hp("8%") : hp("10%"),
                        },
                    ]}
                >
                    <View style={styles.deviceDetails}>
                        <Image source={DeviceIcon} style={styles.deviceIcon} />
                        <Text style={styles.deviceName}>{device.name}</Text>
                    </View>
                    <TouchableOpacity style={styles.supportContainer}>
                        <Image style={styles.SupportIcon} source={SupportIcon} />
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.center} keyboardShouldPersistTaps="handled">
                    <Text style={styles.formTitle}>Enter your details</Text>
                    {submitted && formError ? (
                        <Text style={styles.errorText}>{formError}</Text>
                    ) : null}
                    <View style={styles.inputContainer}>

                        <Text style={styles.label}>Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your name"
                            value={form.name}
                            onChangeText={(value) => handleChange("name", value)}
                        />

                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your email"
                            keyboardType="email-address"
                            value={form.email}
                            onChangeText={(value) => handleChange("email", value)}
                        />

                        <Text style={styles.label}>Phone</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your phone number"
                            keyboardType="phone-pad"
                            value={form.phone}
                            onChangeText={(value) => handleChange("phone", value)}
                        />

                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your password"
                            secureTextEntry
                            value={form.password}
                            onChangeText={(value) => handleChange("password", value)}
                        />


                        <Text style={styles.label}>Confirm Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Confirm your password"
                            secureTextEntry
                            value={form.confirmPassword}
                            onChangeText={(value) => handleChange("confirmPassword", value)}
                        />

                    </View>


                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleSubmit}
                    >
                        <Text style={styles.buttonText}>Create Account</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
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
        flexDirection: "column",
        alignItems: "center",
    },
    top: {
        width: wp("100%"),

        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: wp("3%"),
        justifyContent: "space-between",
    },
    deviceDetails: {
        flexDirection: "row",
        alignItems: "center",
        gap: wp("2%"),
        flex: 1,
    },
    deviceIcon: {
        width: "10%",
        aspectRatio: 1,
    },
    deviceName: {
        fontSize: hp("3%"),
        color: colors.textColor1,
        fontFamily: "Afacad-SemiBold",
    },
    supportContainer: {
        height: "40%",
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
        paddingHorizontal: wp("3.5%"),
    },
    formTitle: {
        fontSize: hp("3.5%"),
        color: colors.textColor1,
        fontFamily: "Afacad-SemiBold",
        marginBottom: hp("1%"),
    },
    inputContainer: {
        marginBottom: hp("1.5%")
    },
    label: {
        fontSize: hp("2.7%"),
        color: colors.textColor1,
        marginBottom: hp("1%"),
        fontFamily: "Afacad-Medium",
    },
    input: {
        backgroundColor: "rgba(42,48,60,0.5)",
        borderRadius: hp("1.6%"),
        paddingHorizontal: wp("4%"),
        paddingVertical: hp("2%"),
        fontSize: hp("2.2%"),
        marginBottom: hp("1%"),
        fontFamily: "Afacad-Medium",
        color: colors.textColor3,

    },
    button: {
        width: "55%",
        height: "9%",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: hp("5%"),
        alignSelf: "center",
        backgroundColor: colors.primaryColor,
    },
    buttonText: {
        fontSize: hp("3%"),
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
});
