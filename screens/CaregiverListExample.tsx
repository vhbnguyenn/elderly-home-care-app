import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { CaregiverAPI, CaregiverProfile, SearchCaregiverParams } from '../services/api';
import { useApiError } from '../services/api/error.handler';
import { Ionicons } from '@expo/vector-icons';

/**
 * Example Caregiver List Component using real backend API
 * 
 * Features:
 * - Load all caregivers
 * - Search with filters
 * - Display caregiver cards
 * - Navigate to caregiver detail
 */
export default function CaregiverListScreen() {
  const [caregivers, setCaregivers] = useState<CaregiverProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const { handleError } = useApiError();

  // Load caregivers on mount
  useEffect(() => {
    loadCaregivers();
  }, []);

  const loadCaregivers = async (page: number = 1) => {
    setLoading(true);

    try {
      const response = await CaregiverAPI.getAllProfiles({
        page,
        limit: 10,
      });

      console.log('Caregivers loaded:', response.data.length);

      if (page === 1) {
        setCaregivers(response.data);
      } else {
        setCaregivers((prev) => [...prev, ...response.data]);
      }

      setTotalCount(response.total);
      setCurrentPage(page);
    } catch (error) {
      const errorMessage = handleError(error, 'Load Caregivers');
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const searchCaregivers = async () => {
    if (!searchQuery.trim()) {
      loadCaregivers();
      return;
    }

    setLoading(true);

    try {
      const params: SearchCaregiverParams = {
        specialization: searchQuery,
        page: 1,
        limit: 10,
      };

      const response = await CaregiverAPI.searchCaregivers(params);

      console.log('Search results:', response.data.length);

      setCaregivers(response.data);
      setTotalCount(response.total);
      setCurrentPage(1);
    } catch (error) {
      const errorMessage = handleError(error, 'Search Caregivers');
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCaregivers(1);
    setRefreshing(false);
  };

  const handleLoadMore = () => {
    if (!loading && caregivers.length < totalCount) {
      loadCaregivers(currentPage + 1);
    }
  };

  const renderCaregiverCard = ({ item }: { item: CaregiverProfile }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => Alert.alert('Navigate', `Go to caregiver detail: ${item.id}`)}
    >
      <View style={styles.cardHeader}>
        {item.avatar ? (
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Ionicons name="person" size={32} color="#fff" />
          </View>
        )}

        <View style={styles.cardInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{item.fullName}</Text>
            {item.isVerified && (
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            )}
          </View>

          <View style={styles.ratingRow}>
            <Ionicons name="star" size={16} color="#FFC107" />
            <Text style={styles.rating}>
              {item.rating?.toFixed(1) || 'N/A'} ({item.totalReviews || 0} đánh giá)
            </Text>
          </View>

          <Text style={styles.experience}>{item.experience} năm kinh nghiệm</Text>
        </View>
      </View>

      <View style={styles.specializationsContainer}>
        {item.specializations.slice(0, 3).map((spec, index) => (
          <View key={index} style={styles.specializationBadge}>
            <Text style={styles.specializationText}>{spec}</Text>
          </View>
        ))}
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.price}>{item.hourlyRate.toLocaleString('vi-VN')} đ/giờ</Text>
        {item.isAvailable ? (
          <View style={styles.availableBadge}>
            <Text style={styles.availableText}>Sẵn sàng</Text>
          </View>
        ) : (
          <View style={styles.unavailableBadge}>
            <Text style={styles.unavailableText}>Bận</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#FF5722" />
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="people-outline" size={64} color="#ccc" />
      <Text style={styles.emptyText}>Không tìm thấy người chăm sóc</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo chuyên môn..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={searchCaregivers}
          />
        </View>
        <TouchableOpacity style={styles.searchButton} onPress={searchCaregivers}>
          <Text style={styles.searchButtonText}>Tìm</Text>
        </TouchableOpacity>
      </View>

      {/* Caregivers List */}
      <FlatList
        data={caregivers}
        renderItem={renderCaregiverCard}
        keyExtractor={(item) => item.id || Math.random().toString()}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={!loading ? renderEmpty : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#FF5722',
    paddingHorizontal: 24,
    borderRadius: 12,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 12,
  },
  avatarPlaceholder: {
    backgroundColor: '#FF5722',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  rating: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  experience: {
    fontSize: 14,
    color: '#999',
  },
  specializationsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  specializationBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  specializationText: {
    fontSize: 12,
    color: '#FF5722',
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF5722',
  },
  availableBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  availableText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  unavailableBadge: {
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  unavailableText: {
    fontSize: 12,
    color: '#F44336',
    fontWeight: '600',
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
});
