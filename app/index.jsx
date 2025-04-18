import React, { useEffect, useRef } from "react";
import { View, Image, StyleSheet, TouchableOpacity, Text, Animated } from "react-native";
import { useRouter } from "expo-router"; // ✅ Import useRouter for navigation
import useBackButtonHandler from "../component/useBackButtonHandler";
const HomeScreen = () => {
  const router = useRouter(); // ✅ Get router instance
  const fadeAnim = useRef(new Animated.Value(0)).current; // Fade effect
  const slideAnim = useRef(new Animated.Value(50)).current; // Slide-up effect

  useBackButtonHandler();
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Animated Logo */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <Image source={require("../assets/logo.png")} style={styles.logo} />
      </Animated.View>

      {/* Animated Buttons */}
      <Animated.View style={[styles.btnContainer, { transform: [{ translateY: slideAnim }] }]}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/Customer")} // ✅ Use router.push()
        >
          <Text style={styles.btnText}>Customer</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/SaleLogin")} // ✅ Use router.push()
        >
          <Text style={styles.btnText}>Sale Attendant</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(2, 14, 26, 0.9)", // Gradient-like deep blue background
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: "contain",
    marginBottom: 20,
  },
  btnContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)", // Light transparent overlay
    minHeight: 200,
    width: "90%",
    borderRadius: 12,
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
  button: {
    padding: 16,
    width: "80%",
    borderRadius: 10,
    backgroundColor: "#1e3c72", // Gradient-like dark blue
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2a5298", // Lighter blue border
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
