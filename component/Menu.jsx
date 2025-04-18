import React, { useEffect, useState } from "react"
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,

  TextInput,
  ScrollView,
  Modal
} from "react-native"
import axios from "axios"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useNavigation } from "@react-navigation/native"
import { useRouter } from "expo-router" // ✅ Navigation
import { Ionicons } from "@expo/vector-icons" // For icons


const API_URL = "https://thesportsbar.com.ng/sport/get_all_items.php" // Change this to your server URL

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("VIP");
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [cartVisible, setCartVisible] = useState(false);
  const router = useRouter();
    const [refreshKey, setRefreshKey] = useState(0); // Key for re-rendering

  const navigation = useNavigation();

  useEffect(() => {
    fetchMenuItems();
    loadCart(); // Load cart from storage
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await axios.get(API_URL);
      const data = response.data;

      setMenuItems(data);
      setCategories([...new Set(data.map((item) => item.category))]);
      setFilteredItems(data);
    } catch (error) {
      setError("<Text>Failed to load menu. Please try again.</Text>");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Load cart from AsyncStorage
  const loadCart = async () => {
    try {
      const storedCart = await AsyncStorage.getItem("cart");
      if (storedCart) {
        setCart(JSON.parse(storedCart));
      }
    } catch (error) {
      console.error("Failed to load cart:", error);
    }
  };

  // Save cart to AsyncStorage
  const saveCart = async (updatedCart) => {
    try {
      await AsyncStorage.setItem("cart", JSON.stringify(updatedCart));
    } catch (error) {
      console.error("Failed to save cart:", error);
    }
  };

  // Add item to cart
  const addToCart = (item) => {
    const existingItem = cart.find((cartItem) => cartItem.id === item.id);
    let updatedCart;

    if (existingItem) {
      updatedCart = cart.map((cartItem) =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      );
    } else {
      updatedCart = [...cart, { ...item, quantity: 1 }];
    }

    setCart(updatedCart);
    saveCart(updatedCart);
  };

  // Remove item from cart
  const removeFromCart = (id) => {
    const updatedCart = cart.filter((item) => item.id !== id);
    setCart(updatedCart);
    saveCart(updatedCart);
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text === "") {
      setFilteredItems(
        menuItems.filter((item) => (selectedCategory ? item.category === selectedCategory : true))
      );
    } else {
      const filtered = menuItems.filter(
        (item) =>
          item.title.toLowerCase().includes(text.toLowerCase()) &&
          (selectedCategory ? item.category === selectedCategory : true)
      );
      setFilteredItems(filtered);
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setFilteredItems(menuItems.filter((item) => item.category === category));
  };

    const renderItem = ({ item }) => (
      <View style={styles.card}>
        <Image
          source={{ uri: item.img }}
          style={styles.image}
          resizeMode="cover"
          defaultSource={require("../assets/placeholder.png")}
        />
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.price}>₦{item.price}</Text>
        <TouchableOpacity style={styles.button} onPress={() => addToCart(item)}>
          <Text style={styles.buttonText}>Order Now</Text>
        </TouchableOpacity>
      </View>
    );
  return (
  <>
  {/* Header with Search & Cart */}
       <View style={styles.header}>
        
         <TextInput
           style={styles.searchInput}
           placeholder="Search menu..."
           placeholderTextColor="#aaa"
           value={searchQuery}
           onChangeText={handleSearch}
         />
         <TouchableOpacity onPress={() => setCartVisible(true)} style={styles.cartContainer}>
           <Ionicons name="cart-outline" size={28} color="white" />
           {cart.length > 0 && (
             <View style={styles.cartBadge}>
               <Text style={styles.badgeText}>{cart.length}</Text>
             </View>
           )}
         </TouchableOpacity>
       </View>
{/* Category Navigation */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryNav}>
        {categories.map((category, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.categoryButtonActive,
            ]}
            onPress={() => handleCategorySelect(category)}
          >
            <Text>
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category && styles.categoryTextActive,
                ]}
              >
                {String(category)}
              </Text>
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
          {/* Content */}
          <View style={styles.content}>
            {/* Show loading indicator */}
            {loading && <ActivityIndicator size="large" color="#1e90ff" />}

            {/* Show error message if it exists */}
            {error ? <Text style={styles.error}>{String(error)}</Text> : null}

            {/* Ensure filteredItems exists before using length */}
            {filteredItems?.length > 0 ? (
              <FlatList
                data={filteredItems}
                keyExtractor={(item) => item.id?.toString()} // Ensure `id` exists
                renderItem={({ item }) => (
                  <View style={styles.card}>
                    <Image
                      source={{ uri: item.img }}
                      style={styles.image}
                      resizeMode="cover"
                      defaultSource={require("../assets/placeholder.png")}
                    />
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.price}>₦{item.price}</Text>
                    <TouchableOpacity style={styles.button} onPress={() => addToCart(item)}>
                      <Text style={styles.buttonText}>Order Now</Text>
                    </TouchableOpacity>
                  </View>
                )}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: "space-between" }}
              />
            ) : (
              !loading && <Text style={styles.emptyText}>No items found.</Text>
            )}
          </View>


      
  {/* Cart Modal */}
      <Modal visible={cartVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.cartModal}>
            {/* Close Icon on Top Right */}
            <TouchableOpacity onPress={() => setCartVisible(false)} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="black" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Shopping Cart</Text>

            {/* Cart Header */}
            <View style={styles.cartItem}>
              <Text style={styles.cartItemText}>Item</Text>
              <Text style={styles.cartItemText}>Quantity</Text>
              <Text style={styles.cartItemText}>Delete</Text>
            </View>

            {cart.length === 0 ? (
              <Text style={styles.emptyCartText}>Your cart is empty.</Text>
            ) : (
              <FlatList
                data={cart}
                keyExtractor={(item) => item.id.toString()} // Using item.id as a unique key
                renderItem={({ item }) => (
                  <View style={styles.cartItem}>
                    <Text style={styles.cartItemText}>{item.title}</Text>
                    <Text style={styles.cartItemText}>{item.quantity}</Text>
                    <TouchableOpacity onPress={() => removeFromCart(item.id)}>
                      <Ionicons name="trash-outline" size={24} color="red" />
                    </TouchableOpacity>
                  </View>
                )}
              />
            )}

            {/* Checkout Button */}
            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={() => navigation.navigate("CheckoutScreen")} // Navigate to CheckoutScreen
            >
              <Text style={styles.buttonText}>Go to Checkout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
  
  </>
  )
  
}



