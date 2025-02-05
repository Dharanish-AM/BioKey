import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import colors from "../../../constants/colors";

export default function MapViewComponent({}) {
  const [region, setRegion] = useState({
    latitude: 20.5937,
    longitude: 78.9629,
    latitudeDelta: 40,
    longitudeDelta: 40,
  });

  const [loading, setLoading] = useState(true);
  const [mapType, setMapType] = useState("standard");

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status === "granted") {
          const lastKnownLocation = await Location.getLastKnownPositionAsync();
          if (lastKnownLocation) {
            const { latitude, longitude } = lastKnownLocation.coords;
            updateRegion(latitude, longitude, 0.0922, 0.0421);
          } else {
            await getCurrentLocation();
          }
        } else {
          Alert.alert("Permission Denied", "Location permission is required.");
        }
      } catch (error) {
        console.error("Error during location fetching:", error);
        Alert.alert(
          "Error",
          "Unable to fetch location. Showing default region."
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 5000,
      });
      const { latitude, longitude } = location.coords;
      updateRegion(latitude, longitude, 0.0922, 0.0421);
    } catch (error) {
      console.error("Error fetching current location:", error);
      Alert.alert(
        "Error",
        "Unable to fetch current location. Showing default region."
      );
    }
  };

  const updateRegion = (latitude, longitude, latitudeDelta, longitudeDelta) => {
    setRegion({
      latitude,
      longitude,
      latitudeDelta,
      longitudeDelta,
    });
  };

  const toggleMapType = () => {
    setMapType((prevType) =>
      prevType === "standard" ? "satellite" : "standard"
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <MapView
          style={styles.map}
          region={region}
          showsUserLocation={true}
          showsMyLocationButton={false}
          showsCompass={true}
          zoomControlEnabled={true}
          zoomEnabled={true}
          scrollEnabled={true}
          rotateEnabled={true}
          loadingEnabled={true}
          loadingIndicatorColor="blue"
          loadingBackgroundColor="white"
          mapType={mapType}
          onRegionChangeComplete={(newRegion) => setRegion(newRegion)}
          showsTraffic={false}
          showsIndoors={true}
          showsBuildings={true}
        >
          <Marker
            coordinate={{
              latitude: region.latitude,
              longitude: region.longitude,
            }}
            title="Your Location"
            description="This is your current or last known location."
          ></Marker>
        </MapView>
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text>Fetching location...</Text>
          </View>
        )}

        <TouchableOpacity style={styles.mapTypeButton} onPress={toggleMapType}>
          <MaterialIcons
            name={mapType === "standard" ? "satellite" : "map"}
            size={24}
            color="white"
          />
          <Text style={styles.buttonText}>
            {mapType === "standard" ? "Satellite" : "Standard"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.locationButton}
          onPress={getCurrentLocation}
        >
          <MaterialIcons name="my-location" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondaryColor1,
  },
  innerContainer: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  mapTypeButton: {
    position: "absolute",
    bottom: 80,
    right: 20,
    backgroundColor: colors.primaryColor,
    padding: 10,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  locationButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: colors.primaryColor,
    padding: 10,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    marginLeft: 5,
  },
});
