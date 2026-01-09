import CaregiverBottomNav from "@/components/navigation/CaregiverBottomNav";
import axiosInstance from "@/services/axiosInstance";
import { API_CONFIG } from "@/services/config/api.config";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

interface WalletData {
  availableBalance: number;
  totalEarnings: number;
  totalPlatformFees: number;
  pendingAmount: number;
  platformFeePercentage: number;
  lastUpdated: string;
}

interface Transaction {
  _id: string;
  booking: {
    _id: string;
    careseeker: {
      _id: string;
      name: string;
      email: string;
    };
    bookingDate: string;
    bookingTime: string;
    totalPrice: number;
    status: string;
  };
  type: "earning" | "platform_fee" | "refund";
  amount: number;
  description: string;
  status: string;
  processedAt: string;
  createdAt: string;
  updatedAt: string;
}

interface TransactionResponse {
  transactions: Transaction[];
  totalPages: number;
  currentPage: number;
  total: number;
  platformFeePercentage: number;
}

export default function PaymentScreen() {
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch wallet data from API
  const fetchWalletData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axiosInstance.get(API_CONFIG.ENDPOINTS.WALLET.MY_WALLET);
      const data = response.data.data || response.data;
      
      setWalletData(data);
    } catch (err: any) {
      console.error("Error fetching wallet data:", err);
      setError("Không thể tải thông tin ví. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch wallet data on mount
  useEffect(() => {
    fetchWalletData();
    fetchTransactions();
  }, [fetchWalletData, fetchTransactions]);

  // Fetch transactions from API
  const fetchTransactions = useCallback(async () => {
    try {
      setLoadingTransactions(true);
      
      const response = await axiosInstance.get(API_CONFIG.ENDPOINTS.WALLET.TRANSACTIONS, {
        params: {
          page: 1,
          limit: 20,
        }
      });
      
      const data = response.data.data || response.data;
      
      setTransactions(data.transactions || []);
    } catch (err: any) {
      console.error("Error fetching transactions:", err);
    } finally {
      setLoadingTransactions(false);
    }
  }, []);

  // Fetch transactions on mount
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'decimal',
      minimumFractionDigits: 0,
    }).format(Math.abs(amount)) + 'đ';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earning':
        return { name: 'cash-plus', color: '#10B981', bg: '#D1FAE5' };
      case 'platform_fee':
        return { name: 'percent', color: '#F59E0B', bg: '#FEF3C7' };
      case 'refund':
        return { name: 'cash-refund', color: '#EF4444', bg: '#FEE2E2' };
      default:
        return { name: 'cash', color: '#64748B', bg: '#F1F5F9' };
    }
  };

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case 'earning':
        return 'Thu nhập';
      case 'platform_fee':
        return 'Phí nền tảng';
      case 'refund':
        return 'Hoàn tiền';
      default:
        return 'Khác';
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Đang tải thông tin ví...</Text>
        </View>
        <CaregiverBottomNav activeTab="income" />
      </View>
    );
  }

  if (error || !walletData) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={48} color="#EF4444" />
          <Text style={styles.errorText}>{error || "Không thể tải dữ liệu"}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchWalletData}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
        <CaregiverBottomNav activeTab="income" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <MaterialCommunityIcons name="wallet" size={20} color="#F59E0B" />
            <Text style={styles.balanceLabel}>Tổng số dư</Text>
          </View>
          <Text style={styles.balanceAmount}>{formatCurrency(walletData.totalEarnings)}</Text>
          
          <View style={styles.balanceDetails}>
            <View style={styles.balanceDetailItem}>
              <View style={styles.balanceDetailIcon}>
                <MaterialCommunityIcons name="circle" size={12} color="#10B981" />
              </View>
              <View>
                <Text style={styles.balanceDetailLabel}>Khả dụng</Text>
                <Text style={styles.balanceDetailValue}>{formatCurrency(walletData.availableBalance)}</Text>
              </View>
            </View>
            
            <View style={styles.balanceDetailItem}>
              <View style={styles.balanceDetailIcon}>
                <MaterialCommunityIcons name="timer-sand" size={12} color="#F59E0B" />
              </View>
              <View>
                <Text style={styles.balanceDetailLabel}>Chờ xử lí</Text>
                <Text style={styles.balanceDetailValue}>{formatCurrency(walletData.pendingAmount)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Transaction History - Hidden as API doesn't provide transaction list */}
        <View style={styles.historySection}>
          <View style={styles.historyHeader}>
            <MaterialCommunityIcons name="clipboard-text-outline" size={20} color="#1E293B" />
            <Text style={styles.historyTitle}>Lịch sử giao dịch</Text>
          </View>

          {loadingTransactions ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="small" color="#64748B" />
              <Text style={styles.emptyStateText}>Đang tải giao dịch...</Text>
            </View>
          ) : transactions.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="clipboard-text-off-outline" size={48} color="#CBD5E1" />
              <Text style={styles.emptyStateText}>Chưa có giao dịch</Text>
            </View>
          ) : (
            transactions.map((transaction) => {
              const icon = getTransactionIcon(transaction.type);
              return (
                <View key={transaction._id} style={styles.transactionCard}>
                  <View style={[styles.transactionIcon, { backgroundColor: icon.bg }]}>
                    <MaterialCommunityIcons 
                      name={icon.name as any} 
                      size={24} 
                      color={icon.color} 
                    />
                  </View>

                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionName}>
                      {getTransactionLabel(transaction.type)}
                    </Text>
                    <Text style={styles.transactionDescription}>
                      {transaction.booking?.careseeker?.name || transaction.description}
                    </Text>
                    <Text style={styles.transactionDateTime}>
                      {formatShortDate(transaction.createdAt)} · {transaction.booking?.bookingTime || ''}
                    </Text>
                  </View>

                  <View style={styles.transactionRight}>
                    <Text style={[
                      styles.transactionAmount,
                      transaction.amount > 0 ? styles.amountPositive : styles.amountNegative
                    ]}>
                      {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                    </Text>
                    <Text style={[
                      styles.transactionStatus,
                      transaction.status === 'completed' && styles.statusCompleted,
                    ]}>
                      {transaction.status === 'completed' ? 'Hoàn thành' : transaction.status}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <CaregiverBottomNav activeTab="income" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#5B9FD8",
  },
  scrollView: {
    flex: 1,
  },
  balanceCard: {
    backgroundColor: "#FFFFFF",
    margin: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  balanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: "#64748B",
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#2196F3",
    marginBottom: 16,
  },
  balanceDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  balanceDetailItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  balanceDetailIcon: {
    width: 8,
    height: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  balanceDetailLabel: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 2,
  },
  balanceDetailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
  },
  actionsContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  withdrawButton: {
    backgroundColor: "#5B9FD8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  withdrawButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  historySection: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 100,
    minHeight: 400,
  },
  historyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
  },
  transactionCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 4,
  },
  transactionDescription: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 2,
  },
  transactionDateTime: {
    fontSize: 12,
    color: "#94A3B8",
  },
  transactionRight: {
    alignItems: "flex-end",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  amountPositive: {
    color: "#10B981",
  },
  amountNegative: {
    color: "#EF4444",
  },
  transactionStatus: {
    fontSize: 12,
    color: "#64748B",
  },
  statusCompleted: {
    color: "#10B981",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#94A3B8",
    marginTop: 12,
  },
  emptyStateSubText: {
    fontSize: 12,
    color: "#CBD5E1",
    marginTop: 4,
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  summaryItemContent: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
  },
  summaryDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 14,
    color: "#FFFFFF",
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 14,
    color: "#FFFFFF",
    marginTop: 12,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: "#5B9FD8",
    fontSize: 14,
    fontWeight: "600",
  },
});

