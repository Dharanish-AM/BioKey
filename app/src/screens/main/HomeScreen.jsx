import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Keyboard,
} from "react-native"
import React, { useEffect, useState, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import colors from "../../constants/colors";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import SpinnerOverlay from "../../components/SpinnerOverlay";
import RBSheet from "react-native-raw-bottom-sheet";
import { useDispatch, useSelector } from "react-redux";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import EvilIcons from '@expo/vector-icons/EvilIcons';

import {
  fetchFilesByCategory,
  fetchRecentFiles,
  fetchRecycleBinFiles,
  fetchUsedSpace,
  getAllfileMetadata,
  uploadMedia,
} from "../../services/fileOperations";
import { pickMedia } from "../../utils/mediaPicker";
import { shallowEqual } from "react-redux";

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
import BottomDocs from "../../assets/images/document_bottom.png";
import { formatFileSize } from "../../utils/formatFileSize";
import { setFirstRender } from "../../redux/actions";
import { fetchFolderList, loadUser } from "../../services/userOperations";
import Toast from "react-native-toast-message";
import { BlurView } from "expo-blur";
import { Pressable, TouchableWithoutFeedback } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";

export default function HomeScreen({ navigation }) {
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [allFilesSearchQuery, setAllFilesSearchQuery] = useState('')
  const [filteredAllFilesMetadata, setFilteredAllFilesMetadata] = useState(allFilesMetadata)
  const refRBSheet = useRef();
  const dispatch = useDispatch();


  const { userId } = useSelector(
    (state) => state.user,
    shallowEqual)

  const recentFilesFromRedux = useSelector(
    (state) => state.files.recents,
    shallowEqual
  );


  const isFirstRender = useSelector(
    (state) => state.appConfig.isFirstRender.homeScreen
  );

  const user = useSelector((state) => state.user);

  const allFilesMetadata = useSelector((state) => state.files.allFilesMetadata)

  const { usedSpaceBytes, totalSpaceBytes } = useSelector((state) => state.files.usedSpace)

  useEffect(() => {
    if (!isFirstRender || !userId) return;

    setIsLoading(true);
    dispatch(setFirstRender("homeScreen"));

    const fetchData = async () => {
      try {
        await Promise.all([
          fetchUsedSpace(userId, dispatch),
          fetchRecentFiles(userId, dispatch),
          getAllfileMetadata(userId, dispatch),
          fetchFolderList(userId, dispatch),
          fetchRecycleBinFiles(userId, dispatch),
        ]);
      } catch (error) {
        console.error("Error in useEffect:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [dispatch, userId]);

  useEffect(() => {
    if (!allFilesSearchQuery.trim()) {
      setFilteredAllFilesMetadata(allFilesMetadata);
      return;
    }

    const filteredFiles = allFilesMetadata.filter((file) =>
      file.name.toLowerCase().includes(allFilesSearchQuery.toLowerCase())
    );

    setFilteredAllFilesMetadata(filteredFiles);
  }, [allFilesSearchQuery, allFilesMetadata]);

  const showAlert = (title, message, onConfirm) => {
    Alert.alert(title, message, [
      { text: "Cancel", onPress: () => console.log("Action cancelled") },
      { text: "OK", onPress: onConfirm },
    ]);
  };

  const uploadFiles = async (files) => {
    const fileData = files.map((file) => ({
      uri: file.uri,
      fileName: file.fileName || file.name,
    }));

    try {
      const uploadResponse = await uploadMedia(userId, fileData, dispatch);
      if (uploadResponse.success) {
        Toast.show({
          type: 'success',
          text1: `File uploaded successfully!`,
          text2: `Total files: ${files.length}.`,
        });
        console.log(`${files.length} file(s) uploaded successfully.`);
        return files.length;
      } else {
        Toast.show({
          type: 'error',
          text1: "Upload Failed",
          text2: uploadResponse.message || "Unknown error occurred.",
        });
        console.error("Upload failed:", uploadResponse.message);
        return 0;
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      Toast.show({
        type: 'error',
        text1: "Upload Failed",
        text2: error.message || "An error occurred during upload.",
      });
      return 0;
    }
  };



  const handleImageVideoPick = async () => {
    if (isUploading) return;
    setIsUploading(true);

    try {
      const result = await pickMedia("images_videos");

      if (result === "cancelled") {
        setIsUploading(false);
        return;
      }

      if (result?.assets?.length > 0) {
        const files = result.assets;
        showAlert(
          "Confirm Upload",
          `You have selected ${files.length} file(s). Do you want to upload them?`,
          async () => {
            const successCount = await uploadFiles(files);

            if (successCount > 0) {
              fetchFilesByCategory(userId, "images", dispatch);
              fetchFilesByCategory(userId, "videos", dispatch);
            }

            refRBSheet.current.close();
            onRefresh();
          }
        );
      } else {
        console.log("No files selected or invalid data");
        Alert.alert(
          "No Selection",
          "Please select valid media files to upload.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error(
        "An error occurred during the media picking or upload process:",
        error
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleOthersPick = async () => {
    if (isUploading) return;
    setIsUploading(true);

    try {
      const result = await pickMedia("others");
      console.log("Picked Media Result:", result);

      if (Array.isArray(result) && result.length > 0) {
        const files = result;

        showAlert(
          "Confirm Upload",
          `You have selected ${files.length} file(s). Do you want to upload them?`,
          async () => {
            const successCount = await uploadFiles(files);

            if (successCount > 0) {
              fetchFilesByCategory(userId, "others", dispatch);
            }

            refRBSheet.current.close();
            onRefresh();
          }
        );
      } else {
        console.log("No files selected or invalid data");
      }
    } catch (error) {
      console.error(
        "An error occurred during the media picking or upload process:",
        error
      );
    } finally {
      setIsUploading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRecentFiles(userId, dispatch);
    await fetchUsedSpace(userId, dispatch);
    await getAllfileMetadata(userId, dispatch)
    setRefreshing(false);
  };


  const renderItem = ({ item }) => {
    const renderThumbnail = () => {
      if (item?.thumbnail) {
        if (item.type === "images") {
          return (
            <View style={styles.customThumbnailContainer}>
              <Image source={{ uri: item.thumbnail }} style={styles.fileImage} />
            </View>
          );
        }

        if (item.type === "videos") {
          return (
            <View style={styles.videoFileWithPlayContainer}>
              <Image
                source={{ uri: item.thumbnail }}
                style={styles.videoThumbnail}
              />
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
        if (item.thumbnail) {
          return (
            <View style={styles.customThumbnailContainer}>
              <Image source={{ uri: item.thumbnail }} style={styles.fileImage} />
            </View>
          );
        } else {
          return (
            <View style={styles.customThumbnailContainer}>
              <Image source={AudioFileIcon} style={styles.fallBackAudioImage} />
            </View>
          );
        }
      }

      return (
        <View style={styles.customThumbnailContainer}>
          <Image source={DocsFileIcon} style={styles.documentImage} />
        </View>
      );
    };

    return (
      <TouchableOpacity
        style={styles.recentItem}
        key={item.id || item.name}
        onPress={() => {
          navigation.navigate("FilePreviewScreen", {
            file: item,
          });
        }}
      >
        <View style={styles.recentFileImageContainer}>
          {renderThumbnail()}
        </View>
        <View style={styles.fileDetailsContainer}>
          <View style={styles.aboutFile}>
            <Text style={styles.recentFileName} numberOfLines={1} ellipsizeMode="tail">
              {item.name}
            </Text>
            <View style={styles.fileDetails}>
              <Text style={styles.recentFileSize}>{formatFileSize(item.size)}</Text>
              <Text style={styles.modifiedTime}>
                {new Date(item.createdAt).toLocaleString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading && !user) {
    <SpinnerOverlay visible={isLoading} />
  }


  return (
    <SafeAreaView edges={["right", "left", "top"]} style={styles.container}>


      {isUploading && (
        <ActivityIndicator
          size="large"
          style={{
            position: "absolute",
            zIndex: 999,
            alignSelf: "center",
          }}
        />
      )}

      <View style={styles.innerContainer}>
        <View style={styles.top}>
          <TouchableOpacity
            style={styles.profileContainer}
            onPress={() => navigation.openDrawer()}
          >
            <View style={styles.profileImageContainer}>
              {user.profileImage && user.profileImage !== "" ? (
                <Image
                  source={{ uri: user.profileImage }}
                  style={styles.profileIcon}
                  resizeMode="cover"
                />
              ) : (
                <Image
                  source={ProfileIcon}
                  style={styles.profileIcon}
                  resizeMode="cover"
                />
              )}
            </View>

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
              onChangeText={setAllFilesSearchQuery}
              value={allFilesSearchQuery}
              onSubmitEditing={() => {
                setAllFilesSearchQuery("")
                Keyboard.dismiss()
              }}
            />
            {
              allFilesSearchQuery.trim() != "" && allFilesSearchQuery.length > 0 ? <Pressable style={{
                padding: hp("1%"),
              }} onPress={() => {
                setAllFilesSearchQuery("")
                Keyboard.dismiss()
              }}>
                <Ionicons name="close-outline" size={hp("2.7%")} color='rgba(166, 166, 166, 0.6)' />
              </Pressable> : null
            }

          </View>
        </View>
        <View style={styles.center}>
          <View style={styles.storageView}>
            <View style={styles.storageViewLeft}>
              <AnimatedCircularProgress
                size={hp("16%")}
                width={hp("1.2%")}
                fill={(usedSpaceBytes / totalSpaceBytes) * 100 || 0}
                prefill={0}
                duration={2000}
                tintColor="rgba(100, 25, 230, 0.8)"
                backgroundColor={"rgba(23, 27, 31, 0.7)"}
                rotation={0}
              >
                {(fill) => (
                  <View style={{ alignItems: "center" }}>
                    <Text
                      style={[
                        styles.progressValueStyle,
                        { color: colors.textColor3 },
                      ]}
                    >
                      {`${Math.round(fill)}%`}
                    </Text>
                    <Text
                      style={[styles.titleStyle, { color: colors.textColor2 }]}
                    >
                      Used
                    </Text>
                  </View>
                )}
              </AnimatedCircularProgress>
            </View>
            <View style={styles.storageSepView}></View>
            <View style={styles.storageViewRight}>
              {/* <Image source={CloudIcon} style={styles.cloudIcon} /> */}
              <View style={styles.storageDetailsContainer}>
                <Text style={styles.storageTitle}>Used Space</Text>
                <Text style={styles.storageValue}>
                  {user && user.usedSpace && user.totalSpace
                    ? `${formatFileSize(usedSpaceBytes)} / ${formatFileSize(totalSpaceBytes)}`
                    : `0 B / ${formatFileSize(totalSpaceBytes)}`}
                </Text>
              </View>
              <TouchableOpacity style={styles.premiumContainer}>
                <Text style={styles.premiumText}>Get Premium!</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.utitlityContainer}>
            <View style={styles.firstRowIcons}>
              <TouchableOpacity
                style={styles.iconContainer}
                onPress={() => {
                  navigation.navigate("PhotosScreen");
                }}
              >
                <Image
                  style={styles.utilIcons}
                  source={ImagesIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconContainer}
                onPress={() => {
                  navigation.navigate("VideosScreen");
                }}
              >
                <Image
                  style={styles.utilIcons}
                  source={VideosIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconContainer}
                onPress={() => {
                  navigation.navigate("AudiosScreen");
                }}
              >
                <Image
                  style={styles.utilIcons}
                  source={AudiosIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconContainer}
                onPress={() => {
                  navigation.navigate("OthersScreen");
                }}
              >
                <Image
                  style={styles.utilIcons}
                  source={DocsIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconContainer}
                onPress={() => {
                  navigation.navigate("PasswordsScreen");
                }}
              >
                <Image
                  style={styles.utilIcons}
                  source={PassIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
            <View style={styles.secondRowIcons}>
              <View style={styles.optionsIcons}>
                <TouchableOpacity
                  style={styles.optionsIconContainer}
                  onPress={() => {
                    navigation.navigate("FavouritesScreen");
                  }}
                >
                  <Image style={styles.optionIcon} source={HeartIcon} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.optionsIconContainer} onPress={() => {
                  navigation.navigate("RecycleBin");
                }} >
                  <Image style={styles.optionIcon} source={BinIcon} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {
                  navigation.navigate("ManageStorage")
                }} style={styles.optionsIconContainer}>
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
              {recentFilesFromRedux && recentFilesFromRedux.length > 0 ? (
                <FlatList
                  data={recentFilesFromRedux}
                  renderItem={renderItem}
                  keyExtractor={(item) => item.name}
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={onRefresh}
                    />
                  }
                  contentContainerStyle={{
                    gap: hp("0.4%"),
                    paddingHorizontal: hp("1.5%"),
                  }}
                  extraData={recentFilesFromRedux}
                  key={recentFilesFromRedux.length}
                />
              ) : (
                <FlatList
                  data={[]}
                  ListEmptyComponent={
                    <View>
                      <Text style={styles.nothingText}>
                        Nothing here, upload now!
                      </Text>
                    </View>
                  }
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={onRefresh}
                    />
                  }
                  contentContainerStyle={{
                    flexGrow: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    width: wp("100%")
                  }}
                />
              )}
            </View>
          </View>
        </View>
        <RBSheet
          ref={refRBSheet}
          height={hp("20%")}
          openDuration={400}
          draggable={true}
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
            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={styles.optionButton}
                onPress={handleImageVideoPick}
              >
                <Image source={ImagesIcon} style={[styles.bottomIcon]} />
                <Text style={styles.optionText}>Photos & Videos</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.optionButton2}
                onPress={handleOthersPick}
              >
                <Image source={BottomDocs} style={styles.bottomIcon} />
                <Text style={styles.optionText}>Others Files</Text>
              </TouchableOpacity>
            </View>
          </View>
        </RBSheet>
      </View>
      {allFilesSearchQuery.trim() !== "" && filteredAllFilesMetadata.length > 0 && (
        <View style={styles.searchResultsContainer}>
          {/* <Text style={styles.searchText}>Search results for: {allFilesSearchQuery}</Text> */}
          <FlatList
            data={filteredAllFilesMetadata}
            keyExtractor={(file) => file._id}
            renderItem={({ item }) => (
              <Pressable onPress={() => {
                Keyboard.dismiss();
                navigation.navigate("FilePreviewScreen", {
                  file: item,
                  thumbnail: item.thumbnail ? item.thumbnail : null
                })
              }} style={styles.searchItem}>
                <Text style={styles.searchFileName}>{item.name}</Text>
                <View style={{
                  flexDirection: "row",
                  gap: wp("5%")
                }}>
                  <Text style={styles.searchFileSize}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                  <Text style={styles.searchFileSize}>{formatFileSize(item.size)}</Text>
                </View>
              </Pressable>
            )}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}


    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondaryColor1,
    alignItems: "center",
    justifyContent: "center",
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
  profileImageContainer: {
    height: hp("5%"),
    width: hp("5%"),
    borderRadius: hp("5%"),
    backgroundColor: colors.secondaryColor2,
    justifyContent: "center",
    alignItems: "center",
  },
  profileIcon: {
    height: "100%",
    width: "100%",
    borderRadius: hp("5%"),
    resizeMode: "cover",
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
  },
  storageView: {
    height: hp("20%"),
    width: "100%",
    backgroundColor: colors.lightColor1,
    marginTop: hp("1%"),
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
  progressValueStyle: {
    fontWeight: "bold",
    fontSize: hp("2.4%"),
    textAlign: "center",
  },
  titleStyle: {
    fontSize: hp("2.2%"),
    textAlign: "center",
    fontFamily: "Afacad-SemiBold",
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
    justifyContent: "space-evenly"
  },
  storageDetailsContainer: {
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
    height: "15%",
    paddingHorizontal: hp("2%"),
    backgroundColor: "rgba(197, 169, 55, 0.2)",
    borderRadius: hp("0.6%"),
    alignItems: "center",
    justifyContent: "center",
  },
  premiumText: {
    fontSize: hp("1.75%"),
    color: "rgb(144, 123, 40)",
    fontFamily: "Afacad-Medium",
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
    backgroundColor: "rgba(103, 39, 212, 0.6)",
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
    alignItems: "center",
    gap: hp("0.5%"),
  },
  recentTop: {
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
    width: wp("100%"),
    alignItems: "center",
    justifyContent: "center",
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
    width: "100%",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "10%",
  },
  recentFileName: {
    fontSize: hp("1.75%"),
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
    fontSize: hp("1.65%"),
    fontFamily: "Afacad-Regular",
    color: colors.textColor2,
  },
  modifiedTime: {
    fontSize: hp("1.65%"),
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
    padding: hp("1.5%"),
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionsContainer: {
    marginTop: "3%",
    flexDirection: "row",
    flex: 1,
    gap: "7%",
  },
  optionButton: {
    width: "45%",
    height: "65%",
    alignItems: "center",
    backgroundColor: "rgba(95,42,189,0.6)",
    borderRadius: hp("2%"),

    gap: wp("5%"),
    justifyContent: "center",
    flexDirection: "row",
  },
  optionButton2: {
    width: "45%",
    height: "65%",
    alignItems: "center",
    backgroundColor: "rgba(95,42,189,0.6)",
    borderRadius: hp("2%"),

    gap: wp("2%"),
    justifyContent: "center",
    flexDirection: "row",
  },

  bottomIcon: {
    width: "20%",
    height: "35%",
    resizeMode: "contain",
    tintColor: colors.textColor3,
    opacity: 0.9,
  },
  optionText: {
    fontSize: hp("2.2%"),
    color: colors.textColor3,
    opacity: 0.9,
    fontFamily: "Afacad-Medium",
    textAlign: "center",
    width: "40%",
  },
  searchResultsContainer: {
    position: "absolute",
    zIndex: 1,
    width: wp("95%"),
    top: hp("15.5%"),
    maxHeight: hp("39%"),
    borderRadius: hp("2%"),
    padding: hp("2%"),
    alignSelf: "center",
    backgroundColor: colors.lightColor1,
    borderColor: "rgba(166, 166, 166, 0.15)",
    borderWidth: hp("0.15%")
  },

  searchText: {
    fontSize: hp("2.2%"),
    color: colors.textColor3,
    fontFamily: "Afacad-Medium",
  },

  searchItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: hp("1.5%"),
    borderBottomColor: "rgba(166, 166, 166, 0.15)",
    borderBottomWidth: hp("0.1%"),
  },

  searchFileName: {
    fontSize: hp("2%"),
    color: colors.textColor3,
    fontFamily: "Afacad-Regular",
    flex: 1,
    flexWrap: "wrap",
  },

  searchFileSize: {
    fontSize: hp("1.8%"),
    color: colors.textColor3,
    fontFamily: "Afacad-Regular",
  },


});
