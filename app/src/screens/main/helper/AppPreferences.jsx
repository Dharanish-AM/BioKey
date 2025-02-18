import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../../../constants/colors';
import { Entypo } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { Dropdown } from 'react-native-element-dropdown';

export default function AppPreferences({ navigation }) {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
    const [autoLogoutTime, setAutoLogoutTime] = useState("5 minutes");
    const [selectedLanguage, setSelectedLanguage] = useState("English");

    const languages = [
        { label: "English", value: "English" },
        { label: "Spanish", value: "Spanish" },
        { label: "French", value: "French" },
        { label: "German", value: "German" },
        { label: "Hindi", value: "Hindi" },
        { label: "Tamil", value: "Tamil" },
        { label: "Chinese", value: "Chinese" }
    ];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.innerContainer}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Entypo name="chevron-thin-left" size={hp("4%")} color={colors.textColor3} />
                    </TouchableOpacity>
                    <Text style={styles.headerText}>App Preferences</Text>
                </View>

                <View style={styles.content}>
                    <View style={styles.preferenceRow}>
                        <Text style={styles.preferenceText}>Dark Mode</Text>
                        <Switch
                            value={isDarkMode}
                            onValueChange={() => setIsDarkMode(!isDarkMode)}
                            trackColor={{ false: colors.textColor2, true: colors.primaryColor }}
                            thumbColor={isDarkMode ? colors.accentColor : colors.secondaryColor2}
                        />
                    </View>

                    <View style={styles.preferenceRow}>
                        <Text style={styles.preferenceText}>Enable Notifications</Text>
                        <Switch
                            value={isNotificationsEnabled}
                            onValueChange={() => setIsNotificationsEnabled(!isNotificationsEnabled)}
                            trackColor={{ false: colors.textColor2, true: colors.primaryColor }}
                            thumbColor={isNotificationsEnabled ? colors.accentColor : colors.secondaryColor2}
                        />
                    </View>

                    <TouchableOpacity style={styles.preferenceRow} onPress={() => Alert.alert("Auto-Logout Timer", "Feature under development.")}>
                        <Text style={styles.preferenceText}>Auto-Logout Timer</Text>
                        <Text style={styles.preferenceValue}>{autoLogoutTime}</Text>
                    </TouchableOpacity>

                    <View style={styles.preferenceRow}>
                        <Text style={styles.preferenceText}>Language</Text>
                        <Dropdown
                            style={styles.dropdown}
                            placeholderStyle={styles.placeholderText}
                            selectedTextStyle={styles.selectedText}
                            iconStyle={styles.iconStyle}
                            data={languages}
                            labelField="label"
                            valueField="value"
                            placeholder="Select Language"
                            value={selectedLanguage}
                            onChange={item => setSelectedLanguage(item.value)}
                            itemTextStyle={styles.itemText}
                            searchPlaceholderTextColor={colors.textColor2}
                            containerStyle={styles.dropdownContainer}
                            activeColor="rgba(161,161,161,0.3)"
                            showsVerticalScrollIndicator={false}
                        />
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.secondaryColor1
    },
    innerContainer: {
        flex: 1,
        alignItems: "center",
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        width: wp("100%"),
        paddingHorizontal: wp("3%"),
        marginBottom: hp("3%")
    },
    headerText: {
        fontSize: hp("3.5%"),
        color: colors.textColor3,
        marginLeft: wp("1%"),
        fontFamily: "Afacad-SemiBold"
    },
    content: {
        width: wp("100%"),
        gap: hp("2%"),
        paddingHorizontal: wp("5%")
    },
    preferenceRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: hp("2%"),
        borderBottomWidth: 1,
        borderBottomColor: "rgba(161,161,161,0.1)"
    },
    preferenceText: {
        fontSize: hp("2.5%"),
        fontFamily: "Afacad-Regular",
        color: colors.textColor3
    },
    preferenceValue: {
        fontSize: hp("2.3%"),
        fontFamily: "Afacad-Regular",
        color: colors.textColor2
    },
    dropdown: {
        width: wp("40%"),
    },
    placeholderText: {
        color: colors.textColor2,
        fontFamily: "Afacad-Regular",
        fontSize: hp("2.1%"),
        opacity: 0.45
    },
    selectedText: {
        color: colors.textColor2,
        fontFamily: "Afacad-Regular",
        fontSize: hp("2.1%"),
    },
    itemText: {
        color: colors.textColor3,
        fontFamily: "Afacad-Regular",
        fontSize: hp("2.1%"),
    },
    dropdownContainer: {
        backgroundColor: colors.lightColor2,
        borderColor: "transparent",
    }
});
