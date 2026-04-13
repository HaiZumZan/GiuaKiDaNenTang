import * as ImagePicker from "expo-image-picker";
import { addDoc, collection } from "firebase/firestore";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import uuid from "react-native-uuid";
import { uploadImageToCloudinary } from "../../config/cloudinary";
import { db } from "../../config/firebase";

// ✅ Đổi sang danh mục món ăn khớp với User app
const LOAI_SP = [
  { id: "Burger", label: "Burger", emoji: "🍔" },
  { id: "Pizza", label: "Pizza", emoji: "🍕" },
  { id: "Burrito", label: "Burrito", emoji: "🌯" },
  { id: "Khác", label: "Khác", emoji: "🍽️" },
];

export default function AddProductScreen({ navigation }) {
  const [tensp, setTensp] = useState("");
  const [loaisp, setLoaisp] = useState("");
  const [gia, setGia] = useState("");
  const [soluong, setSoluong] = useState(1); // ✅ thêm số lượng
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Lỗi", "Cần cấp quyền truy cập thư viện ảnh");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const handleSubmit = async () => {
    if (!tensp.trim() || !loaisp || !gia.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ tên, loại và giá sản phẩm");
      return;
    }
    if (isNaN(Number(gia)) || Number(gia) <= 0) {
      Alert.alert("Lỗi", "Giá sản phẩm phải là số dương");
      return;
    }
    setLoading(true);
    let hinhanh = "";
    try {
      if (imageUri) {
        setUploading(true);
        hinhanh = await uploadImageToCloudinary(imageUri);
        setUploading(false);
      }
      await addDoc(collection(db, "sanpham"), {
        idsanpham: uuid.v4(),
        tensp: tensp.trim(),
        loaisp, // ✅ lưu đúng id: "Burger" | "Pizza" | "Burrito" | "Khác"
        gia: Number(gia),
        soluong, // ✅ lưu số lượng
        hinhanh,
      });
      Alert.alert("Thành công", "Thêm sản phẩm thành công!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert("Lỗi", "Không thể thêm sản phẩm. Vui lòng thử lại.");
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>← Quay lại</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Thêm Sản Phẩm</Text>
          <View style={{ width: 70 }} />
        </View>

        <View style={styles.form}>
          {/* Ảnh */}
          <Text style={styles.label}>Hình ảnh</Text>
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.previewImg} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={{ fontSize: 40 }}>📷</Text>
                <Text style={styles.imageHint}>Nhấn để chọn ảnh</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Tên */}
          <Text style={styles.label}>Tên sản phẩm *</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập tên sản phẩm"
            value={tensp}
            onChangeText={setTensp}
          />

          {/* ✅ Loại — hiển thị dạng card chọn */}
          <Text style={styles.label}>Loại món ăn *</Text>
          <View style={styles.categoryGrid}>
            {LOAI_SP.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryCard,
                  loaisp === cat.id && styles.categoryCardActive,
                ]}
                onPress={() => setLoaisp(cat.id)}
              >
                <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                <Text
                  style={[
                    styles.categoryLabel,
                    loaisp === cat.id && styles.categoryLabelActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Giá */}
          <Text style={styles.label}>Giá (VNĐ) *</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập giá sản phẩm"
            value={gia}
            onChangeText={setGia}
            keyboardType="numeric"
          />

          {/* ✅ Số lượng */}
          <Text style={styles.label}>Số lượng</Text>
          <View style={styles.qtyRow}>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => setSoluong((v) => Math.max(1, v - 1))}
            >
              <Text style={styles.qtyBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.qtyValue}>{soluong}</Text>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => setSoluong((v) => v + 1)}
            >
              <Text style={styles.qtyBtnText}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Nút lưu */}
          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.btnText}>
                  {uploading ? "Đang tải ảnh..." : "Đang lưu..."}
                </Text>
              </View>
            ) : (
              <Text style={styles.btnText}>💾 Lưu Sản Phẩm</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f2f5" },
  header: {
    backgroundColor: "#2c3e50",
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  back: { color: "#3498db", fontSize: 15 },
  title: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  form: { padding: 20 },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 4,
  },
  imagePicker: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#ddd",
    borderStyle: "dashed",
    overflow: "hidden",
  },
  previewImg: { width: "100%", height: 200, resizeMode: "cover" },
  imagePlaceholder: {
    height: 150,
    justifyContent: "center",
    alignItems: "center",
  },
  imageHint: { color: "#95a5a6", marginTop: 8, fontSize: 14 },

  // ✅ Category card grid
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 4,
  },
  categoryCard: {
    width: "47%",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#e8e8e8",
  },
  categoryCardActive: {
    borderColor: "#3498db",
    backgroundColor: "#eaf4fd",
  },
  categoryEmoji: { fontSize: 32, marginBottom: 6 },
  categoryLabel: { fontSize: 14, fontWeight: "600", color: "#7f8c8d" },
  categoryLabelActive: { color: "#3498db" },

  // ✅ Số lượng
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    alignSelf: "flex-start",
    overflow: "hidden",
  },
  qtyBtn: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f2f5",
  },
  qtyBtnText: { fontSize: 22, color: "#2c3e50", fontWeight: "bold" },
  qtyValue: {
    width: 56,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    color: "#2c3e50",
  },

  btn: {
    backgroundColor: "#3498db",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 28,
    marginBottom: 40,
  },
  btnDisabled: { backgroundColor: "#95a5a6" },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
