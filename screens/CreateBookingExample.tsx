import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { BookingAPI, CreateBookingPayload } from '../services/api';
import { useApiError } from '../services/api/error.handler';
import { router } from 'expo-router';

/**
 * Example Create Booking Component
 * 
 * Features:
 * - Create new booking
 * - Input validation
 * - Error handling
 * - Success navigation
 */
export default function CreateBookingExample() {
  const [formData, setFormData] = useState({
    caregiverId: '',
    elderlyProfileId: '',
    startDate: '',
    endDate: '',
    serviceType: 'hourly' as const,
    totalCost: '',
    address: '',
    city: '',
    district: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const { handleError } = useApiError();

  const handleSubmit = async () => {
    // Validation
    if (!formData.caregiverId || !formData.elderlyProfileId) {
      Alert.alert('Lỗi', 'Vui lòng chọn người chăm sóc và hồ sơ người cao tuổi');
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      Alert.alert('Lỗi', 'Vui lòng chọn ngày bắt đầu và kết thúc');
      return;
    }

    if (!formData.address || !formData.city || !formData.district) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ địa chỉ');
      return;
    }

    setLoading(true);

    try {
      const payload: CreateBookingPayload = {
        caregiverId: formData.caregiverId,
        elderlyProfileId: formData.elderlyProfileId,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        serviceType: formData.serviceType,
        totalCost: parseFloat(formData.totalCost),
        address: formData.address,
        city: formData.city,
        district: formData.district,
        notes: formData.notes,
      };

      const booking = await BookingAPI.create(payload);

      console.log('Booking created:', booking);

      Alert.alert(
        'Thành công',
        'Đã tạo booking thành công!',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      const errorMessage = handleError(error, 'Create Booking');
      Alert.alert('Tạo booking thất bại', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Tạo Booking Mới</Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>ID Người chăm sóc *</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập ID người chăm sóc"
              value={formData.caregiverId}
              onChangeText={(text) =>
                setFormData({ ...formData, caregiverId: text })
              }
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>ID Hồ sơ người cao tuổi *</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập ID hồ sơ"
              value={formData.elderlyProfileId}
              onChangeText={(text) =>
                setFormData({ ...formData, elderlyProfileId: text })
              }
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ngày bắt đầu * (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              placeholder="2024-01-01"
              value={formData.startDate}
              onChangeText={(text) =>
                setFormData({ ...formData, startDate: text })
              }
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ngày kết thúc * (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              placeholder="2024-01-31"
              value={formData.endDate}
              onChangeText={(text) =>
                setFormData({ ...formData, endDate: text })
              }
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tổng chi phí * (VNĐ)</Text>
            <TextInput
              style={styles.input}
              placeholder="500000"
              value={formData.totalCost}
              onChangeText={(text) =>
                setFormData({ ...formData, totalCost: text })
              }
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Địa chỉ *</Text>
            <TextInput
              style={styles.input}
              placeholder="Số nhà, tên đường"
              value={formData.address}
              onChangeText={(text) =>
                setFormData({ ...formData, address: text })
              }
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Thành phố *</Text>
            <TextInput
              style={styles.input}
              placeholder="Hồ Chí Minh"
              value={formData.city}
              onChangeText={(text) =>
                setFormData({ ...formData, city: text })
              }
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Quận/Huyện *</Text>
            <TextInput
              style={styles.input}
              placeholder="Quận 1"
              value={formData.district}
              onChangeText={(text) =>
                setFormData({ ...formData, district: text })
              }
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ghi chú</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Thông tin thêm..."
              value={formData.notes}
              onChangeText={(text) =>
                setFormData({ ...formData, notes: text })
              }
              multiline
              numberOfLines={4}
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Tạo Booking</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 24,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#F8F9FA',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#FF5722',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
});
