import React, { useEffect } from "react";
import { View, Text, ActivityIndicator, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router"; // For navigation

const LogoutScreen = () => {
  const router = useRouter(); // Hook for navigation

  useEffect(() => {
    const handleLogout = async () => {
      try {
        // Fetch stored user data
        const userData = await AsyncStorage.getItem("user");
        if (!userData) {
          Alert.alert("Error", "No user data found.");
          router.replace("/SaleLogin");
          return;
        }

        const user = JSON.parse(userData);

        // Send request to update login_status in the database
        const response = await fetch("https://thesportsbar.com.ng/sport/logout.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sale_person_id: user.staff_id }), // ✅ Use staff_id
        });

        const result = await response.json();

        if (result.success) {
          // Clear stored user data and cart
          await AsyncStorage.removeItem("cart");
          await AsyncStorage.removeItem("user");

          // Redirect to the login or index page
          router.replace("/"); // Change this to "/index" if needed
        } else {
          Alert.alert("Error", result.message || "Failed to log out.");
          router.replace("/Dashboard");
        }
      } catch (error) {
        console.error("Logout Error:", error);
        Alert.alert("Error", "Failed to connect to the server.");
        router.replace("/Dashboard");
      }
    };

    handleLogout();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 18, marginBottom: 10 }}>Logging out...</Text>
      <ActivityIndicator size="large" color="blue" />
    </View>
  );
};

export default LogoutScreen;
