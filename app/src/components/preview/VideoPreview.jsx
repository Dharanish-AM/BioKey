import React, { useState, useEffect } from "react";
import { useVideoPlayer, VideoView } from "expo-video";
import { View, ActivityIndicator } from "react-native";
import { useFocusEffect } from '@react-navigation/native';

export default function VideoPreview({ fileData }) {
  const player = useVideoPlayer(fileData, (player) => {
    player.loop = true;
    player.play();
  });

  useFocusEffect(
    React.useCallback(() => {

      return () => {
        if (player && player.pause) {
          player.pause();
        }
      };
    }, [player])
  );

  return (
    <View style={{
      width: "100%",
      height: "100%"
    }}>
      <VideoView
        style={{
          width: "100%",
          height: "100%",
        }}
        player={player}
        shouldPlay
        allowsFullscreen
        allowsPictureInPicture
        fullscreen={true}
        resizeMode="contain"
        contentFit="cover"
        nativeControls={true}
      />
    </View>
  );
}
