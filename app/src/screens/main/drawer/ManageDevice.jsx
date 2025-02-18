import { View, Text, StyleSheet, TouchableOpacity, Image, Modal } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../../../constants/colors';
import { Entypo, Ionicons } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import FingyIcon from "../../../assets/images/FINGY.png";


const fetchDeviceDetails = async () => {
    return {
        name: "FINGY",
        serialNumber: 123456,
        fingerprints: [
            { id: 1, name: "Left Thumb", date: new Date() },
            { id: 2, name: "Right Thumb", date: new Date() },
        ],
        status: "active",
        createdAt: new Date().toLocaleDateString(),
        warrantyPeriod: "2 Years",
    };
};

export default function ManageDevice({ navigation }) {
    const [device, setDevice] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    useEffect(() => {
        const loadDevice = async () => {
            const deviceDetails = await fetchDeviceDetails();
            setDevice(deviceDetails);
        };

        loadDevice();
    }, []);

    const toggleModal = () => {
        setIsModalVisible(!isModalVisible);
    };

    if (!device) {
        return (
            <SafeAreaView style={styles.container}>
                <Text>Loading...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.innerContainer}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Entypo name="chevron-thin-left" size={hp("4%")} color={colors.textColor3} />
                    </TouchableOpacity>
                    <Text style={styles.headerText}>Manage Device</Text>
                </View>

                <View style={styles.content}>
                    <View style={styles.fingyModelContainer}>
                        <Image style={styles.fingyIcon} source={FingyIcon} />
                    </View>

                    <View style={styles.deviceDetails}>
                        <View style={styles.labelValueContainer}>
                            <Text style={styles.label}>Device Name:</Text>
                            <Text style={styles.value}>{device.name}</Text>
                        </View>
                        <View style={styles.labelValueContainer}>
                            <Text style={styles.label}>Serial Number:</Text>
                            <Text style={styles.value}>{device.serialNumber}</Text>
                        </View>
                        <View style={styles.labelValueContainer}>
                            <Text style={styles.label}>Status:</Text>
                            <Text style={styles.value}>{device.status === "active" ? "Active" : "Inactive"}</Text>
                        </View>
                        <View style={styles.labelValueContainer}>
                            <Text style={styles.label}>Registration Date:</Text>
                            <Text style={styles.value}>{device.createdAt}</Text>
                        </View>
                        <View style={styles.labelValueContainer}>
                            <Text style={styles.label}>Warranty Period:</Text>
                            <Text style={styles.value}>{device.warrantyPeriod}</Text>
                        </View>
                    </View>

                    <View style={styles.deviceOptions}>
                        <TouchableOpacity style={styles.optionButton} onPress={toggleModal}>
                            <Text style={styles.optionText}>Manage Fingerprints</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.optionButton}>
                            <Text style={[styles.optionText, { color: "#e74c3c" }]}>Unlink Device</Text>
                        </TouchableOpacity>
                    </View>
                </View>


                <Modal
                    visible={isModalVisible}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={toggleModal}
                >
                    <View style={styles.modal}>
                        <View style={styles.modalContent}>
                            <View style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: hp("2%"),
                            }}>
                                <Text style={styles.modalTitle}>Manage Fingerprints</Text>
                                <TouchableOpacity style={styles.closeButton} onPress={toggleModal}>
                                    <Ionicons name="close-outline" size={hp("3.5%")} color={colors.textColor2} />
                                </TouchableOpacity>
                            </View>
                            {device.fingerprints.map(fingerprint => (
                                <View key={fingerprint.id} style={styles.fingerprintItem}>
                                    <Text style={styles.fingerprintText}>{fingerprint.id}. {fingerprint.name} - {fingerprint.date.toLocaleDateString()}</Text>
                                </View>
                            ))}
                            <TouchableOpacity style={styles.closeButton} onPress={toggleModal}>

                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        width: wp("100%"),
        paddingHorizontal: wp("3%"),
        marginBottom: hp("3%"),
    },
    headerText: {
        fontSize: hp("3.5%"),
        color: colors.textColor3,
        marginLeft: wp("1%"),
        fontFamily: "Afacad-SemiBold",
    },
    content: {
        width: wp("100%"),
        gap: hp("4%"),
        paddingHorizontal: wp("5%"),
        flex: 1,
    },
    fingyModelContainer: {
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10,
        overflow: "hidden",
    },
    fingyIcon: {
        height: hp("30%"),
        aspectRatio: 1,
        resizeMode: "contain",
    },
    deviceDetails: {
        width: wp("90%"),
        flex: 1,
        padding: hp("2%"),
        backgroundColor: colors.lightColor2,
        borderRadius: 10,
        justifyContent: "space-evenly",
    },
    labelValueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    label: {
        fontSize: hp("2.4%"),
        color: colors.textColor3,
        fontFamily: "Afacad-Medium",
        marginRight: wp("1%"),
    },
    value: {
        fontSize: hp("2.4%"),
        color: colors.textColor2,
        fontFamily: "Afacad-Regular",
    },
    deviceOptions: {
        width: wp("90%"),
        height: hp("10%"),
        borderRadius: 10,
        justifyContent: "space-between",
        alignItems: "center",
        flexDirection: 'row',
        gap: wp("4%"),
    },
    optionButton: {
        width: "50%",
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.lightColor2,
        height: "80%",
        borderRadius: hp("2%"),
    },
    optionText: {
        fontSize: hp("2.1%"),
        fontFamily: "Afacad-Regular",
        color: colors.textColor3,
    },

    modal: {
        justifyContent: 'center',
        alignItems: 'center',
        margin: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        flex: 1
    },
    modalContent: {
        backgroundColor: colors.secondaryColor1,
        padding: hp("2%"),
        borderRadius: 10,
        width: wp("75%"),
    },
    modalTitle: {
        fontSize: hp("2.5%"),
        fontFamily: "Afacad-SemiBold",
        color: colors.textColor3,

    },
    fingerprintItem: {
        marginBottom: hp("1.5%"),
    },
    fingerprintText: {
        fontSize: hp("2.1%"),
        fontFamily: "Afacad-Regular",
        color: colors.textColor3,
    },

});