const styles = StyleSheet.create({
 
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    marginTop:15,
    padding:10,
  },
  searchInput: {
    backgroundColor: "#333",
    color: "#fff",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft:10,
    marginRight:10
  },
  cartIcon: {
    marginLeft: 10,
    position: "relative",
  },
  cartBadge: {
    position: "absolute",
    right: -5,
    top: -5,
    backgroundColor: "red",
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  cartBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Dark overlay
    justifyContent: "center",
    alignItems: "center",
  },
  cartModal: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
    backgroundColor: "#ddd",
    borderRadius: 20,
    padding: 6,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
  },
  emptyCartText: {
    textAlign: "center",
    color: "gray",
    fontSize: 16,
    marginBottom: 10,
  },
  cartItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    
  },
  cartItemText: {
    fontSize: 16,
  },
  checkoutButton: {
    backgroundColor: "#1e90ff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 15,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

  
  categoryNav: {
    flexDirection: "row",
    marginBottom: 10,
    height: 50,
    maxHeight: 50,
  },
  categoryButton: {
    backgroundColor: "#222",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginRight: 10,
  },
  categoryButtonActive: {
    backgroundColor: "#007bff",
  },
  categoryText: {
    color: "#bbb",
    fontSize: 16,
  },
  categoryTextActive: {
    color: "#fff",
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
  card: {
    backgroundColor: "#1e1e1e",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    width: "48%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: "100%",
    height: 120,
    borderRadius: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 5,
    textAlign: "center",
  },
  price: {
    fontSize: 14,
    color: "#28a745",
    marginVertical: 5,
  },
  button: {
    backgroundColor: "#007bff",
    padding: 8,
    borderRadius: 5,
    marginTop: 5,
    width: "80%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  }
})

export default Menu
