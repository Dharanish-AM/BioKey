import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import colors from '../../../constants/colors'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Entypo from '@expo/vector-icons/Entypo';

const activityData = [
  {
    id: '1',
    type: 'login',
    date: 'Feb 02, 2025, 3:45 PM',
    device: 'iPhone 13, Safari',
    location: 'Chennai, India',
    ip: '192.168.1.2',
  },
  {
    id: '2',
    type: 'failed-login',
    date: 'Feb 01, 2025, 9:15 AM',
    device: 'Windows 10, Chrome',
    location: 'Unknown Location',
    ip: '103.21.34.12',
  },
  {
    id: '3',
    type: 'new-device',
    date: 'Jan 30, 2025, 5:30 PM',
    device: 'Samsung Galaxy S23',
    location: 'Bangalore, India',
    ip: '110.34.23.56',
  },
  {
    id: '4',
    type: 'failed-login',
    date: 'Jan 29, 2025, 10:00 AM',
    device: 'MacBook Air, Safari',
    location: 'Mumbai, India',
    ip: '203.45.67.89',
  },
]

export default function ActivityLogs({navigation}) {
  const renderItem = ({ item }) => {
    let typeColor;
    let typeText;

    switch (item.type) {
      case 'login':
        typeColor = "#2ecc71";
        typeText = 'Login Successful';
        break;
      case 'failed-login':
        typeColor = "#e74c3c";
        typeText = 'Failed Login Attempt';
        break;
      case 'new-device':
        typeColor = "#3498db";
        typeText = 'New Device Detected';
        break;
      case 'logout':
        typeColor = colors.textColor3;
        typeText = 'Logout';
        break;
      default:
        typeColor = colors.textColor3;
        typeText = 'Unknown Action';
        break;
    }

    return (
      <View style={styles.activityItem}>
        <Text style={styles.dateText}>{item.date}</Text>
        <Text style={styles.deviceText}>{item.device}</Text>
        <Text style={styles.locationText}>{item.location}</Text>
        <Text style={styles.ipText}>{item.ip}</Text>
        <Text style={[styles.typeText, { color: typeColor }]}>
          {typeText}
        </Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Entypo name="chevron-thin-left" size={hp("4%")} color={colors.textColor3} />
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
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondaryColor1,
  },
  innerContainer: {
    flex: 1,
    alignItems: 'center'
  },
  header: {
    fontSize: hp("3.5%"),
    color: colors.textColor3,
    width: wp("100%"),
    paddingHorizontal: wp("3%"),
    flexDirection: "row",
    alignItems: 'center',
    marginBottom: hp("2%")
  },
  headerText: {
    fontSize: hp("3.5%"),
    color: colors.textColor3,
    fontFamily: 'Afacad-SemiBold',
    marginLeft: wp("1%")
  },
  activityList: {
    flexGrow: 1,
    width: wp('100%'),
    paddingHorizontal: wp('5%'),
  },
  activityItem: {
    backgroundColor: colors.lightColor1,
    padding: hp('2%'),
    marginBottom: hp("1.5%"),
    borderRadius: hp("1%"),
    width: "100%"
  },
  dateText: {
    fontSize: hp("2%"),
    color: colors.textColor1,
    fontFamily: "Afacad-Regular"
  },
  deviceText: {
    fontSize: hp("2%"),
    marginTop: hp("1%"),
    fontFamily: "Afacad-Medium",
    color: colors.textColor3
  },
  locationText: {
    fontSize: hp("1.9%"),
    color: colors.textColor2,
    marginTop: 5,
    fontFamily: "Afacad-Regular"
  },
  ipText: {
    fontSize: hp("1.9%"),
    color: '#888',
    marginTop: 5,
    fontFamily: "Afacad-Regular"
  },
  typeText: {
    fontSize: hp("2%"),
    fontWeight: 'bold',
    marginTop: 5,
    fontFamily: "Afacad-Medium"
  },
})
