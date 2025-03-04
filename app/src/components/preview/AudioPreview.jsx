import React, { useState, useEffect } from "react";
import { Audio } from "expo-av";
import { View, TouchableOpacity, Image, Text, ActivityIndicator, StyleSheet } from "react-native";
import Slider from "@react-native-community/slider";
import PlayButtonIcon from "../../assets/images/play-button.png";
import PauseButtonIcon from "../../assets/images/pause-icon.png";
import { useFocusEffect } from "@react-navigation/native";
import colors from "../../constants/colors";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import HeadPhoneIcon from "../../assets/images/headphone-big.png";

export default function AudioPreview({ fileData, thumbnail }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState(null);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let newSound;

    const loadAudio = async () => {
      try {
        if (!fileData) {
          console.warn("No fileData provided");
          return;
        }
        console.log("Loading audio file:", fileData);

        const { sound } = await Audio.Sound.createAsync(
          { uri: fileData },
          { shouldPlay: true },
          updateStatus
        );
        newSound = sound;
        setSound(sound);
        setIsLoaded(true);
        sound.setOnPlaybackStatusUpdate(updateStatus);
      } catch (error) {
        console.error("Error loading audio:", error);
      }
    };

    loadAudio();

    return () => {
      if (newSound) {
        console.log("Unloading audio...");
        newSound.unloadAsync().catch((error) => console.error("Error unloading audio:", error));
      }
    };
  }, [fileData]);

  useEffect(() => {
    const getPermissions = async () => {
      const { status } = await Audio.requestPermissionsAsync();
      console.log("Audio Permission Status:", status);
      if (status !== "granted") {
        console.warn("Permission to access audio is required!");
      }
    };
    getPermissions();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        if (sound) {
          console.log("Stopping audio on screen unfocus...");
          sound.stopAsync().catch((error) => console.error("Error stopping audio:", error));
        }
      };
    }, [sound])
  );

  const updateStatus = (status) => {
    if (status.isLoaded) {
      setDuration(status.durationMillis || 0);
      setPosition(status.positionMillis || 0);
      setIsPlaying(status.isPlaying);
    } else if (status.error) {
      console.error("Audio playback error:", status.error);
    }
  };

  const playAudio = async () => {
    try {
      if (sound) {
        const status = await sound.getStatusAsync();
        if (!status.isLoaded) {
          console.error("Audio is not loaded.");
          return;
        }
        console.log("Playing audio...");
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
        console.log("Pausing audio...");
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
    <View style={styles.container}>
      <View style={styles.thumbnailContainer}>
        {thumbnail ? (
          <Image source={{ uri: thumbnail }} style={styles.thumbnail} onError={(e) => console.error("Thumbnail failed to load", e)} />
        ) : (
          <Image source={HeadPhoneIcon} style={styles.headphone} />
        )}
      </View>

      <View style={styles.controlsContainer}>
        <Slider
          value={position}
          minimumValue={0}
          maximumValue={duration}
          style={styles.slider}
          onSlidingComplete={handleSlidingComplete}
          disabled={!isLoaded}
          minimumTrackTintColor={colors.primaryColor}
        />
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(position)}</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
        <View style={styles.playPauseContainer}>
          {isPlaying ? (
            <TouchableOpacity onPress={pauseAudio}>
              <Image source={PauseButtonIcon} style={styles.playPauseButton} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={playAudio}>
              <Image source={PlayButtonIcon} style={styles.playPauseButton} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      {!isLoaded && <ActivityIndicator size="large" style={styles.activityIndicator} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.secondaryColor2,
  },
  thumbnailContainer: {
    width: "90%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  headphone: {
    tintColor: colors.textColor2,
    width: wp("30%"),
    aspectRatio: 1,
    height: hp("30%")
  },
  thumbnail: {
    aspectRatio: 1,
    resizeMode: "contain",
    borderRadius: hp("2%"),
    width: "100%",
    height: "100%"
  },
  controlsContainer: {
    width: "90%",
    alignItems: "center",
    marginTop: hp("3%"),
  },
  slider: {
    width: "100%",
    height: hp("2%"),
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: hp("1%"),
  },
  timeText: {
    fontSize: hp("2%"),
    color: colors.textColor2,
    fontFamily: "Afacad-Regular",
  },
  playPauseContainer: {
    marginTop: hp("3%"),
    justifyContent: "center",
    alignItems: "center",
  },
  playPauseButton: {
    width: hp("7%"),
    height: hp("7%"),
    tintColor: colors.textColor3,
  },
  activityIndicator: {
    position: "absolute",
    top: "50%",
    left: "50%",
  },
});
