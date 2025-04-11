import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, Modal, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Header = () => {
  const router = useRouter();
  const [isNotifVisible, setNotifVisible] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [logName, setLogName] = useState("");
  const [isMenuVisible, setMenuVisible] = useState(false);
  const [lastNotifCount, setLastNotifCount] = useState(0);

  useEffect(() => {
    getUserLogName();
  }, []);



  const getUserLogName = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        setLogName(user.logName);
      }
    } catch (error) {
      console.error("Error fetching logName:", error);
    }
  };

  

  return (
    <>
      {/* Header Container */}
      <View style={styles.header}>
         <Image source={require("../assets/logo.png")} style={styles.logo} />
        <TouchableOpacity onPress={() => setMenuVisible(true)}>
          <Ionicons name="menu" size={30} color="#fff" />
        </TouchableOpacity>

       

        
      </View>

      {/* Notifications Modal */}
      <Modal visible={isNotifVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Notifications</Text>
            <FlatList
              data={notifications}
              keyExtractor={(item) => item.sale_token}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setNotifVisible(false);
                    router.replace({
                      pathname: "/seeOrderScreen",
                      params: { sale_token: item.sale_token },
                    });
                  }}
                >
                  <Text style={styles.notifItem}>{item.message}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.closeButton} onPress={() => setNotifVisible(false)}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Sidebar Menu */}
      <Modal visible={isMenuVisible} animationType="slide" transparent>
        <View style={styles.menuOverlay}>
          <View style={styles.menu}>
            <TouchableOpacity style={styles.menuClose} onPress={() => setMenuVisible(false)}>
              <Ionicons name="close" size={30} color="black" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/ProfileScreen")}>
              <Ionicons name="person-circle-outline" size={25} color="black" />
              <Text style={styles.menuText}>Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/TableScreen")}>
              <Ionicons name="chatbubbles-outline" size={25} color="black" />
              <Text style={styles.menuText}>Active Table</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/Dashboard")}>
              <Ionicons name="home-outline" size={25} color="black" />
              <Text style={styles.menuText}>Home</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/returnTable")}>
              <Ionicons name="return-down-back-outline" size={25} color="black" />
              <Text style={styles.menuText}>Return Item</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/ServedTable")}>
              <Ionicons name="return-down-back-outline" size={25} color="black" />
              <Text style={styles.menuText}>Served table</Text>
            </TouchableOpacity>
         

            <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/LogoutScreen")}>
              <Ionicons name="log-out-outline" size={25} color="black" />
              <Text style={styles.menuText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default Header;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#2a5298",
  },
  logo: {
    width: 120,
    height: 40,
    resizeMode: "contain",
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "red",
    borderRadius: 10,
    padding: 3,
    minWidth: 20,
    alignItems: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  notifItem: {
    fontSize: 16,
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  closeButton: {
    marginTop: 15,
    backgroundColor: "#2a5298",
    padding: 10,
    borderRadius: 5,
  },
  closeText: {
    color: "#fff",
    fontSize: 16,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-start",
  },
  menu: {
    width: 250,
    backgroundColor: "#fff",
    padding: 20,
    height: "100%",
  },
  menuClose: {
    alignSelf: "flex-end",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
  },
  menuText: {
    fontSize: 18,
    marginLeft: 10,
  },
});
