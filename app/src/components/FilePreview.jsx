import { View, Text, ActivityIndicator, StyleSheet, Image } from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";
import { setTabBarVisible } from "../redux/actions";
import colors from "../constants/colors";
import { useFocusEffect } from "@react-navigation/native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { previewFile } from "../services/fileOperations";
import SpinnerOverlay from "./SpinnerOverlay";

export default function FilePreviewScreen({ route }) {
  const { fileName, category, folder } = route.params;
  const [fileData, setFileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useFocusEffect(
    React.useCallback(() => {
      dispatch(setTabBarVisible(false));

      return () => {
        dispatch(setTabBarVisible(true));
      };
    }, [dispatch])
  );

  useEffect(() => {
    const fetchFilePreview = async () => {
      if (fileName && category) {
        const data = await previewFile(fileName, category, folder);
        setFileData(data);
      }
      setLoading(false);
    };

    fetchFilePreview();
  }, [fileName, category, folder]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <SpinnerOverlay visible={loading} />
        <View style={styles.top}></View>
        <View style={styles.center}>
          {fileData ? (
            <Image
              source={{ uri: `data:image/jpeg;base64,${fileData.base64Data}` }}
              style={styles.image}
            />
          ) : (
            <Text>No Preview Available</Text>
          )}
        </View>
        <View style={styles.bottom}></View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondaryColor2,
    alignItems: "center",
    justifyContent: "center",
  },
  innerContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
  },
  top: {
    height: hp("12%"),
    width: wp("100%"),
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp("3%"),
  },
  center: {
    flex: 1,
    width: wp("100%"),
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  bottom: {
    height: hp("12%"),
    width: wp("100%"),
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp("3%"),
  },
});
