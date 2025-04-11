import { View, StyleSheet, SafeAreaView } from "react-native";
import React from "react";


import Menu from "../component/Menu";


function Customer() {


  return (
    <SafeAreaView style={styles.container}>
    {/* Wrap MenuScreen with ErrorBoundary */}
        <Menu/>
    
    </SafeAreaView>
  );
}

export default Customer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 10,
  },
});
