import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ThemedText } from '../themed-text';

interface ModernHeaderProps {
  userName?: string;
  userAvatar?: string;
  onSearchPress?: () => void;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
}

export const ModernHeader: React.FC<ModernHeaderProps> = ({
  userName = 'User',
  onSearchPress,
  onNotificationPress,
  onProfilePress,
}) => {
  return (
    <LinearGradient
      colors={['#FF6B6B', '#FF8E53']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.locationContainer}>
          <Ionicons name="location-sharp" size={20} color="#FFFFFF" />
          <View style={styles.locationText}>
            <ThemedText style={styles.locationLabel}>Nhà tôi</ThemedText>
            <ThemedText style={styles.locationAddress}>
              123 Lê Lợi, Quận 1, TP.HCM
            </ThemedText>
          </View>
        </View>
        <TouchableOpacity
          style={styles.avatarButton}
          onPress={onProfilePress}
        >
          <View style={styles.avatar}>
            <ThemedText style={styles.avatarText}>
              {userName.charAt(0).toUpperCase()}
            </ThemedText>
          </View>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm dịch vụ hoặc nhiệm vụ"
          placeholderTextColor="#999"
          onFocus={onSearchPress}
        />
      </View>

      {/* Title Section */}
      <View style={styles.titleSection}>
        <ThemedText style={styles.title}>Chăm sóc người thân</ThemedText>
        <ThemedText style={styles.subtitle}>Tìm người chăm sóc phù hợp</ThemedText>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationText: {
    marginLeft: 8,
    flex: 1,
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  locationAddress: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  avatarButton: {
    marginLeft: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#2c3e50',
  },
  titleSection: {
    marginTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
});
