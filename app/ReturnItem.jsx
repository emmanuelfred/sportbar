import React, { useEffect, useState } from "react";
import { 
    View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator 
} from "react-native";
import Checkbox from 'expo-checkbox';
import { useLocalSearchParams } from "expo-router";
import Header from "../component/Header";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ReturnItem = () => {
    const { staff_id, log_name, table_number } = useLocalSearchParams();

    const [items, setItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [loading, setLoading] = useState(true);
     const [user, setUser] = useState(null); // Holds user data
    
    
 

    useEffect(() => {
     
        const fetchItems = async () => {
            try {
                const response = await fetch(
                    `https://thesportsbar.com.ng/sport/get_items.php?staff_id=${staff_id}&log_name=${log_name}&table_number=${table_number}`
                );
                const data = await response.json();
               
                if (data.success) {
                    setItems(data.items);
                } else {
                    setItems([]);
                }
            } catch (error) {
                console.error("Error fetching items:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchItems();
    }, [staff_id, log_name, table_number]);
    
    const toggleSelection = (itemId) => {
        setSelectedItems((prevSelected) =>
            prevSelected.includes(itemId)
                ? prevSelected.filter((id) => id !== itemId)
                : [...prevSelected, itemId]
        );
    };

    const handleReturn = async () => {
        // Check if any items are selected
        if (selectedItems.length === 0) {
            alert("Please select items to return.");
            return;
        }
    
        try {
            // Send the selected items to the backend
            const response = await fetch("https://thesportsbar.com.ng/sport/return_items.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    table_number,
                    staff_id,
                    log_name,
                    items: selectedItems,
                }),
            });
    
            // Log request details for debugging
            console.log("Sending Request:", {
                table_number,
                staff_id,
                log_name,
                items: selectedItems,
            });
    
            // Parse the response
            const result = await response.json();
    
            // Check if the response indicates success
            if (result.success) {
                // Filter out the returned items from the list of items
                setItems((prevItems) => prevItems.filter((item) => !selectedItems.includes(item.id)));
    
                // Clear selected items
                setSelectedItems([]);
    
                // Show success message
                alert("Items returnedsuccessfully!");
            } else {
                // Handle failure case
                console.log("Return Error:", result.errors || result.message);
                alert("Failed to return items.");
            }
        } catch (error) {
            // Catch and log any errors
            console.error("Error returning items:", error);
            alert("An error occurred while returning items. Please try again.");
        }
    };
    
    return (
        <>
        <Header/>
         <View style={styles.container}>
            <Text style={styles.title}>Return Items for Table {table_number}</Text>
            {loading ? (
                <ActivityIndicator size="large" color="#4CAF50" />
            ) : items.length === 0 ? (
                <Text style={styles.noItems}>No items found.</Text>
            ) : (
                <FlatList
                    data={items}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.itemContainer}>
                            <Checkbox
                                value={selectedItems.includes(item.id)}
                                onValueChange={() => toggleSelection(item.id)}
                                color={selectedItems.includes(item.id) ? '#4CAF50' : '#fff'}
                            />
                            <Text style={styles.itemText}>{item.item_name} - ₦{parseFloat(item.item_price).toLocaleString()}</Text>
                        </View>
                    )}
                />
            )}

            <TouchableOpacity style={styles.returnButton} onPress={handleReturn}>
                <Text style={styles.returnButtonText}>Return Selected Items</Text>
            </TouchableOpacity>
        </View>
        </>
       
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
        padding: 20,
    },
    title: {
        fontSize: 24,
        color: '#fff',
        marginBottom: 20,
        fontWeight: 'bold',
    },
    noItems: {
        color: '#fff',
        fontSize: 18,
        textAlign: 'center',
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    itemText: {
        color: '#fff',
        fontSize: 18,
        marginLeft: 10,
    },
    returnButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 12,
        borderRadius: 5,
        marginTop: 20,
        alignItems: 'center',
    },
    returnButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default ReturnItem;