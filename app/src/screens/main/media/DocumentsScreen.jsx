import { View, Text, FlatList, ActivityIndicator } from "react-native";
import React, { useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchFilesByCategory } from "../../../services/fileOperations";
import { shallowEqual } from "react-redux";

export default function DocumentsScreen() {
  const fetchOnceRef = useRef(false);
  const dispatch = useDispatch();

  const { documents, loading, error } = useSelector(
    (state) => ({
      documents: state.files.documents,
      loading: state.loading,
      error: state.error,
    }),
    shallowEqual
  );

  useEffect(() => {
    if (fetchOnceRef.current) return;
    fetchOnceRef.current = true;

    const fetchData = async () => {
      await fetchFilesByCategory("user123", "documents", dispatch);
    };

    fetchData();
  }, [dispatch]);

  const renderItem = ({ item }) => (
    <View style={{ marginBottom: 20 }}>
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
      <Text>DocumentsScreen</Text>
      {documents && documents.length > 0 ? (
        <FlatList
          data={documents}
          renderItem={renderItem}
          keyExtractor={(item) => item.fileName}
        />
      ) : (
        <Text>No files found</Text>
      )}
    </View>
  );
}
