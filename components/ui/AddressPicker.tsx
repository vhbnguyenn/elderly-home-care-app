import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { AddressSelector } from './AddressSelector';

interface AddressPickerProps {
  onAddressSelected: (address: string) => void;
  initialAddress?: string;
  isStreetRequired?: boolean;
  showStreetHint?: boolean;
}

export const AddressPicker: React.FC<AddressPickerProps> = ({
  onAddressSelected,
  initialAddress = '',
  showStreetHint = false,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          Địa chỉ <Text style={styles.required}>*</Text>
        </Text>
        {showStreetHint && (
          <View style={styles.hintBanner}>
            <Ionicons name="information-circle" size={16} color="#FF6B35" />
            <Text style={styles.hintText}>
              Nhập địa chỉ và chọn từ danh sách gợi ý
            </Text>
          </View>
        )}
        
        <AddressSelector
          onAddressChange={onAddressSelected}
          initialAddress={initialAddress}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  required: {
    color: '#FF6B35',
    fontSize: 14,
    fontWeight: '600',
  },
  hintBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 8,
    marginBottom: 4,
    gap: 6,
  },
  hintText: {
    flex: 1,
    fontSize: 12,
    color: '#FF6B35',
    lineHeight: 16,
  },
});
