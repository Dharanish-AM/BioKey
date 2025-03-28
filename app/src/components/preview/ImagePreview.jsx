import React, { useState, useEffect } from "react";
import { Image, View, ActivityIndicator } from "react-native";
import { ImageZoom } from "@likashefqet/react-native-image-zoom";

export default function ImagePreview({ fileData }) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <View style={{ width: "100%", height: "100%" }}>
      <ImageZoom
        uri={fileData || ""}
        style={{ flex: 1 }}
        onLoadStart={() => setIsLoading(true)}
        onLoad={() => setIsLoading(false)}
        isPanEnabled={false}
      />
      {isLoading && (
        <ActivityIndicator
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
          }}
          size="large"
        />
      )}
    </View>
  );
}
