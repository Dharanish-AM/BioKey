import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Image,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Pressable,
  Animated,
  TextInput,
} from "react-native";
import React, { useRef, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchFilesByCategory } from "../../../services/fileOperations";
import { shallowEqual } from "react-redux";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { setFirstRender } from "../../../redux/actions";
import { Easing } from "react-native-reanimated";

import colors from "../../../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { formatFileSize } from "../../../utils/formatFileSize";
import PlusIcon from "../../../assets/images/plus.png";
import SpinnerOverlay from "../../../components/SpinnerOverlay";
import SkeletonLoader from "../../../components/SkeletonLoader";
import SearchIcon from "../../../assets/images/new_search_icon.png";
import FilterIcon from "../../../assets/images/filter_icon.png";
import BackIcon from "../../../assets/images/back_icon.png";

export default function PhotosScreen({ navigation }) {
  const dispatch = useDispatch();
  const { images, loading, error } = useSelector(
    (state) => ({
      images: state.files.images,
      loading: state.loading,
      error: state.error,
    }),
    shallowEqual
  );

  const isFirstRender = useSelector(
    (state) => state.appConfig.isFirstRender.imagesScreen
  );

  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setIsInitialLoading] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredImages, setFilteredImages] = useState(images);
  const [width] = useState(new Animated.Value(0));
  const [opacity] = useState(new Animated.Value(0));
  const [iconsOpacity] = useState(new Animated.Value(1));

  const fetchData = async () => {
    setIsInitialLoading(true);
    await fetchFilesByCategory("user123", "images", dispatch);
    setIsInitialLoading(false);
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchFilesByCategory("user123", "images", dispatch);
    setRefreshing(false);
  };

  useEffect(() => {
    if (!isFirstRender) return;
    fetchData();
    dispatch(setFirstRender("imagesScreen"));
  }, [isFirstRender, dispatch]);

  const handlePress = async (fileName) => {
    await navigation.navigate("FilePreviewScreen", {
      fileName,
      category: "images",
      folder: null,
    });
  };

  const handleSearchIconClick = () => {
    setIsSearchActive(true);
    Animated.parallel([
      Animated.timing(width, {
        toValue: hp("25%"),
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
    const filteredData = images.filter((image) =>
      image.fileName.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredImages(filteredData);
  };

  const handleSubmitEditing = () => {
    handleCancelSearch();
  };

  const renderItem = ({ item }) => (
    <Pressable
      style={styles.fileContainer}
      onPress={() => handlePress(item.fileName)}
    >
      {item.thumbnail ? (
        <View style={styles.fileThumbnailContainer}>
          <Image
            source={{ uri: item.thumbnail }}
            style={styles.fileThumbnail}
          />
        </View>
      ) : (
        <Text>No Thumbnail Available</Text>
      )}
      <View style={styles.fileDetails}>
        <Text style={styles.fileName} ellipsizeMode="tail" numberOfLines={1}>
          {item.fileName}
        </Text>
        <Text style={styles.fileSize}>{formatFileSize(item.size)}</Text>
      </View>
    </Pressable>
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
      <View style={styles.innerContainer}>
        <View style={styles.top}>
          <View style={styles.topContainer}>
            <View style={styles.titleContainer}>
              <TouchableOpacity
                style={styles.backIconContainer}
                onPress={() => navigation.goBack()}
              >
                <Image source={BackIcon} style={styles.backIcon} />
              </TouchableOpacity>
              <Text style={styles.screenTitle}>Photos</Text>
            </View>
            <View style={styles.filterContainer}>
              <Animated.View
                style={[styles.filterContainer, { opacity: iconsOpacity }]}
              >
                {!isSearchActive && (
                  <TouchableOpacity style={styles.filterIconContainer}>
                    <Image source={FilterIcon} style={styles.searchIcon} />
                  </TouchableOpacity>
                )}

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
        </View>

        <View style={styles.center}>
          {initialLoading ? (
            <FlatList
              data={[1, 2, 3, 4, 5, 6]}
              renderItem={renderSkeletonItem}
              keyExtractor={(item, index) => `skeleton-${index}`}
              numColumns={2}
              contentContainerStyle={{
                flexGrow: 1,
                justifyContent: "center",
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
              data={filteredImages}
              renderItem={renderItem}
              keyExtractor={(item, index) => `${item.fileName}-${index}`}
              numColumns={2}
              contentContainerStyle={{
                flexGrow: 1,
                justifyContent: images.length === 0 ? "center" : "flex-start",
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
        <TouchableOpacity style={styles.addButton}>
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
    height: hp("10%"),
    width: wp("100%"),
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp("1%"),
    justifyContent: "space-between",
  },
  topContainer: {
    height: "60%",
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
  },
  titleContainer: {
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: wp("1%"),
  },
  backIconContainer: {
    height: "70%",
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    flex: 1,
    aspectRatio: 1,
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
    alignItems: "center",
    gap: wp("5%"),
    flex: 1,
    marginRight: wp("1%"),
    height: "100%",
  },
  searchIconContainer: {
    height: "65%",
    alignItems: "center",
    justifyContent: "center",
  },
  searchIcon: {
    flex: 1,
    aspectRatio: 1,
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
    height: "85%",
  },
  textInput: {
    height: "100%",
    fontSize: hp("1.7%"),
    flex: 1,
    fontFamily: "Montserrat-Medium",
    color: colors.textColor3,
  },
  filterIconContainer: {
    height: "85%",
    alignItems: "center",
  },
  filterIcon: {
    flex: 1,
    aspectRatio: 1,
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
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 0.6,
    backgroundColor: "rgba(25, 29, 36, 0.5)",
    borderColor: "rgba(229,231,235,0.1)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
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
    fontSize: hp("1.3%"),
    color: colors.textColor3,
    fontFamily: "Montserrat-Regular",
    opacity: 0.9,
    width: "60%",
  },
  fileSize: {
    fontSize: hp("1.3%"),
    color: "rgba(255,255,255,0.7)",
    fontFamily: "Montserrat-Regular",
  },
  addButton: {
    position: "absolute",
    right: wp("7%"),
    bottom: hp("3%"),
    width: hp("7.5%"),
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
