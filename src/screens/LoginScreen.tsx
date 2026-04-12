import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity
} from "react-native";
import { auth, checkIsAdmin } from "../config/firebase";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin");
      return;
    }
    setLoading(true);
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);

      // Kiểm tra quyền admin ngay sau khi đăng nhập
      const adminStatus = await checkIsAdmin(user.uid);
      if (!adminStatus) {
        // Đăng xuất ngay nếu không phải admin
        await signOut(auth);
        Alert.alert(
          "Không có quyền truy cập",
          "Tài khoản này không phải Admin.\nVui lòng liên hệ quản trị viên.",
        );
        return;
      }
      // Nếu là admin → AppNavigator tự điều hướng sang Home
    } catch (error: any) {
      let msg = "Đăng nhập thất bại";
      if (error.code === "auth/user-not-found") msg = "Tài khoản không tồn tại";
      if (error.code === "auth/wrong-password") msg = "Sai mật khẩu";
      if (error.code === "auth/invalid-email") msg = "Email không hợp lệ";
      if (error.code === "auth/invalid-credential")
        msg = "Email hoặc mật khẩu không đúng";
      Alert.alert("Lỗi", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Text style={styles.title}>🛍️ Quản Lý Sản Phẩm</Text>
      <Text style={styles.subtitle}>Đăng nhập Admin</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Mật khẩu"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={styles.btn}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Đăng Nhập</Text>
        )}
      </TouchableOpacity>

      {/* Không có nút Register — admin chỉ được tạo thủ công trên Console */}
      <Text style={styles.note}>
        Tài khoản Admin được cấp bởi quản trị viên hệ thống
      </Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    color: "#2c3e50",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
    color: "#7f8c8d",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  btn: {
    backgroundColor: "#3498db",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  note: { textAlign: "center", color: "#bdc3c7", fontSize: 13, marginTop: 8 },
});
