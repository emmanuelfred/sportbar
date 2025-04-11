import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Button, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams } from "expo-router";
import Header from "../component/Header";
import { useRouter } from "expo-router";

const SeeOrderScreen = () => {
      const router = useRouter(); 
    const { sale_token } = useLocalSearchParams(); 
    const [orders, setOrders] = useState([]);
    const [orderDetails, setOrderDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [attendant, setAttendant] = useState(""); // Store attendant name
    const [staff_id, setStaff_id] = useState("");

    useEffect(() => {
        fetchUserDetails(); // Get attendant from local storage
        if (sale_token) {
            fetchOrderDetails();
        }
    }, [sale_token]);

    const fetchUserDetails = async () => {
        try {
            const userData = await AsyncStorage.getItem("user");
            if (userData) {
                const parsedUser = JSON.parse(userData);
                setAttendant(parsedUser.name); // Set the attendant's name
                setStaff_id(parsedUser.staff_id)
            }
        } catch (error) {
            console.error("Error fetching user details:", error);
        }
    };

    const fetchOrderDetails = async () => {
        try {
            
    
            const response = await fetch(`https://thesportsbar.com.ng/sport/get_order.php?sale_token=${sale_token}`);
            const data = await response.json();
    
            if (data.error) {
                console.warn("Error:", data.error);
                setOrders([]);
                setLoading(false);
                return;
            }
    
            if (data.message === "No orders found") {
                setOrders([]);
                setLoading(false);
                return;
            }

            const { table_number, customer_name, log_name } = data.orders[0];

            setOrderDetails({ table_number, customer_name, log_name });
            setOrders(data.orders || []);
            setLoading(false);
        } catch (error) {
            console.error("Fetch error:", error);
            setLoading(false);
        }
    };

    const handleTakeOrder = async () => {
        if (!orders.length || !orderDetails) {
            Alert.alert("Error", "No orders available to process.");
            return;
        }

        try {
            const response = await fetch("https://thesportsbar.com.ng/sport/take_order.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    sale_token,
                    attendant, // Send attendant name from AsyncStorage
                    staff_id,
                    orders,
                    table_number: orderDetails.table_number,
                    customer_name: orderDetails.customer_name,
                    log_name: orderDetails.log_name,
                }),
            });

            const data = await response.json();

            if (data.success) {
                Alert.alert("Success", "Order has been taken successfully!");
                router.push("/Dashboard");
            } else {
                Alert.alert("Error", data.message || "Failed to take order.");
            }
        } catch (error) {
            console.error("Take order error:", error);
            Alert.alert("Error", "Network error. Please try again.");
        }
    };

    return (
        <>
          <Header/>
        <View style={styles.container}>
            <Text style={styles.header}>Order Details</Text>
            {loading ? (
                <ActivityIndicator size="large" color="#014925" />
            ) : orders.length === 0 ? (
                <Text style={styles.noOrders}>No orders found.</Text>
            ) : (
                <>
                    <View style={styles.orderSummary}>
                        <Text style={styles.orderDetail}>Table Number: {orderDetails.table_number}</Text>
                        <Text style={styles.orderDetail}>Customer Name: {orderDetails.customer_name}</Text>
                        <Text style={styles.orderDetail}>Log Name: {orderDetails.log_name}</Text>
                        <Text style={styles.orderDetail}>Attendant: {attendant}</Text>
                    </View>
                    
                    <FlatList
                        data={orders}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <View style={styles.orderItem}>
                                <Text style={styles.title}>Product: {item.product_name}</Text>
                                <Text>Quantity: {item.quantity}</Text>
                                <Text>Price: {item.price}</Text>
                                <Text>Status: {item.status}</Text>
                            </View>
                        )}
                    />
                </>
            )}

            <Button title="Take Order" onPress={handleTakeOrder} color="#014925" />
        </View>
        </>
      
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#121212", // Dark background
    },
    header: {
        fontSize: 22,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 20,
        color: "#ffffff", // White text for contrast
    },
    noOrders: {
        fontSize: 18,
        color: "#bbbbbb", // Light gray text
        textAlign: "center",
        marginTop: 20,
    },
    orderSummary: {
        padding: 15,
        backgroundColor: "#1e1e1e", // Dark card background
        marginBottom: 15,
        borderRadius: 8,
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 3,
    },
    orderDetail: {
        fontSize: 16,
        color: "#ffffff", // White text for readability
        marginBottom: 5,
    },
    orderItem: {
        padding: 15,
        backgroundColor: "#1e1e1e", // Dark card background
        marginBottom: 10,
        borderRadius: 8,
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 3,
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#ffffff", // White text
    },
    button: {
        backgroundColor: "#014925", // Dark green for accent
        padding: 15,
        borderRadius: 5,
        alignItems: "center",
        marginTop: 20,
    },
    buttonText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "bold",
    },
});


export default SeeOrderScreen;
