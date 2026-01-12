import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { ThemedText } from '../themed-text';

interface ServiceCategory {
  id: string;
  title: string;
  icon: string;
  color: string;
  route?: string;
}

interface ServiceCategoriesProps {
  onCategoryPress?: (category: ServiceCategory) => void;
}

const categories: ServiceCategory[] = [
  {
    id: 'home-care',
    title: 'Chăm sóc\ntại nhà',
    icon: 'home',
    color: '#FF6B35',
  },
  {
    id: 'medical',
    title: 'Y tế &\nKiểm tra',
    icon: 'medical',
    color: '#FF8E53',
  },
  {
    id: 'therapy',
    title: 'Vật lý\ntrị liệu',
    icon: 'fitness',
    color: '#FFB84D',
  },
  {
    id: 'companion',
    title: 'Đồng hành\n& Trò chuyện',
    icon: 'people',
    color: '#6BCB77',
  },
  {
    id: 'meal',
    title: 'Nấu ăn &\nDinh dưỡng',
    icon: 'restaurant',
    color: '#FF8C42',
  },
  {
    id: 'cleaning',
    title: 'Vệ sinh &\nDọn dẹp',
    icon: 'water',
    color: '#A8E6CF',
  },
];

export const ServiceCategories: React.FC<ServiceCategoriesProps> = ({
  onCategoryPress,
}) => {
  const renderCategory = ({ item }: { item: ServiceCategory }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => onCategoryPress?.(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
        <Ionicons name={item.icon as any} size={28} color={item.color} />
      </View>
      <ThemedText style={styles.categoryTitle} numberOfLines={2}>
        {item.title}
      </ThemedText>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.sectionTitle}>Dịch vụ</ThemedText>
        <TouchableOpacity>
          <ThemedText style={styles.seeAllText}>Xem tất cả</ThemedText>
        </TouchableOpacity>
      </View>
      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id}
        numColumns={3}
        scrollEnabled={false}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  seeAllText: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 10,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  categoryCard: {
    width: '31%',
    aspectRatio: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: 'center',
    lineHeight: 14,
  },
});
