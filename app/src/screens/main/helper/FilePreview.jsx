import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";
import colors from "../../../constants/colors";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import {
  deleteFile,
  previewFile,
} from "../../../services/fileOperations";
import FavIcon from "../../../assets/images/heart_bottom_icon.png";
import ShareIcon from "../../../assets/images/share_bottom_icon.png";
import AddFolder from "../../../assets/images/addfolder_bottom_icon.png";
import BinIcon from "../../../assets/images/trash_bottom_icon.png";
import InfoIcon from "../../../assets/images/info_bottom_icon.png";
import RBSheet from "react-native-raw-bottom-sheet";
import { formatFileSize } from "../../../utils/formatFileSize";
import { likeOrUnlikeFile } from "../../../services/userOperations";
import LikedHeartIcon from "../../../assets/images/like-heart.png";
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import ImagePreview from '../../../components/preview/ImagePreview';
import VideoPreview from '../../../components/preview/VideoPreview';
import AudioPreview from '../../../components/preview/AudioPreview';
import OtherPreview from '../../../components/preview/OtherPreview';
import { useSelector } from "react-redux";
import Toast from "react-native-toast-message";
import AddFilesFolder from "../../../components/AddFilesFolder";

export default function FilePreviewScreen({ route, navigation }) {
  const { file } = route.params;
  const [imageData, setImageData] = useState(null);
  const [videoData, setVideoData] = useState(null);
  const [audioData, setAudioData] = useState(null);
  const [otherData, setOtherData] = useState(null);
  const dispatch = useDispatch();
  const refRBSheet = useRef();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLiked, setIsLike] = useState(false)
  const addFolderSheet = useRef()

  const userId = useSelector((state) => state.user.userId);


  useEffect(() => {
    const fetchFilePreview = async () => {
      try {
        const fileUrl = await previewFile(userId, file._id);
        switch (file.type) {
          case "images":
            setImageData(fileUrl);
            break;
          case "videos":
            setVideoData(fileUrl);
            break;
          case "audios":
            setAudioData(fileUrl);
            break;
          default:
            setOtherData(fileUrl);
            break;
        }
      } catch (error) {
        console.error("Error fetching file preview:", error);
      }
    };

    fetchFilePreview();
  }, [file]);



  useEffect(() => {
    if (file.isLiked !== undefined) {
      setIsLike(file.isLiked);
    }
  }, [file.isLiked]);

  const handleShare = async () => {
    try {
      let uri = "";

      switch (true) {
        case file.type.includes("image"):
          uri = imageData;
          break;
        case file.type.includes("video"):
          uri = videoData;
          break;
        case file.type.includes("audio"):
          uri = audioData;
          break;
        default:
          uri = otherData;
          break;
      }


      const isSharingAvailable = await Sharing.isAvailableAsync();
      if (!isSharingAvailable) {
        Alert.alert('Sharing not available', 'Your device does not support sharing.');
        return;
      }


      if (!uri || typeof uri !== 'string') {
        Alert.alert('Invalid file path', 'The file path is missing or invalid.');
        return;
      }

      await Sharing.shareAsync(uri, {
        mimeType: file.type,
        dialogTitle: `Share ${file.name}`,
      });

      console.log('File shared successfully!');


    } catch (error) {

      if (error.message.includes('Network')) {
        Alert.alert('Network error', 'Unable to share the file due to a network issue.');
      } else if (error.message.includes('canceled')) {
        console.log('User canceled the sharing process.');
      } else {
        Alert.alert('Error sharing file', 'An unexpected error occurred while sharing the file.');
        console.error('Error sharing file:', error.message);
      }
    }
  };


  const handleLikeOrUnlike = async () => {
    if (isProcessing) return;

    setIsProcessing(true);
    const previousState = isLiked;
    setIsLike(!previousState);

    try {
      const response = await likeOrUnlikeFile(userId, file._id, dispatch, file.type);
      if (!response.success) {
        setIsLike(previousState);
      }
    } catch (error) {
      console.error("Error updating like status:", error);
      setIsLike(previousState);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Confirm Deletion",
      `Are you sure you want to delete the file "${file.name}"?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const result = await deleteFile(userId, file._id, file.type, dispatch);

            if (result.success === false) {
              Toast.show({
                type: 'error',
                text1: `Error deleting file.`,
                text2: `Status code: ${response?.message}`
              })
            } else {
              navigation.goBack()
              Toast.show({
                type: 'success',
                text1: `File deleted successfully!`,
              })
            }
          },
        },
      ],
      { cancelable: true }
    );
  };


  const renderFilePreview = () => {
    switch (file.type) {
      case "images":
        return imageData && <ImagePreview fileData={imageData} />
      case "videos":
        return videoData && <VideoPreview fileData={videoData} />
      case "audios":
        return audioData && <AudioPreview thumbnail={file.thumbnail} fileData={audioData} />
      default:
        return <OtherPreview name={file.name} fileData={otherData} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <View style={styles.top}>
          <TouchableOpacity
            style={styles.backIconContainer}
            onPress={() => navigation.goBack()}
          >
            <Image
              source={require("../../../assets/images/back_icon.png")}
              style={styles.backIcon}
            />
          </TouchableOpacity>
          <Text style={styles.fileName}>{file.name}</Text>
        </View>

        <View style={styles.center}>{
          renderFilePreview()
        }</View>
        <View style={styles.bottom}>
          <TouchableOpacity onPress={handleLikeOrUnlike} disabled={isProcessing} style={styles.opticonContainer}>
            {isLiked ? (
              <Image source={LikedHeartIcon} style={styles.newoptiicon} />
            ) : (
              <Image source={FavIcon} style={styles.opticon} />
            )}
          </TouchableOpacity>


          <TouchableOpacity
            onPress={handleShare}
            style={styles.opticonContainer}

          >
            <Image source={ShareIcon} style={styles.opticon} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              addFolderSheet.current.open()
            }}
            style={styles.opticonContainer}
          >
            <Image source={AddFolder} style={styles.opticon} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={
              handleDelete
            }
            style={styles.opticonContainer}
          >
            <Image source={BinIcon} style={styles.opticon} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.opticonContainer} onPress={() => refRBSheet.current.open()}>
            <Image source={InfoIcon} style={styles.opticon} />
          </TouchableOpacity>
        </View>
        <RBSheet
          ref={refRBSheet}
          openDuration={400}
          draggable={true}
          closeDuration={300}
          animationType="slide"
          closeOnPressMask={true}
          closeOnDragDown={true}
          keyboardAvoidingViewEnabled={true}
          customStyles={{
            container: {
              borderTopLeftRadius: hp("3%"),
              borderTopRightRadius: hp("3%"),
              backgroundColor: colors.lightColor2,
              height: hp("40%")
            },
            mask: {
              backgroundColor: "rgba(0, 0, 0, 0.3)",
            },
          }}
        >
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Text style={[styles.infotext, styles.head,

              ]}>File Name:</Text>
              <Text style={[styles.infotext, styles.value, {
                flexWrap: "wrap",
                width: "90%",
              }]}>{file.name}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={[styles.infotext, styles.head]}>File Type:</Text>
              <Text style={[styles.infotext, styles.value]}>
                {file.type.includes('image')
                  ? 'Image'
                  : file.type.includes('video')
                    ? 'Video'
                    : file.type.includes('audio')
                      ? 'Audio'
                      : 'Other'}
              </Text>

            </View>

            <View style={styles.infoRow}>
              <Text style={[styles.infotext, styles.head]}>File Size:</Text>
              <Text style={[styles.infotext, styles.value]}>{formatFileSize(file.size)}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={[styles.infotext, styles.head]}>Folders:</Text>
              <Text style={[styles.infotext, styles.value]}>{file.folders && file.folders.map((item, index) => {
                return (
                  <View key={index}>
                    <Text style={[styles.infotext, styles.value]}>
                      {file.folders && file.folders.length > 0 ? `${item}, ` : "No Folders"}
                    </Text>

                  </View>
                )
              })}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={[styles.infotext, styles.head]}>Created At:</Text>
              <Text style={[styles.infotext, styles.value]}>
                {new Date(file.createdAt).toLocaleString()}
              </Text>
            </View>
          </View>


        </RBSheet>
        <RBSheet draggable={true} customStyles={{
          container: {
            backgroundColor: colors.lightColor1,
            borderTopLeftRadius: hp("3%"),
            borderTopRightRadius: hp("3%"),
          }
        }} ref={addFolderSheet}>
          <AddFilesFolder sheetRef={addFolderSheet} file={file} />
        </RBSheet>
      </View>
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
    marginBottom: hp("1%"),
    gap: wp("0.5%"),
    flexWrap: "wrap",
  },

  fileName: {
    fontSize: hp("3%"),
    color: colors.textColor3,
    fontFamily: "Afacad-SemiBold",
    flex: 1,
    flexWrap: "wrap",

  },
  backIconContainer: {
    height: hp("4.7%"),
    aspectRatio: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  backIcon: {
    flex: 1,
    aspectRatio: 1,
    resizeMode: "contain",
  },
  center: {
    width: wp("100%"),
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  bottom: {
    height: hp("10%"),
    width: wp("100%"),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: wp("3.5%"),
  },

  opticonContainer: {
    width: hp("5%"),
    height: hp("5%"),
    alignItems: "center",
    justifyContent: "center",
  },
  opticon: {
    width: "70%",
    height: "70%",
    aspectRatio: 1,
    resizeMode: "contain",
    tintColor: colors.textColor3,
  },
  newoptiicon: {
    width: "100%",
    height: "100%",
    aspectRatio: 1,
    resizeMode: "contain",
  },
  infoContainer: {
    gap: hp("1%"),
    padding: hp("2%")
  },
  infoRow: {
    flexDirection: 'row',
    gap: wp("2%"),
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(166, 166, 166, 0.1)',
    paddingVertical: hp("1%"),
  },
  head: {
    fontSize: hp("2.3%"),
    color: colors.textColor1,
    fontFamily: "Afacad-Medium"
  },
  value: {
    fontSize: hp("2.3%"),
    color: colors.textColor3,
    fontFamily: "Afacad-Regular"
  },
});
