import React, { useState, useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import * as FileSystem from "expo-file-system";

const getFileType = (name) => {
  if (name.includes('.pdf')) {
    return 'pdf';
  } else if (name.includes('.doc') || name.includes('.docx')) {
    return 'word';
  } else if (name.includes('.csv')) {
    return 'csv';
  } else if (name.includes('.xlsx')) {
    return 'excel';
  } else if (name.includes('.ppt') || name.includes('.pptx')) {
    return 'ppt';
  } else {
    return 'unknown';
  }
};

export default function OtherPreview({ name, fileData }) {
  const [loading, setLoading] = useState(true);
  const [fileType, setFileType] = useState('');
  const [webViewSource, setWebViewSource] = useState(null);

  useEffect(() => {
    if(!fileData) return;
    console.log(fileData)
  }, [fileData]);

  useEffect(() => {
    const type = getFileType(name);
    setFileType(type);

    const loadSource = async () => {
      let source = await getWebViewSource(fileData);
      setWebViewSource(source);
      setLoading(false); 
    };

    loadSource();
  }, [name, fileData]);

  const getWebViewSource = async(url) => {
    switch (fileType) {
      case 'pdf':
        return { uri: `https://docs.google.com/viewer?url=${url}` };
      case 'word':
        return { uri: `https://docs.google.com/viewer?url=${url}` };
      case 'csv':
        return { uri: url };
      case 'excel':
        return { uri: `https://docs.google.com/spreadsheets/d/e/2PACX-1vRjNYmht1jEXAMPLE/view?usp=sharing` };
      case 'ppt':
      case 'pptx':
        return { uri: `https://docs.google.com/presentation/d/e/2PACX-1vRjNYmht1jEXAMPLE/view?usp=sharing` };
      default:
        return { html: '<h2>Unsupported file type</h2>' };
    }
  };


  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator
          style={styles.loader}
          size="large"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {webViewSource && (
        <WebView
          style={styles.webview}
          source={webViewSource}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  webview: {
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
