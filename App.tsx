import React from "react";
import { SafeAreaView, StatusBar, StyleSheet } from "react-native";
import { PlayScreen } from "./src/screens/PlayScreen";

export default function App() {
  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" />
      <PlayScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0a1710" },
});
