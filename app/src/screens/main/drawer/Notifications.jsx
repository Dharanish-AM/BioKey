import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import React from 'react';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import colors from '../../../constants/colors';
import Entypo from '@expo/vector-icons/Entypo';
import { SafeAreaView } from 'react-native-safe-area-context';
import moment from 'moment';

const notifications = [
  {
    date: "2025-02-02",
    data: [
      { id: "1", title: "Storage Almost Full! 🚨", content: "Your storage is 95% full. Free up space now.", type: "warning" },
      { id: "2", title: "Suspicious Activity Detected! ⚠️", content: "We noticed unusual activity on your account.", type: "security" }
    ],
  },
  {
    date: "2025-02-01",
    data: [
      { id: "3", title: "Backup Completed ✅", content: "Your latest backup was successfully completed.", type: "info" }
    ],
  },
  {
    date: "2025-01-29",
    data: [
      { id: "4", title: "New Feature Added! 🎉", content: "Check out the latest update in Biokey.", type: "update" },
    ],
  }
];


const formatDate = (date) => moment(date).format("MMM DD, YYYY ddd").toUpperCase();

export default function Notifications({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Entypo name="chevron-thin-left" size={hp("4%")} color={colors.textColor3} />
          </TouchableOpacity>
          <Text style={styles.headerText}>Notifications</Text>
        </View>

        <FlatList
          data={notifications}
          keyExtractor={(item) => item.date}
          renderItem={({ item }) => (
            <View style={styles.section}>
              <Text style={styles.dateHeader}>{formatDate(item.date)}</Text>

              {item.data.map((noti) => (
                <View key={noti.id} style={styles.notificationContainer}>
                  <View style={styles.notiLeft}>
                    <View style={styles.notiDot} />
                  </View>
                  <View style={styles.notiRight}>
                    <Text style={styles.notiHeader}>{noti.title}</Text>
                    <Text style={styles.notiContent}>{noti.content}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
          style={
            {
              paddingHorizontal: wp("5%"),
              flexGrow: 1
            }
          }
        />
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
    alignItems: "center",
  },
  header: {
    flexDirection: 'row',
    width: wp("100%"),
    paddingHorizontal: wp("3%"),
    alignItems: 'center',
    marginBottom: hp("1.5%")
  },
  headerText: {
    fontSize: hp("3.5%"),
    color: colors.textColor3,
    fontFamily: 'Afacad-SemiBold',
    marginLeft: wp("1.5%"),
  },
  section: {
    flexGrow: 1,
    marginTop: hp("2%"),
    width: wp("100%") - wp("10%"),
  },
  dateHeader: {
    fontSize: hp("2.2%"),
    fontFamily: 'Afacad-Regular',
    color: colors.textColor2,
    marginBottom: hp("1%"),
  },
  notificationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp("2%"),

  },
  notiLeft: {
    alignItems: 'center',
    justifyContent: "center",
    marginRight: wp("3%"),
  },
  notiDot: {
    width: wp("3.5%"),
    height: wp("3.5%"),
    borderRadius: wp("100%"),
    backgroundColor: colors.primaryColor,
  },
  notiRight: {
    flex: 1,
    justifyContent: "space-between",
  },
  notiHeader: {
    fontSize: hp("2.3%"),
    color: colors.textColor3,
    fontFamily: 'Afacad-Medium',
  },
  notiContent: {
    fontSize: hp("2.1%"),
    color: colors.textColor2,
    fontFamily: 'Afacad-Regular',
  },
});
