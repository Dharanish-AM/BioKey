import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import Entypo from '@expo/vector-icons/Entypo';
import colors from '../../../constants/colors';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const activityData = [
  {
    id: '1',
    type: 'login',
    date: 'Feb 02, 2025, 3:45 PM',
    device: 'iPhone 13, Safari',
    location: 'Coimbatore, India',
    latitude: 11.0168,
    longitude: 76.9558,
    ip: '192.168.1.2',
  },
  {
    id: '2',
    type: 'failed-login',
    date: 'Feb 01, 2025, 9:15 AM',
    device: 'Windows 10, Chrome',
    location: 'Pollachi, India',
    latitude: 10.6583,
    longitude: 77.0086,
    ip: '103.21.34.12',
  },
  {
    id: '3',
    type: 'new-device',
    date: 'Jan 30, 2025, 5:30 PM',
    device: 'Samsung Galaxy S23',
    location: 'Coimbatore, India',
    latitude: 11.0224,
    longitude: 76.9373,
    ip: '110.34.23.56',
  },
  {
    id: '4',
    type: 'failed-login',
    date: 'Jan 29, 2025, 10:00 AM',
    device: 'MacBook Air, Safari',
    location: 'Pollachi, India',
    latitude: 10.6601,
    longitude: 77.0021,
    ip: '203.45.67.89',
  },
];

export default function ActivityLogs({ navigation }) {
  const [selectedLocation, setSelectedLocation] = useState(null);

  const renderItem = ({ item }) => {
    let typeColor, typeText;
    switch (item.type) {
      case 'login':
        typeColor = '#2ecc71';
        typeText = 'Login Successful';
        break;
      case 'failed-login':
        typeColor = '#e74c3c';
        typeText = 'Failed Login Attempt';
        break;
      default:
        typeColor = colors.textColor3;
        typeText = 'Unknown Action';
        break;
    }

    return (
      <View style={styles.activityItem}>
        <View style={styles.row}>
          <Text style={styles.dateText}>{item.date}</Text>
          <Text style={[styles.typeText, { color: typeColor }]}>{typeText}</Text>
        </View>
        <Text style={styles.deviceText}>{item.device}</Text>
        <Text style={styles.locationText}>{item.location}</Text>
        <View style={styles.row}>
          <Text style={styles.ipText}>{item.ip}</Text>
          <TouchableOpacity onPress={() => setSelectedLocation(item)}>
            <Text style={styles.viewLocationText}>View Location</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (selectedLocation) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={{
          position: 'absolute',
          top: hp("6%"),
          left: wp("3%"),
          zIndex: 3
        }} onPress={() => setSelectedLocation(null)}>
          <Entypo name="chevron-thin-left" size={hp('4%')} color={colors.textColor3} />
        </TouchableOpacity>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: selectedLocation.latitude,
            longitude: selectedLocation.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          <Marker
            coordinate={{
              latitude: selectedLocation.latitude,
              longitude: selectedLocation.longitude,
            }}
            title="Activity Location"
            description={selectedLocation.location}
          />
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
        <FlatList
          data={activityData}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.activityList}
        />
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
    fontSize: hp('1.8%'),
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
