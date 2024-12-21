import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Image,
  StyleSheet,
} from "react-native";
import React, { useRef, useEffect } from "react";
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

export default function VideosScreen() {
  const fetchOnceRef = useRef(false);
  const dispatch = useDispatch();

  const { images, loading, error } = useSelector(
    (state) => ({
      images: state.files.audios,
      loading: state.loading,
      error: state.error,
    }),
    shallowEqual
  );

  useEffect(() => {
    if (fetchOnceRef.current) return;
    fetchOnceRef.current = true;
    const fetchData = async () => {
      await fetchFilesByCategory("user123", "audios", dispatch);
    };

    fetchData();
  }, [dispatch]);

  const renderItem = ({ item }) => (
    <View style={styles.fileContainer}>
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
    </View>
  );

  return (
    <SafeAreaView edges={["right", "left", "top"]} style={styles.container}>
      <View style={styles.innerContainer}>
        <View style={styles.top}>
          <Text style={styles.screenTitle}>Audios</Text>
        </View>
        <View style={styles.center}>
          <FlatList
            data={images}
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
            ListFooterComponent={
              loading ? <ActivityIndicator size="large" /> : null
            }
          />
        </View>
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
  fileDetails: {
    alignItems: "center",
    width: "100%",
    height: "20%",
    justifyContent: "space-between",
    paddingHorizontal: "6%",
    flexDirection: "row",
  },
  fileName: {
    fontSize: hp("1.55%"),
    color: colors.textColor3,
    fontFamily: "Afacad-Regular",
    opacity: 0.9,
    width: "60%",
  },
  fileSize: {
    fontSize: hp("1.4%"),
    color: "rgba(255,255,255,0.7)",
    fontFamily: "Afacad-Regular",
  },
});
