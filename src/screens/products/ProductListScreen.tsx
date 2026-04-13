import { signOut } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../../config/firebase";

export default function HomeScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const q = query(collection(db, "sanpham"), orderBy("tensp", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setProducts(data);
      setFiltered(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (search.trim() === "") {
      setFiltered(products);
    } else {
      const kw = search.toLowerCase();
      setFiltered(
        products.filter(
          (p) =>
            p.tensp?.toLowerCase().includes(kw) ||
            p.loaisp?.toLowerCase().includes(kw),
        ),
      );
    }
  }, [search, products]);

  const handleDelete = (item) => {
    Alert.alert("Xác nhận xóa", `Bạn có chắc muốn xóa "${item.tensp}"?`, [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "sanpham", item.id));
            Alert.alert("Thành công", "Đã xóa sản phẩm");
          } catch {
            Alert.alert("Lỗi", "Không thể xóa sản phẩm");
          }
        },
      },
    ]);
  };

  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn có muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      { text: "Đăng xuất", onPress: () => signOut(auth) },
    ]);
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      {item.hinhanh ? (
        <Image source={{ uri: item.hinhanh }} style={styles.img} />
      ) : (
        <View style={[styles.img, styles.noImg]}>
          <Text style={{ fontSize: 28 }}>📦</Text>
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {item.tensp}
        </Text>
        <Text style={styles.category}>🏷️ {item.loaisp}</Text>
        <Text style={styles.price}>{formatPrice(item.gia)}</Text>
        <Text style={styles.idText} numberOfLines={1}>
          ID: {item.idsanpham}
        </Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.editBtn]}
          onPress={() => navigation.navigate("EditProduct", { product: item })}
        >
          <Text>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.deleteBtn]}
          onPress={() => handleDelete(item)}
        >
          <Text>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🛍️ Sản Phẩm ({filtered.length})</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.search}
        placeholder="🔍 Tìm theo tên, loại sản phẩm..."
        value={search}
        onChangeText={setSearch}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          <Text style={styles.empty}>Chưa có sản phẩm nào</Text>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("AddProduct")}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f2f5" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    backgroundColor: "#2c3e50",
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  logoutBtn: {
    backgroundColor: "#e74c3c",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  logoutText: { color: "#fff", fontWeight: "bold" },
  search: {
    margin: 12,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 12,
    marginBottom: 10,
    borderRadius: 12,
    flexDirection: "row",
    padding: 12,
    elevation: 3,
  },
  img: { width: 80, height: 80, borderRadius: 8 },
  noImg: {
    backgroundColor: "#ecf0f1",
    justifyContent: "center",
    alignItems: "center",
  },
  info: { flex: 1, paddingHorizontal: 12, justifyContent: "center" },
  name: { fontSize: 16, fontWeight: "bold", color: "#2c3e50", marginBottom: 3 },
  category: { fontSize: 13, color: "#7f8c8d", marginBottom: 3 },
  price: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#e74c3c",
    marginBottom: 2,
  },
  idText: { fontSize: 11, color: "#bdc3c7" },
  actions: { justifyContent: "space-around" },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  editBtn: { backgroundColor: "#d6eaf8", marginBottom: 6 },
  deleteBtn: { backgroundColor: "#fadbd8" },
  empty: { textAlign: "center", marginTop: 60, fontSize: 16, color: "#95a5a6" },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#3498db",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
  },
  fabText: { color: "#fff", fontSize: 32, fontWeight: "bold", marginTop: -2 },
});
