import { useEffect, useState } from "react";
import { BackHandler, Alert } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const useBackButtonHandler = () => {
  const router = useRouter();
  const [lastPress, setLastPress] = useState(0);
  const [user, setUser] = useState(null); // Holds user data

  useEffect(() => {
    checkUserLogin();
  }, []);

  const checkUserLogin = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        setUser(JSON.parse(userData)); // Set user state if logged in
      }
    } catch (error) {
      console.error("Error checking user login:", error);
    }
  };

  useEffect(() => {
    const onBackPress = () => {
      const now = Date.now();
      const targetScreen = user ? "/Dashboard" : "/Customer"; // If logged in, go to Dashboard, else Customer

      if (router.pathname !== targetScreen) {
        router.replace(targetScreen);
        return true; // Prevent default behavior
      }

      if (now - lastPress < 2000) {
        Alert.alert("Exit App", "Do you want to exit?", [
          { text: "Cancel", style: "cancel" },
          { text: "Exit", onPress: () => BackHandler.exitApp() },
        ]);
      } else {
        setLastPress(now);
      }

      return true;
    };

    BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => BackHandler.removeEventListener("hardwareBackPress", onBackPress);
  }, [router, lastPress, user]); // Depend on user state

  return null;
};

export default useBackButtonHandler;
