import React, { useState, useEffect } from "react";
import { View, ActivityIndicator, StyleSheet, Text } from "react-native";
import { WebView } from "react-native-webview";

export default function OtherPreview({ name, fileData }) {
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    if (fileData) {
      setLoading(false);
      console.log(fileData)
    }
  }, [fileData]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator style={styles.loader} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: fileData }}
        zoomable={true}
        startInLoadingState={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  loader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -25 }, { translateY: -25 }],
  },
});
