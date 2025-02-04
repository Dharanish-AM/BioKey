import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import colors from '../constants/colors';
import { fetchFolderList, handleFolderMove } from '../services/userOperations';
import Toast from 'react-native-toast-message';

export default function AddFilesFolder({ file, sheetRef }) {
    const folders = useSelector((state) => state.user.folders);
    const userId = useSelector((state) => state.user.userId)
    const dispatch = useDispatch()

    const handleFileAddToFolder = async (folder) => {
        const response = await handleFolderMove(userId, folder.folderId, file._id, dispatch)
        console.log(response)
        if (response.success) {

            sheetRef.current.close()
            Toast.show({
                type: 'success',
                text1: `File added to ${folder.folderName} folder`,
            })
        }
        else {
            Toast.show({
                type: 'error',
                text1: 'Error adding file to folder',
                text2: response.message
            })
        }
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={folders}
                keyExtractor={(item) => item.folderId?.toString() || item.name}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => {
                        handleFileAddToFolder(item)
                    }} style={styles.item}>
                        <Text style={styles.itemText1}>{item.folderName}</Text>
                        <Text style={styles.itemText2}>{item.files.length} files</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: wp("100%")
    },
    item: {
        width: wp("90%"),
        padding: hp("2"),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: "space-between",
        borderBottomColor: 'rgba(166, 166, 166, 0.1)',
        borderBottomWidth: hp("0.1%")
    },
    itemText1: {
        fontSize: hp("2.5%"),
        color: colors.textColor3,
        fontFamily: "Afacad-Medium"
    },
    itemText2: {
        fontSize: hp("2%"),
        color: colors.textColor2,
        fontFamily: "Afacad-Regular"
    }
})