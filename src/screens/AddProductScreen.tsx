import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, Image, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { collection, addDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { db } from '../config/firebase';
import { uploadImageToCloudinary } from '../config/cloudinary';
import uuid from 'react-native-uuid';

const LOAI_SP = ['Điện tử', 'Thời trang', 'Thực phẩm', 'Đồ gia dụng', 'Khác'];

export default function AddProductScreen({ navigation }) {
  const [tensp, setTensp] = useState('');
  const [loaisp, setLoaisp] = useState('');
  const [gia, setGia] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Lỗi', 'Cần cấp quyền truy cập thư viện ảnh');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!tensp.trim() || !loaisp.trim() || !gia.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ tên, loại và giá sản phẩm');
      return;
    }
    if (isNaN(Number(gia)) || Number(gia) <= 0) {
      Alert.alert('Lỗi', 'Giá sản phẩm phải là số dương');
      return;
    }

    setLoading(true);
    let hinhanh = '';

    try {
      if (imageUri) {
        setUploading(true);
        hinhanh = await uploadImageToCloudinary(imageUri);
        setUploading(false);
      }

      const idsanpham = uuid.v4();

      await addDoc(collection(db, 'sanpham'), {
        idsanpham,
        tensp: tensp.trim(),
        loaisp: loaisp.trim(),
        gia: Number(gia),
        hinhanh,
      });

      Alert.alert('Thành công', 'Thêm sản phẩm thành công!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi', 'Không thể thêm sản phẩm. Vui lòng thử lại.');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>← Quay lại</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Thêm Sản Phẩm</Text>
          <View style={{ width: 70 }} />
        </View>

        <View style={styles.form}>
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

          <Text style={styles.label}>Tên sản phẩm *</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập tên sản phẩm"
            value={tensp}
            onChangeText={setTensp}
          />

          <Text style={styles.label}>Loại sản phẩm *</Text>
          <View style={styles.tagRow}>
            {LOAI_SP.map(tag => (
              <TouchableOpacity
                key={tag}
                style={[styles.tag, loaisp === tag && styles.tagActive]}
                onPress={() => setLoaisp(tag)}
              >
                <Text style={[styles.tagText, loaisp === tag && styles.tagTextActive]}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={styles.input}
            placeholder="Hoặc nhập loại khác"
            value={loaisp}
            onChangeText={setLoaisp}
          />

          <Text style={styles.label}>Giá (VNĐ) *</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập giá sản phẩm"
            value={gia}
            onChangeText={setGia}
            keyboardType="numeric"
          />

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.btnText}>
                  {uploading ? 'Đang tải ảnh...' : 'Đang lưu...'}
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
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  header: {
    backgroundColor: '#2c3e50', paddingTop: 50, paddingBottom: 16,
    paddingHorizontal: 20, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center'
  },
  back: { color: '#3498db', fontSize: 15 },
  title: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  form: { padding: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#2c3e50', marginBottom: 6, marginTop: 14 },
  input: {
    backgroundColor: '#fff', borderRadius: 10, padding: 14,
    fontSize: 16, borderWidth: 1, borderColor: '#ddd', marginBottom: 4
  },
  imagePicker: {
    backgroundColor: '#fff', borderRadius: 12, borderWidth: 2,
    borderColor: '#ddd', borderStyle: 'dashed', overflow: 'hidden'
  },
  previewImg: { width: '100%', height: 200, resizeMode: 'cover' },
  imagePlaceholder: { height: 150, justifyContent: 'center', alignItems: 'center' },
  imageHint: { color: '#95a5a6', marginTop: 8, fontSize: 14 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  tag: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1, borderColor: '#bdc3c7', margin: 3, backgroundColor: '#fff'
  },
  tagActive: { backgroundColor: '#3498db', borderColor: '#3498db' },
  tagText: { color: '#7f8c8d', fontSize: 13 },
  tagTextActive: { color: '#fff' },
  btn: {
    backgroundColor: '#3498db', borderRadius: 12, padding: 16,
    alignItems: 'center', marginTop: 24, marginBottom: 40
  },
  btnDisabled: { backgroundColor: '#95a5a6' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});