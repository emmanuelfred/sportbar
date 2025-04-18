
import React, { useEffect, useState } from "react";
import { 
    View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity 
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router"; // Use useRouter instead of useNavigation
import { useNavigation } from "@react-navigation/native";
import Header from "../component/Header";

const ServedTable = () => {
    const [tables, setTables] = useState({});
    const [loading, setLoading] = useState(true);
    const router = useRouter(); // Initialize useRouter
        const navigation = useNavigation();
    const [user, setUser] = useState(null); // Holds user data
    const [saleToken, setSaleToken] = useState(null)

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
                    const user = JSON.parse(userData);
                    const { name, staff_id, logName } = user;

                    const response = await fetch(
                        `https://thesportsbar.com.ng/sport/get_server_tables.php?attendant=${name}&staff_id=${staff_id}&log_name=${logName}`
                    );
                    const data = await response.json();
                

                    if (data.success) {
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

    return (
        <>

        <Header/>
        <View style={styles.container}>
    <Text style={styles.header}>Active Tables</Text>

    {loading ? (
        <ActivityIndicator size="large" color="#014925" />
    ) : Object.keys(tables).length === 0 ? (
        <Text style={styles.noTables}>No  tables found.</Text>
    ) : (
        <FlatList
            data={Object.keys(tables)}
            keyExtractor={(item) => item}
            renderItem={({ item }) => {
                const firstOrder = tables[item][0];

                return (
                    <TouchableOpacity
                        style={styles.tableItem}
                        onPress={() => {
                            const orders = tables[item].map(order => ({
                                item_id: order.item_id,
                                item_name: order.item_name,
                                item_price: order.item_price,
                                item_portion: order.item_portion,
                            }));
                            setSaleToken(firstOrder.sale_token)

                            // Navigate to ReturnItem screen
                           
                        }}
                    >
                        <Text style={styles.tableTitle}>Table {item}</Text>
                        <Text style={styles.attendantText}>Transaction Token: {firstOrder.sale_token}</Text>
                    </TouchableOpacity>
                );
            }}
        />
    )}

    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Back</Text>
    </TouchableOpacity>
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
    },
    backButton: {
        marginTop: 20,
        backgroundColor: "#014925",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    backButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
});

export default ServedTable;
