import { View, Text, StyleSheet, Pressable, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import colors from '../../../constants/colors';
import { Entypo, Feather } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { PieChart } from 'react-native-gifted-charts';
import { formatFileSize } from '../../../utils/formatFileSize';
import { FlatList } from 'react-native-gesture-handler';

export default function ManageStorage({ navigation }) {
    const [imagesUsedSpace, setImagesUsedSpace] = useState(0);
    const [videosUsedSpace, setVideosUsedSpace] = useState(0);
    const [audiosUsedSpace, setAudiosUsedSpace] = useState(0);
    const [othersUsedSpace, setOthersUsedSpace] = useState(0);
    const [recycleBinUsedSpace, setRecycleBinUsedSpace] = useState(0);
    const [allFiles, setAllFiles] = useState([]);
    const [selectedTab, setSelectedTab] = useState("All Files");
    const [filteredFiles, setFilteredFiles] = useState(allFilesMetadata);
    const [focusedSlice, setFocusedSlice] = useState(null);


    const allFilesMetadata = useSelector((state) => state.files.allFilesMetadata);
    const recycleBinFiles = useSelector((state) => state.files.recycleBinFiles);

    useEffect(() => {
        if (pieData.length > 0) {
            const focusIndex = pieData.findIndex(item =>
                item.label.toLowerCase().includes(selectedTab.toLowerCase())
            );
            setFocusedSlice(focusIndex !== -1 ? focusIndex : null);
        }
    }, [selectedTab, imagesUsedSpace, videosUsedSpace, audiosUsedSpace, othersUsedSpace, recycleBinUsedSpace]);


    useEffect(() => {
        let filesArray = [];

        allFilesMetadata.forEach(file => {
            filesArray.push(file);
        });

        filesArray.sort((a, b) => b.size - a.size);

        setAllFiles(filesArray);
    }, [allFilesMetadata, recycleBinFiles]);

    useEffect(() => {
        let filesToShow = [];

        if (selectedTab === "All Files") {
            filesToShow = [...allFilesMetadata];
        } else {
            filesToShow = allFilesMetadata.filter(file => file.type === selectedTab.toLowerCase());
        }


        filesToShow.sort((a, b) => b.size - a.size);

        setFilteredFiles(filesToShow);
    }, [selectedTab, allFilesMetadata]);


    useEffect(() => {
        let imagesSize = 0, videosSize = 0, audiosSize = 0, othersSize = 0, recycleBinSize = 0;

        allFilesMetadata.forEach(file => {
            switch (file.type) {
                case "images":
                    imagesSize += file.size;
                    break;
                case "videos":
                    videosSize += file.size;
                    break;
                case "audios":
                    audiosSize += file.size;
                    break;
                default:
                    othersSize += file.size;
            }
        });

        recycleBinSize = recycleBinFiles.reduce((acc, file) => acc + file.size, 0);

        setImagesUsedSpace(imagesSize);
        setVideosUsedSpace(videosSize);
        setAudiosUsedSpace(audiosSize);
        setOthersUsedSpace(othersSize);
        setRecycleBinUsedSpace(recycleBinSize);
    }, [allFilesMetadata, recycleBinFiles]);

    const totalUsedSpace = imagesUsedSpace + videosUsedSpace + audiosUsedSpace + othersUsedSpace + recycleBinUsedSpace;

    const pieData = [
        {
            value: imagesUsedSpace,
            color: "#ff6384",
            gradientCenterColor: "#d32f2f",
            label: `Images ${totalUsedSpace > 0 ? ((imagesUsedSpace / totalUsedSpace) * 100).toFixed(2) + "%" : "0%"}`
        },
        {
            value: videosUsedSpace,
            color: "#36a2eb",
            gradientCenterColor: "#1976d2",
            label: `Videos ${totalUsedSpace > 0 ? ((videosUsedSpace / totalUsedSpace) * 100).toFixed(2) + "%" : "0%"}`
        },
        {
            value: audiosUsedSpace,
            color: "#ffce56",
            gradientCenterColor: "#fbc02d",
            label: `Audios ${totalUsedSpace > 0 ? ((audiosUsedSpace / totalUsedSpace) * 100).toFixed(2) + "%" : "0%"}`
        },
        {
            value: othersUsedSpace,
            color: "#4bc0c0",
            gradientCenterColor: "#00796b",
            label: `Others ${totalUsedSpace > 0 ? ((othersUsedSpace / totalUsedSpace) * 100).toFixed(2) + "%" : "0%"}`
        },
        {
            value: recycleBinUsedSpace,
            color: "#8e44ad",
            gradientCenterColor: "#6c3483",
            label: `Recycle Bin ${totalUsedSpace > 0 ? ((recycleBinUsedSpace / totalUsedSpace) * 100).toFixed(2) + "%" : "0%"}`
        },
    ].filter(item => item.value > 0);

    const options = [
        "All Files", "Images", "Videos", "Audios", "Others"
    ]

    const renderItem = ({ item,index }) => (
        <TouchableOpacity onPress={() => {
            navigation.navigate("FilePreviewScreen", {
                file: item
            })
        }} style={styles.fileItem}>
            <Text style={styles.fileName}>{index+1}. {item.name}</Text>
            <Text style={styles.fileSize}>{formatFileSize(item.size)}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.innerContainer}>
                <View style={styles.header}>
                    <Pressable onPress={() => navigation.goBack()}>
                        <Entypo name="chevron-thin-left" size={hp("3.5%")} color={colors.textColor3} />
                    </Pressable>
                    <Text style={styles.headerText}>Manage Storage</Text>
                </View>

                <View style={styles.content}>
                    <View style={styles.storageInfoContainer}>
                        {pieData.length > 0 ? (
                            <PieChart
                                data={pieData}
                                donut
                                showGradient
                                sectionAutoFocus
                                radius={hp("11%")}
                                innerRadius={hp("8%")}
                                focusOnPress
                                showValuesAsLabels
                                isAnimated
                                curvedStartEdges
                                shadow
                                focusedIndex={focusedSlice}
                                innerCircleColor={colors.lightColor1}
                                centerLabelComponent={(selectedData) => {
                                    return selectedData ? (
                                        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                            <Text style={{ fontSize: hp("2.5%"), color: colors.textColor3, fontWeight: 'bold' }}>
                                                {formatFileSize(selectedData.value)}
                                            </Text>
                                            <Text style={{ fontSize: hp("2%"), color: colors.textColor3, fontFamily: "Afacad-Medium" }}>
                                                {selectedData.label}
                                            </Text>
                                        </View>
                                    ) : (
                                        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                            <Text style={{ fontSize: hp("2.5%"), color: colors.textColor3, fontWeight: 'bold' }}>
                                                {formatFileSize(totalUsedSpace)}
                                            </Text>
                                            <Text style={{ fontSize: hp("2%"), color: colors.textColor3, fontFamily: "Afacad-Medium" }}>
                                                Total Used
                                            </Text>
                                        </View>
                                    );
                                }}
                            />
                        ) : (
                            <Text style={styles.noDataText}>No Data Available</Text>
                        )}
                        <View style={styles.storageInfo}>
                            {pieData.map((data) => (
                                <View key={data.label} style={styles.storageInfoItem}>
                                    <View style={[styles.dotContainer, { backgroundColor: data.color }]}></View>
                                    <Text style={styles.storageInfoLabel}>{data.label}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                    <View style={styles.fileDetailsContainer}>
                        <View style={styles.tabsContainer}>
                            {options.map((option, index) => (
                                <Pressable
                                    key={index}
                                    onPress={() => setSelectedTab(option)}
                                    style={[styles.tab, selectedTab === option && styles.selectedTab]}
                                >
                                    <Text style={styles.tabText}>{option}</Text>
                                </Pressable>
                            ))}
                        </View>
                        <FlatList
                            data={filteredFiles}
                            renderItem={renderItem}
                            keyExtractor={(item) => item.name}
                            style={{
                                width: wp("87%"),
                                flexGrow: 1
                            }}
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
        alignItems: "center"
    },
    header: {
        flexDirection: 'row',
        width: wp("100%"),
        paddingHorizontal: wp("3.5%"),
        alignItems: "center",
        marginBottom: hp("2%")
    },
    headerText: {
        fontSize: hp("3.5%"),
        color: colors.textColor3,
        fontFamily: "Afacad-Medium",
    },
    content: {
        flex: 1,
        alignItems: "center",
        width: wp("100%"),
        paddingHorizontal: wp("3.5%"),
        justifyContent: "space-between"
    },
    storageInfoContainer: {
        width: wp("90%"),
        height: hp("40%"),
        backgroundColor: colors.lightColor1,
        borderRadius: hp("2%"),
        alignItems: "center",
        justifyContent: "space-evenly",
        padding: hp("1%"),
        position: "relative"
    },
    fileDetailsContainer: {
        width: wp("90%"),
        flex: 1,
        padding: hp("2%"),
        borderRadius: hp("2%"),
        alignItems: "center",
    },
    noDataText: {
        fontSize: hp("2.5%"),
        color: colors.textColor3,
        textAlign: "center",
    },
    storageInfo: {
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-around",
    },
    storageInfoItem: {
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: wp("1%"),
    },
    dotContainer: {
        width: wp("2.5%"),
        height: wp("2.5%"),
        borderRadius: wp("2.5%"),
        aspectRatio: 1
    },
    storageInfoLabel: {
        fontSize: hp("2%"),
        color: colors.textColor3,
        fontFamily: "Afacad-Regular",
        paddingVertical: hp("0.5%")
    },
    tabsContainer: {
        width: wp("90%"),
        flexDirection: "row",
        marginBottom: hp("1.5%"),
        justifyContent: "space-between",
    },
    tab: {

        paddingVertical: hp("1%"),
        alignItems: "center",
        justifyContent: "center",
        marginHorizontal: wp("1%")
    },
    selectedTab: {
        borderBottomColor: "#9366E2",
        borderBottomWidth: hp("0.2%"),
    },
    tabText: {
        fontSize: hp("2.2%"),
        color: colors.textColor3,
        fontFamily: "Afacad-Medium",
    },
    fileItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: hp("1.5%"),
    },
    fileName: {
        fontSize: hp("2%"),
        color: colors.textColor3,
        fontFamily: "Afacad-Regular",
        flexWrap: "wrap",
        width: "80%"
    },
    fileSize: {
        fontSize: hp("2%"),
        color: colors.textColor3,
        fontFamily: "Afacad-Regular"
    },
});
