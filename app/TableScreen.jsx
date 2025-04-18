import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import Header from "../component/Header";

const TableScreen = () => {
    const [tables, setTables] = useState({});
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();
    const [user, setUser] = useState(null); // Holds user data

    useEffect(() => {
        checkUserLogin();
    }, []);

    const checkUserLogin = async () => {
        try {
            const userData = await AsyncStorage.getItem("user");
            if (userData) {
                const parsedUser = JSON.parse(userData);
                setUser(parsedUser);
            }
        } catch (error) {
            console.error("Error checking user login:", error);
        }
    };

    useEffect(() => {
        const fetchTables = async () => {
            try {
                const userData = await AsyncStorage.getItem("user");
                if (userData) {
                    const parsedUser = JSON.parse(userData);
                    const { name, staff_id, logName } = parsedUser;

                    const response = await fetch(
                        `https://thesportsbar.com.ng/sport/get_active_tables.php?attendant=${name}&staff_id=${staff_id}&log_name=${logName}`
                    );
                    const data = await response.json();

                    if (data.success) {
                        // Group tables by table_num
                        const groupedTables = data.tables.reduce((acc, item) => {
                            if (!acc[item.table_num]) {
                                acc[item.table_num] = [];
                            }
                            acc[item.table_num].push(item);
                            return acc;
                        }, {});

                        setTables(groupedTables);
                    } else {
                        setTables({});
                    }
                }
            } catch (error) {
                console.error("Error fetching tables:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTables();
    }, []);

    const addToCart = async (orders) => {
        try {
            // Transform the orders to the new structure
            const updatedCart = orders.map((item) => ({
                id: item.item_id, // Save item_id as id
                title: item.item_name, // Save item_name as title
                price: item.item_price, // Save item_price as price
                quantity: item.item_portion || 1, // Save item_portion as quantity (default to 1 if missing)
            }));

            // Add the new orders to the cart
            await AsyncStorage.setItem("cart", JSON.stringify(updatedCart));
        } catch (error) {
            console.error("Error updating cart:", error);
        }
    };

    return (
        <>
            <Header />
            <View style={styles.container}>
                <Text style={styles.header}>Active Tables</Text>

                {loading ? (
                    <ActivityIndicator size="large" color="#014925" />
                ) : Object.keys(tables).length === 0 ? (
                    <Text style={styles.noTables}>No active tables found.</Text>
                ) : (
                    <FlatList
                        data={Object.keys(tables)}
                        keyExtractor={(item) => item}
                        renderItem={({ item }) => {
                            const firstOrder = tables[item][0]; // Get first order from the group
                            return (
                                <TouchableOpacity
                                    style={styles.tableItem}
                                    onPress={() => {
                                        // Prepare the items to be added to the cart
                                        const orders = tables[item].map((order) => ({
                                            item_id: order.item_id,
                                            item_name: order.item_name,
                                            item_price: order.item_price,
                                            item_portion: order.item_portion,
                                        }));

                                        // Add the orders to the cart
                                        addToCart(orders);

                                        // Navigate to AllOrderScreen with the necessary data
                                        navigation.replace("AllOrderScreen", {
                                            staff_id: firstOrder.Staff_id,
                                            log_name: user?.logName || "Guest",
                                            table_number: firstOrder.table_num,
                                            orders: encodeURIComponent(JSON.stringify(tables[item])), // Send grouped orders
                                        });
                                    }}
                                >
                                    <Text style={styles.tableTitle}>Table {item}</Text>
                                    <Text style={styles.attendantText}>Attendant: {firstOrder.attendant}</Text>
                                </TouchableOpacity>
                            );
                        }}
                    />
                )}
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#121212",
        padding: 20,
    },
    header: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#fff",
        textAlign: "center",
        marginBottom: 20,
    },
    noTables: {
        fontSize: 18,
        color: "gray",
        textAlign: "center",
        marginTop: 20,
    },
    tableItem: {
        backgroundColor: "#1e1e1e",
        padding: 15,
        marginBottom: 10,
        borderRadius: 8,
    },
    tableTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#fff",
    },
    attendantText: {
        color: "#ccc",
        marginTop: 5,
    }
});

export default TableScreen;
