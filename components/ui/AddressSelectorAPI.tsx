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
  ActivityIndicator,
} from 'react-native';
import { addressService, Province, District, Ward } from '@/services/address.service';

interface AddressSelectorAPIProps {
  onAddressChange: (address: {
    street?: string;
    ward?: Ward;
    district?: District;
    province?: Province;
    fullAddress: string;
  }) => void;
  initialAddress?: string;
}

export const AddressSelectorAPI: React.FC<AddressSelectorAPIProps> = ({
  onAddressChange,
  initialAddress,
}) => {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

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

  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [isLoadingWards, setIsLoadingWards] = useState(false);

  // Load provinces on mount
  useEffect(() => {
    loadProvinces();
  }, []);

  // Update full address whenever any field changes
  useEffect(() => {
    const parts = [
      streetAddress,
      selectedWard?.name,
      selectedDistrict?.name,
      selectedProvince?.name,
    ].filter(Boolean);
    
    onAddressChange({
      street: streetAddress,
      ward: selectedWard || undefined,
      district: selectedDistrict || undefined,
      province: selectedProvince || undefined,
      fullAddress: parts.join(', '),
    });
  }, [selectedProvince, selectedDistrict, selectedWard, streetAddress]);

  const loadProvinces = async () => {
    setIsLoadingProvinces(true);
    try {
      const data = await addressService.getProvinces();
      setProvinces(data);
    } catch (error) {
      console.error('Error loading provinces:', error);
    } finally {
      setIsLoadingProvinces(false);
    }
  };

  const loadDistricts = async (provinceCode: number) => {
    setIsLoadingDistricts(true);
    try {
      const data = await addressService.getDistricts(provinceCode);
      setDistricts(data);
    } catch (error) {
      console.error('Error loading districts:', error);
    } finally {
      setIsLoadingDistricts(false);
    }
  };

  const loadWards = async (districtCode: number) => {
    setIsLoadingWards(true);
    try {
      const data = await addressService.getWards(districtCode);
      setWards(data);
    } catch (error) {
      console.error('Error loading wards:', error);
    } finally {
      setIsLoadingWards(false);
    }
  };

  // Filter functions
  const filteredProvinces = addressService.searchProvinces(provinces, provinceSearch);
  const filteredDistricts = addressService.searchDistricts(districts, districtSearch);
  const filteredWards = addressService.searchWards(wards, wardSearch);

  // Handle selections
  const handleProvinceSelect = async (province: Province) => {
    setSelectedProvince(province);
    setSelectedDistrict(null);
    setSelectedWard(null);
    setDistricts([]);
    setWards([]);
    setShowProvinceModal(false);
    setProvinceSearch('');
    
    // Load districts for selected province
    await loadDistricts(province.code);
  };

  const handleDistrictSelect = async (district: District) => {
    setSelectedDistrict(district);
    setSelectedWard(null);
    setWards([]);
    setShowDistrictModal(false);
    setDistrictSearch('');
    
    // Load wards for selected district
    await loadWards(district.code);
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
    title: string,
    isLoading: boolean
  ) => (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#2C3E50" />
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder={`Tìm kiếm ${title.toLowerCase()}...`}
              placeholderTextColor="#9CA3AF"
              value={searchValue}
              onChangeText={onSearchChange}
            />
          </View>

          {/* List */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF5722" />
              <Text style={styles.loadingText}>Đang tải...</Text>
            </View>
          ) : (
            <FlatList
              data={data}
              keyExtractor={(item) => item.code.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.listItem}
                  onPress={() => onSelect(item)}
                >
                  <Text style={styles.listItemText}>{item.name}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>Không tìm thấy kết quả</Text>
              }
            />
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Street Address Input */}
      <View>
        <Text style={styles.fieldLabel}>Số nhà, tên đường</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập số nhà, tên đường (tùy chọn)"
          placeholderTextColor="#9CA3AF"
          value={streetAddress}
          onChangeText={setStreetAddress}
        />
      </View>

      {/* Province Selector */}
      <View>
        <Text style={styles.fieldLabel}>
          Tỉnh/Thành phố <Text style={styles.requiredStar}>*</Text>
        </Text>
        <TouchableOpacity
          style={styles.selector}
          onPress={() => setShowProvinceModal(true)}
          disabled={isLoadingProvinces}
        >
          <Text
            style={[
              styles.selectorText,
              !selectedProvince && styles.selectorPlaceholder,
            ]}
          >
            {selectedProvince?.name || 'Chọn Tỉnh/Thành phố'}
          </Text>
          {isLoadingProvinces ? (
            <ActivityIndicator size="small" color="#FF5722" />
          ) : (
            <Ionicons name="chevron-down" size={20} color="#2C3E50" />
          )}
        </TouchableOpacity>
      </View>

      {/* District Selector */}
      <View>
        <Text style={styles.fieldLabel}>
          Quận/Huyện <Text style={styles.requiredStar}>*</Text>
        </Text>
        <TouchableOpacity
          style={[
            styles.selector,
            !selectedProvince && styles.selectorDisabled,
          ]}
          onPress={() => setShowDistrictModal(true)}
          disabled={!selectedProvince || isLoadingDistricts}
        >
          <Text
            style={[
              styles.selectorText,
              !selectedDistrict && styles.selectorPlaceholder,
            ]}
          >
            {selectedDistrict?.name || 'Chọn Quận/Huyện'}
          </Text>
          {isLoadingDistricts ? (
            <ActivityIndicator size="small" color="#FF5722" />
          ) : (
            <Ionicons name="chevron-down" size={20} color="#2C3E50" />
          )}
        </TouchableOpacity>
      </View>

      {/* Ward Selector */}
      <View>
        <Text style={styles.fieldLabel}>
          Phường/Xã <Text style={styles.requiredStar}>*</Text>
        </Text>
        <TouchableOpacity
          style={[
            styles.selector,
            !selectedDistrict && styles.selectorDisabled,
          ]}
          onPress={() => setShowWardModal(true)}
          disabled={!selectedDistrict || isLoadingWards}
        >
          <Text
            style={[
              styles.selectorText,
              !selectedWard && styles.selectorPlaceholder,
            ]}
          >
            {selectedWard?.name || 'Chọn Phường/Xã'}
          </Text>
          {isLoadingWards ? (
            <ActivityIndicator size="small" color="#FF5722" />
          ) : (
            <Ionicons name="chevron-down" size={20} color="#2C3E50" />
          )}
        </TouchableOpacity>
      </View>

      {/* Modals */}
      {renderModal(
        showProvinceModal,
        () => setShowProvinceModal(false),
        filteredProvinces,
        handleProvinceSelect,
        provinceSearch,
        setProvinceSearch,
        'Tỉnh/Thành phố',
        isLoadingProvinces
      )}

      {renderModal(
        showDistrictModal,
        () => setShowDistrictModal(false),
        filteredDistricts,
        handleDistrictSelect,
        districtSearch,
        setDistrictSearch,
        'Quận/Huyện',
        isLoadingDistricts
      )}

      {renderModal(
        showWardModal,
        () => setShowWardModal(false),
        filteredWards,
        handleWardSelect,
        wardSearch,
        setWardSearch,
        'Phường/Xã',
        isLoadingWards
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  requiredStar: {
    color: '#EF4444',
  },
  input: {
    height: 56,
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#2C3E50',
  },
  selector: {
    height: 56,
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectorDisabled: {
    opacity: 0.5,
  },
  selectorText: {
    fontSize: 16,
    color: '#2C3E50',
  },
  selectorPlaceholder: {
    color: '#9CA3AF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
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
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
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
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingLeft: 40,
    paddingRight: 16,
    fontSize: 16,
    color: '#2C3E50',
  },
  listItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  listItemText: {
    fontSize: 16,
    color: '#2C3E50',
  },
  emptyText: {
    textAlign: 'center',
    padding: 32,
    fontSize: 16,
    color: '#9CA3AF',
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#9CA3AF',
  },
});


