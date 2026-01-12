import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/contexts/AuthContext';
import { profileService, UserProfile } from '@/services/profile.service';

interface MenuItem {
    id: string;
    title: string;
    icon: string;
    route?: string;
    action?: () => void;
    badge?: number;
    color?: string;
}

export default function ProfileScreen() {
    const { user, logout } = useAuth();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [profileData, setProfileData] = useState<UserProfile | null>(null);

    // Load data on mount
    useEffect(() => {
        loadProfileData();
    }, []);

    const loadProfileData = async () => {
        try {
            setIsLoading(true);
            
            // Debug: Check authentication state
            console.log('[Profile] User from context:', user);
            const AsyncStorage = require('@react-native-async-storage/async-storage').default;
            const token = await AsyncStorage.getItem('auth_token');
            console.log('[Profile] Token exists:', !!token);
            
            if (!token) {
                console.log('[Profile] ❌ No token found, redirecting to login...');
                Alert.alert(
                    'Phiên đăng nhập hết hạn',
                    'Vui lòng đăng nhập lại',
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                logout();
                                router.replace('/login');
                            }
                        }
                    ]
                );
                return;
            }
            
            // Load profile data only
            const profileRes = await profileService.getMe();
            setProfileData(profileRes);
        } catch (error: any) {
            console.error('[Profile] Load error:', error);
            
            // If it's an auth error, show alert and logout
            if (error.message?.includes('token') || error.message?.includes('authentication')) {
                Alert.alert(
                    'Lỗi xác thực',
                    'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                logout();
                                router.replace('/login');
                            }
                        }
                    ]
                );
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleUploadAvatar = async () => {
        try {
            // Request permission
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Thông báo', 'Cần cấp quyền truy cập thư viện ảnh');
                return;
            }

            // Pick image
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                const asset = result.assets[0];
                
                setIsUploadingAvatar(true);

                // Create FormData
                const formData = new FormData();
                formData.append('avatar', {
                    uri: asset.uri,
                    type: 'image/jpeg',
                    name: 'avatar.jpg',
                } as any);

                // Upload
                const updatedProfile = await profileService.updateProfile(formData);
                
                setProfileData(updatedProfile);
                Alert.alert('Thành công', 'Cập nhật ảnh đại diện thành công');
            }
        } catch (error: any) {
            console.error('[Profile] Upload avatar error:', error);
            Alert.alert('Lỗi', error.message || 'Không thể tải ảnh lên');
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            'Đăng xuất',
            'Bạn có chắc chắn muốn đăng xuất?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Đăng xuất',
                    style: 'destructive',
                    onPress: async () => {
                        setIsLoggingOut(true);
                        await logout();
                        router.replace('/login');
                    },
                },
            ]
        );
    };

    const menuSections = [
        {
            title: 'Quản lý',
            items: [
                {
                    id: 'elderly',
                    title: 'Hồ sơ người già',
                    icon: 'people',
                    route: '/careseeker/elderly-list',
                    color: '#FF6B35',
                },
                {
                    id: 'family',
                    title: 'Quản lý gia đình',
                    icon: 'home',
                    route: '/careseeker/family-list',
                    color: '#FF8E53',
                },
                {
                    id: 'hired',
                    title: 'Người chăm sóc đã thuê',
                    icon: 'person-add',
                    route: '/careseeker/hired-caregivers',
                    color: '#FFA07A',
                },
            ],
        },
        {
            title: 'Hoạt động',
            items: [
                {
                    id: 'appointments',
                    title: 'Lịch hẹn',
                    icon: 'calendar',
                    route: '/careseeker/appointments',
                    color: '#FF6B35',
                },
                {
                    id: 'history',
                    title: 'Lịch sử thuê',
                    icon: 'time',
                    route: '/careseeker/hiring-history',
                    color: '#FFA500',
                },
                {
                    id: 'reviews',
                    title: 'Đánh giá của tôi',
                    icon: 'star',
                    route: '/careseeker/reviews',
                    color: '#FFB648',
                },
            ],
        },
        {
            title: 'Hỗ trợ',
            items: [
                {
                    id: 'complaints',
                    title: 'Khiếu nại',
                    icon: 'alert-circle',
                    route: '/careseeker/complaints',
                    color: '#FF6B35',
                },
                {
                    id: 'system-info',
                    title: 'Về hệ thống',
                    icon: 'information-circle',
                    route: '/careseeker/system-info',
                    color: '#6B7280',
                },
            ],
        },
        {
            title: 'Tài khoản',
            items: [
                {
                    id: 'settings',
                    title: 'Cài đặt',
                    icon: 'settings',
                    route: '/careseeker/in-progress',
                    color: '#6B7280',
                },
                {
                    id: 'logout',
                    title: 'Đăng xuất',
                    icon: 'log-out',
                    action: handleLogout,
                    color: '#FF6B35',
                },
            ],
        },
    ];

    const handleMenuPress = (item: MenuItem) => {
        if (item.action) {
            item.action();
        } else if (item.route) {
            router.push(item.route as any);
        }
    };

    // Show loading state
    if (isLoading) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FF6B35" />
                    <ThemedText style={styles.loadingText}>Đang tải...</ThemedText>
                </View>
            </SafeAreaView>
        );
    }

    const displayUser = profileData || user;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header with Profile Info */}
            <View style={styles.header}>
                <View style={styles.profileSection}>
                    <View style={styles.avatarContainer}>
                        {displayUser?.avatar ? (
                            <Image
                                source={{ uri: displayUser.avatar }}
                                style={styles.avatar}
                            />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <ThemedText style={styles.avatarText}>
                                    {displayUser?.name?.charAt(0) || displayUser?.email?.charAt(0) || 'U'}
                                </ThemedText>
                            </View>
                        )}
                        <TouchableOpacity 
                            style={styles.editAvatarButton}
                            onPress={handleUploadAvatar}
                            disabled={isUploadingAvatar}
                        >
                            {isUploadingAvatar ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <Ionicons name="camera" size={16} color="white" />
                            )}
                        </TouchableOpacity>
                    </View>

                    <View style={styles.userInfo}>
                        <ThemedText style={styles.userName}>
                            {displayUser?.name || 'Người dùng'}
                        </ThemedText>
                        <View style={styles.roleBadge}>
                            <ThemedText style={styles.roleText}>Care Seeker</ThemedText>
                        </View>
                    </View>
                </View>
            </View>

            {/* Menu Sections */}
            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {menuSections.map((section, sectionIndex) => (
                    <View key={sectionIndex} style={styles.menuSection}>
                        <ThemedText style={styles.sectionTitle}>{section.title}</ThemedText>
                        <View style={styles.menuList}>
                            {section.items.map((item, itemIndex) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={[
                                        styles.menuItem,
                                        itemIndex === section.items.length - 1 && styles.menuItemLast,
                                    ]}
                                    onPress={() => handleMenuPress(item)}
                                    activeOpacity={0.7}
                                    disabled={isLoggingOut && item.id === 'logout'}
                                >
                                    <View style={styles.menuItemLeft}>
                                        <View
                                            style={[
                                                styles.menuIcon,
                                                { backgroundColor: item.color + '20' },
                                            ]}
                                        >
                                            <Ionicons
                                                name={item.icon as any}
                                                size={20}
                                                color={item.color}
                                            />
                                        </View>
                                        <ThemedText style={styles.menuItemText}>
                                            {item.title}
                                        </ThemedText>
                                        {item.badge && item.badge > 0 && (
                                            <View style={styles.badge}>
                                                <ThemedText style={styles.badgeText}>
                                                    {item.badge}
                                                </ThemedText>
                                            </View>
                                        )}
                                    </View>
                                    <Ionicons
                                        name="chevron-forward"
                                        size={20}
                                        color="#9CA3AF"
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ))}

                {/* App Version */}
                <View style={styles.versionContainer}>
                    <ThemedText style={styles.versionText}>
                        Elder Care Connect v1.0.0
                    </ThemedText>
                    <ThemedText style={styles.copyrightText}>
                        © 2025 All rights reserved
                    </ThemedText>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F4F9FD',
    },
    header: {
        backgroundColor: 'white',
        paddingTop: 20,
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 16,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    avatarPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FF6B35',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 32,
        fontWeight: '700',
        color: 'white',
    },
    editAvatarButton: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#FF6B35',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'white',
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 20,
        fontWeight: '700',
        color: '#12394A',
        marginBottom: 8,
    },
    roleBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#FFE5D9',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    roleText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FF6B35',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 120,
    },
    menuSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#6B7280',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    menuList: {
        backgroundColor: 'white',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    menuItemLast: {
        borderBottomWidth: 0,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    menuIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    menuItemText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#12394A',
        flex: 1,
    },
    badge: {
        backgroundColor: '#FF6B35',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        marginLeft: 8,
        minWidth: 20,
        alignItems: 'center',
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: 'white',
    },
    versionContainer: {
        alignItems: 'center',
        marginTop: 20,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    versionText: {
        fontSize: 12,
        color: '#9CA3AF',
        marginBottom: 4,
    },
    copyrightText: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F4F9FD',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#6B7280',
    },
});

