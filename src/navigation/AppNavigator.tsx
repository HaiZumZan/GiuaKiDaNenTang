import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { auth, checkIsAdmin } from "../config/firebase";

import AddProductScreen from "../screens/AddProductScreen";
import EditProductScreen from "../screens/EditProductScreen";
import HomeScreen from "../screens/HomeScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";

const Stack = createNativeStackNavigator();

// Màn hình báo không có quyền
function UnauthorizedScreen() {
  return (
    <View style={styles.center}>
      <Text style={styles.icon}>🚫</Text>
      <Text style={styles.title}>Không có quyền truy cập</Text>
      <Text style={styles.sub}>
        Tài khoản này không phải Admin.{"\n"}Vui lòng đăng nhập bằng tài khoản
        Admin.
      </Text>
    </View>
  );
}

export default function AppNavigator() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // Kiểm tra trong collection admins
        const adminStatus = await checkIsAdmin(u.uid);
        setIsAdmin(adminStatus);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Đang kiểm tra
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Đang kiểm tra quyền truy cập...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          // Chưa đăng nhập
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : isAdmin ? (
          // Đã đăng nhập + là admin
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="AddProduct" component={AddProductScreen} />
            <Stack.Screen name="EditProduct" component={EditProductScreen} />
          </>
        ) : (
          // Đã đăng nhập nhưng KHÔNG phải admin
          <Stack.Screen name="Unauthorized" component={UnauthorizedScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#f5f5f5",
  },
  icon: { fontSize: 60, marginBottom: 16 },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 8,
  },
  sub: { fontSize: 14, color: "#7f8c8d", textAlign: "center", lineHeight: 22 },
  loadingText: { marginTop: 12, color: "#7f8c8d", fontSize: 14 },
});
