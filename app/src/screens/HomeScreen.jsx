import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useEffect, useState, useRef } from "react";
import { Animated, Easing } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import useCustomFonts from "../hooks/useLoadFonts";
import CircularProgress from "react-native-circular-progress-indicator";
import { FlatList } from "react-native-gesture-handler";

import colors from "../constants/Color";
import ProfileIcon from "../assets/images/Profile.png";
import ArrowIcon from "../assets/images/Arrow.png";
import SearchIcon from "../assets/images/Search.png";
import More from "../assets/images/More.png";

import ImagesIcon from "../assets/images/images.png";
import VideosIcon from "../assets/images/videos.png";
import AudiosIcon from "../assets/images/audios.png";
import DocumentsIcon from "../assets/images/documents.png";
import PasswordsIcon from "../assets/images/passwords.png";
import BinIcon from "../assets/images/bin.png";
import PlusIcon from "../assets/images/plus.png";
import FavouriteIcon from "../assets/images/favourite.png";
import CloudIcon from "../assets/images/cloud.png";
import CrownIcon from "../assets/images/crown.png";

const { width, height } = Dimensions.get("screen");

const HomeScreen = ({ navigation }) => {
  const fontsLoaded = useCustomFonts();
  const scrollX = useRef(new Animated.Value(0)).current;

  if (!fontsLoaded) {
    return (
      <ActivityIndicator
        size="large"
        color="#0000ff"
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      />
    );
  }

  const files = [
    {
      id: 1,
      name: "Wavy-dot.jpg",
      size: "1.8 MB",
    },
    {
      id: 2,
      name: "Building Outro.mp4",
      size: "21 MB",
    },
    {
      id: 3,
      name: "Illustration.jpg",
      size: "5 MB",
    },
    {
      id: 4,
      name: "Icons.jpg",
      size: "19 MB",
    },
    {
      id: 5,
      name: "Animation.gif",
      size: "1.2 MB",
    },
  ];

  const toplistdata = [
    { id: "1", type: "first" },
    { id: "2", type: "second" },
  ];

  const renderItem = ({ item }) => (
    <View style={styles.eachFile}>
      <View style={styles.fileIcon}></View>
      <View style={styles.fileDetails}>
        <View style={styles.aboutFile}>
          <Text style={styles.fileName}>{item.name}</Text>
          <Text style={styles.fileSize}>{item.size}</Text>
        </View>
        <TouchableOpacity style={styles.moreIconContainer}>
          <Image source={More} style={styles.moreIcon} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const totalStorage = 128;
  const usedStorage = 60;
  const usedPercentage = (usedStorage / totalStorage) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <TouchableOpacity
          style={styles.profileIcon}
          onPress={() => {
            navigation.openDrawer();
          }}
        >
          <Image
            source={ProfileIcon}
            style={styles.profileIconImage}
            resizeMode="contain"
          />
          <Image
            source={ArrowIcon}
            style={styles.arrowIconImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <View style={styles.searchBar}>
          <Image
            source={SearchIcon}
            style={styles.searchIcon}
            resizeMode="contain"
          />
          <TextInput
            style={styles.searchTextInput}
            placeholder="Search files . . ."
            placeholderTextColor={colors.textColor2}
          />
        </View>
      </View>
      <View style={styles.center}>
        <View style={styles.topParentContainer}>
          <View style={styles.topView}>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={toplistdata}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                if (item.type === "first") {
                  return (
                    <View style={styles.fBoxContainer}>
                      <View style={styles.firstBox}>
                        <View style={styles.storageViewLeft}>
                          <CircularProgress
                            value={usedPercentage}
                            radius={hp("7.5%")}
                            duration={1000}
                            textColor={"#E1E1E1"}
                            textStyle={{
                              fontFamily: "Afacad-SemiBold",
                            }}
                            valueSuffix={"%"}
                            activeStrokeColor={"#5f39ce"}
                            inActiveStrokeColor={colors.lightColor2}
                            progressValueColor={colors.textColor3}
                            progressValueStyle={{
                              fontFamily: "Afacad-SemiBold",
                              fontSize: hp(
                                usedPercentage.toString().length === 1
                                  ? "3.5%"
                                  : usedPercentage.toString().length === 2
                                  ? "3.5%"
                                  : "2.5%"
                              ),
                              textAlign: "center",
                              verticalAlign: "middle",
                            }}
                            inActiveStrokeOpacity={0.5}
                            activeStrokeWidth={12}
                            inActiveStrokeWidth={12}
                          />
                        </View>
                        <View style={styles.storageViewRight}>
                          <View style={styles.topStorageRightTop}>
                            <View style={styles.storageItem}>
                              <Text style={styles.labelText}>
                                Total Storage:{" "}
                              </Text>
                              <Text style={styles.valueText}>
                                {totalStorage}GB
                              </Text>
                            </View>

                            <View style={styles.storageItem}>
                              <Text style={styles.labelText}>Used: </Text>
                              <Text style={styles.valueText}>
                                {usedStorage}GB
                              </Text>
                            </View>

                            <View style={styles.storageItem}>
                              <Text style={styles.labelText}>Available: </Text>
                              <Text style={styles.valueText}>
                                {totalStorage - usedStorage}GB
                              </Text>
                            </View>
                          </View>
                          {/* <View style={styles.topStorageRightBottom}>
                            <View style={styles.premiumContainer}>
                              <TouchableOpacity>
                                <Text style={styles.premiumText}>
                                  Upgrade to Premium
                                </Text>
                              </TouchableOpacity>
                              <Image
                                source={CrownIcon}
                                style={styles.crownIcon}
                                resizeMode="contain"
                              />
                            </View>
                          </View> */}
                        </View>
                      </View>
                    </View>
                  );
                } else {
                  return (
                    <View style={styles.sBoxContainer}>
                      <View style={styles.secondBox}></View>
                    </View>
                  );
                }
              }}
              pagingEnabled
              contentContainerStyle={styles.flatListContent}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                { useNativeDriver: false }
              )}
            />
          </View>

          <View style={styles.topMiddleView}>
            <View style={styles.paginationDotContainer}>
              {toplistdata.map((_, index) => {
                const inputRange = [
                  (index - 1) * width,
                  index * width,
                  (index + 1) * width,
                ];

                const dotWidth = scrollX.interpolate({
                  inputRange,
                  outputRange: ["15%", "25%", "15%"],
                  extrapolate: "clamp",
                });

                const dotColor = scrollX.interpolate({
                  inputRange,
                  outputRange: [
                    colors.textColor1,
                    "#5f39ce",
                    colors.textColor1,
                  ],
                  extrapolate: "clamp",
                });

                return (
                  <Animated.View
                    key={index}
                    style={[
                      styles.dot,
                      {
                        width: dotWidth,
                        backgroundColor: dotColor,
                      },
                    ]}
                  />
                );
              })}
            </View>
          </View>

          <View style={styles.centerMediaView}>
            <View style={styles.firstRowContainer}>
              <TouchableOpacity style={styles.mediaIcon}>
                <Image
                  source={ImagesIcon}
                  style={styles.mediaIconImage}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.mediaIcon}>
                <Image
                  source={VideosIcon}
                  style={styles.mediaIconImage}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.mediaIcon}>
                <Image
                  source={AudiosIcon}
                  style={styles.mediaIconImage}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.mediaIcon}>
                <Image
                  source={DocumentsIcon}
                  style={styles.mediaIconImage}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.mediaIcon}>
                <Image
                  source={PasswordsIcon}
                  style={styles.mediaIconImage}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
            <View style={styles.secondRowButtons}>
              <TouchableOpacity style={styles.favouriteContainer}>
                <Image
                  source={FavouriteIcon}
                  style={styles.favouriteIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.binButtonContainer}>
                <Image
                  source={BinIcon}
                  style={styles.binIcon}
                  resizeMode="contain"
                />
                <Text style={styles.binText}>Bin</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.addButtonContainer}
                onPress={() => {
                  navigation.push("Dummy");
                }}
              >
                <Image
                  source={PlusIcon}
                  style={styles.plusIcon}
                  resizeMode="contain"
                />
                <View style={styles.sepText}></View>
                <Text style={styles.addText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View style={styles.bottomRecentView}>
          <View style={styles.recentHeader}>
            <Text style={styles.recentText}>Recent Files</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}> See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.recentBottom}>
            <FlatList
              data={files}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondaryColor1,
    flexDirection: "column",
    alignItems: "center",
  },
  top: {
    flexDirection: "row",
    alignItems: "center",
    width: wp("100%"),
    height: hp("10%"),
    gap: wp("3%"),
    justifyContent: "space-between",
    paddingHorizontal: wp("3.5%"),
  },
  profileIcon: {
    width: "30%",
    height: "65%",
    alignItems: "center",
    flexDirection: "row",
    backgroundColor: colors.darkColor,
    borderRadius: hp("2%"),
    justifyContent: "space-around",
  },
  profileIconImage: {
    width: "38%",
    aspectRatio: 1,
    marginLeft: wp("1%"),
  },
  arrowIconImage: {
    width: "22%",
    aspectRatio: 1,
  },
  searchBar: {
    flex: 1,
    height: "65%",
    backgroundColor: colors.darkColor,
    borderRadius: hp("2%"),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: wp("3%"),
    paddingLeft: wp("5%"),
  },
  searchIcon: {
    width: "11%",
    aspectRatio: 1,
  },
  searchTextInput: {
    flex: 1,
    fontSize: hp("2.2%"),
    color: colors.textColor2,
    fontFamily: "Afacad-Regular",
    paddingVertical: 0,
  },
  center: {
    width: wp("100%"),
    flex: 1,
    alignItems: "center",
    flexDirection: "column",
  },
  topParentContainer: {
    width: wp("100%"),
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topView: {
    width: "100%",
    height: "45%",
    alignItems: "center",
    justifyContent: "center",
  },
  flatListContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  topMiddleView: {
    width: "100%",
    height: "5%",
    justifyContent: "center",
    alignItems: "center",
    marginTop: hp("1%"),
  },
  paginationDotContainer: {
    width: "13%",
    height: "93%",
    backgroundColor: colors.darkColor,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    opacity: 0.5,
    borderRadius: hp("15%"),
    gap: wp("2%"),
  },
  dot: {
    width: "11%",
    height: "28%",
    borderRadius: hp("15%"),
    backgroundColor: colors.lightColor1,
  },
  fBoxContainer: {
    width: wp("100%"),
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  firstBox: {
    width: "93%",
    height: "100%",
    backgroundColor: colors.lightColor1,
    borderRadius: hp("3%"),
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-around",
  },
  sBoxContainer: {
    width: wp("100%"),
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  secondBox: {
    width: wp("93%"),
    height: "100%",
    backgroundColor: colors.lightColor1,
    borderRadius: hp("3%"),
  },
  storageViewLeft: {
    width: "40%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  storageViewRight: {
    width: "50%",
    height: "100%",
    alignItems: "center",
    flexDirection: "column",
    justifyContent: "space-evenly",
  },
  topStorageRightTop: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    gap: hp("1%"),
  },
  storageItem: {
    flexDirection: "row",
  },
  labelText: {
    fontSize: hp("2.2%"),
    color: colors.textColor3,
    fontFamily: "Afacad-Medium",
  },
  valueText: {
    fontSize: hp("2.2%"),
    color: colors.textColor3,
    fontFamily: "Afacad-Regular",
  },
  topStorageRightBottom: {
    width: "100%",
    height: "30%",
    alignItems: "center",
    justifyContent: "center",
    display: "none",
  },
  premiumContainer: {
    width: "100%",
    height: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: wp("1%"),
  },
  premiumText: {
    fontSize: hp("2.1%"),
    color: colors.textColor3,
    fontFamily: "Afacad-Regular",
    textDecorationLine: "underline",
  },
  crownIcon: {
    width: wp("5%"),
    height: hp("5%"),
  },
  centerMediaView: {
    width: "93%",
    flex: 1,
    flexDirection: "column",
    flexWrap: "wrap",
    justifyContent: "space-evenly",
  },
  firstRowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  mediaIcon: {
    width: "17%",
    aspectRatio: 1,
    backgroundColor: colors.darkColor,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: hp("1.2%"),
    flexDirection: "row",
  },
  mediaIconImage: {
    width: "50%",
    height: "50%",
  },
  secondRowButtons: {
    width: "100%",
    height: "35%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  favouriteContainer: {
    width: "17.5%",
    height: "100%",
    backgroundColor: colors.darkColor,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: hp("1.2%"),
    flexDirection: "row",
  },
  favouriteIcon: {
    width: "55%",
    height: "55%",
  },
  binButtonContainer: {
    width: "38%",
    height: "100%",
    backgroundColor: colors.darkColor,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: hp("1.2%"),
    flexDirection: "row",
    gap: wp("2%"),
  },
  binIcon: {
    width: "23%",
    height: "50%",
  },
  binText: {
    fontSize: hp("2.5%"),
    color: colors.textColor3,
    fontFamily: "Afacad-Medium",
  },
  addButtonContainer: {
    width: "38%",
    height: "100%",
    backgroundColor: "#5F2ABD",
    alignItems: "center",
    justifyContent: "space-evenly",
    borderRadius: hp("1.2%"),
    flexDirection: "row",
  },
  plusIcon: {
    width: "18%",
    height: "50%",
  },
  sepText: {
    width: "1%",
    height: "45%",
    fontFamily: "Afacad-SemiBold",
    backgroundColor: colors.textColor2,
  },
  addText: {
    fontSize: hp("2.5%"),
    color: colors.textColor3,
    fontFamily: "Afacad-Medium",
  },
  bottomRecentView: {
    width: wp("100%"),
    height: "40%",
    flexDirection: "column",
    alignItems: "center",
    gap: hp("1.5%"),
    paddingHorizontal: wp("3.5%"),
  },
  recentHeader: {
    width: "100%",
    height: "20%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  recentText: {
    fontSize: hp("3%"),
    color: colors.textColor3,
    fontFamily: "Afacad-Medium",
  },
  seeAllText: {
    fontSize: hp("2%"),
    color: colors.textColor2,
    fontFamily: "Afacad-Regular",
  },
  recentBottom: {
    width: "100%",
    flex: 0.9,
  },
  eachFile: {
    width: "100%",
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: hp("2.5%"),
  },
  fileIcon: {
    height: "100%",
    aspectRatio: 1,
    backgroundColor: colors.lightColor2,
    borderRadius: hp("1.5%"),
  },
  fileDetails: {
    height: "100%",
    width: "80%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  aboutFile: {
    flexDirection: "column",
    alignItems: "center",
  },
  fileName: {
    fontSize: hp("1.9%"),
    color: colors.textColor1,
    fontFamily: "Afacad-Regular",
    width: "100%",
    textAlign: "left",
  },
  fileSize: {
    fontSize: hp("1.8%"),
    color: colors.textColor2,
    fontFamily: "Afacad-Regular",
    textAlign: "left",
    width: "100%",
  },
  moreIconContainer: {
    width: "auto",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  moreIcon: {
    height: "65%",
    aspectRatio: 1,
  },
});

export default HomeScreen;
