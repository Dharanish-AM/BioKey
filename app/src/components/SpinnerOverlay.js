import React from "react";
import { StyleSheet, View } from "react-native";
import Spinner from "react-native-loading-spinner-overlay";
import LottieView from "lottie-react-native";

import LoadingAnimtion from "../assets/animations/loading.json";

const SpinnerOverlay = ({ visible }) => {
  return (
    <Spinner visible={visible} overlayColor="rgba(0, 0, 0, 0.7)" cancelable>
      <View style={styles.spinnerContainer}>
        <LottieView
          source={LoadingAnimtion}
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
  },
  spinnerAnimation: {
    width: "60%",
    height: "60%",
  },
});

export default SpinnerOverlay;
