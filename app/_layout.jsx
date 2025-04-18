import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar"; // ✅ Import StatusBar
import { View } from "react-native";
import React from "react";

export default function Layout() {
  return (
    <View style={{ flex: 1 }}>
      {/* ✅ Show status bar but hide header */}
      <StatusBar style="light" /> 
      
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="Customer" options={{ headerShown: false }} />
        <Stack.Screen name="SaleLogin" options={{ headerShown: false }} />
        <Stack.Screen name="CheckoutScreen" options={{ headerShown: false }} />
        <Stack.Screen name="Dashboard" options={{ headerShown: false }} />
        <Stack.Screen name="AllOrderScreen" options={{ headerShown: false }} />
        <Stack.Screen name="seeOrderScreen" options={{ headerShown: false }} />
         <Stack.Screen name="ProfileScreen" options={{ headerShown: false }} />
         <Stack.Screen name="TableScreen" options={{ headerShown: false }} />
         <Stack.Screen name="returnTable" options={{ headerShown: false }} />
         <Stack.Screen name="ReturnItem" options={{ headerShown: false }} />
         <Stack.Screen name="ServedTable" options={{ headerShown: false }} />
        
        
        <Stack.Screen name="LogoutScreen" options={{ headerShown: false }} />
        
      </Stack>
    </View>
  );
}
