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
import useBackButtonHandler from "../component/useBackButtonHandler";
import CustomAlertModal from "../component/CustomAlertModal";

const CheckoutScreen = () => {
  const [showActionOptions, setShowActionOptions] = useState(false);
  const [cart, setCart] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [logName, setLogName] = useState("");
  const [user, setUser] = useState(null); // Holds user data
  const router = useRouter();
  const [modalData, setModalData] = useState({
    visible: false,
    title: '',
    message: '',
    buttons: [],
  });
  

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

  const loadCart = async () => {
    try {
      const storedCart = await AsyncStorage.getItem("cart");
      if (storedCart !== null) {
        setCart(JSON.parse(storedCart));
      }
    } catch (error) {
      console.error("Error loading cart:", error);
    }
  };

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

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handlePlaceOrder = () => {
    setModalVisible(true);
  };

  const confirmOrder = async () => {
    if (!customerName || !tableNumber || !logName) {
      if (Platform.OS === 'web') {
        window.alert(`${"Error"}\n\n${"Please fill in all details before proceeding."}`);
      } else {
        Alert.alert("Error", "Please fill in all details before proceeding.");
      }
      
      return;
    }
  
    const orderData = {
      attendant: user ? user.staff_id : "Customer",
      customer_name: user ? user.name : customerName,
      table_number: tableNumber,
      log_name: user ? user.logName : logName, // Fix here
      sale_date: new Date().toISOString().split("T")[0],
      sale_token: Math.random().toString(36).substring(2, 10),
      cart: cart,
    };
  
    if (!user) {
      try {
        const response = await fetch("https://thesportsbar.com.ng/sport/save_order.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData),
        });
    
        const result = await response.json();
    
        if (result.success) {
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
          return;
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
    }
     else {
      if (Platform.OS === 'web') {
        setShowActionOptions(true);
      } else {
        Alert.alert(
          "Action",
          "What would you like to do?",
          [
            { text: "Add to existing table", onPress: async () => await addordertable() },
            { text: "Create new table", onPress: async () => await newTable() },
            { text: "Cancel", style: "cancel" },
          ]
        );
      }
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
const handleback = async ()=>{
  if(!user){
    router.replace("/Customer");
  }else{
    router.replace("/Dashboard");
  }

}
const addordertable = async () => {
  if (!user || !user.staff_id || !tableNumber) {
    setModalData({
      visible: true,
      title: "Error",
      message: "User and table number are required.",
      buttons: [
        {
          text: "OK",
          onPress: () => setModalData(prev => ({ ...prev, visible: false })),
        },
      ],
    });
    return;
  }

  const requestData = {
    saleid: user.staff_id,
    table: tableNumber,
    attendant: user?.name || "Customer",
    staff_id: user?.staff_id || "Customer",
    log_name: user?.logName || logName,
    table_number: tableNumber,
    sale_date: new Date().toISOString().split("T")[0],
    sale_token: Math.random().toString(36).substring(2, 10),

    cart: cart.map((item, index) => ({
      item_id: index + 1,
      item_name: item.title,
      item_price: item.price,
      item_portion: item.quantity,
    })),
  };

  try {
    const response = await fetch("https://thesportsbar.com.ng/sport/addordertable.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestData),
    });

    const result = await response.json();

    if (result.error) {
      setModalData({
        visible: true,
        title: "Verification Failed",
        message: result.error,
        buttons: [
          {
            text: "OK",
            onPress: () => setModalData(prev => ({ ...prev, visible: false })),
          },
        ],
      });
    } else if (result.array && result.array.length > 0) {
      setModalData({
        visible: true,
        title: "Success",
        message: "Table verified successfully. Updating cart...",
        buttons: [
          {
            text: "OK",
            onPress: () => {
              setModalData(prev => ({ ...prev, visible: false }));
              updateCart(result.array);
            },
          },
        ],
      });
    } else {
      setModalData({
        visible: true,
        title: "Info",
        message: result.message || "No sales records found for this table.",
        buttons: [
          {
            text: "OK",
            onPress: () => setModalData(prev => ({ ...prev, visible: false })),
          },
        ],
      });
    }
  } catch (error) {
    console.error("Error verifying table:", error);
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
  }
};


const updateCart = async (orders) => {
  if (!orders || orders.length === 0) {
    setModalData({
      visible: true,
      title: "No Orders",
      message: "No previous orders found for this table.",
      buttons: [
        {
          text: "OK",
          onPress: () => setModalData(prev => ({ ...prev, visible: false })),
        },
      ],
    });
    return;
  }

  try {
    // Extract Staff_id, sale_token, and table_num from the first order
    const { Staff_id, sale_token, table_num } = orders[0];

    // Map orders to the desired cart structure
    const updatedCart = orders.map((item) => ({
      id: item.id,
      title: item.item_name, // Save item_name as title
      price: item.item_price, // Save item_price as price
      quantity: item.item_portion || 1, // Save item_portion as quantity (default to 1 if missing)
    }));

    // Log the updated cart to check if the structure is correct


    // Save the updated cart to AsyncStorage
    await AsyncStorage.setItem("cart", JSON.stringify(updatedCart));

    // Verify the saved cart
    const savedCart = await AsyncStorage.getItem("cart");


    // Update state
    setCart(updatedCart);
    console.log({
      staff_id: user ? user.staff_id : "Customer",  // Default to 'Customer' if user is not defined
      log_name: user ? user.logName : logName || "Guest",  // Use 'Guest' if logName is undefined
      table_number: tableNumber || "Unknown",  // Default to 'Unknown' if tableNumber is not provided
      orders: encodeURIComponent(JSON.stringify(updatedCart)), // Ensure updatedCart is valid
    })

    router.replace({
      pathname: "/AllOrderScreen",
      params: {
        staff_id: user ? user.staff_id : "Customer",  // Default to 'Customer' if user is not defined
        log_name: user ? user.logName : logName || "Guest",  // Use 'Guest' if logName is undefined
        table_number: tableNumber || "Unknown",  // Default to 'Unknown' if tableNumber is not provided
        orders: encodeURIComponent(JSON.stringify(updatedCart)), // Ensure updatedCart is valid
      }
    });
    
  } catch (error) {
    console.error("Error updating cart in storage:", error);
  }
};



const newTable = async () => {
  try {
    if (!customerName || !tableNumber || !logName || cart.length === 0) {
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
      return;
    }

    const orderData = {
      attendant: user ? user.name : "Customer",
      staff_id: user ? user.staff_id : "Customer",
      log_name: user ? user.logName : logName,
      table_number: tableNumber,
      sale_date: new Date().toISOString().split("T")[0],
      sale_token: Math.random().toString(36).substring(2, 10),
      cart: cart.map((item, index) => ({
        item_id: index + 1,
        item_name: item.title,
        item_price: item.price,
        item_portion: item.quantity,
      })),
    };

    const response = await fetch("https://thesportsbar.com.ng/sport/newtable.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });

    const result = await response.json();

    if (result.error) {
      setModalData({
        visible: true,
        title: "Error",
        message: result.error,
        buttons: [
          {
            text: "OK",
            onPress: () => setModalData(prev => ({ ...prev, visible: false })),
          },
        ],
      });
    } else {
      setModalData({
        visible: true,
        title: "Success",
        message: "Order placed successfully!",
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
    }
  } catch (error) {
    console.error("Error sending order:", error);
    setModalData({
      visible: true,
      title: "Error",
      message: "Failed to send order.",
      buttons: [
        {
          text: "OK",
          onPress: () => setModalData(prev => ({ ...prev, visible: false })),
        },
      ],
    });
  }
};



  return (
    <>
    {/* Show Header only if user is logged in (Sales Attendant) */}
    {user && <Header />}

    <View style={styles.container}>
      <Text style={styles.title}>Veiw all Orders</Text>

      {cart.length === 0 ? (
        <View>
          <Text style={styles.emptyCartText}>Your cart is empty.</Text>
          <TouchableOpacity style={styles.confirmButton} onPress={() => clearCart()}>
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
          <TouchableOpacity style={styles.orderButton} onPress={handlePlaceOrder}>
            <Text style={styles.orderButtonText}>Place Order</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.orderButton} onPress={handleback}>
            <Text style={styles.orderButtonText}>Back</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal visible={isModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Order Details</Text>

            <TextInput
              style={styles.input}
              placeholder="Customer Name"
              placeholderTextColor="white"
              value={customerName}
              onChangeText={setCustomerName}
            />
            <TextInput
              style={styles.input}
              placeholder="Table Number or Nearest Table"
              placeholderTextColor="white"
              keyboardType="numeric"
              value={tableNumber}
              onChangeText={setTableNumber}
            />
          {!user ? (
              <View style={styles.pickerContainer}>
                <Picker 
                  selectedValue={logName} 
                  onValueChange={setLogName} 
                  style={styles.picker}
                >
                  <Picker.Item label="Select Log Name" value="" />
                  <Picker.Item label="VIP" value="VIP" />
                  <Picker.Item label="Snooker Area" value="Snooker Area" />
                  <Picker.Item label="Field" value="Field" />
                </Picker>
              </View>
            ) : (
              <TextInput
                style={styles.input}
               
                placeholderTextColor="white"
                editable={false}  
                value={logName}
                onChangeText={setLogName}
              />
            )}

                      

            <TouchableOpacity style={styles.confirmButton} onPress={confirmOrder}>
              <Text style={styles.confirmButtonText}>Confirm Order</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.closeModal}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
    <CustomAlertModal
        visible={showActionOptions}
        onClose={() => setShowActionOptions(false)}
        title="Action"
        message="What would you like to do?"
        buttons={[
          { text: "Add to existing table", onPress: addordertable },
          { text: "Create new table", onPress: newTable },
          { text: "Cancel", style: "cancel", onPress: () => setShowActionOptions(false) }
        ]}
      />
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
    marginTop:10,
  },
  orderButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  modalContent: {
    width: "80%",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  input: {
    width: "100%",
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    backgroundColor: "#1e3c72",
    color: "#fff",
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
  confirmButton: {
    width: "100%",
    padding: 15,
    backgroundColor: "#2a5298",
    borderRadius: 8,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  closeModal: {
    marginTop: 10,
    color: "red",
    textAlign: "center",
  },
});

export default CheckoutScreen;
