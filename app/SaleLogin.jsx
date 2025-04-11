import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router"; // ✅ Navigation
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useBackButtonHandler from "../component/useBackButtonHandler";
const SaleLogin = () => {
  const router = useRouter(); // ✅ Get navigation function

  const [name, setName] = useState("");
  const [staff_id, setStaff_id] = useState("");
   const [logName, setLogName] = useState("");

  // ✅ Handle Login
  useBackButtonHandler();
  const handleLogin = async () => {
    if (!name || !staff_id || !logName) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
  
    try {
      const response = await fetch("https://thesportsbar.com.ng/sport/sale_login.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, staff_id, log_name: logName }),
      });
  
      const data = await response.json();
      if (data.status === "success") {
        // ✅ Save user info in AsyncStorage
        await AsyncStorage.setItem(
          "user",
          JSON.stringify({ name, staff_id, logName })
        );
  
        Alert.alert("Success", data.message);
        router.push("/Dashboard"); // Navigate to dashboard
      } else {
        Alert.alert("Error", data.message);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to connect to server");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sale Attendant Login</Text>

      {/* Email Input */}
      <TextInput
        style={styles.input}
        placeholder="Name"
        placeholderTextColor="#aaa"
        value={name}
        onChangeText={setName}
       
        autoCapitalize="none"
      />

      {/* Password Input */}
      <TextInput
        style={styles.input}
        placeholder="Staff ID"
        placeholderTextColor="#aaa"
        value={staff_id}
        onChangeText={setStaff_id}
        secureTextEntry
      />
        <View style={styles.pickerContainer}>
          <Picker
              selectedValue={logName}
              onValueChange={(itemValue) => setLogName(itemValue)}
              style={styles.picker}
          >
              <Picker.Item label="Select Area" value="" />
              <Picker.Item label="VIP" value="VIP" />
              <Picker.Item label="Snooker Area" value="Snooker Area" />
              <Picker.Item label="Field" value="Field" />
          </Picker>
        </View>

      {/* Login Button */}
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.btnText}>Sign In</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SaleLogin;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#020e1a",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    backgroundColor: "#1e3c72",
    color: "#fff",
  },
  button: {
    width: "100%",
    padding: 15,
    backgroundColor: "#2a5298",
    borderRadius: 8,
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },
  pickerContainer: {
    width: "100%",
    marginBottom: 15,
    backgroundColor: "#1e3c72",
    borderRadius: 8,
  },
  picker: {
    color: "#fff",
  },
});
