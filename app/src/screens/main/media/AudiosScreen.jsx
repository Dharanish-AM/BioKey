import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Image,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import React, { useRef, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchFilesByCategory } from "../../../services/fileOperations";
import { shallowEqual } from "react-redux";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

import colors from "../../../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { formatFileSize } from "../../../utils/formatFileSize";
import PlusIcon from "../../../assets/images/plus.png";
import SpinnerOverlay from "../../../components/SpinnerOverlay";
import AudioFileIcon from "../../../assets/images/audiofile_icon.png";
import SkeletonLoader from "../../../components/SkeletonLoader";
import { setFirstRender } from "../../../redux/actions";

export default function AudiosScreen() {
  const dispatch = useDispatch();

  const { audios, loading, error } = useSelector(
    (state) => ({
      audios: state.files.audios,
      loading: state.loading,
      error: state.error,
    }),
    shallowEqual
  );

  const isFirstRender = useSelector(
    (state) => state.appConfig.isFirstRender.audiosScreen
  );

  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setIsInitialLoading] = useState(false);

  const fetchData = async () => {
    setIsInitialLoading(true);
    await fetchFilesByCategory("user123", "audios", dispatch);
    setIsInitialLoading(false);
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchFilesByCategory("user123", "audios", dispatch);
    setRefreshing(false);
  };

  useEffect(() => {
    if (!isFirstRender) return;
    fetchData();
    dispatch(setFirstRender("audiosScreen"));
  }, [isFirstRender, dispatch]);

  // useEffect(() => {
  //   console.log("Audios updated:", audios.length);
  // }, [audios]);

  const renderItem = ({ item }) => (
    <View style={styles.fileContainer}>
      <View style={styles.fileThumbnailContainer}>
        {item.thumbnail ? (
          <Image
            source={{ uri: item.thumbnail }}
            style={styles.fileThumbnail}
          />
        ) : (
          <Image source={AudioFileIcon} style={styles.fallbackThumbnail} />
        )}
      </View>
      <View style={styles.fileDetails}>
        <Text style={styles.fileName} ellipsizeMode="tail" numberOfLines={1}>
          {item.fileName}
        </Text>
        <Text style={styles.fileSize}>{formatFileSize(item.size)}</Text>
      </View>
    </View>
  );

  const renderSkeletonItem = () => (
    <View style={styles.shimmerFileContainer}>
      <View style={{}}>
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
        {/* <SpinnerOverlay visible={initialLoading} /> */}
        <View style={styles.top}>
          <Text style={styles.screenTitle}>Audios</Text>
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
              data={audios}
              renderItem={renderItem}
              keyExtractor={(item, index) => `${item.fileName}-${index}`}
              numColumns={2}
              contentContainerStyle={{
                flexGrow: 1,
                justifyContent: audios.length === 0 ? "center" : "flex-start",
                paddingHorizontal: wp("3%"),
              }}
              columnWrapperStyle={{
                justifyContent: "space-between",
                marginBottom: hp("2%"),
              }}
              // ListFooterComponent={
              //   loading ? <ActivityIndicator size="large" /> : null
              // }
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
    paddingHorizontal: wp("3%"),
  },
  screenTitle: {
    fontSize: hp("4%"),
    fontFamily: "Afacad-SemiBold",
    color: colors.textColor3,
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
  fallbackThumbnail: {
    height: "50%",
    width: "50%",
    tintColor: colors.textColor3,
    opacity: 0.9,
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
    right: wp("5%"),
    bottom: hp("5%"),
  },
});
