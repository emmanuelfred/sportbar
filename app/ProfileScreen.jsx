import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native"; // For navigation
import Header from "../component/Header";

const ProfileScreen = () => {
    const [user, setUser] = useState(null);
    const navigation = useNavigation();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userData = await AsyncStorage.getItem("user");
                if (userData) {
                    setUser(JSON.parse(userData));
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        fetchUserData();
    }, []);

    return (
        <>
        <Header/>
         <View style={styles.container}>
            <Text style={styles.header}>Profile</Text>

            {user ? (
                <View style={styles.profileInfo}>
                    <Text style={styles.label}>Name:</Text>
                    <Text style={styles.value}>{user.name}</Text>

                    <Text style={styles.label}>Staff ID:</Text>
                    <Text style={styles.value}>{user.staffId}</Text>

                    <Text style={styles.label}>Log Name:</Text>
                    <Text style={styles.value}>{user.logName}</Text>
                </View>
            ) : (
                <Text style={styles.loading}>Loading...</Text>
            )}

            {/* Back Button */}
            
        </View>
        </>
       
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#121212", // Dark theme
        padding: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    header: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 20,
    },
    profileInfo: {
        backgroundColor: "#1e1e1e",
        padding: 20,
        borderRadius: 10,
        width: "100%",
        alignItems: "center",
    },
    label: {
        fontSize: 18,
        color: "#bbb",
        marginTop: 10,
    },
    value: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#fff",
    },
    loading: {
        fontSize: 18,
        color: "#ccc",
    },

});

export default ProfileScreen;
