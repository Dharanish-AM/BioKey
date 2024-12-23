import React, { useEffect } from "react";
import { View, StyleSheet, Text } from "react-native";
import Spinner from "react-native-loading-spinner-overlay";
import { heightPercentageToDP } from "react-native-responsive-screen";
import LottieView from "lottie-react-native";

import Animation from "../assets/animations/loading-2.json";

const SpinnerOverlay2 = ({ visible }) => {
  return (
    <Spinner
      visible={visible}
      textContent="Uploading..."
      textStyle={styles.spinnerTextStyle}
      overlayColor="rgba(0, 0, 0, 0.6)"
      size="large"
    >
      <View style={styles.spinnerContainer}>
        <LottieView
          source={Animation}
          autoPlay
          loop
          style={styles.spinnerAnimation}
        />
      </View>
    </Spinner>
  );
};

const styles = StyleSheet.create({
  spinnerContainer: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    zIndex: 999,
  },
  spinnerAnimation: {
    width: "33%",
    height: "30%",
    zIndex: 1000,
  },
});

export default SpinnerOverlay2;
