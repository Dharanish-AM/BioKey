import { View, Text, FlatList, ActivityIndicator, Image } from "react-native";
import React, { useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchFilesByCategory } from "../../../services/fileOperations";
import { shallowEqual } from "react-redux";

export default function AudiosScreen() {
  const fetchOnceRef = useRef(false);
  const dispatch = useDispatch();

  const { audios, loading, error } = useSelector(
    (state) => ({
      audios: state.files.audios,
      loading: state.loading,
      error: state.error,
    }),
    shallowEqual
  );

  useEffect(() => {
    if (fetchOnceRef.current) return;
    fetchOnceRef.current = true;

    const fetchData = async () => {
      await fetchFilesByCategory("user123", "audios", dispatch);
    };

    fetchData();
  }, [dispatch]);

  const renderItem = ({ item }) => {
    // If no thumbnail exists for audio, use a default icon
    const thumbnailUrl = item.thumbnail || "https://via.placeholder.com/100"; // Fallback URL for audio

    return (
      <View style={{ marginBottom: 20 }}>
        <Image
          source={{ uri: thumbnailUrl }}
          style={{ width: 100, height: 100, borderRadius: 10 }}
        />
        <Text>{item.fileName}</Text>
        <Text>{`Size: ${item.size}`}</Text>
        <Text>{`Created At: ${item.createdAt}`}</Text>
      </View>
    );
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (error) {
    return <Text>Error: {error}</Text>;
  }

  return (
    <View>
      <Text>AudiosScreen</Text>
      {audios && audios.length > 0 ? (
        <FlatList
          data={audios}
          renderItem={renderItem}
          keyExtractor={(item) => item.fileName}
        />
      ) : (
        <Text>No files found</Text>
      )}
    </View>
  );
}
