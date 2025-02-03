import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { FlatList } from 'react-native-gesture-handler'
import { useSelector } from 'react-redux'

export default function AddFilesFolder({ file }) {
    const folders = useSelector((state) => state.user.folders)
    return (
        <View style={styles.container}>
            <FlatList renderItem={(item) => {
                return (
                    <View style={styles.item}>
                        <Text style={styles.itemText}>{item.item.name}</Text>
                    </View>
                )
            }} data={folders} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
})