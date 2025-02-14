import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import React, { useEffect, useState } from 'react';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import colors from '../../../constants/colors';
import Entypo from '@expo/vector-icons/Entypo';
import { SafeAreaView } from 'react-native-safe-area-context';
import moment from 'moment';
import { getNotifications } from '../../../services/userOperations';
import { useSelector } from 'react-redux';

const formatDate = (date) => moment(date).format("MMM DD, YYYY ddd").toUpperCase();

export default function Notifications({ navigation }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);


  const userId = useSelector((state) => state.user.userId);
  const token = useSelector((state) => state.auth.token);

  const fetchNotifications = async () => {
    if (!userId || !token) return;

    setLoading(true);
    try {
      const response = await getNotifications(userId, token);
      setNotifications(response || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, [userId, token]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Entypo name="chevron-thin-left" size={hp("4%")} color={colors.textColor3} />
          </TouchableOpacity>
          <Text style={styles.headerText}>Notifications</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={styles.loading} />
        ) : notifications.length === 0 ? (
          <View style={styles.noNotificationsContainer}>
            <Text style={styles.noNotificationsText}>No Notifications</Text>
          </View>
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.section}>
                <Text style={styles.dateHeader}>{formatDate(item.date)}</Text>
                <View key={item._id} style={styles.notificationContainer}>
                  <View style={styles.notiLeft}>
                    <View style={styles.notiDot} />
                  </View>
                  <View style={styles.notiRight}>
                    <Text style={styles.notiHeader}>{item.title}</Text>
                    <Text style={styles.notiContent}>{item.message}</Text>
                  </View>
                </View>
              </View>
            )}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
            style={{ paddingHorizontal: wp("5%"), flexGrow: 1 }}
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
