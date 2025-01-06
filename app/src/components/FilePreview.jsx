import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";
import { setTabBarVisible } from "../redux/actions";
import colors from "../constants/colors";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useFocusEffect } from "@react-navigation/native";
import {
  previewImage,
  previewVideo,
  previewAudio,
} from "../services/fileOperations";
import { useVideoPlayer, VideoView } from "expo-video";
import { Audio } from "expo-av";
import PlayButtonIcon from "../assets/images/play-button.png";
import PauseButtonicon from "../assets/images/pause-icon.png";
import Slider from "@react-native-community/slider";
import FavIcon from "../assets/images/heart_bottom_icon.png";
import ShareIcon from "../assets/images/share_bottom_icon.png";
import AddFolder from "../assets/images/addfolder_bottom_icon.png";
import BinIcon from "../assets/images/trash_bottom_icon.png";
import InfoIcon from "../assets/images/info_bottom_icon.png";

export default function FilePreviewScreen({ route, navigation }) {
  const { fileName, fileId, type, thumbnail } = route.params;
  const [imageData, setImageData] = useState(null);
  const [videoData, setVideoData] = useState(null);
  const [audioData, setAudioData] = useState(null);
  const [documentData, setDocumentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const userId = "676aee09b3f0d752bbbe58f7";
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchFilePreview = async () => {
      try {
        switch (type) {
          case "images":
            const imageResponse = await previewImage(userId, fileId);
            setImageData(imageResponse);
            break;
          case "videos":
            const videoUrl = previewVideo(userId, fileId);
            setVideoData(videoUrl);
            break;
          case "audios":
            const audioUrl = previewAudio(userId, fileId);
            setAudioData(audioUrl);
            break;
          // case "others":
          //   const docResponse = await previewDocument(
          //     userId,
          //     category,
          //     fileName,
          //     folder
          //   );
          //   setDocumentData(docResponse);
          //   break;
          default:
            console.warn("Unknown category:", type);
        }
      } catch (error) {
        console.error("Error fetching file preview:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFilePreview();
  }, []);

  const ImagePreview = ({ fileData }) => {
    const [isLoading, setIsLoading] = useState(true);

    return (
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: fileData }}
          style={styles.image}
          onLoadStart={() => setIsLoading(true)}
          onLoad={() => setIsLoading(false)}
        />
        {isLoading && (
          <ActivityIndicator size="large" style={styles.activityIndicator} />
        )}
      </View>
    );
  };

  const VideoPreview = () => {
    const player = useVideoPlayer(videoData, (player) => {
      player.loop = true;
      player.play();
    });

    useFocusEffect(
      React.useCallback(() => {
        return () => {
          if (player) {
            player.pause();
          }
        };
      }, [player])
    );

    return (
      <View style={styles.videoContainer}>
        <VideoView
          style={styles.video}
          player={player}
          shouldPlay
          allowsFullscreen
          allowsPictureInPicture
          fullscreen={true}
          resizeMode="contain"
          contentFit="cover"
        />
      </View>
    );
  };

  const AudioPreview = ({ fileData = "", thumbnail = "" }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [sound, setSound] = useState(null);
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
      const loadAudio = async () => {
        try {
          const { sound: newSound } = await Audio.Sound.createAsync(
            { uri: fileData },
            { shouldPlay: false, isLooping: true },
            updateStatus
          );
          setSound(newSound);
          setIsLoaded(true);
        } catch (error) {
          console.error("Error loading audio:", error);
        }
      };

      if (fileData) {
        loadAudio();
      }

      return () => {
        if (sound) {
          sound.unloadAsync().catch((error) => {
            console.error("Error unloading audio during cleanup:", error);
          });
        }
      };
    }, [fileData]);

    useFocusEffect(
      React.useCallback(() => {
        return () => {
          if (sound) {
            sound.stopAsync();
          }
        };
      }, [sound])
    );

    const updateStatus = (status) => {
      if (status.isLoaded) {
        setDuration(status.durationMillis || 0);
        setPosition(status.positionMillis || 0);
        setIsPlaying(status.isPlaying || false);
      } else if (status.error) {
        console.error("Audio playback error:", status.error);
      }
    };

    const playAudio = async () => {
      try {
        if (sound) {
          await sound.playAsync();
          setIsPlaying(true);
        }
      } catch (error) {
        console.error("Error playing audio:", error);
      }
    };

    const pauseAudio = async () => {
      try {
        if (sound) {
          await sound.pauseAsync();
          setIsPlaying(false);
        }
      } catch (error) {
        console.error("Error pausing audio:", error);
      }
    };

    const handleSlidingComplete = async (value) => {
      if (sound) {
        try {
          await sound.setPositionAsync(value);
          setPosition(value);

          if (value === 0) {
            await sound.pauseAsync();
            setIsPlaying(false);
          } else {
            await sound.playAsync();
            setIsPlaying(true);
          }
        } catch (error) {
          console.error("Error during slider interaction:", error);
        }
      }
    };

    const formatTime = (timeInMillis) => {
      const minutes = Math.floor(timeInMillis / 60000);
      const seconds = Math.floor((timeInMillis % 60000) / 1000);
      return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    };

    return (
      <View style={styles.audioContainer}>
        <View style={styles.audioThumbnailContainer}>
          <Image source={{ uri: thumbnail }} style={styles.audioThumbnail} />
        </View>
        <View style={styles.audioControls}>
          <Slider
            value={position}
            minimumValue={0}
            maximumValue={duration}
            style={styles.slider}
            onSlidingComplete={handleSlidingComplete}
            disabled={!isLoaded}
            tapToSeek={true}
            minimumTrackTintColor={colors.primaryColor}
          />
          <View style={styles.audioTimeContainer}>
            <Text style={styles.audioText}>{formatTime(position)} </Text>
            <Text style={styles.audioText}>{formatTime(duration)} </Text>
          </View>
          {isPlaying ? (
            <TouchableOpacity onPress={pauseAudio}>
              <Image source={PauseButtonicon} style={styles.pauseButton} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={playAudio}>
              <Image source={PlayButtonIcon} style={styles.playButton} />
            </TouchableOpacity>
          )}
        </View>
        {!isLoaded && (
          <ActivityIndicator size="large" style={styles.activityIndicator} />
        )}
      </View>
    );
  };

  const DocumentPreview = ({ fileData }) => (
    <View style={styles.documentContainer}>
      <Text style={styles.documentText}>
        Document Preview: {fileData.name || "Unnamed Document"}
      </Text>
      <Text style={styles.documentText}>
        Size: {fileData.size || "Unknown"} bytes
      </Text>
    </View>
  );

  const NoPreviewAvailable = () => (
    <Text style={styles.noPreviewText}>No Preview Available</Text>
  );

  const renderFilePreview = () => {
    switch (type) {
      case "images":
        return imageData ? (
          <ImagePreview fileData={imageData} />
        ) : (
          <NoPreviewAvailable />
        );
      case "videos":
        return videoData ? <VideoPreview /> : <NoPreviewAvailable />;
      case "audios":
        return audioData ? (
          <AudioPreview fileData={audioData} thumbnail={thumbnail} />
        ) : (
          <NoPreviewAvailable />
        );
      case "documents":
        return documentData ? (
          <DocumentPreview fileData={documentData} />
        ) : (
          <NoPreviewAvailable />
        );
      default:
        return <NoPreviewAvailable />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <View style={styles.top}>
          <View style={styles.topContent}>
            <TouchableOpacity
              style={styles.backIconContainer}
              onPress={() => navigation.goBack()}
            >
              <Image
                source={require("../assets/images/back_icon.png")}
                style={styles.backIcon}
              />
            </TouchableOpacity>
            <Text style={styles.fileName}>{fileName}</Text>
          </View>
        </View>
        <View style={styles.center}>{renderFilePreview()}</View>
        <View style={styles.bottom}>
          <TouchableOpacity
            onPress={() => console.log("Favorite Icon Pressed")}
            style={styles.opticonContainer}
          >
            <Image source={FavIcon} style={styles.opticon} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => console.log("Share Icon Pressed")}
            style={styles.opticonContainer}
          >
            <Image source={ShareIcon} style={styles.opticon} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => console.log("Add Folder Icon Pressed")}
            style={styles.opticonContainer}
          >
            <Image source={AddFolder} style={styles.opticon} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => console.log("Bin Icon Pressed")}
            style={styles.opticonContainer}
          >
            <Image source={BinIcon} style={styles.opticon} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => console.log("Info Icon Pressed")}
            style={styles.opticonContainer}
          >
            <Image source={InfoIcon} style={styles.opticon} />
          </TouchableOpacity>
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
    paddingHorizontal: wp("1%"),
  },
  topContent: {
    flexDirection: "row",
    alignItems: "center",
    height: "70%",
    gap: wp("0.5%"),
    width: "90%",
  },
  fileName: {
    fontSize: hp("2%"),
    color: colors.textColor3,
    fontFamily: "Montserrat-SemiBold",
  },
  backIconContainer: {
    height: hp("4.5%"),
    width: hp("4.5%"),
    justifyContent: "center",
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
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  imageContainer: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  activityIndicator: {
    position: "absolute",
    alignSelf: "center",
  },
  videoContainer: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  video: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  documentContainer: {
    padding: 20,
    backgroundColor: colors.secondaryColor2,
    borderRadius: 10,
  },
  documentText: {
    fontSize: hp("2%"),
    color: colors.textColor3,
  },
  noPreviewText: {
    fontSize: hp("2%"),
    color: colors.textColor3,
    fontStyle: "italic",
  },
  loadingIndicator: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -25 }, { translateY: -25 }],
  },
  bottom: {
    height: hp("10%"),
    width: wp("100%"),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: wp("6%"),
  },
  audioContainer: {
    width: "100%",
    height: "100%",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.secondaryColor2,
  },
  audioThumbnailContainer: {
    width: "90%",
    aspectRatio:1
  },
  audioTimeContainer: {
    width: "90%",
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
  },
  audioText: {
    fontSize: hp("1.8%"),
    color: colors.textColor2,
    fontFamily: "Afacad-Regular",
  },
  audioThumbnail: {
    aspectRatio: 1,
    resizeMode: "contain",
    borderRadius: hp("2%"),
  },
  slider: {
    width: "90%",
  },
  audioControls: {
    width: "100%",
    flexDirection: "column",
    marginTop: hp("3%"),
    alignItems: "center",
  },
  pauseButton: {
    width: hp("7%"),
    height: hp("7%"),
    tintColor: colors.textColor3,
  },
  playButton: {
    width: hp("7%"),
    height: hp("7%"),
    tintColor: colors.textColor3,
  },
  opticonContainer: {
    width: hp("3.2%"),
    height: hp("3.2%"),
  },
  opticon: {
    flex: 1,
    aspectRatio: 1,
    resizeMode: "contain",
    tintColor: colors.textColor3,
  },
});
