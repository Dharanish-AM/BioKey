import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Callout, Marker } from 'react-native-maps';
import Entypo from '@expo/vector-icons/Entypo';
import colors from '../../../constants/colors';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { useDispatch, useSelector } from 'react-redux';
import { getActivityLogs } from '../../../services/userOperations';

export default function ActivityLogs({ navigation }) {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(0.02);
  const [refreshing, setRefreshing] = useState(false);

  const dispatch = useDispatch();
  const userId = useSelector((state) => state.user.userId);
  const token = useSelector((state) => state.auth.token);
  const activityLogs = useSelector((state) => state.user.activityLogs);


  const fetchActivityLogs = async () => {
    if (userId && token) {
      setRefreshing(true);
      await getActivityLogs(userId, token, dispatch);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchActivityLogs();
  }, [userId, token, dispatch]);

  const onRefresh = () => {
    fetchActivityLogs();
  };

  const handleDeleteLog = (logId) => {
    console.log(logId)
  }

  const renderItem = ({ item }) => {
    let typeColor, typeText;
    switch (item.status) {
      case 'Success':
        typeColor = '#2ecc71';
        typeText = 'Login Successful';
        break;
      case 'Failed':
        typeColor = '#e74c3c';
        typeText = 'Failed Login Attempt';
        break;
      default:
        typeColor = colors.textColor3;
        typeText = 'Unknown Action';
        break;
    }

    const formattedDate = new Date(item.date).toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });


    return (

      <View style={styles.activityItem}>
        <View style={styles.row}>
          <Text style={styles.dateText}>{formattedDate}</Text>
          <Text style={[styles.typeText, { color: typeColor }]}>{typeText}</Text>
        </View>
        <Text style={styles.deviceText}>{item.deviceName}</Text>
        <Text style={styles.locationText}>{`${item.location.district}, ${item.location.region}`}</Text>
        <View style={styles.row}>
          <Text style={styles.ipText}>{item.ipAddress}</Text>
          <TouchableOpacity onPress={() => setSelectedLocation(item)}>
            <Text style={styles.viewLocationText}>View Location</Text>
          </TouchableOpacity>
        </View>
      </View >

    );
  };

  if (selectedLocation) {
    const latitude = parseFloat(selectedLocation?.latitude) || 0;
    const longitude = parseFloat(selectedLocation?.longitude) || 0;

    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: hp("6%"),
            left: wp("3%"),
            zIndex: 3
          }}
          onPress={() => setSelectedLocation(null)}
        >
          <Entypo name="chevron-thin-left" size={hp('4%')} color={colors.textColor3} />
        </TouchableOpacity>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude,
            longitude,
            latitudeDelta: zoomLevel,
            longitudeDelta: zoomLevel,
          }}
          zoomEnabled={true}
          showsUserLocation={true}
          zoomTapEnabled={true}
        >
          <Marker coordinate={{ latitude, longitude }}>
            <Callout>
              <View style={styles.markerInfo}>
                <Text style={styles.markerHeader}>Activity Location</Text>
                <Text style={styles.makerText}>{`${selectedLocation?.location.district}, ${selectedLocation?.location.region}`}</Text>
                <Text>{selectedLocation?.deviceName}</Text>
                <Text>{selectedLocation?.ipAddress}</Text>
                <Text>{new Date(selectedLocation?.date).toLocaleString()}</Text>
              </View>
            </Callout>
          </Marker>
        </MapView>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Entypo name="chevron-thin-left" size={hp('4%')} color={colors.textColor3} />
          </TouchableOpacity>
          <Text style={styles.headerText}>Activity Logs</Text>
        </View>
        {activityLogs.length === 0 ? (
          <Text style={styles.noLogsText}>No activity logs found.</Text>
        ) : (
          <FlatList
            data={activityLogs}
            renderItem={renderItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.activityList}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondaryColor1,
    position: "relative"
  },
  innerContainer: {
    flex: 1,
    alignItems: 'center',
  },
  header: {
    width: wp('100%'),
    paddingHorizontal: wp('3%'),
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('2%'),
  },
  headerText: {
    fontSize: hp('3.5%'),
    color: colors.textColor3,
    fontFamily: 'Afacad-SemiBold',
    marginLeft: wp('1%'),
  },
  activityList: {
    flexGrow: 1,
    width: wp('100%'),
    paddingHorizontal: wp('5%'),
  },
  activityItem: {
    backgroundColor: colors.lightColor1,
    paddingHorizontal: hp('2%'),
    paddingVertical: hp('1.7%'),
    marginBottom: hp('1.5%'),
    borderRadius: hp('1%'),
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: hp('2%'),
    color: colors.textColor1,
    fontFamily: 'Afacad-Regular',
  },
  deviceText: {
    fontSize: hp('2%'),
    marginTop: hp('1%'),
    fontFamily: 'Afacad-Medium',
    color: colors.textColor3,
  },
  locationText: {
    fontSize: hp('1.9%'),
    color: colors.textColor2,
    marginTop: 5,
    fontFamily: 'Afacad-Regular',
  },
  ipText: {
    fontSize: hp('1.9%'),
    color: '#888',
    marginTop: 5,
    fontFamily: 'Afacad-Regular',
  },
  typeText: {
    fontSize: hp('2%'),
    fontWeight: 'bold',
    fontFamily: 'Afacad-Medium',
  },
  viewLocationText: {
    color: '#9366E2',
    fontFamily: 'Afacad-Medium',
    fontSize: hp('2%'),
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  markerInfo: {
    flexDirection: "column",
    padding: hp("0.5%")
  },
  markerHeader: {
    fontSize: hp("2%"),
    fontWeight: "bold",
    marginBottom: hp("1%")
  }
});
