import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  Animated,
  TouchableOpacity,
  TextInput,
  RefreshControl
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import colors from "../../constants/colors";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import BackIcon from "../../assets/images/back_icon.png";
import FolderImage from "../../assets/images/folder (2).png";
import SearchIcon from "../../assets/images/new_search_icon.png";
import FilterIcon from "../../assets/images/filter_icon.png";
import { Easing } from "react-native-reanimated";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { fetchFolderList } from "../../services/userOperations";
import PlusIcon from "../../assets/images/plus_icon.png";

export default function FoldersScreen() {
  const [filteredFolders, setFilteredFolders] = useState([]);
  const [width] = useState(new Animated.Value(0));
  const [opacity] = useState(new Animated.Value(0));
  const [searchTerm, setSearchTerm] = useState("");
  const [iconsOpacity] = useState(new Animated.Value(1));
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true)
  const userId = useSelector((state) => state.user.userId);


  const folders = useSelector(
    (state) => state.user.folders,
    shallowEqual
  );

  const fetchData = async () => {
    setIsLoading(true);
    try {
      await fetchFolderList(userId, dispatch);
    } catch (error) {
      console.error("Error fetching folders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
  };

  useEffect(() => {
    const fetchDataEffect = async () => {
      await fetchData();
    };
    fetchDataEffect();
  }, [userId, dispatch]);

  useEffect(() => {
    setFilteredFolders(folders);
  }, [folders]);

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
    const filteredData = folders.filter((folderItem) =>
      folderItem.name.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredFolders(filteredData);
  };

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity key={item._id} style={styles.folderItem}>
        <View style={styles.folderImageContainer}>
          <Image source={FolderImage} style={styles.folderIcon} />
        </View>
        <Text style={styles.folderName}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView edges={["right", "left", "top"]} style={styles.container}>
      <View style={styles.innerContainer}>
        <View style={styles.top}>
          <Text style={styles.screenTitle}>Folders</Text>

          <View style={styles.filterContainer}>
            <Animated.View
              style={[styles.filterContainer, { opacity: iconsOpacity }]}
            >

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
                  onSubmitEditing={handleCancelSearch}
                  returnKeyType="done"
                />
              </Animated.View>
            )}
          </View>
        </View>

        <View style={styles.center}>
          <FlatList
            data={filteredFolders}
            renderItem={renderItem}
            keyExtractor={(item) => item._id}
            numColumns={2}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
              />
            }
            columnWrapperStyle={styles.columnWrapper}
            contentContainerStyle={{
              width: wp("100%"),
              paddingHorizontal: wp("1.5%"),
            }}
          />
        </View>
      </View>
      <TouchableOpacity
        style={styles.addButton}
      >
        <Image source={PlusIcon} style={styles.plusIcon} />
      </TouchableOpacity>
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
    paddingHorizontal: wp("4%"),
    justifyContent: "space-between",
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
    marginRight: wp("1%"),
    height: "80%",
  },
  searchIconContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: hp("3.2%"),
    aspectRatio: 1,
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
    flexDirection: "column",
    alignItems: "center",
    flex: 1,
    width: wp("100%"),
    paddingTop: hp("2%")
  },
  columnWrapper: {
    marginBottom: hp("2%"),
    justifyContent: "space-between",
  },
  folderItem: {
    width: wp("45%"),
    height: hp("21%"),
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    flexDirection: "column",
  },
  folderImageContainer: {
    width: "100%",
    height: "85%",
    justifyContent: "center",
    alignItems: "center",
  },
  folderIcon: {
    flex: 1,
    aspectRatio: 1,
    alignSelf: "center",
    resizeMode: "contain",
  },
  folderName: {
    color: colors.textColor3,
    fontSize: hp("2.2%"),
    textAlign: "center",
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
