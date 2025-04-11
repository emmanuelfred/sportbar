import { View, StyleSheet, SafeAreaView } from "react-native";
import React, { useState } from "react";
import Menu from "../component/Menu";
import Header from "../component/Header";

import { useRouter } from "expo-router";
import useBackButtonHandler from "../component/useBackButtonHandler";
function Dashboard() {
  const router = useRouter();
useBackButtonHandler();

  

  return (
    <SafeAreaView style={styles.container}>
      
      <Header />
     
      <Menu/>{/* Re-renders when refreshKey changes */}
    </SafeAreaView>
  );
}

export default Dashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 10,
  }
});
