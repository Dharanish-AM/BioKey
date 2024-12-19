import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import colors from "../../constants/colors";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import axios from "axios";
import CircularProgress from "react-native-circular-progress-indicator";
import SpinnerOverlay from "../../components/SpinnerOverlay";
import RBSheet from "react-native-raw-bottom-sheet";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";

import { uploadMedia } from "../../services/mediaUpload";
import { pickMedia } from "../../utils/mediaPicker";

import ProfileIcon from "../../assets/images/profile_icon.png";
import SearchIcon from "../../assets/images/search_icon.png";
import RightIcon from "../../assets/images/right_icon.png";
import ImagesIcon from "../../assets/images/image_icon.png";
import VideosIcon from "../../assets/images/videos_icon.png";
import AudiosIcon from "../../assets/images/audio_icon.png";
import DocsIcon from "../../assets/images/docs_icon.png";
import PassIcon from "../../assets/images/pass_icon.png";
import HeartIcon from "../../assets/images/heart_icon.png";
import BinIcon from "../../assets/images/bin_icon.png";
import BrushIcon from "../../assets/images/brush_icon.png";
import PlusIcon from "../../assets/images/plus_icon.png";
import MoreIcon from "../../assets/images/more_icon.png";
import DocsFileIcon from "../../assets/images/document_icon.png";
import AudioFileIcon from "../../assets/images/audiofile_icon.png";
import PlayIcon from "../../assets/images/play_icon.png";
import PdfIcon from "../../assets/images/pdf_icon.png";
import CloudIcon from "../../assets/images/cloud_icon.png";

