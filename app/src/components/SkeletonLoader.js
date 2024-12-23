import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, Dimensions } from "react-native";
import colors from "../constants/colors";
import { Easing } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const SkeletonLoader = ({
  visible = true,
  boxHeight = 20,
  boxWidth = "90%",
  shimmerSpeed = 1500,
  borderRadius = hp("1.5%"),
}) => {
  const shimmerAnimation = useRef(new Animated.Value(0)).current;
  const screenWidth = Dimensions.get("window").width;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnimation, {
        toValue: 1,
        duration: shimmerSpeed,
        useNativeDriver: true,
        easing: Easing.ease,
      })
    ).start();
  }, [shimmerSpeed]);

  const shimmerTranslate = shimmerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-screenWidth, screenWidth],
  });

  if (!visible) {
    return null;
  }

  return (
    <View
      style={[
        styles.skeletonBox,
        {
          height: boxHeight,
          width: boxWidth === "random" ? `${60}%` : boxWidth,
          borderRadius: borderRadius,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.shimmerOverlay,
          { transform: [{ translateX: shimmerTranslate }] },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  skeletonBox: {
    backgroundColor: colors.textColor2,
    opacity: 0.1,
    borderRadius: hp("1.5%"),
    overflow: "hidden",
  },
  shimmerOverlay: {
    height: "100%",
    width: "100%",
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
});

export default SkeletonLoader;