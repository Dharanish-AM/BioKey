import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, Alert, Modal } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import colors from '../../../constants/colors'
import Entypo from '@expo/vector-icons/Entypo';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { FlatList, Pressable, RefreshControl } from 'react-native-gesture-handler';
import { formatFileSize } from '../../../utils/formatFileSize';
import SkeletonLoader from '../../../components/SkeletonLoader';
import Feather from '@expo/vector-icons/Feather';
import Toast from 'react-native-toast-message';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { deleteFolders, fetchFolderList, handleFolderRename } from '../../../services/userOperations';

export default function FolderPreviewScreen({ navigation, route }) {
    const { folderId } = route.params;
    const [isMore, setIsMore] = useState(false);
    const [newFolderName, setNewFolderName] = useState(folder?.folderName);
    const [isRename, setIsRename] = useState(false);
    const dispatch = useDispatch()
    const userId = useSelector((state) => state.user.userId)
    const [refreshing, setRefreshing] = useState(false);

    const folder = useSelector(state =>
        state.user.folders.find(f => f.folderId === folderId)
        , shallowEqual);


    const onRefresh = async () => {
        setRefreshing(true);
        await fetchFolderList(userId, dispatch)
        setRefreshing(false);
    }


    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.fileContainer}
            onPress={() => {
                navigation.navigate('FilePreviewScreen', { file: item })
            }}
        >
            {item.thumbnail ? (
                <View style={styles.fileThumbnailContainer}>
                    <Image source={{ uri: item.thumbnail }} style={styles.fileThumbnail} />
                </View>
            ) : (
                <View style={styles.fileThumbnailContainer}>
                    <Text style={styles.noThumbnail}>No Thumbnail Available</Text>
                </View>
            )}
            <View style={styles.fileDetails}>
                <Text style={styles.fileName} ellipsizeMode="tail" numberOfLines={1}>
                    {item.name}
                </Text>
                <Text style={styles.fileSize}>{formatFileSize(item.size)}</Text>
            </View>
        </TouchableOpacity>
    );

    const renderSkeletonItem = () => (
        <View>
            <SkeletonLoader boxHeight={hp("18%")} boxWidth={wp("45%")} />
            <View style={{ marginTop: hp("1%") }}>
                <SkeletonLoader boxHeight={hp("2%")} boxWidth={wp("45%")} borderRadius={hp("1.5%")} />
            </View>
        </View>
    );

    const handleRename = () => {
        setIsMore(false)
        setIsRename(true)
    };

    const handleDelete = () => {
        setIsMore(false)
        Alert.alert(
            'Delete Folder',
            'Are you sure you want to delete this folder?',
            [
                {
                    text: 'Cancel',
                    onPress: () => setIsMore(false),
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    onPress: async () => {
                        const response = await deleteFolders(userId, folderId, dispatch);
                        if (response.success) {
                            setIsMore(false)
                            Toast.show({
                                text1: 'Folder deleted successfully',
                                type: "success"
                            })
                            navigation.goBack()
                        }
                        else {
                            Toast.show({
                                text1: 'Failed to delete folder',
                                text2: response.message,
                                type: "error"
                            })
                        }
                    },
                    style: "destructive"

                },
            ],
            { cancelable: false }
        );
    };

    const onRenameFolder = async () => {


        const response = await handleFolderRename(userId, folder.folderId, newFolderName, dispatch)
        if (response.success) {
            setIsRename(false)
            setIsMore(false)
            Toast.show({
                text1: 'Folder renamed successfully',
                type: "success"
            })

        } else {
            Toast.show({
                text1: 'Failed to rename folder',
                text2: response.message,
                type: "error"
            })
        }
    }


    return (
        <SafeAreaView edges={["top", "left", "right"]} style={styles.container}>
            <View style={styles.innerContainer}>
                <View style={styles.header}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Entypo name="chevron-thin-left" size={hp("4%")} color={colors.textColor3} />
                        </TouchableOpacity>
                        <Text style={styles.headerText}>{folder?.folderName}</Text>
                    </View>
                    <TouchableOpacity onPress={() => setIsMore(true)}>
                        <Feather name="more-vertical" size={hp("3.5%")} color={colors.textColor3} />
                    </TouchableOpacity>
                </View>
                <View style={styles.content}>
                    {
                        folder ? (
                            <FlatList
                                numColumns={2}
                                columnWrapperStyle={styles.columnWrapper}
                                keyExtractor={(item) => item._id}
                                data={folder.files}
                                renderItem={renderItem}
                                ListEmptyComponent={() => {
                                    return (
                                        <View style={styles.emptyList}>
                                            <Text style={styles.emptyListText}>No files in this folder</Text>
                                        </View>
                                    )
                                }}
                                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                            />
                        ) : (
                            <FlatList
                                numColumns={2}
                                columnWrapperStyle={styles.skelColumnWrapper}
                                contentContainerStyle={{
                                    width: wp("100%"),
                                    paddingHorizontal: wp("1.5%"),
                                }}
                                data={[1, 2, 3, 4, 5, 6, 7, 8, 9]}
                                renderItem={renderSkeletonItem}
                            />
                        )
                    }
                </View>
            </View>
            {
                isMore && (
                    <Pressable onPress={() => {
                        setIsMore(false);
                    }} style={styles.overlayContainer}>
                        <View style={styles.moreContainer}>
                            <Pressable onPress={() => {
                                handleRename()
                            }} style={styles.optionButton}>
                                <Text style={styles.optionButtonText}>Rename Folder</Text>
                            </Pressable>
                            <Pressable onPress={handleDelete} style={[styles.optionButton, {
                                borderBottomWidth: 0
                            }]}>
                                <Text style={styles.optionButtonText}>Delete Folder</Text>
                            </Pressable>
                        </View>
                    </Pressable>
                )
            }

            {
                isRename && <View style={styles.overlayContainertwo}></View>
            }

            <Modal visible={isRename}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsRename(false)}
            >
                <View style={styles.renameContainer}>
                    <Text style={styles.renameTitle}>Rename Folder</Text>
                    <TextInput
                        style={styles.renameInput}
                        textAlign='center'
                        value={newFolderName}
                        onChangeText={setNewFolderName}
                        placeholder="Enter new folder name"
                    />
                    <View style={{
                        flexDirection: 'row',
                        width: "100%",
                        justifyContent: "space-between"
                    }}>

                        <TouchableOpacity
                            onPress={() => {
                                setIsRename(false)
                                setNewFolderName(folder?.folderName)
                            }}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                onRenameFolder();

                            }}
                        >
                            <Text style={styles.renameButtonText}>Rename</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>


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
        alignItems: "center"
    },
    header: {
        width: wp("100%"),
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: wp("1.5%"),
        justifyContent: "space-between"
    },
    headerText: {
        fontSize: hp("4%"),
        color: colors.textColor3,
        fontFamily: "Afacad-SemiBold"
    },
    content: {
        flex: 1,
        width: wp("100%"),
        marginTop: hp("3%")
    },
    fileContainer: {
        width: wp("45%"),
        height: hp("21%"),
        overflow: "hidden",
        borderRadius: hp("1.5%"),
        justifyContent: "space-between",
        alignItems: "center",
        borderWidth: 0.6,
        backgroundColor: "rgba(25, 29, 36, 0.5)",
        borderColor: "rgba(229,231,235,0.1)",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    columnWrapper: {
        marginBottom: hp("2%"),
        justifyContent: "space-between",
        paddingHorizontal: wp("3.5%"),
    },
    skelColumnWrapper: {
        marginBottom: hp("2%"),
        justifyContent: "space-between",
        paddingHorizontal: wp("1.5%"),
    },
    fileThumbnailContainer: {
        height: "80%",
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    fileThumbnail: {
        height: "100%",
        width: "100%",
        resizeMode: "cover",
    },
    fileDetails: {
        alignItems: "center",
        width: "100%",
        height: "20%",
        justifyContent: "space-between",
        paddingHorizontal: "6%",
        flexDirection: "row",
    },
    noThumbnail: {
        fontFamily: "Afacad-Regular",
        opacity: 0.9,
        fontSize: hp("1.5%"),
        color: colors.textColor2,
        alignSelf: "center",
    },
    fileName: {
        fontSize: hp("1.5%"),
        color: colors.textColor3,
        fontFamily: "Afacad-Regular",
        opacity: 0.9,
        width: "70%",
    },
    fileSize: {
        fontSize: hp("1.5%"),
        color: "rgba(255,255,255,0.7)",
        fontFamily: "Afacad-Regular",
    },
    overlayContainer: {
        position: 'absolute',
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        width: wp("100%"),
        height: hp("100%"),
    },
    overlayContainertwo: {
        position: 'absolute',
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        width: wp("100%"),
        height: hp("100%"),
        alignItems: "center", justifyContent: "center"
    },
    moreContainer: {
        borderRadius: hp("2%"),
        padding: wp("0%"),
        alignItems: "center",
        left: wp("35%"),
        top: hp("13%"),
        backgroundColor: colors.lightColor1,
        width: "60%",
        paddingVertical: hp("1%"),
        paddingHorizontal: wp("3%")
    },

    optionButton: {
        width: "100%",
        paddingVertical: hp("1%"),
        alignItems: "center",
        borderBottomColor: "rgba(166, 173, 186, 0.2)",
        borderBottomWidth: 1
    },
    optionButtonText: {
        fontSize: hp("2.2%"),
        color: "white",
        fontFamily: "Afacad-Regular",
    },
    renameContainer: {
        paddingHorizontal: hp("2.5%"),
        paddingVertical: hp("2.5%"),
        backgroundColor: colors.secondaryColor1,
        borderRadius: hp("2%"),
        width: wp("80%"),
        height: hp("21%"),
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [
            { translateX: wp("-40%") },
            { translateY: hp("-10.5%") },
        ],
        alignItems: 'center',
        justifyContent: 'space-between',
        alignSelf: 'center',
    },
    renameTitle: {
        fontSize: hp("2.5%"),
        color: colors.textColor3,
        fontFamily: "Afacad-Medium",
        alignSelf: 'flex-start'
    },
    renameInput: {
        width: "100%",
        borderBottomWidth: 1,
        borderBottomColor: "rgba(166, 173, 186, 0.2)",
        marginBottom: hp("2%"),
        paddingHorizontal: wp("2%"),
        fontFamily: "Afacad-Regular",
        color: colors.textColor2,
        fontSize: hp("2.5%"),
        padding: hp("1%"),
    },
    renameButtonText: {
        fontSize: hp("2.2%"),
        color: "#9366E2",
        fontFamily: "Afacad-Regular",
    },
    cancelButtonText: {
        fontSize: hp("2.2%"),
        color: colors.textColor3,
        fontFamily: "Afacad-Regular",
    },
    emptyList: {
        flex: 1,
        width: '100%',
        height: hp("70%"),
        alignItems: "center",
        justifyContent: "center"
    },
    emptyListText: {
        fontSize: hp("2.5%"),
        color: colors.textColor3,
        fontFamily: "Afacad-Italic",
    }
});
