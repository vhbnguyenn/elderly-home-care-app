import { Colors } from '@/constants/theme';
import { vietnamProvinces, Province, District, Ward } from '@/data/vietnamAddress';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  TextInput,
} from 'react-native';

interface AddressSelectorProps {
  onAddressChange: (address: string) => void;
  initialAddress?: string;
}

export const AddressSelector: React.FC<AddressSelectorProps> = ({
  onAddressChange,
  initialAddress,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
  const [selectedWard, setSelectedWard] = useState<Ward | null>(null);
  const [streetAddress, setStreetAddress] = useState('');

  const [showProvinceModal, setShowProvinceModal] = useState(false);
  const [showDistrictModal, setShowDistrictModal] = useState(false);
  const [showWardModal, setShowWardModal] = useState(false);

  const [provinceSearch, setProvinceSearch] = useState('');
  const [districtSearch, setDistrictSearch] = useState('');
  const [wardSearch, setWardSearch] = useState('');

  // Update full address whenever any field changes
  useEffect(() => {
    const parts = [
      streetAddress,
      selectedWard?.name,
      selectedDistrict?.name,
      selectedProvince?.name,
    ].filter(Boolean);
    
    onAddressChange(parts.join(', '));
  }, [selectedProvince, selectedDistrict, selectedWard, streetAddress]);

  // Filter functions
  const filteredProvinces = vietnamProvinces.filter(p =>
    p.name.toLowerCase().includes(provinceSearch.toLowerCase())
  );

  const filteredDistricts = selectedProvince
    ? selectedProvince.districts.filter(d =>
        d.name.toLowerCase().includes(districtSearch.toLowerCase())
      )
    : [];

  const filteredWards = selectedDistrict
    ? selectedDistrict.wards.filter(w =>
        w.name.toLowerCase().includes(wardSearch.toLowerCase())
      )
    : [];

  // Handle selections
  const handleProvinceSelect = (province: Province) => {
    setSelectedProvince(province);
    setSelectedDistrict(null);
    setSelectedWard(null);
    setShowProvinceModal(false);
    setProvinceSearch('');
  };

  const handleDistrictSelect = (district: District) => {
    setSelectedDistrict(district);
    setSelectedWard(null);
    setShowDistrictModal(false);
    setDistrictSearch('');
  };

  const handleWardSelect = (ward: Ward) => {
    setSelectedWard(ward);
    setShowWardModal(false);
    setWardSearch('');
  };

  const renderModal = (
    visible: boolean,
    onClose: () => void,
    data: any[],
    onSelect: (item: any) => void,
    searchValue: string,
    onSearchChange: (text: string) => void,
    title: string
  ) => (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          {/* Header */}
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { 
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.text 
              }]}
              placeholder={`Tìm kiếm ${title.toLowerCase()}...`}
              placeholderTextColor="#999"
              value={searchValue}
              onChangeText={onSearchChange}
            />
          </View>

          {/* List */}
          <FlatList
            data={data}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.listItem, { borderBottomColor: colors.border }]}
                onPress={() => onSelect(item)}
              >
                <Text style={[styles.listItemText, { color: colors.text }]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={[styles.emptyText, { color: colors.text }]}>
                Không tìm thấy kết quả
              </Text>
            }
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Street Address Input */}
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.background,
            borderColor: colors.border,
            color: colors.text,
          },
        ]}
        placeholder="Số nhà, tên đường (tùy chọn)"
        placeholderTextColor={colors.text + '80'}
        value={streetAddress}
        onChangeText={setStreetAddress}
      />

      {/* Province Selector */}
      <TouchableOpacity
        style={[
          styles.selector,
          {
            backgroundColor: colors.background,
            borderColor: colors.border,
          },
        ]}
        onPress={() => setShowProvinceModal(true)}
      >
        <Text
          style={[
            styles.selectorText,
            { color: selectedProvince ? colors.text : colors.text + '80' },
          ]}
        >
          {selectedProvince?.name || 'Chọn Tỉnh/Thành phố *'}
        </Text>
        <Ionicons name="chevron-down" size={20} color={colors.text} />
      </TouchableOpacity>

      {/* District Selector */}
      <TouchableOpacity
        style={[
          styles.selector,
          {
            backgroundColor: colors.background,
            borderColor: colors.border,
            opacity: selectedProvince ? 1 : 0.5,
          },
        ]}
        onPress={() => selectedProvince && setShowDistrictModal(true)}
        disabled={!selectedProvince}
      >
        <Text
          style={[
            styles.selectorText,
            { color: selectedDistrict ? colors.text : colors.text + '80' },
          ]}
        >
          {selectedDistrict?.name || 'Chọn Quận/Huyện *'}
        </Text>
        <Ionicons name="chevron-down" size={20} color={colors.text} />
      </TouchableOpacity>

      {/* Ward Selector */}
      <TouchableOpacity
        style={[
          styles.selector,
          {
            backgroundColor: colors.background,
            borderColor: colors.border,
            opacity: selectedDistrict ? 1 : 0.5,
          },
        ]}
        onPress={() => selectedDistrict && setShowWardModal(true)}
        disabled={!selectedDistrict}
      >
        <Text
          style={[
            styles.selectorText,
            { color: selectedWard ? colors.text : colors.text + '80' },
          ]}
        >
          {selectedWard?.name || 'Chọn Phường/Xã *'}
        </Text>
        <Ionicons name="chevron-down" size={20} color={colors.text} />
      </TouchableOpacity>

      {/* Modals */}
      {renderModal(
        showProvinceModal,
        () => setShowProvinceModal(false),
        filteredProvinces,
        handleProvinceSelect,
        provinceSearch,
        setProvinceSearch,
        'Tỉnh/Thành phố'
      )}

      {renderModal(
        showDistrictModal,
        () => setShowDistrictModal(false),
        filteredDistricts,
        handleDistrictSelect,
        districtSearch,
        setDistrictSearch,
        'Quận/Huyện'
      )}

      {renderModal(
        showWardModal,
        () => setShowWardModal(false),
        filteredWards,
        handleWardSelect,
        wardSearch,
        setWardSearch,
        'Phường/Xã'
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  selector: {
    height: 56,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectorText: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchContainer: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: 28,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingLeft: 40,
    paddingRight: 16,
    fontSize: 16,
  },
  listItem: {
    padding: 16,
    borderBottomWidth: 1,
  },
  listItemText: {
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    padding: 32,
    fontSize: 16,
    opacity: 0.5,
  },
});
