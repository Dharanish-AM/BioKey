import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Image,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Animated,
  Alert,
  TextInput,
} from "react-native";
import React, { useRef, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchFilesByCategory,
  fetchRecentFiles,
} from "../../../services/fileOperations";
import { shallowEqual } from "react-redux";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { setFirstRender } from "../../../redux/actions";
import { Easing } from "react-native-reanimated";
import { pickMedia } from "../../../utils/mediaPicker";
import { uploadMedia } from "../../../services/fileOperations";

import colors from "../../../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { formatFileSize } from "../../../utils/formatFileSize";
import PlusIcon from "../../../assets/images/plus.png";
import SkeletonLoader from "../../../components/SkeletonLoader";
import SearchIcon from "../../../assets/images/new_search_icon.png";
import FilterIcon from "../../../assets/images/filter_icon.png";
import BackIcon from "../../../assets/images/back_icon.png";
import SpinnerOverlay2 from "../../../components/SpinnerOverlay2";
import DocsFileIcon from "../../../assets/images/document_icon.png";
import PdfIcon from "../../../assets/images/pdf_icon.png";

export default function OthersScreen({ navigation }) {
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setIsInitialLoading] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredothers, setFilteredothers] = useState(others);
  const [width] = useState(new Animated.Value(0));
  const [opacity] = useState(new Animated.Value(0));
  const [iconsOpacity] = useState(new Animated.Value(1));
  const [isUploading, setIsUploading] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);

  const userId = useSelector((state) => state.user.userId);

  const { others } = useSelector(
    (state) => ({
      others: state.files.others,
    }),
    shallowEqual
  );
  const isFirstRender = useSelector(
    (state) => state.appConfig.isFirstRender.othersScreen
  );

  const fetchData = async () => {
    setIsInitialLoading(true);
    await fetchFilesByCategory(userId, "others", dispatch);
    setIsInitialLoading(false);
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchFilesByCategory(userId, "others", dispatch);
    fetchRecentFiles(userId, dispatch);
    setRefreshing(false);
  };

  useEffect(() => {
    if (!isFirstRender) return;
    fetchData();

    dispatch(setFirstRender("othersScreen"));
  }, [isFirstRender, dispatch]);

  useEffect(() => {
    if (searchTerm) {
      const filteredData = others.filter((other) =>
        other.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredothers(filteredData);
    } else {
      setFilteredothers(others);
    }
  }, [others, searchTerm]);



  const handlePress = async (file) => {
    await navigation.navigate("FilePreviewScreen", {
      file
    });
  };

  const handleSearchIconClick = () => {
    setIsSearchActive(true);
    Animated.parallel([
      Animated.timing(width, {
        toValue: hp("21%"),
        duration: 400,
        useNativeDriver: false,
        easing: Easing.inOut(Easing.ease),
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: false,
        easing: Easing.inOut(Easing.ease),
      }),
      Animated.timing(iconsOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: false,
        easing: Easing.inOut(Easing.ease),
      }),
    ]).start();
  };

  const handleCancelSearch = () => {
    Animated.parallel([
      Animated.timing(width, {
        toValue: 0,
        duration: 400,
        useNativeDriver: false,
        easing: Easing.inOut(Easing.ease),
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: false,
        easing: Easing.inOut(Easing.ease),
      }),
      Animated.timing(iconsOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: false,
        easing: Easing.inOut(Easing.ease),
      }),
    ]).start(() => setIsSearchActive(false));
  };

  const handleSearchChange = (text) => {
    setSearchTerm(text);
    const filteredData = others.filter((other) =>
      other.name.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredothers(filteredData);
  };

  const handleSubmitEditing = () => {
    handleCancelSearch();
  };

  const handleothersPick = async () => {
    if (isUploading || isSelecting) return;
    setIsSelecting(true);

    try {
      const result = await pickMedia("others");

      setIsSelecting(false);

      if (!result) {
        console.log("No files selected or invalid data");
        Alert.alert(
          "No Selection",
          "Please select valid media files to upload.",
          [{ text: "OK" }]
        );
        setIsUploading(false);
        return;
      }

      if (result === "cancelled") {
        setIsUploading(false);
        return;
      }

      if (Array.isArray(result) && result.length > 0) {
        const files = result;
        console.log("Files selected:", files);

        const category = "others";

        Alert.alert(
          "Confirm Upload",
          `You have selected ${files.length} ${category}(s). Do you want to upload them?`,
          [
            {
              text: "Cancel",
              onPress: () => {
                console.log("Upload cancelled");
                setIsUploading(false);
              },
            },
            {
              text: "OK",
              onPress: async () => {
                setIsUploading(true);


                const uploadResponse = await uploadMedia(userId, files, dispatch);

                if (uploadResponse.success) {
                  console.log(
                    `${category.charAt(0).toUpperCase() + category.slice(1)
                    } uploaded successfully`
                  );
                  Alert.alert(
                    "Upload Success",
                    `${files.length} ${category}(s) uploaded successfully!`,
                    [{ text: "OK" }]
                  );
                } else {
                  console.error(
                    `${category.charAt(0).toUpperCase() + category.slice(1)
                    } upload failed:`,
                    uploadResponse.message
                  );
                  Alert.alert("Upload Failed", uploadResponse.message, [
                    { text: "OK" },
                  ]);
                }

                setIsUploading(false);
                refreshData();
                console.log("Upload finished...");
              },
            },
          ]
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
      setIsSelecting(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.fileContainer}
      onPress={() => {
        handlePress(item);
      }}
    >
      <View
        style={[
          styles.fileThumbnailContainer,
          !item.thumbnail && styles.fallbackThumbnailContainer,
        ]}
      >
        <Image
          source={
            item.thumbnail
              ? { uri: item.thumbnail }
              : item.name.includes("pdf")
                ? PdfIcon
                : DocsFileIcon
          }
          style={[styles.fileThumbnail, !item.thumbnail && styles.fallbackIcon]}
        />
      </View>
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
      <View>
        <SkeletonLoader boxHeight={hp("18%")} boxWidth={wp("45%")} />
      </View>
      <View style={{ marginTop: hp("1%") }}>
        <SkeletonLoader
          boxHeight={hp("2%")}
          boxWidth={wp("45%")}
          borderRadius={hp("1.5%")}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView edges={["right", "left", "top"]} style={styles.container}>
      <SpinnerOverlay2 visible={isUploading} />
      {isSelecting && (
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
            style={styles.backIconContainer}
            onPress={() => navigation.goBack()}
          >
            <Image source={BackIcon} style={styles.backIcon} />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>Others</Text>

          <View style={styles.filterContainer}>
            <Animated.View
              style={[styles.filterContainer, { opacity: iconsOpacity }]}
            >
              {/* {!isSearchActive && (
                <TouchableOpacity style={styles.filterIconContainer}>
                  <Image source={FilterIcon} style={styles.filterIcon} />
                </TouchableOpacity>
              )} */}

              {!isSearchActive && (
                <TouchableOpacity
                  style={styles.searchIconContainer}
                  onPress={handleSearchIconClick}
                >
                  <Image source={SearchIcon} style={styles.searchIcon} />
                </TouchableOpacity>
              )}
            </Animated.View>

            {isSearchActive && (
              <Animated.View
                style={[styles.inputContainer, { width, opacity }]}
              >
                <TextInput
                  style={styles.textInput}
                  placeholder="Search..."
                  value={searchTerm}
                  onChangeText={handleSearchChange}
                  autoFocus={true}
                  onSubmitEditing={handleSubmitEditing}
                  returnKeyType="done"
                />
              </Animated.View>
            )}
          </View>
        </View>

        <View style={styles.center}>
          {initialLoading ? (
            <FlatList
              data={[1, 2, 3, 4, 5, 6, 7, 8]}
              renderItem={renderSkeletonItem}
              keyExtractor={(item, index) => `skeleton-${index}`}
              numColumns={2}
              contentContainerStyle={{
                flexGrow: 1,

                paddingHorizontal: wp("3%"),
              }}
              columnWrapperStyle={{
                justifyContent: "space-between",
                marginBottom: hp("2%"),
              }}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={refreshData}
                  tintColor={colors.textColor3}
                />
              }
            />
          ) : (
            <FlatList
              data={filteredothers}
              renderItem={renderItem}
              keyExtractor={(item, index) => `${item.fileName}-${index}`}
              numColumns={2}
              contentContainerStyle={{
                flexGrow: 1,
                paddingHorizontal: wp("3%"),
              }}
              columnWrapperStyle={{
                justifyContent: "space-between",
                marginBottom: hp("2%"),
              }}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={refreshData}
                  tintColor={colors.textColor3}
                />
              }
            />
          )}
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            handleothersPick();
          }}
        >
          <Image source={PlusIcon} style={styles.plusIcon} />
        </TouchableOpacity>
      </View>
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
    width: wp("100%"),
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp("1.5%"),
    justifyContent: "space-between",
    marginBottom: hp("2%"),
  },
  backIconContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: wp("8%"),
    justifyContent: "center",
    marginRight: wp("1%")
  },
  backIcon: {
    width: wp("5%"),
    height: hp("5%"),
    resizeMode: "contain",
  },
  screenTitle: {
    fontSize: hp("4%"),
    fontFamily: "Afacad-SemiBold",
    color: colors.textColor3,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: wp("4%"),
    flex: 1,
    alignItems: "center",
  },
  searchIconContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: hp("3.2%"),
    aspectRatio: 1,
    marginRight: wp("2%")
  },
  searchIcon: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
    tintColor: colors.textColor3,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.secondaryColor2,
    borderRadius: hp("2%"),
    paddingHorizontal: hp("2%"),
    overflow: "hidden",
    height: hp("6%"),
  },
  textInput: {
    height: "100%",
    fontSize: hp("1.7%"),
    flex: 1,
    fontFamily: "Montserrat-Medium",
    color: colors.textColor3,
  },
  filterIconContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: hp("3.2%"),
    aspectRatio: 1,
  },
  filterIcon: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
    tintColor: colors.textColor3,
  },
  center: {
    flex: 1,
    width: wp("100%"),
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
  fallbackThumbnailContainer: {
    width: "100%",
    height: "80%",
    alignItems: "center",
    justifyContent: "center",
  },
  fallbackIcon: {
    width: "60%",
    height: "60%",
    resizeMode: "contain",
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
  },
  fileDetails: {
    alignItems: "center",
    width: "100%",
    height: "20%",
    justifyContent: "space-between",
    paddingHorizontal: "6%",
    flexDirection: "row",
  },
  fileName: {
    fontSize: hp("1.5%"),
    color: colors.textColor3,
    fontFamily: "Afacad-Regular",
    opacity: 0.9,
    width: "65%",
  },
  fileSize: {
    fontSize: hp("1.5%"),
    color: "rgba(255,255,255,0.7)",
    fontFamily: "Afacad-Regular",
  },
  addButton: {
    position: "absolute",
    right: wp("7%"),
    bottom: hp("3%"),
    width: hp("8%"),
    aspectRatio: 1,
    backgroundColor: "rgba(101, 48, 194, 0.95)",
    borderRadius: hp("100%"),
    alignItems: "center",
    justifyContent: "center",
  },
  plusIcon: {
    width: "50%",
    height: "50%",
    opacity: 0.9,
  },
});
