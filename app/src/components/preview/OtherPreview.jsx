import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
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
  const [error, setError] = useState(false);
  const [fileContent, setFileContent] = useState('');
  const [fileType, setFileType] = useState('');

  useEffect(() => {
    console.log("name :",name,"file :",fileData)
    const type = getFileType(name);
    setFileType(type);


    if (type === 'unknown') {
      loadTextContent(fileData);
    }
  }, [name, fileData]);

  const loadTextContent = async (uri) => {
    try {
      const fileUri = await FileSystem.readAsStringAsync(uri);
      setFileContent(fileUri);
      setLoading(false);
    } catch (error) {
      setError(true);
      setLoading(false);
    }
  };

  const getWebViewSource = (url) => {
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

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Document Preview: {name || "Unnamed Document"}</Text>
      {loading && !error && <ActivityIndicator size="large" />}
      {error && <Text style={styles.errorText}>Failed to load file.</Text>}

      {!loading && !error && fileType !== 'unknown' && (
        <WebView
          source={getWebViewSource(fileData)}
          style={styles.webview}
        />
      )}

      {!loading && !error && fileType === 'unknown' && (
        <View style={styles.textContainer}>
          <Text style={styles.text}>{fileContent || 'Unable to display this file type.'}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  webview: {
    width: '100%',
    height: '100%',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 16,
    color: 'black',
    textAlign: 'center',
    padding: 10,
  },
});
