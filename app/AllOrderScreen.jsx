import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  Modal,
  Platform
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import Header from "../component/Header"; // Import your Header component
import { useLocalSearchParams } from "expo-router";
import useBackButtonHandler from "../component/useBackButtonHandler";
import CustomAlertModal from "../component/CustomAlertModal";

const AllOrderScreen = () => {
  const [cart, setCart] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [logName, setLogName] = useState("");
  const [user, setUser] = useState(null); // Holds user data
  // Use useLocalSearchParams to get query params from the URL
  const { staff_id, log_name, table_number, orders } = useLocalSearchParams();
    const [modalData, setModalData] = useState({
      visible: false,
      title: '',
      message: '',
      buttons: [],
    });

  const router = useRouter();


  

  useBackButtonHandler();
    useEffect(() => {
      loadCart();
      checkUserLogin();
    }, []);
  
    const checkUserLogin = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setLogName(parsedUser.logName); // Use parsedUser, not user
          setCustomerName(parsedUser.name); 
         
        }
      } catch (error) {
        console.error("Error checking user login:", error);
      }
    };
  
  
  // Function to load cart from AsyncStorage
  const loadCart = async () => {
    try {
      const storedCart = await AsyncStorage.getItem("cart");
      if (storedCart !== null) {
        setCart(JSON.parse(storedCart));
        console.log('cart',cart)
      }
    } catch (error) {
      console.error("Error loading cart:", error);
    }
  };

  // Load cart when the component mounts
  useEffect(() => {
    loadCart();
  }, []);

  // Function to update quantity
  const updateQuantity = async (id, quantity) => {
    if (quantity < 1) {
      removeFromCart(id);
    } else {
      const updatedCart = cart.map((item) =>
        item.id === id ? { ...item, quantity: quantity } : item
      );
      setCart(updatedCart);
      await AsyncStorage.setItem("cart", JSON.stringify(updatedCart));
    }
  };

  const removeFromCart = async (id) => {
    const updatedCart = cart.filter((item) => item.id !== id);
    setCart(updatedCart);
    await AsyncStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  // Calculate total price
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  // Handle Checkout
  
  const handleCheckout = async () => {
    try {
      if (!staff_id || !table_number || !log_name || cart.length === 0) {
        if (Platform.OS === 'web') {
          setModalData({
            visible: true,
            title: "Error",
            message: "Please fill in all details and add items to the cart.",
            buttons: [
              {
                text: "OK",
                onPress: () => setModalData(prev => ({ ...prev, visible: false })),
              },
            ],
          });
        } else {
          Alert.alert("Error", "Please fill in all details and add items to the cart.");
        }
        return;
      }
  
      const orderData = {
        attendant: user ? user.name : "Customer",
        staff_id: staff_id,
        log_name: log_name,
        table_number: table_number,
        sale_token: Math.random().toString(36).substring(2, 10),
      };
  
      const response = await fetch("https://thesportsbar.com.ng/sport/checkout.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });
  
      const result = await response.json();
  
      if (result.status === 'success') {
        if (Platform.OS === 'web') {
          setModalData({
            visible: true,
            title: "Order Confirmed",
            message: "Your order has been placed successfully!",
            buttons: [
              {
                text: "OK",
                onPress: async () => {
                  await clearCart();
                  setModalData(prev => ({ ...prev, visible: false }));
                },
              },
            ],
          });
        } else {
          Alert.alert("Order Confirmed", "Your order has been placed successfully!", [
            { text: "OK", onPress: async () => await clearCart() },
          ]);
        }
      } else {
        if (Platform.OS === 'web') {
          setModalData({
            visible: true,
            title: "Error",
            message: result.message || "Something went wrong.",
            buttons: [
              {
                text: "OK",
                onPress: () => setModalData(prev => ({ ...prev, visible: false })),
              },
            ],
          });
        } else {
          Alert.alert("Error", result.message || "Something went wrong.");
        }
      }
    } catch (error) {
      console.error("Error placing order:", error);
      if (Platform.OS === 'web') {
        setModalData({
          visible: true,
          title: "Error",
          message: "Failed to connect to the server.",
          buttons: [
            {
              text: "OK",
              onPress: () => setModalData(prev => ({ ...prev, visible: false })),
            },
          ],
        });
      } else {
        Alert.alert("Error", "Failed to connect to the server.");
      }
    }
  };
  // Handle Back
  const handleBack = () => {
    if(!user){
        router.replace("/Customer");
        }else{
          router.replace("/Dashboard");
        }
  };
  const clearCart = async () => {
   
    try {
      await AsyncStorage.removeItem("cart");
      setCart([]);
      if(!user){
      router.replace("/Customer");
      }else{
        router.replace("/Dashboard");
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };
  return (
    <>
      {/* Show Header only if user is logged in (Sales Attendant) */}
      {user && <Header />}

      <View style={styles.container}>
        <Text style={styles.title}>Checkout</Text>

         {cart.length === 0 ? (
                <View>
                  <Text style={styles.emptyCartText}>Your cart is empty.</Text>
                  <TouchableOpacity style={styles.confirmButton} onPress={() => handleBack()}>
                    <Text style={styles.orderButtonText}>Back</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <FlatList
                  data={cart}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <View style={styles.cartItem}>
                      <Text style={styles.itemText}>{item.title}</Text>
                      <View style={styles.quantityContainer}>
                        <TouchableOpacity onPress={() => updateQuantity(item.id, item.quantity - 1)}>
                          <Ionicons name="remove-circle-outline" size={24} color="red" />
                        </TouchableOpacity>
                        <TextInput
                          style={styles.quantityInput}
                          keyboardType="numeric"
                          value={String(item.quantity)}
                          onChangeText={(value) => updateQuantity(item.id, parseInt(value) || 1)}
                        />
                        <TouchableOpacity onPress={() => updateQuantity(item.id, item.quantity + 1)}>
                          <Ionicons name="add-circle-outline" size={24} color="green" />
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.itemPrice}>₦{item.price * item.quantity}</Text>
                    </View>
                  )}
                />
              )}

        {cart.length > 0 && (
          <View style={styles.footer}>
            <Text style={styles.totalText}>Total: ₦{calculateTotal()}</Text>
            <TouchableOpacity style={styles.orderButton} onPress={handleCheckout}>
              <Text style={styles.orderButtonText}>Checkout Table</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.orderButton} onPress={clearCart}>
              <Text style={styles.orderButtonText}>Back</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      <CustomAlertModal
              visible={modalData.visible}
              title={modalData.title}
              message={modalData.message}
              buttons={modalData.buttons}
              onClose={() => setModalData(prev => ({ ...prev, visible: false }))}
            />
    </>
  );
};

// 🔹 Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
  },
  emptyCartText: {
    color: "gray",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  itemText: {
    color: "#fff",
    fontSize: 16,
    flex: 1,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginRight: 30,
  },
  quantityInput: {
    width: 40,
    height: 40,
    textAlign: "center",
    borderWidth: 1,
    borderColor: "#fff",
    color: "#fff",
    borderRadius: 5,
    backgroundColor: "#333",
    padding: 0,
    fontSize: 12,
  },
  itemPrice: {
    color: "#28a745",
    fontSize: 16,
  },
  footer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#1e1e1e",
    borderRadius: 10,
  },
  totalText: {
    fontSize: 18,
    color: "#fff",
    textAlign: "center",
    marginBottom: 10,
  },
  orderButton: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  orderButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default AllOrderScreen;
