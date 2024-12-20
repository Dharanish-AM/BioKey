import { View, Text, FlatList, ActivityIndicator, Image } from "react-native";
import React, { useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchFilesByCategory } from "../../../services/fileOperations";
import { shallowEqual } from "react-redux";

export default function PhotoScreen() {
  const fetchOnceRef = useRef(false);
  const dispatch = useDispatch();

  const { images, loading, error } = useSelector(
    (state) => ({
      images: state.files.images,
      loading: state.loading,
      error: state.error,
    }),
    shallowEqual
  );

  useEffect(() => {
    if (fetchOnceRef.current) return;
    fetchOnceRef.current = true;

    const fetchData = async () => {
      await fetchFilesByCategory("user123", "images", dispatch);
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
      <Text>PhotoScreen</Text>
      {images && images.length > 0 ? (
        <FlatList
          data={images}
          renderItem={renderItem}
          keyExtractor={(item) => item.fileName}
        />
      ) : (
        <Text>No files found</Text>
      )}
    </View>
  );
}
