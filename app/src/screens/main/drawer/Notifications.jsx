import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Animated,
  LayoutAnimation,
  UIManager,
  Platform
} from "react-native";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import colors from "../../../constants/colors";
import Entypo from "@expo/vector-icons/Entypo";
import { SafeAreaView } from "react-native-safe-area-context";
import moment from "moment";
import { clearNotification, getNotifications } from "../../../services/userOperations";
import { useSelector } from "react-redux";
import SwipeableItem from "react-native-swipeable-item";

const formatDate = (date) =>
  date ? moment(date).format("MMM DD, ddd  hh:mm A") : "UNKNOWN DATE";


if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

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

      const sortedNotifications = (response || []).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );


      setNotifications(sortedNotifications);
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

  const handleDeleteNotification = useCallback(async (item) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setNotifications((prev) => prev.filter((noti) => noti._id !== item._id));

    try {
      const response = await clearNotification(userId, item._id, false, token);
      if (!response.success) {
        fetchNotifications();
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
      fetchNotifications();
    }
  }, [userId, token]);

  const renderItem = ({ item }) => {
    return (
      <SwipeableItem
        key={item._id}
        item={item}
        onChange={({ openDirection }) => {
          if (openDirection === "right") {
            handleDeleteNotification(item);
          }
        }}
        snapPointsRight={[wp("100%")]}
        activationThreshold={0.8}
      >
        <View style={styles.section}>
          <Text style={styles.dateHeader}>{formatDate(item.createdAt)}</Text>
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
      </SwipeableItem>
    );
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
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
            style={{ paddingHorizontal: wp("5%"), flexGrow: 1 }}
            ListEmptyComponent={() => (
              <Text style={styles.emptyListText}>No new notifications!</Text>
            )}
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
    flexDirection: "row",
    width: wp("100%"),
    paddingHorizontal: wp("3%"),
    alignItems: "center",
    marginBottom: hp("1.5%"),
  },
  headerText: {
    fontSize: hp("3.5%"),
    color: colors.textColor3,
    fontFamily: "Afacad-SemiBold",
    marginLeft: wp("1.5%"),
  },
  section: {
    flexGrow: 1,
    marginTop: hp("2%"),
    width: wp("100%") - wp("10%"),
  },
  dateHeader: {
    fontSize: hp("2.2%"),
    fontFamily: "Afacad-Regular",
    color: colors.textColor2,
  },
  notificationContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    padding: hp("2%"),
    borderRadius: 10,
  },
  notiLeft: {
    alignItems: "center",
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
    fontFamily: "Afacad-Medium",
  },
  notiContent: {
    fontSize: hp("2.1%"),
    color: colors.textColor2,
    fontFamily: "Afacad-Regular",
  },
  hiddenContainer: {
    backgroundColor: colors.secondaryColor1,
    height: "100%",
    width: wp("100%"),
    position: "absolute",
    right: 0,
  },
  emptyListText: {
    fontSize: hp("2.5%"),
    color: colors.textColor2,
    fontFamily: "Afacad-Italic",
    marginTop: hp("35%"),
  },
});
