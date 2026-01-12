import CaregiverBottomNav from "@/components/navigation/CaregiverBottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { ChatAPI, ChatListItem } from "@/services/api";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

// Types
interface ChatItem {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  isOnline: boolean;
  isPriority?: boolean;
  isTyping?: boolean;
  isSeen?: boolean;
}

// Mock data
const chatData: ChatItem[] = [
  {
    id: "1",
    name: "Nguyễn Thị Lan",
    avatar: "👵",
    lastMessage: "Chào anh, hôm nay tôi cảm thấy khỏe hơn rồi",
    time: "9:30",
    unreadCount: 2,
    isOnline: true,
    isPriority: true,
  },
  {
    id: "2",
    name: "Trần Văn Hùng",
    avatar: "👴",
    lastMessage: "đang nhập...",
    time: "9:15",
    unreadCount: 0,
    isOnline: true,
    isTyping: true,
  },
  {
    id: "3",
    name: "Lê Thị Phương",
    avatar: "�",
    lastMessage: "🚨 Khẩn cấp: Tôi vừa ngã, cần hỗ trợ ngay!",
    time: "8:45",
    unreadCount: 1,
    isOnline: false,
    isPriority: true,
  },
  {
    id: "4",
    name: "Nguyễn Thị Mai",
    avatar: "👵",
    lastMessage: "✓✓ Cảm ơn anh đã chăm sóc tôi rất tốt!",
    time: "Hôm qua",
    unreadCount: 0,
    isOnline: false,
    isSeen: true,
  },
  {
    id: "5",
    name: "Lê Văn Sơn",
    avatar: "👴",
    lastMessage: "✓ Vâng, tôi đã uống thuốc đầy đủ rồi",
    time: "Hôm qua",
    unreadCount: 0,
    isOnline: false,
  },
  {
    id: "6",
    name: "Phạm Văn Minh",
    avatar: "�",
    lastMessage: "✓✓ Lịch tuần sau như thế nào a?",
    time: "3 ngày trước",
    unreadCount: 0,
    isOnline: false,
    isSeen: true,
  },
  {
    id: "7",
    name: "Hoàng Thị Hoa",
    avatar: "👵",
    lastMessage: "✓✓ Hẹn gặp lại anh tuần sau nhé",
    time: "1 tuần trước",
    unreadCount: 0,
    isOnline: false,
    isSeen: true,
  },
  {
    id: "8",
    name: "Hỗ trợ Elder Care",
    avatar: "🏥",
    lastMessage: "Chào mừng bạn đến với Elder Care Connect! 👋",
    time: "2 tuần trước",
    unreadCount: 0,
    isOnline: false,
  },
];

