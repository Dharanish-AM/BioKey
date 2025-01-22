import { View, Text, StyleSheet } from "react-native";
import React from "react";
import colors from "../../constants/colors";

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}></View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondaryColor1,
    alignItems: "center",
    justifyContent: "center",
  },
  innerContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
  },
})
