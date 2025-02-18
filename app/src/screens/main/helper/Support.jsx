import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import colors from '../../../constants/colors'
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function Support({ navigation }) {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.innerContainer}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Entypo name="chevron-thin-left" size={hp("4%")} color={colors.textColor3} />
                    </TouchableOpacity>
                    <Text style={styles.headerText}>Support</Text>
                </View>

                <View style={styles.content}>
                    <View style={styles.contactInfoContainer}>
                        <View style={styles.contactItem}>
                            <FontAwesome name="phone" size={hp("3%")} color={colors.textColor2} />
                            <Text style={styles.contactText}>0421-298261</Text>
                        </View>
                        <View style={styles.contactItem}>
                            <FontAwesome name="envelope" size={hp("3%")} color={colors.textColor2} />
                            <Text style={styles.contactText}>support@biokey.com</Text>
                        </View>
                        <View style={styles.contactItem}>
                            <FontAwesome name="map-marker" size={hp("3%")} color={colors.textColor2} />
                            <Text style={styles.contactText}>1234 Main St, City, Country</Text>
                        </View>
                    </View>

                    <View style={styles.additionalInfoContainer}>
                        <View>
                            <Text style={styles.sectionHeader}>Working Hours</Text>
                            <Text style={styles.text}>Mon - Fri: 9 AM - 6 PM</Text>
                            <Text style={styles.text}>Sat - Sun: Closed</Text>
                        </View>
                        <View>
                            <Text style={styles.sectionHeader}>FAQ</Text>
                            <Text style={styles.text}>
                                1. How do I reset my password? {"\n"}Just click "Forgot Password" on the login screen.
                            </Text>
                            <Text style={styles.text}>
                                2. How do I report an issue? {"\n"}You can contact us using the details above.
                            </Text>
                        </View>

                        <View>
                            <Text style={styles.sectionHeader}>Follow Us</Text>
                            <View style={styles.socialLinks}>
                                <TouchableOpacity onPress={() => Linking.openURL('https://www.facebook.com/')}>
                                    <FontAwesome name="facebook" size={hp("3%")} color={colors.primaryColor} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => Linking.openURL('https://twitter.com/')}>
                                    <FontAwesome name="twitter" size={hp("3%")} color={colors.primaryColor} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => Linking.openURL('https://www.instagram.com/')}>
                                    <FontAwesome name="instagram" size={hp("3%")} color={colors.primaryColor} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.secondaryColor1,
    },
    innerContainer: {
        flex: 1,
        paddingHorizontal: wp("3%"),

    },
    header: {
        flexDirection: "row",
        alignItems: 'center',
        marginBottom: hp("3%"),
    },
    headerText: {
        fontSize: hp("3.5%"),
        color: colors.textColor3,
        fontFamily: 'Afacad-SemiBold',
        marginLeft: wp("1%"),
    },
    content: {
        flex: 1,
        width: "100%",
        paddingHorizontal: wp("2%")
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.lightColor1,
        padding: hp("2%"),
        borderRadius: hp("1%"),
        width: '100%',
        marginBottom: hp("2%"),
    },
    contactText: {
        fontSize: hp("2.2%"),
        color: colors.textColor3,
        fontFamily: 'Afacad-Regular',
        marginLeft: wp("3%"),
    },
    additionalInfoContainer: {
        flex: 1,
        justifyContent: "space-evenly"
    },
    sectionHeader: {
        fontSize: hp("3%"),
        fontFamily: 'Afacad-SemiBold',
        color: colors.textColor3,
        marginBottom: hp("1%"),
    },
    text: {
        fontSize: hp("2.2%"),
        color: colors.textColor2,
        fontFamily: 'Afacad-Regular',
        marginBottom: hp("1%"),
    },
    socialLinks: {
        flexDirection: 'row',
        marginTop: hp("1%"),
        gap: wp("10%")
    },
})
