import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CaregiverBottomNav from "@/components/navigation/CaregiverBottomNav";
import { ThemedText } from "@/components/themed-text";
import { useAuth } from "@/contexts/AuthContext";
import { ChatAPI, ChatDetail, ChatMessage } from "@/services/api";

interface Message {
  id: string;
  text: string;
  sender: "user" | "caregiver";
  timestamp: Date;
  isRead: boolean;
  senderId?: string;
}

interface ChatScreenProps {
  caregiverName: string;
  caregiverAvatar: string;
}

export default function ChatScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  
  // Thử lấy params từ cả route và useLocalSearchParams
  const routeParams = (route.params || {}) as any;
  
  // Đọc từ các nguồn khác nhau (chat-list truyền chatName, các màn hình khác có thể truyền clientName)
  const chatId = routeParams.chatId || params.chatId;
  const chatName = routeParams.chatName || params.chatName;
  const chatAvatar = routeParams.chatAvatar || params.chatAvatar;
  const clientName = routeParams.clientName || params.clientName;
  const clientAvatar = routeParams.clientAvatar || params.clientAvatar;
  const caregiverName = routeParams.caregiverName || params.caregiverName;
  const fromScreen = routeParams.fromScreen || params.fromScreen;
  const appointmentId = routeParams.appointmentId || params.appointmentId;

  const [messages, setMessages] = useState<Message[]>([]);
  const [chatDetail, setChatDetail] = useState<ChatDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newMessage, setNewMessage] = useState("");
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Fetch chat detail and messages
  const fetchChatData = async (isRefreshing = false) => {
    if (!chatId) {
      setError('Không tìm thấy ID cuộc trò chuyện');
      setLoading(false);
      return;
    }

    try {
      if (!isRefreshing) {
        setLoading(true);
      }
      setError(null);

      // Fetch chat detail and messages in parallel
      const [detailResponse, messagesResponse] = await Promise.all([
        ChatAPI.getChatDetail(chatId as string),
        ChatAPI.getChatMessages(chatId as string),
      ]);

      setChatDetail(detailResponse.data);

      // Map API messages to local Message format
      const mappedMessages: Message[] = messagesResponse.data.map((msg: ChatMessage) => ({
        id: msg._id,
        text: msg.content,
        sender: msg.sender._id === user?.id ? 'caregiver' : 'user',
        senderId: msg.sender._id,
        timestamp: new Date(msg.createdAt),
        isRead: msg.isRead,
      }));

      // Sort messages by timestamp (oldest first, newest last)
      mappedMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

      setMessages(mappedMessages);
    } catch (err: any) {
      console.error('Error fetching chat data:', err);
      setError(err?.response?.data?.message || 'Không thể tải tin nhắn');
    } finally {
      if (!isRefreshing) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchChatData();
  }, [chatId, user?.id]);

  // Handle pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchChatData(true);
    setRefreshing(false);
  };

  // Lấy tên và avatar người nhận từ params (ưu tiên chatName từ chat-list) hoặc từ chatDetail
  // Lấy tên và avatar người nhận từ params (ưu tiên chatName từ chat-list) hoặc từ chatDetail
  const otherParticipant = chatDetail?.participants.find(p => p._id !== user?.id);
  const recipientName = (chatName as string) || (clientName as string) || (caregiverName as string) || otherParticipant?.name || "";
  const recipientAvatar = (chatAvatar as string) || (clientAvatar as string) || otherParticipant?.avatar || "👤";
  
  // Debug log
  console.log("Chat params:", { chatName, chatAvatar, clientName, clientAvatar, caregiverName, recipientName });

  useEffect(() => {
    // Auto scroll to bottom when new message is added
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  useEffect(() => {
    // Listen for keyboard show/hide events
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => {
        setIsKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setIsKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Setup header back button based on fromScreen param
  useEffect(() => {
    const handleBack = () => {
      if (fromScreen === "appointment-detail") {
        // Quay lại trang appointment detail với appointmentId
        if (appointmentId) {
          (navigation.navigate as any)("Appointment Detail", {
            appointmentId: appointmentId,
            fromScreen: "chat",
          });
        } else {
          navigation.goBack();
        }
      } else if (fromScreen === "dashboard") {
        // Quay lại trang chủ
        (navigation.navigate as any)("Trang chủ");
      } else {
        // Mặc định quay lại chat-list hoặc goBack
        (navigation.navigate as any)("Danh sách tin nhắn");
      }
    };

    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          onPress={handleBack}
          style={{ marginLeft: 15 }}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={28}
            color="#fff"
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation, fromScreen, appointmentId]);

  const handleSendMessage = async () => {
    if (newMessage.trim() && chatId && !isSending) {
      const messageText = newMessage.trim();
      setNewMessage(""); // Clear input immediately for better UX
      
      try {
        setIsSending(true);
        
        // Call API to send message
        const response = await ChatAPI.sendMessage(chatId as string, messageText);
        
        // Add the sent message to the list
        const sentMessage: Message = {
          id: response.data._id,
          text: response.data.content,
          sender: "caregiver", // Current user is caregiver
          senderId: response.data.sender._id,
          timestamp: new Date(response.data.createdAt),
          isRead: response.data.isRead,
        };

        setMessages((prev) => [...prev, sentMessage]);
      } catch (error: any) {
        console.error("Error sending message:", error);
        // Restore message if failed
        setNewMessage(messageText);
        // Could show an error alert here
        alert(error?.response?.data?.message || "Không thể gửi tin nhắn. Vui lòng thử lại.");
      } finally {
        setIsSending(false);
      }
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateSeparator = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Reset time to compare dates only
    const messageDate = new Date(date);
    messageDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);

    if (messageDate.getTime() === today.getTime()) {
      return "Hôm nay";
    } else if (messageDate.getTime() === yesterday.getTime()) {
      return "Hôm qua";
    } else {
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const renderMessage = (message: Message, index: number) => {
    // Trong màn hình chat của caregiver: caregiver ở bên phải, user/seeker ở bên trái
    const isCaregiver = message.sender === "caregiver";

    // Check if we need to show date separator
    const showDateSeparator =
      index === 0 ||
      !isSameDay(message.timestamp, messages[index - 1].timestamp);

    return (
      <View key={message.id}>
        {/* Date Separator */}
        {showDateSeparator && (
          <View style={styles.dateSeparatorWrapper}>
            <View style={styles.dateSeparatorBadge}>
              <Text style={styles.dateSeparatorText}>
                {formatDateSeparator(message.timestamp)}
              </Text>
            </View>
          </View>
        )}

        {/* Message Bubble */}
        <View
          style={[
            styles.messageContainer,
            isCaregiver
              ? styles.userMessageContainer
              : styles.caregiverMessageContainer,
          ]}
        >
          <View
            style={[
              styles.messageBubble,
              isCaregiver ? styles.userMessageBubble : styles.caregiverMessageBubble,
            ]}
          >
            <ThemedText
              style={[
                styles.messageText,
                isCaregiver ? styles.userMessageText : styles.caregiverMessageText,
              ]}
            >
              {message.text}
            </ThemedText>
            <ThemedText
              style={[
                styles.messageTime,
                isCaregiver ? styles.userMessageTime : styles.caregiverMessageTime,
              ]}
            >
              {formatTime(message.timestamp)}
            </ThemedText>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      {/* Loading state */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4ECDC4" />
          <Text style={styles.loadingText}>Đang tải tin nhắn...</Text>
        </View>
      ) : error ? (
        /* Error state */
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        /* Chat content */
        <>
      {/* Chat Header - Info người nhận */}
      <View style={styles.chatHeader}>
        <View style={styles.chatHeaderAvatar}>
          <Text style={styles.chatHeaderAvatarText}>{recipientAvatar}</Text>
        </View>
        <View style={styles.chatHeaderInfo}>
          <ThemedText style={styles.chatHeaderName}>
            {recipientName || "Chưa có tên"}
          </ThemedText>
        </View>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.messagesContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#4ECDC4"]}
              tintColor="#4ECDC4"
            />
          }
        >
          {messages.map((msg, index) => renderMessage(msg, index))}
        </ScrollView>

        {/* Input */}
        <View style={[
          styles.inputContainer,
          { marginBottom: isKeyboardVisible ? 80 : 50 }
        ]}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Nhập tin nhắn..."
              placeholderTextColor="#999"
              value={newMessage}
              onChangeText={setNewMessage}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                newMessage.trim() && !isSending
                  ? styles.sendButtonActive
                  : styles.sendButtonInactive,
              ]}
              onPress={handleSendMessage}
              disabled={!newMessage.trim() || isSending}
            >
              {isSending ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons
                  name="send"
                  size={20}
                  color={newMessage.trim() ? "white" : "#999"}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
        </>
      )}
      
      {/* Bottom Navigation */}
      <CaregiverBottomNav activeTab="home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  
  // Chat Header - Info người nhận
  chatHeader: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  chatHeaderAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FEF3C7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  chatHeaderAvatarText: {
    fontSize: 28,
  },
  chatHeaderInfo: {
    flex: 1,
  },
  chatHeaderName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 2,
  },
  chatHeaderStatus: {
    fontSize: 13,
    color: "#10B981",
  },
  
  header: {
    backgroundColor: "#4ECDC4",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  moreButton: {
    padding: 8,
    marginRight: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 8,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 160,
    paddingTop: 8,
  },
  messageContainer: {
    marginBottom: 8,
  },
  userMessageContainer: {
    alignItems: "flex-end",
  },
  caregiverMessageContainer: {
    alignItems: "flex-start",
  },
  messageBubble: {
    maxWidth: "75%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  userMessageBubble: {
    backgroundColor: "#4ECDC4",
    borderBottomRightRadius: 4,
    shadowColor: "#4ECDC4",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  caregiverMessageBubble: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  userMessageText: {
    color: "white",
  },
  caregiverMessageText: {
    color: "#2c3e50",
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
  },
  userMessageTime: {
    color: "rgba(255,255,255,0.8)",
    textAlign: "right",
  },
  caregiverMessageTime: {
    color: "#6c757d",
  },
  inputContainer: {
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#F9FAFB",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  dateSeparatorWrapper: {
    width: "100%",
    alignItems: "center",
    marginVertical: 16,
  },
  dateSeparatorBadge: {
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dateSeparatorText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#2c3e50",
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonActive: {
    backgroundColor: "#4ECDC4",
  },
  sendButtonInactive: {
    backgroundColor: "#e9ecef",
  },
});
