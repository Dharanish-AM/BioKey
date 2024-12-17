import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  FlatList,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import colors from "../../constants/colors";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import axios from "axios";

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

export default function HomeScreen() {
  const ip = "192.168.1.3:8000";
  const [recentFiles, setRecentFiles] = useState([]);
  const [usedSpace, setUsedSpace] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchRecentFiles();
    fetchUsedSpace();
  }, []);

  const fetchRecentFiles = async () => {
    setIsLoading(true);
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
        setUsedSpace(response.data.usedSpaceInMB || 0);
      } else {
        console.error("Error fetching used space:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching used space:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRecentFiles();
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
    const thumbnailSource =
      item.category === "documents" && !item.thumbnail
        ? DocsFileIcon
        : item.category === "audio" && !item.thumbnail
        ? AudioFileIcon
        : { uri: item.thumbnail } || "https://placehold.jp/150x150.png";

    return (
      <TouchableOpacity style={styles.recentItem} key={item.id || item.name}>
        <View style={styles.recentFileImageContainer}>
          {item.category === "documents" && !item.thumbnail ? (
            <View style={styles.customThumbnailContainer}>
              <Image source={DocsFileIcon} style={styles.documentImage} />
            </View>
          ) : item.category === "audio" && !item.thumbnail ? (
            <View style={styles.customThumbnailContainer}>
              <Image source={AudioFileIcon} style={styles.audioImage} />
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
            <Text style={styles.recentFileSize}>
              {formatFileSize(item.size)}
            </Text>
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
      <View style={styles.innerContainer}>
        <View style={styles.top}>
          <TouchableOpacity style={styles.profileContainer}>
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
          <View style={styles.storageView}></View>
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
                <TouchableOpacity style={styles.addContainer}>
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
              <FlatList
                showsVerticalScrollIndicator={true}
                data={recentFiles}
                renderItem={renderItem}
                keyExtractor={(item) => item.name}
                contentContainerStyle={{
                  gap: hp("1%"),
                }}
                refreshing={refreshing}
                onRefresh={onRefresh}
              />
            </View>
          </View>
        </View>
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
    height: "30%",
    width: "100%",
    backgroundColor: colors.lightColor1,
    marginTop: "4%",
    borderRadius: hp("3%"),
    maxHeight: hp("20%"),
  },
  utitlityContainer: {
    height: "22%",
    width: "100%",
    alignItems: "center",
    flexDirection: "column",
    marginTop: "5%",
    justifyContent: "space-between",
  },
  firstRowIcons: {
    width: "100%",
    height: "46%",
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
    height: "46%",
    flexDirection: "row",
    alignItems: "center",
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
    height: "45%",
    width: "1%",
    opacity: 0.5,

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
    marginTop: "5%",
    flexDirection: "column",
    justifyContent: "space-between",
    gap: "3%",
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
    marginTop: "2%",
    width: "100%",
    alignItems: "center",
  },
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: hp("9%"),
    width: "100%",
    gap: "5%",
  },
  recentFileImageContainer: {
    height: "85%",
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
  audioImage: {
    tintColor: "#D3D3D3",
    opacity: 0.8,
    height: "60%",
    width: "60%",
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
    alignItems: "flex-start",
    justifyContent: "center",
    gap: "5%",
    width: "80%",
  },
  recentFileName: {
    fontSize: hp("2%"),
    fontFamily: "Afacad-Regular",
    color: colors.textColor3,
    width: "100%",
  },
  recentFileSize: {
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
});
