import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  Animated,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Modal
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import colors from "../../constants/colors";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Easing } from "react-native-reanimated";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { fetchFolderList, handleFolderCreate, deleteFolders } from "../../services/userOperations";
import Toast from "react-native-toast-message";

import BackIcon from "../../assets/images/back_icon.png";
import FolderImage from "../../assets/images/folder (2).png";
import SearchIcon from "../../assets/images/new_search_icon.png";
import PlusIcon from "../../assets/images/plus_icon.png";
import Feather from '@expo/vector-icons/Feather';
import EvilIcons from '@expo/vector-icons/EvilIcons';

export default function FoldersScreen({ navigation }) {
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.user.userId);
  const folders = useSelector((state) => state.user.folders, shallowEqual);

  const [filteredFolders, setFilteredFolders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateFolder, setIsCreateFolder] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [selectedFolders, setSelectedFolders] = useState([]);
  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [isLongPressed, setIsLongPressed] = useState(false);
  const [width] = useState(new Animated.Value(0));
  const [opacity] = useState(new Animated.Value(0));
  const [searchOpacity] = useState(new Animated.Value(0));
  const [iconsOpacity] = useState(new Animated.Value(1));
  const [isSearchActive, setIsSearchActive] = useState(false);

  useEffect(() => {
    setFilteredFolders(folders);
  }, [folders]);

  useEffect(() => {
    if (folders?.length > 0) return;
    fetchData();
  }, [userId, dispatch]);

  const fetchData = async () => {
    console.log("first")
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

  const handleLongPress = (folderId) => {
    setIsMultiSelect(true);
    setIsLongPressed(true);
    setSelectedFolders((prevSelected) =>
      prevSelected.includes(folderId) ? prevSelected : [...prevSelected, folderId]
    );
  };

  const cancelSelection = () => {
    setIsLongPressed(false);
    setSelectedFolders([]);
    setIsMultiSelect(false);
  };

  const handleSelectFolder = (folder) => {
    if (isMultiSelect) {
      setSelectedFolders((prevSelected) => {
        if (prevSelected.includes(folder.folderId)) {
          const updatedSelection = prevSelected.filter(id => id !== folder.folderId);
          if (updatedSelection.length === 0) {
            setIsMultiSelect(false);
          }
          return updatedSelection;
        } else {
          return [...prevSelected, folder.folderId];
        }
      });
    } else {
      navigation.navigate("FolderPreviewScreen", { folderId: folder.folderId });
    }
  };

  const handleDeleteFolders = async () => {
    if (selectedFolders.length === 0) return;
    console.log(selectedFolders)
    try {
      const response = await deleteFolders(userId, selectedFolders, dispatch);
      if (response.success) {
        cancelSelection();
        Toast.show({ text1: "Folders deleted successfully", type: "success" });
      }
      else {
        Toast.show({ text1: "Error deleting folders", type: "error" });
      }

    } catch (error) {
      Toast.show({ text1: "Failed to delete folders", type: "error" });
    }
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
      Animated.timing(searchOpacity, {
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
      }),
      Animated.timing(searchOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: false,
      }),
      Animated.timing(iconsOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: false,
      }),
    ]).start(() => {
      setIsSearchActive(false);  
    });
  };

  const handleSearchChange = (text) => {
    setSearchTerm(text);
    const filteredData = folders.filter((folderItem) =>
      folderItem.folderName.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredFolders(filteredData);
  };

  const handleCreateFolder = () => setIsCreateFolder(true);
  const handleCancel = () => {
    setFolderName("");
    setIsCreateFolder(false);
  };

  const handleCreate = async () => {
    const response = await handleFolderCreate(userId, folderName, dispatch);
    if (response.success) {
      fetchData();
      Toast.show({ text1: "Folder Created Successfully", type: "success" });
    } else {
      Toast.show({ text1: "Failed to Create Folder", text2: response.message, type: "error" });
    }
    handleCancel();
  };

  const renderItem = ({ item }) => {
    const isSelected = selectedFolders.includes(item.folderId);
    return (
      <TouchableOpacity
        onLongPress={() => handleLongPress(item.folderId)}
        onPress={() => handleSelectFolder(item)}
        style={[styles.folderItem, isSelected && styles.selectedFolder]}
      >
        <Image source={FolderImage} style={styles.folderIcon} />
        <Text style={styles.folderName}>{item.folderName}</Text>
      </TouchableOpacity>
    );
  };


  return (
    <SafeAreaView edges={["right", "left", "top"]} style={styles.container}>
      <View style={styles.innerContainer}>
        <View style={styles.top}>
          <Text style={styles.screenTitle}>Folders</Text>

          {
            isMultiSelect ? (
              isLongPressed && <View style={{
                flexDirection: "row",
                alignItems: 'center',
                justifyContent: "center",
                marginTop: "2%"
              }}>
                <Feather onPress={cancelSelection} name="x" size={hp("3.8%")} color={colors.textColor3} />

              </View>
            ) : <View style={styles.filterContainer}>
              <Animated.View
                style={[styles.filterContainer, { width, opacity: iconsOpacity }]}
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
                  style={[styles.inputContainer, { width: width, opacity: searchOpacity }]}
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
          }
        </View>

        <View style={styles.center}>
          <FlatList
            data={filteredFolders}
            renderItem={renderItem}
            keyExtractor={(item) => item.folderId}
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
      </View>{
        isCreateFolder && <View style={styles.modalContainer}></View>
      }
      {
        isMultiSelect && isLongPressed ? (
          <TouchableOpacity onPress={() => {
            handleDeleteFolders()
          }} style={styles.trashIconContainer}>
            <EvilIcons name="trash" size={hp("5%")} color={colors.textColor3} />
          </TouchableOpacity>
        ) : <TouchableOpacity
          style={styles.addButton}
          onPress={handleCreateFolder}
        >
          <Image source={PlusIcon} style={styles.plusIcon} />
        </TouchableOpacity>
      }
      {
        isCreateFolder && (

          <Modal
            visible={isCreateFolder}
            animationType="slide"
            transparent={true}
            onRequestClose={handleCancel}
          >

            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Enter Folder Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Folder Name"
                value={folderName}
                onChangeText={setFolderName}
              />
              <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={handleCancel}>
                  <Text style={[styles.option, {
                    color: colors.textColor2
                  }]} >Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleCreate}>
                  <Text style={styles.option} >Create</Text>
                </TouchableOpacity>
              </View>
            </View>

          </Modal>

        )
      }
    </SafeAreaView >
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: wp("100%"),
    height: hp("100%"),
    position: "absolute",
  },
  modalContent: {
    width: wp('80%'),
    padding: wp('5%'),
    backgroundColor: colors.lightColor2,
    borderRadius: hp("2%"),
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [
      { translateX: wp("-40%") },
      { translateY: hp("-10.5%") },
    ],
    alignSelf: "center"
  },
  modalTitle: {
    fontSize: hp('2.7%'),
    marginBottom: hp('2%'),
    color: colors.textColor3,
    fontFamily: "Afacad-SemiBold"
  },
  input: {

    borderColor: "rgba(166, 166, 166, 0.3)",
    borderWidth: 0.5,
    marginBottom: hp('3%'),
    padding: hp("1.5%"),
    borderRadius: hp("1%"),
    fontFamily: "Afacad-Regular",
    fontSize: hp("2.1%"),
    color: colors.textColor2
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  option: {
    fontFamily: "Afacad-Regular",
    color: "#9366E2",
    fontSize: hp("2.1%"),
  },
  selectedFolder: {
    backgroundColor: "rgba(180, 100, 255, 0.3)",
    borderRadius: 10,
  },
  trashIconContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
    position: "absolute",
    right: wp("7%"),
    bottom: hp("3%"),
    width: hp("8%"),
    aspectRatio: 1,
    borderRadius: hp("500%"),
    alignItems: "center", justifyContent: "center"
  },
});
