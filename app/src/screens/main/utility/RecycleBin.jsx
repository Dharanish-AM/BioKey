import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import colors from '../../../constants/colors';
import { Entypo, Feather } from '@expo/vector-icons';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { fetchRecentFiles, fetchRecycleBinFiles, permanentDelete, restoreFile } from '../../../services/fileOperations';
import { formatFileSize } from '../../../utils/formatFileSize';
import RecycleBinIcon from "../../../assets/images/recycle.png"
import { Pressable, RefreshControl, TouchableWithoutFeedback } from 'react-native-gesture-handler';
import EvilIcons from '@expo/vector-icons/EvilIcons';
import Toast from 'react-native-toast-message';
import { setFirstRender } from '../../../redux/actions';
import PdfIcon from "../../../assets/images/pdf_icon.png"
import PlayIcon from "../../../assets/images/play_icon.png"
import DocsIcon from "../../../assets/images/docs_icon.png"

export default function RecycleBin({ navigation }) {
    const dispatch = useDispatch();
    const userId = useSelector((state) => state.user.userId);
    const [refreshing, setRefreshing] = useState(false);
    const binFiles = useSelector((state) => state.files.recycleBinFiles, shallowEqual);
    const [selectedFile, setSelectedFile] = useState(null);

    const isFirstRender = useSelector(
        (state) => state.appConfig.isFirstRender.recycleBinScreen
    );

    useEffect(() => {
        if (!isFirstRender) return;

        const fetchBinFiles = async () => {
            await fetchRecycleBinFiles(userId, dispatch);
        };
        fetchBinFiles();
        dispatch(setFirstRender("recycleBinScreen"));
    }, [dispatch, userId]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchRecycleBinFiles(userId, dispatch);
        setRefreshing(false);
    };

    const toggleOptions = (file) => {
        setSelectedFile(selectedFile?.name === file.name ? null : file);
    };

    const handleDeleteAll = async () => {
        Alert.alert(
            "Confirm Delete",
            "Are you sure you want to permanently delete all files in the recycle bin?",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Delete All",
                    style: "destructive",
                    onPress: async () => {
                        const response = await permanentDelete(userId, null, true, dispatch);
                        if (response?.success) {
                            Toast.show({
                                type: 'success',
                                text1: 'Recycle Bin Cleared!',
                                text2: 'All files have been permanently deleted.',
                            });
                        } else {
                            Toast.show({
                                type: 'error',
                                text1: 'Failed to clear recycle bin.',
                                text2: response?.message || 'An error occurred.',
                            });
                        }
                    }
                }
            ],
            { cancelable: true }
        );
    };

    const handleDeleteFileOne = async (file) => {
        console.log(file)
        Alert.alert(
            "Confirm Delete",
            "Are you sure you want to permanently delete this file?",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Delete File",
                    style: "destructive",
                    onPress: async () => {
                        const response = await permanentDelete(userId, file._id, false, dispatch);
                        if (response?.success) {
                            Toast.show({
                                type: 'success',
                                text1: 'File Deleted!',
                                text2: 'The file has been permanently deleted.',
                            });
                        } else {
                            Toast.show({
                                type: 'error',
                                text1: 'Failed to delete file.',
                                text2: response?.message || 'An error occurred.',
                            });
                        }
                    },
                },
            ],
            { cancelable: true }
        );
    };

    const renderItem = ({ item }) => {
        const renderThumbnail = () => {
            if (item?.thumbnailUrl) {
                if (item.type === "images") {
                    return (
                        <View style={styles.customThumbnailContainer}>
                            <Image source={{ uri: item.thumbnailUrl }} style={styles.fileImage} />
                        </View>
                    );
                }

                if (item.type === "videos") {
                    return (
                        <View style={styles.videoFileWithPlayContainer}>
                            <Image source={{ uri: item.thumbnailUrl }} style={styles.videoThumbnail} />
                            <View style={styles.overlay} />
                            <Image source={PlayIcon} style={styles.playIcon} />
                        </View>
                    );
                }
            }

            if (item.name.toLowerCase().endsWith(".pdf")) {
                return (
                    <View style={styles.customThumbnailContainer}>
                        <Image source={PdfIcon} style={styles.pdfImage} />
                    </View>
                );
            }

            if (item.type === "audios") {
                return (
                    <View style={styles.customThumbnailContainer}>
                        <Image source={item.thumbnailUrl ? { uri: item.thumbnailUrl } : AudioFileIcon} style={styles.fileImage} />
                    </View>
                );
            }

            return (
                <View style={styles.customThumbnailContainer}>
                    <Image source={DocsIcon} style={styles.documentImage} />
                </View>
            );
        };

        return (
            <View style={styles.fileContainer}>
                <View style={styles.fileInfo}>
                    <View style={styles.fileThumbnail}>
                        {renderThumbnail()}
                    </View>
                    <View style={styles.fileDetails}>
                        <View style={styles.fileMeta}>
                            <Text style={styles.fileName}>{item.name} <Text style={{ color: colors.textColor2 }}>-</Text> <Text style={styles.fileSize}>{formatFileSize(item.size)}</Text></Text>


                        </View>
                        <Text style={styles.fileDate}>{new Date(item.deletedAt).toUTCString()}</Text>
                    </View>
                </View>

                <TouchableOpacity onPress={() => toggleOptions(item)} style={styles.fileOption}>
                    <Feather name="more-horizontal" size={hp("3.5%")} color={colors.textColor3} />
                </TouchableOpacity>

                {selectedFile?.name === item.name && (
                    <View style={styles.optionsContainer}>
                        <TouchableOpacity style={styles.optionButton} onPress={() => handleRestoreFile(item)}>
                            <Text style={styles.optionText}>Restore</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.optionButton} onPress={() => handleDeleteFileOne(item)}>
                            <Text style={[styles.optionText, { color: "#B82132" }]}>Delete Permanently</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        );
    };

    const handleRestoreFile = async (file) => {
        const response = await restoreFile(userId, file._id, file.type, dispatch)
        if (response.success) {
            Toast.show({
                type: 'success',
                text1: 'File Restored!',
            })
        }
        else {
            Toast.show({
                type: 'error',
                text1: 'Failed to restore file.',
                text2: response.message
            })
        }
    }
    return (
        <SafeAreaView style={styles.container} >
            <View style={styles.innerContainer}>
                <View style={styles.header}>
                    <View style={{
                        flexDirection: 'row',
                        alignItems: "center"
                    }}>
                        <Pressable onPress={() => navigation.goBack()}>
                            <Entypo name="chevron-thin-left" size={hp("3.5%")} color={colors.textColor3} />
                        </Pressable>
                        <Text style={styles.headerText}>Recycle Bin</Text>
                    </View>

                </View>

                <View style={styles.content}>
                    <FlatList
                        data={binFiles}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={renderItem}
                        ListEmptyComponent={() => (
                            <View style={styles.emptyList}>
                                <Image style={styles.recycleBinIcon} source={RecycleBinIcon} />
                            </View>
                        )}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    />
                </View>
            </View>
            {
                binFiles?.length > 0 && <TouchableOpacity onPress={handleDeleteAll} style={styles.deleteAllButton}>
                    <EvilIcons name="trash" size={hp("6%")} color={colors.textColor3} />
                </TouchableOpacity>
            }
        </SafeAreaView >
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
        width: wp("100%"),
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: wp("3%"),
        marginBottom: hp("2%"),
        justifyContent: "space-between"
    },
    headerText: {
        fontSize: hp("4%"),
        color: colors.textColor3,
        fontFamily: "Afacad-SemiBold",
        marginLeft: wp("1%"),
    },
    content: {
        flex: 1,
        width: wp("100%"),
    },
    fileContainer: {
        padding: hp("2%"),
        borderRadius: hp("1.5%"),
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        position: "relative",
    },
    fileInfo: {
        flexDirection: "row",
        flex: 1,
        alignItems: "center",
        gap: wp("5%")
    },
    fileOption: {
        alignItems: "center",
        justifyContent: "center",
    },
    fileThumbnail: {
        width: wp("18%"),
        height: hp("18%"),
        backgroundColor: colors.lightColor2,
        borderRadius: hp("2%"),
        aspectRatio: 1,
    },
    customThumbnailContainer: {
        width: "100%",
        height: "100%",
        aspectRatio: 1,
    },
    imageStyle: {
        width: "100%",
        height: "100%",
        resizeMode: 'contain',
        borderRadius: hp("2%"),
    },
    fileDetails: {
        gap: hp("1.3%"),
    },
    fileMeta: {
        flexDirection: "row",
        alignItems: "center",

    },
    fileName: {
        fontSize: hp("2%"),
        color: colors.textColor3,
        fontFamily: "Afacad-Medium",
        flexWrap: 'wrap',
        width: "90%"
    },
    fileSize: {
        fontSize: hp("1.9%"),
        color: colors.textColor2,
        fontFamily: "Afacad-Regular",
    },
    fileDate: {
        fontSize: hp("1.8%"),
        color: colors.textColor2,
        fontFamily: "Afacad-Regular",
    },
    optionsContainer: {
        position: "absolute",
        right: wp("5%"),
        top: hp("8%"),
        backgroundColor: colors.lightColor1,
        padding: hp("1%"),
        borderRadius: hp("1%"),
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        zIndex: 100,

    },
    optionButton: {
        padding: hp("1%"),
        flex: 1
    },
    optionText: {
        fontSize: hp("2%"),
        color: colors.textColor3,
        fontFamily: "Afacad-Regular",
    },
    emptyList: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        height: hp("70%")
    },
    recycleBinIcon: {
        width: wp("30%"),
        height: wp("30%"),
        resizeMode: "contain",
        aspectRatio: 1,
        tintColor: colors.textColor2,
        opacity: 0.8
    },
    deleteAllButton: {
        position: 'absolute',
        bottom: hp('5%'),
        alignSelf: 'center',
        backgroundColor: 'rgba(255, 0, 0, 0.2)',
        padding: hp("1%"),
        borderRadius: hp("1000%"),
        aspectRatio: 1,
        height: hp("9%"),
        justifyContent: "center",
        alignItems: 'center'

    }, customThumbnailContainer: {
        width: "100%",
        height: "100%",
        backgroundColor: colors.lightColor2,
        borderRadius: hp("1.5%"),
        alignItems: "center",
        justifyContent: "center",

    },
    fileImage: {
        width: "100%",
        height: "100%",
        resizeMode: "contain",
        borderRadius: hp("1.5%"),
    },
    pdfImage: {
        width: "65%",
        height: "65%",
        opacity: 0.9,
    },
    audioImage: {
        width: "100%",
        height: "100%",
        resizeMode: "contain",
    },
    fallBackAudioImage: {
        width: "60%",
        height: "60%",
        resizeMode: "contain",
    },
    videoFileWithPlayContainer: {
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: hp("1.5%"),

    },
    playIcon: {
        position: "absolute",
        width: "35%",
        height: "35%",
        tintColor: "rgba(202, 202, 202, 0.90)",
        zIndex: 10,
    },
    videoThumbnail: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
        borderRadius: hp("1.5%"),
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        borderRadius: hp("1.5%"),
    },
    documentImage: {
        height: "60%",
        width: "60%",
        resizeMode: "contain",
    },
});
