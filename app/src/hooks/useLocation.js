import { useState, useEffect } from "react";
import * as Location from "expo-location";
import * as Device from "expo-device";

const useLocation = () => {
    const [date, setDate] = useState(new Date().toLocaleString());
    const [deviceName] = useState(Device.modelName);
    const [ip, setIp] = useState(null);
    const [location, setLocation] = useState({
        latitude: null,
        longitude: null,
        district: null,
        region: null,
        country: null,
    });

    useEffect(() => {
        const fetchData = async () => {
            try {

                const ipResponse = await fetch("https://api64.ipify.org?format=json");
                const ipData = await ipResponse.json();
                setIp(ipData.ip);


                const locationResponse = await fetch(`https://ipapi.co/${ipData.ip}/json/`);
                const locationData = await locationResponse.json();

                setLocation((prev) => ({
                    ...prev,
                    latitude: locationData.latitude,
                    longitude: locationData.longitude,
                    district: locationData.city,
                    region: locationData.region,
                    country: locationData.country_name,
                }));
            } catch (error) {
                console.error("Error fetching IP location:", error);
            }

            try {

                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== "granted") {
                    console.warn("Location permission denied. Using IP-based location.");
                    return;
                }

                const loc = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.High,
                });

                const { latitude, longitude } = loc.coords;


                const reverseGeocode = await Location.reverseGeocodeAsync({ latitude, longitude });

                if (reverseGeocode.length > 0) {
                    const place = reverseGeocode[0];
                    setLocation({
                        latitude,
                        longitude,
                        district: place.city || place.subregion || location.district,
                        region: place.region || location.region,
                        country: place.country || location.country,
                    });
                }
            } catch (error) {
                console.error("Error fetching GPS location:", error);
            }
        };

        fetchData();
    }, []);

    return { date, deviceName, ip, location };
};

export default useLocation;
