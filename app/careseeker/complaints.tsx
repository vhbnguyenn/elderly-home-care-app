import { ThemedText } from '@/components/themed-text';
import { Complaint, ComplaintTab } from '@/types/complaint';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

type StatusTab = 'all' | 'pending' | 'received' | 'processing' | 'resolved' | 'rejected';

export default function ComplaintsScreen() {
  const [activeTab, setActiveTab] = useState<'my_complaints' | 'complaints_against_me'>('my_complaints');
  const [activeStatusTab, setActiveStatusTab] = useState<StatusTab>('all');

  const tabs: ComplaintTab[] = [
    {
      id: 'my_complaints',
      title: 'Báº¡n khiáº¿u náº¡i',
      icon: 'person-outline',
    },
    {
      id: 'complaints_against_me',
      title: 'Báº¡n bá»‹ khiáº¿u náº¡i',
      icon: 'warning-outline',
    },
  ];

  // TODO: Replace with real API data from complaint service
  // For now using empty array until API is ready
  const mockComplaints: Complaint[] = [];

  const getFilteredComplaints = () => {
    let filtered = mockComplaints;
    
    // Filter by tab
    if (activeTab === 'my_complaints') {
      // Show complaints where current user is complainant (simulate current user ID = '1')
      filtered = filtered.filter(complaint => complaint.complainant.id === '1');
    } else {
      // Show complaints where current user is accused (simulate current user ID = '2')
      filtered = filtered.filter(complaint => complaint.accused.id === '2');
    }
    
    // Filter by status
    if (activeStatusTab !== 'all') {
      filtered = filtered.filter(complaint => complaint.status === activeStatusTab);
    }
    
    return filtered;
  };

  const getStatusCount = (status: StatusTab) => {
    const filtered = getFilteredComplaints();
    if (status === 'all') {
      return filtered.length;
    }
    return filtered.filter(complaint => complaint.status === status).length;
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Äang chá»';
      case 'received': return 'ÄÃ£ tiáº¿p nháº­n';
      case 'processing': return 'Äang xá»­ lÃ­';
      case 'resolved': return 'ÄÃ£ xá»­ lÃ­';
      case 'rejected': return 'ÄÃ£ tá»« chá»‘i';
      default: return 'KhÃ´ng xÃ¡c Ä‘á»‹nh';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#ffa502';
      case 'received': return '#3498db';
      case 'processing': return '#f39c12';
      case 'resolved': return '#2ed573';
      case 'rejected': return '#ff4757';
      default: return '#6c757d';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'salary': return 'LÆ°Æ¡ng';
      case 'behavior': return 'ThÃ¡i Ä‘á»™';
      case 'quality': return 'Cháº¥t lÆ°á»£ng';
      case 'schedule': return 'Lá»‹ch trÃ¬nh';
      case 'payment': return 'Thanh toÃ¡n';
      case 'other': return 'KhÃ¡c';
      default: return 'KhÃ´ng xÃ¡c Ä‘á»‹nh';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return '#2ed573';
      case 'medium': return '#ffa502';
      case 'high': return '#ff4757';
      case 'urgent': return '#e74c3c';
      default: return '#6c757d';
    }
  };

  const handleComplaintPress = (complaint: Complaint) => {
    router.push(`/careseeker/complaint-detail?id=${complaint.id}`);
  };

  const handleCreateComplaint = () => {
    router.push('/careseeker/create-complaint');
  };

  const renderComplaintCard = ({ item }: { item: Complaint }) => (
    <TouchableOpacity
      style={styles.complaintCard}
      onPress={() => handleComplaintPress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.complaintHeader}>
        <View style={styles.complaintInfo}>
          <ThemedText style={styles.complaintTitle} numberOfLines={2}>
            {item.title}
          </ThemedText>
          <ThemedText style={styles.complaintType}>
            Loáº¡i: {getTypeText(item.type)}
          </ThemedText>
          <ThemedText style={styles.complaintDescription} numberOfLines={2}>
            {item.description}
          </ThemedText>
        </View>
        <View style={styles.complaintStatus}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <ThemedText style={styles.statusText}>
              {getStatusText(item.status)}
            </ThemedText>
          </View>
        </View>
      </View>
      
      <View style={styles.complaintFooter}>
        <View style={styles.complaintMeta}>
          <ThemedText style={styles.complaintDate}>
            {new Date(item.createdAt).toLocaleDateString('vi-VN')}
          </ThemedText>
          <ThemedText style={styles.complaintEvidence}>
            {item.evidences.length} báº±ng chá»©ng
          </ThemedText>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#6c757d" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <ThemedText style={styles.headerTitle}>Khiáº¿u náº¡i</ThemedText>
          <ThemedText style={styles.headerSubtitle}>Quáº£n lÃ½ khiáº¿u náº¡i vÃ  tá»‘ cÃ¡o</ThemedText>
        </View>

        <TouchableOpacity style={styles.addButton} onPress={handleCreateComplaint}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Main Tabs */}
      <View style={styles.mainTabsContainer}>
        <View style={styles.tabsWrapper}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.mainTab, activeTab === tab.id && styles.mainTabActive]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Ionicons 
                name={tab.icon as any} 
                size={20} 
                color={activeTab === tab.id ? 'white' : '#6c757d'} 
              />
              <ThemedText style={[styles.mainTabText, activeTab === tab.id && styles.mainTabTextActive]}>
                {tab.title}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Status Tabs */}
      <View style={styles.statusTabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statusTabsScrollContainer}>
          <TouchableOpacity
            style={[styles.statusTab, activeStatusTab === 'all' && styles.statusTabActive]}
            onPress={() => setActiveStatusTab('all')}
          >
            <ThemedText style={[styles.statusTabText, activeStatusTab === 'all' && styles.statusTabTextActive]}>
              Táº¥t cáº£ ({getStatusCount('all')})
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statusTab, activeStatusTab === 'pending' && styles.statusTabActive]}
            onPress={() => setActiveStatusTab('pending')}
          >
            <ThemedText style={[styles.statusTabText, activeStatusTab === 'pending' && styles.statusTabTextActive]}>
              Äang chá» ({getStatusCount('pending')})
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statusTab, activeStatusTab === 'received' && styles.statusTabActive]}
            onPress={() => setActiveStatusTab('received')}
          >
            <ThemedText style={[styles.statusTabText, activeStatusTab === 'received' && styles.statusTabTextActive]}>
              ÄÃ£ tiáº¿p nháº­n ({getStatusCount('received')})
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statusTab, activeStatusTab === 'processing' && styles.statusTabActive]}
            onPress={() => setActiveStatusTab('processing')}
          >
            <ThemedText style={[styles.statusTabText, activeStatusTab === 'processing' && styles.statusTabTextActive]}>
              Äang xá»­ lÃ­ ({getStatusCount('processing')})
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statusTab, activeStatusTab === 'resolved' && styles.statusTabActive]}
            onPress={() => setActiveStatusTab('resolved')}
          >
            <ThemedText style={[styles.statusTabText, activeStatusTab === 'resolved' && styles.statusTabTextActive]}>
              ÄÃ£ xá»­ lÃ­ ({getStatusCount('resolved')})
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statusTab, activeStatusTab === 'rejected' && styles.statusTabActive]}
            onPress={() => setActiveStatusTab('rejected')}
          >
            <ThemedText style={[styles.statusTabText, activeStatusTab === 'rejected' && styles.statusTabTextActive]}>
              ÄÃ£ tá»« chá»‘i ({getStatusCount('rejected')})
            </ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Complaints List */}
      <FlatList
        data={getFilteredComplaints()}
        renderItem={renderComplaintCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="document-outline" size={64} color="#6c757d" />
            <ThemedText style={styles.emptyTitle}>KhÃ´ng cÃ³ khiáº¿u náº¡i</ThemedText>
            <ThemedText style={styles.emptySubtitle}>
              {activeTab === 'my_complaints' 
                ? 'Báº¡n chÆ°a cÃ³ khiáº¿u náº¡i nÃ o' 
                : 'ChÆ°a cÃ³ khiáº¿u náº¡i nÃ o vá» báº¡n'
              }
            </ThemedText>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingBottom: 100, // Space for navigation bar
  },
  header: {
    backgroundColor: '#E74C3C',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  addButton: {
    padding: 8,
  },
  mainTabsContainer: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  tabsWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 12,
  },
  mainTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    gap: 8,
    minWidth: 140,
    justifyContent: 'center',
  },
  mainTabActive: {
    backgroundColor: '#E74C3C',
    borderColor: '#E74C3C',
  },
  mainTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6C757D',
  },
  mainTabTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  statusTabsContainer: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  statusTabsScrollContainer: {
    paddingHorizontal: 16,
  },
  statusTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  statusTabActive: {
    backgroundColor: '#3498DB',
    borderColor: '#3498DB',
  },
  statusTabText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6C757D',
  },
  statusTabTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  complaintCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  complaintHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  complaintInfo: {
    flex: 1,
    marginRight: 12,
  },
  complaintTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  complaintType: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 4,
  },
  complaintDescription: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
  },
  complaintStatus: {
    alignItems: 'flex-end',
    gap: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  complaintFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  complaintMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  complaintDate: {
    fontSize: 12,
    color: '#6c757d',
  },
  complaintEvidence: {
    fontSize: 12,
    color: '#6c757d',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 20,
  },
});
