import React, { useState, useEffect } from "react";
import { useVideoPlayer, VideoView } from "expo-video";
import { View, ActivityIndicator } from "react-native";
import { useFocusEffect } from '@react-navigation/native';

export default function VideoPreview({ fileData }) {

  const [isLoading, setIsLoading] = useState(true);
  const player = useVideoPlayer(fileData, (player) => {
    player.loop = true;
    player.play();
  });

  useEffect(() => {
    if (player) {
      setIsLoading(false);
    }
  }, [player])

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
      {isLoading && <ActivityIndicator style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
      }} size="large" />}
    </View>
  );
}
