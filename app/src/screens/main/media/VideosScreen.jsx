import { View, Text, FlatList, ActivityIndicator, Image } from "react-native";
import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchFilesByCategory } from "../../../services/fileOperations";
import { shallowEqual } from "react-redux";

export default function VideosScreen() {
  const fetchOnceRef = useRef(false);
  const dispatch = useDispatch();

  const { videos, loading, error } = useSelector(
    (state) => ({
      videos: state.files.videos,
      loading: state.loading,
      error: state.error,
    }),
    shallowEqual
  );

  useEffect(() => {
    if (fetchOnceRef.current) return;
    fetchOnceRef.current = true;

    const fetchData = async () => {
      await fetchFilesByCategory("user123", "videos", dispatch);
    };

    fetchData();
  }, [dispatch]);

  const renderItem = ({ item }) => (
    <View style={{ marginBottom: 20 }}>
      {item.thumbnail ? (
        <Image
          source={{ uri: item.thumbnail }}
          style={{ width: 100, height: 100, borderRadius: 10 }}
        />
      ) : (
        <Text>No Thumbnail Available</Text>
      )}
      <Text>{item.fileName}</Text>
      <Text>{`Size: ${item.size}`}</Text>
      <Text>{`Created At: ${item.createdAt}`}</Text>
    </View>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (error) {
    return <Text>Error: {error}</Text>;
  }

  return (
    <View>
      <Text>VideosScreen</Text>
      {videos && videos.length > 0 ? (
        <FlatList
          data={videos}
          renderItem={renderItem}
          keyExtractor={(item) => item.fileName}
        />
      ) : (
        <Text>No videos found</Text>
      )}
    </View>
  );
}
