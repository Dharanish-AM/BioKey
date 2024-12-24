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
import { useFocusEffect } from "@react-navigation/native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import {
  previewImage,
  previewVideo,
  previewAudio,
  previewDocument,
} from "../services/fileOperations";
import { useVideoPlayer, VideoView } from "expo-video";
import { Audio } from "expo-av";

export default function FilePreviewScreen({ route, navigation }) {
  const { fileName, category, folder } = route.params;
  const [fileData, setFileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sound, setSound] = useState(null);
  const dispatch = useDispatch();

  const player = useVideoPlayer(fileData, (player) => {
    player.loop = true;
    player.play();
  });

  useEffect(() => {
    setLoading(true);
    const fetchFilePreview = async () => {
      if (fileName && category) {
        try {
          if (category === "images") {
            const response = await previewImage(
              "user123",
              fileName,
              category,
              folder
            );
            setFileData(response);
          } else if (category === "videos") {
            const videoUrl1 = previewVideo(
              "user123",
              category,
              fileName,
              folder
            );
            setFileData(videoUrl1);
          } else if (category === "audios") {
            const audioUrl = previewAudio(
              "user123",
              category,
              fileName,
              folder
            );
            setFileData(audioUrl);
          } else if (category === "documents") {
            const docData = await previewDocument(
              "user123",
              category,
              fileName,
              folder
            );
            setFileData(docData);
          }
        } catch (error) {
          console.error("Error fetching file preview:", error);
        }
      }

      setLoading(false);
    };

    fetchFilePreview();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [fileName, category, folder, sound]);

  const ImagePreview = ({ fileData }) => (
    <View style={styles.imageContainer}>
      <Image
        source={{
          uri: `data:image/jpeg;base64,${fileData.base64Data}`,
        }}
        style={styles.image}
      />
    </View>
  );

  const VideoPreview = ({ player }) => (
    <View style={styles.videoContainer}>
      <VideoView
        style={styles.video}
        player={player}
        shouldPlay
        allowsFullscreen
        allowsPictureInPicture
        fullscreen={true}
        rate={1.0}
        volume={1.0}
        isMuted={false}
        resizeMode="contain"
        contentFit="cover"
      />
    </View>
  );

  const AudioPreview = ({ fileData }) => {
    const [sound, setSound] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const playAudio = async () => {
      try {
        if (sound) {
          await sound.unloadAsync();
          setSound(null);
        }

        const { sound: newSound } = await Audio.Sound.createAsync({
          uri: fileData,
        });

        setSound(newSound);
        await newSound.playAsync();
        setIsPlaying(true);

        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            stopAudio();
          }
        });
      } catch (error) {
        console.error("Error playing audio:", error);
      }
    };

    const stopAudio = async () => {
      try {
        if (sound) {
          await sound.stopAsync();
          await sound.unloadAsync();
          setSound(null);
        }
        setIsPlaying(false);
      } catch (error) {
        console.error("Error stopping audio:", error);
      }
    };

    useEffect(() => {
      return () => {
        if (sound) {
          sound.unloadAsync().catch((error) => {
            console.error("Error unloading audio during cleanup:", error);
          });
        }
      };
    }, [sound]);

    return (
      <View>
        {!isPlaying ? (
          <TouchableOpacity style={styles.audioButton} onPress={playAudio}>
            <Text style={styles.audioButtonText}>Play Audio</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.audioButton} onPress={stopAudio}>
            <Text style={styles.audioButtonText}>Stop Audio</Text>
          </TouchableOpacity>
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
        <View style={styles.center}>
          {loading ? (
            <ActivityIndicator size="large" />
          ) : fileData ? (
            category === "images" ? (
              <ImagePreview fileData={fileData} />
            ) : category === "videos" ? (
              <VideoPreview player={player} />
            ) : category === "audios" ? (
              <AudioPreview fileData={fileData} />
            ) : category === "documents" ? (
              <DocumentPreview fileData={fileData} />
            ) : (
              <NoPreviewAvailable />
            )
          ) : (
            <NoPreviewAvailable />
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
  },
  fileName: {
    fontSize: hp("2.2%"),
    color: colors.textColor3,
    fontFamily: "Montserrat-SemiBold",
  },
  backIconContainer: {
    height: hp("4%"),
    width: hp("4%"),
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    flex: 1,
    aspectRatio: 1,
    resizeMode: "contain",
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
  },
  imageContainer: {
    width: "100%",
    height: "100%",
  },
  videoContainer: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    overflow: "hidden",
  },
  video: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  audioButton: {
    padding: 10,
    backgroundColor: colors.primaryColor,
    borderRadius: 5,
    marginTop: 10,
  },
  audioButtonText: {
    color: colors.white,
    fontSize: hp("2%"),
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
  bottom: {
    height: hp("10%"),
    width: wp("100%"),
  },
});
