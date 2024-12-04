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
import BrushIcon from "../assets/images/brush.png";
import CrownIcon from "../assets/images/crown.png";

const { width } = Dimensions.get("screen");

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

  const renderRecentItem = ({ item }) => (
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
          style={styles.profileContainer}
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
        <View style={styles.searchBarContainer}>
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
        <View style={styles.storageCard}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={toplistdata}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              if (item.type === "first") {
                return (
                  <View style={styles.firstBoxContainer}>
                    <View style={styles.firstBox}>
                      <View style={styles.storageViewLeft}>
                        <Text style={styles.usedText}>Used</Text>
                        <CircularProgress
                          value={usedPercentage}
                          radius={hp("7.2%")}
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
                            fontSize: hp("2.5%"),
                            textAlign: "center",
                            verticalAlign: "middle",
                            marginBottom: hp("1.5%"),
                          }}
                          inActiveStrokeOpacity={0.5}
                          activeStrokeWidth={12}
                          inActiveStrokeWidth={12}
                        />
                      </View>
                      <View style={styles.storageViewRight}>
                        <View style={styles.storageRightTop}>
                          <View style={styles.storageItem}>
                            <View style={styles.storageTitle}>
                              <Text style={styles.titleText}>Used Space</Text>
                              <Image
                                source={CloudIcon}
                                style={styles.cloudIcon}
                                resizeMethod="contain"
                              />
                            </View>
                            <Text style={styles.valueText}>
                              {usedPercentage} GB/{totalStorage} GB
                            </Text>
                          </View>
                        </View>
                        <View style={styles.storageRightBottom}>
                          <TouchableOpacity style={styles.premiumContainer}>
                            <Text style={styles.premiumText}>Get Premium</Text>
                            <Image
                              source={CrownIcon}
                              style={styles.crownIcon}
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              } else {
                return (
                  <View style={styles.secondBoxContainer}>
                    <View style={styles.secondBox}></View>
                  </View>
                );
              }
            }}
            pagingEnabled
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false }
            )}
          />
        </View>
        <View style={styles.paginationView}>
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
                outputRange: [colors.textColor1, "#5f39ce", colors.textColor1],
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
        <View style={styles.utilityContainer}>
          <View style={styles.firstRowButtons}>
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
            <TouchableOpacity style={styles.cleanContainer}>
              <Image
                source={BrushIcon}
                style={styles.brushIcon}
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
      <View style={styles.bottom}>
        <View style={styles.recentHeader}>
          <Text style={styles.recentText}>Recent Files</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}> See All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.recentBottom}>
          <FlatList
            data={files}
            renderItem={renderRecentItem}
            keyExtractor={(item) => item.id}
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={true}
          />
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
    justifyContent: "space-between",
  },
  top: {
    flex: 0.2,
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    paddingHorizontal: wp("3.5%"),
  },
  profileContainer: {
    width: "30%",
    height: "85%",
    backgroundColor: colors.darkColor,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: hp("1.5%"),
    borderRadius: hp("2%"),
  },
  profileIconImage: {
    width: "45%",
    aspectRatio: 1,
  },
  arrowIconImage: {
    width: "25%",
    aspectRatio: 1,
  },
  searchBarContainer: {
    width: "65%",
    height: "85%",
    backgroundColor: colors.darkColor,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: wp("3%"),
    paddingHorizontal: wp("3%"),
    borderRadius: hp("2%"),
  },
  searchIcon: {
    width: "12%",
    aspectRatio: 1,
  },
  searchTextInput: {
    flex: 1,
    height: "100%",
    fontFamily: "Afacad-Regular",
    fontSize: hp("2.2%"),
    color: colors.textColor2,
  },
  center: {
    width: "100%",
    paddingHorizontal: wp("3.5%"),
    alignItems: "center",
    flexDirection: "column",
    justifyContent: "flex-start",
  },
  storageCard: {
    width: wp("100%"),
    height: hp("20%"),
  },
  firstBoxContainer: {
    width: wp("100%"),
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  firstBox: {
    width: "93%",
    height: "100%",
    backgroundColor: colors.lightColor1,
    borderRadius: hp("3.5%"),
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-around",
  },
  secondBoxContainer: {
    width: wp("100%"),
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  paginationView: {
    width: "100%",
    height: hp("2.5%"),
    justifyContent: "center",
    alignItems: "center",
    marginTop: hp("1%"),
  },
  paginationDotContainer: {
    width: "14%",
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
  secondBox: {
    width: "93%",
    height: "100%",
    backgroundColor: colors.lightColor1,
    borderRadius: hp("3.5%"),
  },
  storageViewLeft: {
    width: "40%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  usedText: {
    fontSize: hp("2%"),
    color: colors.textColor2,
    fontFamily: "Afacad-SemiBold",
    position: "absolute",
    top: "52.5%",
  },
  storageViewRight: {
    width: "50%",
    height: "90%",
    alignItems: "center",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  storageRightTop: {
    width: "100%",
    height: "60%",
    alignItems: "center",
    justifyContent: "center",
  },
  storageItem: {
    flexDirection: "column",
    height: "auto",
    width: "100%",
    gap: hp("1%"),
    alignItems: "flex-start",
  },
  storageTitle: {
    flexDirection: "row",
    gap: wp("2%"),
    height: "auto",
    width: "100%",
    alignItems: "center",
  },
  titleText: {
    fontSize: hp("2.5%"),
    color: colors.textColor2,
    fontFamily: "Afacad-Medium",
  },
  cloudIcon: {
    width: "12%",
    aspectRatio: 1,
  },
  valueText: {
    fontSize: hp("2%"),
    color: colors.textColor3,
    fontFamily: "Afacad-Medium",
  },
  storageRightBottom: {
    width: "90%",
    flex: 1,
    alignItems: "flex-end",
    justifyContent: "flex-end",
    flexDirection: "row",
    paddingBottom: "4%",
  },
  premiumContainer: {
    width: "auto",
    height: "auto",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#333",
    borderRadius: hp("1%"),
    padding: hp("0.5%"),
    gap: wp("1%"),
  },
  premiumText: {
    fontSize: hp("1.8%"),
    color: "#FFE47C",
    fontFamily: "Afacad-Regular",
    opacity: 0.7,
  },
  crownIcon: {
    width: "15%",
    aspectRatio: 1,
  },
  utilityContainer: {
    width: "100%",
    height: hp("16%"),
    marginTop: hp("1.5%"),
    alignItems: "center",
    gap: hp("1.5%"),
  },
  firstRowButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    height: "auto",
    alignItems: "center",
  },
  mediaIcon: {
    width: "18%",
    aspectRatio: 1,
    backgroundColor: colors.darkColor,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: hp("2%"),
  },
  mediaIconImage: {
    height: "50%",
    width: "50%",
  },
  secondRowButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    height: "auto",
    alignItems: "center",
  },
  favouriteContainer: {
    width: "18%",
    aspectRatio: 1,
    backgroundColor: colors.lightColor1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: hp("2%"),
    flexDirection: "row",
  },
  cleanContainer: {
    width: "18%",
    aspectRatio: 1,
    backgroundColor: colors.lightColor1,
    alignItems: "center",
    borderRadius: hp("2%"),
    justifyContent: "center",
  },
  brushIcon: {
    width: "45%",
    height: "45%",
  },
  favouriteIcon: {
    width: "50%",
    height: "50%",
  },
  binButtonContainer: {
    width: "18%",
    aspectRatio: 1,
    backgroundColor: colors.lightColor1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: hp("2%"),
    flexDirection: "row",
    gap: wp("2.5%"),
  },
  binIcon: {
    width: "45%",
    height: "45%",
  },
  binText: {
    fontSize: hp("2.5%"),
    color: colors.textColor3,
    fontFamily: "Afacad-Medium",
    display: "none",
  },
  addButtonContainer: {
    width: "38.5%",
    height: "100%",
    backgroundColor: "#5F2ABD",
    alignItems: "center",
    justifyContent: "space-evenly",
    borderRadius: hp("2%"),
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
  bottom: {
    flex: 0.69,
    width: "100%",
    paddingHorizontal: wp("3.5%"),
    flexDirection: "column",
    justifyContent: "flex-start",
    gap: hp("1.4%"),
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
    fontSize: hp("2.2%"),
    color: colors.textColor2,
    fontFamily: "Afacad-Regular",
  },
  recentBottom: {
    width: "100%",
    flex: 1,
  },
  eachFile: {
    width: "100%",
    height: hp("8%"),
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
    width: "75%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  aboutFile: {
    flexDirection: "column",
    alignItems: "center",
    height: "100%",
    flex: 1,
    justifyContent: "center",
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
    width: "15%",
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