export default function HomeScreen({ navigation }) {
  const ip = "192.168.1.3:8000";
  const [recentFiles, setRecentFiles] = useState([]);
  const [usedSpace, setUsedSpace] = useState(0);
  const [usedSpaceWithUnit, setUsedSpaceWithUnit] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const fetchOnceRef = useRef(false);
  const refRBSheet = useRef();
  const TOTAL_SPACE = 5 * 1024 * 1024 * 1024;
  const TOTAL_SPACE_UNIT = "5 GB";

  useEffect(() => {
    if (fetchOnceRef.current) return;
    fetchOnceRef.current = true;
    setIsLoading(true);
    fetchRecentFiles();
    fetchUsedSpace();
  }, []);

  const fetchRecentFiles = async () => {
    console.log("Fetching recent files");
    try {
      const response = await axios.get(
        `http://${ip}/api/files/recent?userId=user123`
      );
      if (response.status === 200) {
        setRecentFiles(response.data.files || []);
      } else {
        console.error("Error fetching recent files:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching recent files:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsedSpace = async () => {
    try {
      const response = await axios.get(
        `http://${ip}/api/files/usedspace?userId=user123`
      );

      if (response.status === 200) {
        const usedSpaceBytes = response.data.usedSpace || 0;
        const usedSpacePercentage = (usedSpaceBytes / TOTAL_SPACE) * 100;
        const usedSpaceWithUnit = formatFileSize(usedSpaceBytes);

        setUsedSpaceWithUnit(usedSpaceWithUnit);
        setUsedSpace(usedSpacePercentage.toFixed(2));
      } else {
        console.error("Error fetching used space:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching used space:", error);
    }
  };

  const handlePickImage = async () => {
    const result = await pickMedia("image");

    if (
      result &&
      ((Array.isArray(result) && result.length > 0) || result.uri)
    ) {
      const files = Array.isArray(result) ? result : [result];
      Alert.alert(
        "Confirm Upload",
        `You have selected ${files.length} image(s). Do you want to upload them?`,
        [
          { text: "Cancel", onPress: () => console.log("Upload cancelled") },
          {
            text: "OK",
            onPress: async () => {
              let successCount = 0;
              for (const file of files) {
                const fileUri = file.uri;
                const fileType = "image";
                const fileName = file.fileName;
                const uploadResponse = await uploadMedia(
                  fileUri,
                  fileType,
                  fileName
                );
                if (uploadResponse.success) {
                  successCount++;
                  console.log(`Image ${fileName} uploaded successfully`);
                } else {
                  console.error(
                    `Image ${fileName} upload failed:`,
                    uploadResponse.message
                  );
                }
              }

              if (successCount > 0) {
                Alert.alert(
                  "Upload Success",
                  `${successCount} image(s) uploaded successfully!`,
                  [{ text: "OK" }]
                );
              } else {
                Alert.alert(
                  "Upload Failed",
                  "No files were uploaded successfully.",
                  [{ text: "OK" }]
                );
              }
              refRBSheet.current.close();
              onRefresh();
            },
          },
        ]
      );
    } else {
      console.log("No files selected or invalid data");
    }
  };

  const handlePickVideo = async () => {
    const result = await pickMedia("video");

    if (
      result &&
      ((Array.isArray(result) && result.length > 0) || result.uri)
    ) {
      const files = Array.isArray(result) ? result : [result];
      Alert.alert(
        "Confirm Upload",
        `You have selected ${files.length} video(s). Do you want to upload them?`,
        [
          { text: "Cancel", onPress: () => console.log("Upload cancelled") },
          {
            text: "OK",
            onPress: async () => {
              let successCount = 0;
              for (const video of files) {
                const fileUri = video.uri;
                const fileType = "video";
                const fileName = video.fileName;
                const uploadResponse = await uploadMedia(
                  fileUri,
                  fileType,
                  fileName
                );
                if (uploadResponse.success) {
                  successCount++;
                  console.log(`Video ${fileName} uploaded successfully`);
                } else {
                  console.error(
                    `Video ${fileName} upload failed:`,
                    uploadResponse.message
                  );
                }
              }

              if (successCount > 0) {
                Alert.alert(
                  "Upload Success",
                  `${successCount} video(s) uploaded successfully!`,
                  [{ text: "OK" }]
                );
              } else {
                Alert.alert(
                  "Upload Failed",
                  "No files were uploaded successfully.",
                  [{ text: "OK" }]
                );
              }
              refRBSheet.current.close();
              onRefresh();
            },
          },
        ]
      );
    } else {
      console.log("No files selected or invalid data");
    }
  };

  const handlePickAudio = async () => {
    const result = await pickMedia("audio");
    if (result && (Array.isArray(result) ? result.length > 0 : result.uri)) {
      const files = Array.isArray(result) ? result : [result];

      Alert.alert(
        "Confirm Upload",
        `You have selected ${files.length} audio file(s). Do you want to upload them?`,
        [
          { text: "Cancel", onPress: () => console.log("Upload cancelled") },
          {
            text: "OK",
            onPress: async () => {
              let successCount = 0;

              for (const audio of files) {
                const fileUri = audio.uri;
                const fileType = "audio";
                const fileName = audio.name || "Unknown File";

                const uploadResponse = await uploadMedia(
                  fileUri,
                  fileType,
                  fileName
                );

                if (uploadResponse?.success) {
                  successCount++;
                  console.log(`Audio ${fileName} uploaded successfully`);
                } else {
                  console.error(
                    `Audio ${fileName} upload failed:`,
                    uploadResponse?.message || "Unknown error"
                  );
                }
              }

              if (successCount > 0) {
                Alert.alert(
                  "Upload Success",
                  `${successCount} audio file(s) uploaded successfully!`,
                  [{ text: "OK" }]
                );
              } else {
                Alert.alert(
                  "Upload Failed",
                  "No files were uploaded successfully.",
                  [{ text: "OK" }]
                );
              }

              refRBSheet.current.close();
              onRefresh();
            },
          },
        ]
      );
    } else {
      console.log("No files selected or invalid data");
      Alert.alert(
        "No Selection",
        "Please select valid audio files to upload.",
        [{ text: "OK" }]
      );
    }
  };

  const handlePickDocument = async () => {
    const result = await pickMedia("document");

    if (
      result &&
      ((Array.isArray(result) && result.length > 0) || result.uri)
    ) {
      const files = Array.isArray(result) ? result : [result];
      Alert.alert(
        "Confirm Upload",
        `You have selected ${files.length} document(s). Do you want to upload them?`,
        [
          { text: "Cancel", onPress: () => console.log("Upload cancelled") },
          {
            text: "OK",
            onPress: async () => {
              let successCount = 0;
              for (const doc of files) {
                const fileUri = doc.uri;
                const fileType = "document";
                const fileName = doc.fileName;
                const uploadResponse = await uploadMedia(
                  fileUri,
                  fileType,
                  fileName
                );
                if (uploadResponse.success) {
                  successCount++;
                  console.log(`Document ${fileName} uploaded successfully`);
                } else {
                  console.error(
                    `Document ${fileName} upload failed:`,
                    uploadResponse.message
                  );
                }
              }

              if (successCount > 0) {
                Alert.alert(
                  "Upload Success",
                  `${successCount} document(s) uploaded successfully!`,
                  [{ text: "OK" }]
                );
              } else {
                Alert.alert(
                  "Upload Failed",
                  "No files were uploaded successfully.",
                  [{ text: "OK" }]
                );
              }
              refRBSheet.current.close();
              onRefresh();
            },
          },
        ]
      );
    } else {
      console.log("No files selected or invalid data");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRecentFiles();
    await fetchUsedSpace();
    setRefreshing(false);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 B";
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    let i = 0;
    while (bytes >= 1024 && i < sizes.length - 1) {
      bytes /= 1024;
      i++;
    }
    return `${bytes.toFixed(2)} ${sizes[i]}`;
  };

  const renderItem = ({ item }) => {
    const isPdf = item.name.toLowerCase().endsWith(".pdf");

    const thumbnailSource = isPdf
      ? PdfIcon
      : item.category === "documents" && !item.thumbnail
      ? DocsFileIcon
      : item.category === "audio" && !item.thumbnail
      ? AudioFileIcon
      : { uri: item.thumbnail } || "https://placehold.jp/150x150.png";

    return (
      <TouchableOpacity style={styles.recentItem} key={item.id || item.name}>
        <View style={styles.recentFileImageContainer}>
          {isPdf ? (
            <View style={styles.customThumbnailContainer}>
              <Image source={PdfIcon} style={styles.pdfImage} />
            </View>
          ) : item.category === "documents" && !item.thumbnail ? (
            <View style={styles.customThumbnailContainer}>
              <Image source={DocsFileIcon} style={styles.documentImage} />
            </View>
          ) : item.category === "audios" && !item.thumbnail ? (
            <View style={styles.customThumbnailContainer}>
              <Image source={AudioFileIcon} style={styles.audioImage} />
            </View>
          ) : item.category === "videos" ? (
            <View style={styles.videoFileWithPlayContainer}>
              <Image
                source={thumbnailSource}
                style={[
                  styles.fileImage,
                  item.category === "documents" && styles.documentImage,
                  item.category === "audio" && styles.audioImage,
                ]}
              />
              <Image source={PlayIcon} style={styles.playIcon} />
            </View>
          ) : (
            <Image
              source={thumbnailSource}
              style={[
                styles.fileImage,
                item.category === "documents" && styles.documentImage,
                item.category === "audio" && styles.audioImage,
              ]}
            />
          )}
        </View>
        <View style={styles.fileDetailsContainer}>
          <View style={styles.aboutFile}>
            <Text
              style={styles.recentFileName}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.name}
            </Text>
            <View style={styles.fileDetails}>
              <Text style={styles.recentFileSize}>
                {formatFileSize(item.size)}
              </Text>
              <Text style={styles.modifiedTime}>
                {new Date(item.modifiedTime).toLocaleString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}{" "}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.moreIconContainer}>
            <Image source={MoreIcon} style={styles.moreIcon} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView edges={["right", "left", "top"]} style={styles.container}>
      <SpinnerOverlay visible={isLoading} />
      <View style={styles.innerContainer}>
        <View style={styles.top}>
          <TouchableOpacity
            style={styles.profileContainer}
            onPress={() => navigation.openDrawer()}
          >
            <Image
              source={ProfileIcon}
              style={styles.profileIcon}
              resizeMode="contain"
            />
            <Image
              source={RightIcon}
              resizeMethod="contain"
              style={styles.rightIcon}
            />
          </TouchableOpacity>
          <View style={styles.searchContainer}>
            <Image source={SearchIcon} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search files . . ."
              placeholderTextColor="rgba(166, 173, 186, 0.5)"
            />
          </View>
        </View>
        <View style={styles.center}>
          <View style={styles.storageView}>
            <View style={styles.storageViewLeft}>
              <CircularProgress
                value={usedSpace}
                radius={hp("8%")}
                duration={2000}
                progressValueColor={"#ecf0f1"}
                maxValue={100}
                title={"Used"}
                valueSuffix="%"
                titleColor={"#ecf0f1"}
                titleStyle={{
                  fontWeight: "bold",
                  fontSize: hp("1.8%"),
                  color: colors.textColor2,
                }}
                activeStrokeColor="rgba(100, 25, 230, 0.8)"
                progressValueStyle={{
                  fontSize: hp("2.5%"),
                  color: colors.textColor3,
                }}
                valueSuffixStyle={{
                  fontSize: hp("2.2%"),
                  color: colors.textColor3,
                }}
              />
            </View>
            <View style={styles.storageSepView}></View>
            <View style={styles.storageViewRight}>
              {/* <Image source={CloudIcon} style={styles.cloudIcon} /> */}
              <View style={styles.storageDetailsContainer}>
                <Text style={styles.storageTitle}>Used Space</Text>
                <Text style={styles.storageValue}>
                  {usedSpaceWithUnit} / {TOTAL_SPACE_UNIT}
                </Text>
              </View>
              <TouchableOpacity style={styles.premiumContainer}>
                <Text style={styles.premiumText}>Get Premium!</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.utitlityContainer}>
            <View style={styles.firstRowIcons}>
              <TouchableOpacity style={styles.iconContainer}>
                <Image
                  style={styles.utilIcons}
                  source={ImagesIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconContainer}>
                <Image
                  style={styles.utilIcons}
                  source={VideosIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconContainer}>
                <Image
                  style={styles.utilIcons}
                  source={AudiosIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <View style={styles.iconContainer}>
                <Image
                  style={styles.utilIcons}
                  source={DocsIcon}
                  resizeMode="contain"
                />
              </View>
              <TouchableOpacity style={styles.iconContainer}>
                <Image
                  style={styles.utilIcons}
                  source={PassIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
            <View style={styles.secondRowIcons}>
              <View style={styles.optionsIcons}>
                <TouchableOpacity style={styles.optionsIconContainer}>
                  <Image style={styles.optionIcon} source={HeartIcon} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.optionsIconContainer}>
                  <Image style={styles.optionIcon} source={BinIcon} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.optionsIconContainer}>
                  <Image style={styles.optionIcon} source={BrushIcon} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.addContainer}
                  onPress={() => refRBSheet.current.open()}
                >
                  <Image style={styles.addIcon} source={PlusIcon} />
                  <View style={styles.seperator}></View>
                  <Text style={styles.addText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <View style={styles.recentContainer}>
            <View style={styles.recentTop}>
              <Text style={styles.recentText}>Recent Files</Text>
              <Text style={styles.seeAllText}>See All</Text>
            </View>
            <View style={styles.recentBottom}>
              {recentFiles.length === 0 ? (
                <Text style={styles.nothingText}>
                  Nothing here, upload now!
                </Text>
              ) : (
                <FlatList
                  data={recentFiles}
                  renderItem={renderItem}
                  keyExtractor={(item) => item.name}
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  contentContainerStyle={{
                    gap: hp("0.6%"),
                  }}
                />
              )}
            </View>
          </View>
        </View>
        <RBSheet
          ref={refRBSheet}
          height={300}
          openDuration={400}
          closeDuration={300}
          animationType="slide"
          closeOnPressMask={true}
          closeOnDragDown={true}
          customStyles={{
            container: {
              borderTopLeftRadius: hp("2%"),
              borderTopRightRadius: hp("2%"),
              backgroundColor: colors.secondaryColor1,
              transform: [{ translateY: 0 }],
            },
            mask: {
              backgroundColor: "rgba(0, 0, 0, 0.3)",
            },
          }}
        >
          <View style={styles.sheetContainer}>
            <Text style={styles.headerText}>Select the file type</Text>
            <View style={styles.bottomSepView}></View>
            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={styles.optionButton}
                onPress={handlePickImage}
              >
                <Image source={ImagesIcon} style={styles.bottomIcon} />
                <Text style={styles.optionText}>Image</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.optionButton}
                onPress={handlePickVideo}
              >
                <Image source={VideosIcon} style={styles.bottomIcon} />
                <Text style={styles.optionText}>Video</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.optionButton}
                onPress={handlePickAudio}
              >
                <Image source={AudiosIcon} style={styles.bottomIcon} />
                <Text style={styles.optionText}>Audio</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.optionButton}
                onPress={handlePickDocument}
              >
                <Image source={DocsIcon} style={styles.bottomIcon} />
                <Text style={styles.optionText}>Others</Text>
              </TouchableOpacity>
            </View>
          </View>
        </RBSheet>
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
    flexDirection: "column",
    alignItems: "center",
  },
  top: {
    height: hp("8%"),
    width: wp("100%"),
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    paddingHorizontal: wp("3%"),
  },
  profileContainer: {
    flexDirection: "row",
    height: "80%",
    width: "30%",
    backgroundColor: colors.darkColor,
    borderRadius: hp("2%"),
    alignItems: "center",
    justifyContent: "space-evenly",
  },
  profileIcon: {
    height: "85%",
    width: "35%",
  },
  rightIcon: {
    height: "45%",
    width: "25%",
    objectFit: "contain",
    tintColor: colors.textColor2,
  },
  searchContainer: {
    height: "80%",
    width: "65%",
    backgroundColor: colors.darkColor,
    borderRadius: hp("2%"),
    paddingHorizontal: "5%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "7%",
    alignItems: "center",
  },
  searchIcon: {
    height: "50%",
    width: "15%",
    opacity: 0.5,
    objectFit: "contain",
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontFamily: "Afacad-Medium",
    fontSize: hp("2.2%"),
    color: colors.textColor3,
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    flex: 1,
    width: wp("100%"),
    paddingHorizontal: wp("3%"),
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
  },
  storageView: {
    height: hp("20%"),
    width: "100%",
    backgroundColor: colors.lightColor1,
    marginTop: hp("1.5%"),
    borderRadius: hp("3%"),
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  storageViewLeft: {
    height: "100%",
    width: "50%",
    alignItems: "center",
    justifyContent: "center",
  },
  storageSepView: {
    backgroundColor: colors.textColor2,
    height: "80%",
    width: "0.2%",
    opacity: 0.15,
    borderRadius: hp("50%"),
  },
  storageViewRight: {
    height: "100%",
    flex: 1,
    alignItems: "center",
    flexDirection: "column",
  },
  storageDetailsContainer: {
    marginTop: "10%",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  storageTitle: {
    fontSize: hp("2.3%"),
    color: colors.textColor3,
    opacity: 0.9,
    fontFamily: "Afacad-Medium",
  },
  storageValue: {
    fontSize: hp("1.8%"),
    color: colors.textColor2,
    fontFamily: "Afacad-Medium",
  },
  premiumContainer: {
    marginTop: "33%",
    marginLeft: "15%",
    height: "15%",
    paddingHorizontal: hp("2%"),
    backgroundColor: "rgba(197, 169, 55, 0.2)",
    borderRadius: hp("0.6%"),
    alignItems: "center",
    justifyContent: "center",
  },
  premiumText: {
    fontSize: hp("1.75%"),
    color: "rgba(158, 136, 46, 1)",
    fontFamily: "Afacad-MediumItalic",
  },
  cloudIcon: {
    height: "60%",
    width: "15%",
    resizeMode: "contain",
    tintColor: colors.textColor3,
    opacity: 0.5,
    position: "absolute",
    right: "5%",
    bottom: "62%",
    display: "none",
  },
  utitlityContainer: {
    width: "100%",
    alignItems: "center",
    flexDirection: "column",
    marginTop: hp("2%"),
    gap: hp("1.5%"),
    justifyContent: "space-between",
  },
  firstRowIcons: {
    width: "100%",
    height: hp("7.5%"),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  utilIcons: {
    height: "50%",
    width: "50%",
    resizeMode: "contain",
  },
  iconContainer: {
    height: "100%",
    aspectRatio: 1,
    backgroundColor: colors.darkColor,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: hp("1.5%"),
  },
  secondRowIcons: {
    width: "100%",
    height: hp("7.5%"),
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  optionsIcons: {
    height: "100%",
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionsIconContainer: {
    height: "100%",
    aspectRatio: 1,
    backgroundColor: colors.lightColor1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: hp("1.5%"),
  },
  optionIcon: {
    height: "50%",
    width: "50%",
    resizeMode: "contain",
  },
  addContainer: {
    height: "100%",
    width: "38%",
    backgroundColor: "#5F2ABD",
    borderRadius: hp("1.5%"),
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  addIcon: {
    height: "50%",
    width: "20%",
    resizeMode: "contain",
  },
  seperator: {
    height: "50%",
    width: "1%",
    opacity: 0.6,
    backgroundColor: colors.textColor3,
  },
  addText: {
    fontSize: hp("2.5%"),
    fontFamily: "Afacad-SemiBold",
    color: colors.textColor3,
  },
  recentContainer: {
    flex: 1,
    width: "100%",
    marginTop: hp("1.5%"),
    flexDirection: "column",
    justifyContent: "space-between",
    gap: "2%",
  },
  recentTop: {
    height: "12%",
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  recentText: {
    fontSize: hp("3%"),
    fontFamily: "Afacad-SemiBold",
    color: colors.textColor3,
  },
  seeAllText: {
    fontSize: hp("2.2%"),
    fontFamily: "Afacad-Regular",
    color: colors.textColor2,
  },
  recentBottom: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginTop: hp("0.5%"),
  },
  nothingText: {
    fontSize: hp("2.1%"),
    fontFamily: "Afacad-Italic",
    opacity: 0.8,
    color: colors.textColor2,
  },
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: hp("9%"),
    width: "100%",
    gap: wp("4%"),
  },
  recentFileImageContainer: {
    height: "80%",
    aspectRatio: 1,
    borderRadius: hp("1.5%"),
    alignItems: "center",
    justifyContent: "center",
  },
  customThumbnailContainer: {
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
    borderRadius: hp("1.5%"),
  },
  pdfImage: {
    width: "65%",
    height: "65%",
    tintColor: "#D3D3D3",
    opacity: 0.8,
  },
  audioImage: {
    tintColor: "#D3D3D3",
    opacity: 0.8,
    height: "60%",
    width: "60%",
  },
  videoFileWithPlayContainer: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  playIcon: {
    position: "absolute",
    width: "90%",
    height: "90%",
    tintColor: colors.textColor3,
    zIndex: 10,
  },
  documentImage: {
    tintColor: "#D3D3D3",
    opacity: 0.8,
    height: "45%",
    width: "45%",
  },
  fileDetailsContainer: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  aboutFile: {
    height: "100%",
    width: "80%",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "10%",
  },
  recentFileName: {
    fontSize: hp("2%"),
    fontFamily: "Afacad-Regular",
    color: colors.textColor3,
    width: "100%",
  },
  fileDetails: {
    height: "30%",
    width: "100%",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  recentFileSize: {
    fontSize: hp("1.7%"),
    fontFamily: "Afacad-Regular",
    color: colors.textColor2,
  },
  modifiedTime: {
    fontSize: hp("1.7%"),
    fontFamily: "Afacad-Regular",
    color: colors.textColor2,
  },
  moreIconContainer: {
    height: "40%",
    width: "10%",
  },
  moreIcon: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  sheetContainer: {
    flex: 1,
    padding: hp("2%"),
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerText: {
    fontSize: hp("2.7%"),
    color: colors.textColor3,
    opacity: 0.9,
    fontFamily: "Afacad-SemiBold",
  },
  bottomSepView: {
    height: "0.5%",
    opacity: 0.1,
    width: "100%",
    backgroundColor: colors.textColor2,
    marginTop: "3%",
  },
  optionsContainer: {
    marginTop: "5%",
    flexDirection: "row",
    flexWrap: "wrap",
    flex: 1,
    justifyContent: "space-between",
  },
  optionButton: {
    width: "48%",
    height: "40%",
    alignItems: "center",
    backgroundColor: "rgba(26, 30, 34, 0.5)",
    borderRadius: hp("1%"),
    marginBottom: hp("1.5%"),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    gap: "8%",
    justifyContent: "center",
    flexDirection: "row",
  },
  bottomIcon: {
    width: "20%",
    height: "35%",
    resizeMode: "contain",
    tintColor: colors.textColor3,
    opacity: 0.8,
  },
  optionText: {
    fontSize: hp("2.2%"),
    color: colors.textColor2,
    fontFamily: "Afacad-Medium",
  },
});
