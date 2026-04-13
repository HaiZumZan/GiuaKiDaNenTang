import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { db } from "../../config/firebase";

const STATUS_TABS = [
  { key: "pending", label: "Chờ duyệt", color: "#e67e22" },
  { key: "confirmed", label: "Đã duyệt", color: "#3498db" },
  { key: "shipping", label: "Đang giao", color: "#9b59b6" },
  { key: "done", label: "Hoàn thành", color: "#27ae60" },
];

export default function OrderListScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  const filtered = orders.filter((o) => o.status === activeTab);

  const formatPrice = (p) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(p);

  const formatDate = (iso) => new Date(iso).toLocaleString("vi-VN");

  const currentTab = STATUS_TABS.find((t) => t.key === activeTab);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("OrderDetail", { order: item })}
    >
      <View style={styles.cardTop}>
        <Text style={styles.orderId} numberOfLines={1}>
          🧾 {item.orderId?.slice(0, 8).toUpperCase()}...
        </Text>
        <View style={[styles.badge, { backgroundColor: currentTab.color }]}>
          <Text style={styles.badgeText}>{currentTab.label}</Text>
        </View>
      </View>
      <Text style={styles.userName}>👤 {item.userName}</Text>
      <Text style={styles.address}>📍 {item.deliveryAddress}</Text>
      <View style={styles.cardBottom}>
        <Text style={styles.itemCount}>{item.items?.length} món</Text>
        <Text style={styles.total}>{formatPrice(item.total)}</Text>
      </View>
      <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🧾 Quản Lý Đơn Hàng</Text>
      </View>

      {/* Status tabs */}
      <View style={styles.tabs}>
        {STATUS_TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && {
                borderBottomColor: tab.color,
                borderBottomWidth: 3,
              },
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && {
                  color: tab.color,
                  fontWeight: "700",
                },
              ]}
            >
              {tab.label}
            </Text>
            <Text style={[styles.tabCount, { color: tab.color }]}>
              {orders.filter((o) => o.status === tab.key).length}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#3498db"
          style={{ marginTop: 40 }}
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 12, paddingBottom: 40 }}
          ListEmptyComponent={
            <Text style={styles.empty}>Không có đơn hàng nào</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f2f5" },
  header: {
    backgroundColor: "#2c3e50",
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  tabs: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  tab: { flex: 1, alignItems: "center", paddingVertical: 10 },
  tabText: { fontSize: 11, color: "#95a5a6" },
  tabCount: { fontSize: 16, fontWeight: "bold", marginTop: 2 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    elevation: 2,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  orderId: { fontSize: 13, fontWeight: "700", color: "#2c3e50", flex: 1 },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  userName: { fontSize: 14, color: "#2c3e50", marginBottom: 3 },
  address: { fontSize: 13, color: "#7f8c8d", marginBottom: 8 },
  cardBottom: { flexDirection: "row", justifyContent: "space-between" },
  itemCount: { fontSize: 13, color: "#7f8c8d" },
  total: { fontSize: 15, fontWeight: "bold", color: "#e74c3c" },
  date: { fontSize: 11, color: "#bdc3c7", marginTop: 6 },
  empty: { textAlign: "center", marginTop: 60, color: "#95a5a6", fontSize: 15 },
});