export default function ChatListScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Format time
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      // Today - show time
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays === 1) {
      return "Hôm qua";
    } else if (diffInDays < 7) {
      return `${diffInDays} ngày trước`;
    } else if (diffInDays < 14) {
      return "1 tuần trước";
    } else if (diffInDays < 30) {
      return `${Math.floor(diffInDays / 7)} tuần trước`;
    } else {
      return date.toLocaleDateString('vi-VN');
    }
  };

  // Fetch chats from API
  const fetchChats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ChatAPI.getMyChats();
      setChats(response.data);
    } catch (err: any) {
      console.error('Error fetching chats:', err);
      setError(err?.response?.data?.message || 'Không thể tải danh sách tin nhắn');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount and when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchChats();
    }, [fetchChats])
  );

  // Map API data to ChatItem
  const mapChatToChatItem = (chat: ChatListItem): ChatItem => {
    // Find the other participant (not current user)
    const otherParticipant = chat.participants.find(p => p._id !== user?.id);
    
    // Get avatar from participant data (profileImage or avatar field)
    const avatarUrl = otherParticipant?.profileImage || otherParticipant?.avatar;
    
    // Default emoji based on role if no avatar URL
    const defaultAvatar = otherParticipant?.role === 'caregiver' ? '👨' : '👵';
    
    return {
      id: chat._id,
      name: otherParticipant?.name || 'Người dùng',
      avatar: avatarUrl || defaultAvatar,
      lastMessage: chat.lastMessage?.content || 'Chưa có tin nhắn',
      time: chat.lastMessage?.timestamp ? formatTime(chat.lastMessage.timestamp) : '',
      unreadCount: chat.unreadCount,
      isOnline: false,
      isPriority: false,
      isTyping: false,
      isSeen: chat.unreadCount === 0,
    };
  };

  // Filter chats
  const chatItems = chats.map(mapChatToChatItem);
  const filteredChats = chatItems.filter((chat) => {
    const matchesSearch = chat.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleChatPress = (chat: ChatItem) => {
    navigation.navigate("Tin nhắn", { 
      chatId: chat.id,
      chatName: chat.name,
      chatAvatar: chat.avatar,
      fromScreen: "chat-list"
    });
  };

  const renderChatItem = (chat: ChatItem) => {
    // Check if avatar is a URL or emoji
    const isAvatarUrl = chat.avatar.startsWith('http');
    
    return (
      <TouchableOpacity
        key={chat.id}
        style={[
          styles.chatItem,
          chat.unreadCount > 0 && styles.chatItemUnread,
        ]}
        onPress={() => handleChatPress(chat)}
      >
        <View style={styles.avatarContainer}>
          {isAvatarUrl ? (
            <Image 
              source={{ uri: chat.avatar }} 
              style={styles.avatarImage}
            />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarEmoji}>{chat.avatar}</Text>
            </View>
          )}
          {chat.isOnline && <View style={styles.onlineBadge} />}
        </View>

        <View style={styles.chatContent}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatName}>{chat.name}</Text>
            <Text style={styles.chatTime}>{chat.time}</Text>
          </View>
          <View style={styles.chatMessageRow}>
            {chat.isPriority && !chat.isTyping && (
              <Text style={styles.priorityIcon}>🚨</Text>
            )}
            <Text
              style={[
                styles.chatMessage,
                chat.isTyping && styles.chatMessageTyping,
                chat.unreadCount > 0 && styles.chatMessageUnread,
              ]}
              numberOfLines={1}
            >
              {chat.lastMessage}
            </Text>
            {chat.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{chat.unreadCount}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2DC2D7" />
          <Text style={styles.loadingText}>Đang tải tin nhắn...</Text>
        </View>
        <CaregiverBottomNav activeTab="home" />
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchChats}>
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
        <CaregiverBottomNav activeTab="home" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons
          name="magnify"
          size={20}
          color="#6B7280"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm tin nhắn..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Chat List */}
      <ScrollView
        style={styles.chatList}
        contentContainerStyle={styles.chatListContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredChats.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyText}>
              {searchQuery ? "Không tìm thấy cuộc trò chuyện" : "Chưa có tin nhắn nào"}
            </Text>
          </View>
        ) : (
          filteredChats.map(renderChatItem)
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <CaregiverBottomNav activeTab="home" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#ff0000',
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#2DC2D7',
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },

  // Search
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    margin: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#1F2937",
  },

  // Chat List
  chatList: {
    flex: 1,
  },
  chatListContent: {
    paddingBottom: 100,
  },
  chatItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  chatItemUnread: {
    backgroundColor: "#FEF3C7",
  },
  avatarContainer: {
    position: "relative",
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarEmoji: {
    fontSize: 32,
  },
  onlineBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#10B981",
    borderWidth: 2,
    borderColor: "#fff",
  },
  chatContent: {
    flex: 1,
    justifyContent: "center",
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    flex: 1,
  },
  chatTime: {
    fontSize: 12,
    color: "#9CA3AF",
    marginLeft: 8,
  },
  chatMessageRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  priorityIcon: {
    fontSize: 14,
  },
  chatMessage: {
    flex: 1,
    fontSize: 14,
    color: "#6B7280",
  },
  chatMessageTyping: {
    color: "#3B82F6",
    fontStyle: "italic",
  },
  chatMessageUnread: {
    fontWeight: "600",
    color: "#1F2937",
  },
  unreadBadge: {
    backgroundColor: "#3B82F6",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  unreadBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
});
