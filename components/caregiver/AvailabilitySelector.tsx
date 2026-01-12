import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { getAvailableSlots } from '@/services/availability.repository';
import { AvailableTimeSlot, TimeSlot } from '@/services/database.types';

interface AvailabilitySelectorProps {
  caregiverId: string;
  selectedDate?: string;
  selectedTime?: { start: string; end: string };
  onSelect: (date: string, startTime: string, endTime: string) => void;
  packageDuration?: number; // in hours (from selected package)
}

export function AvailabilitySelector({
  caregiverId,
  selectedDate,
  selectedTime,
  onSelect,
  packageDuration = 4,
}: AvailabilitySelectorProps) {
  const [loading, setLoading] = useState(true);
  const [availableSlots, setAvailableSlots] = useState<AvailableTimeSlot[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAvailability();
  }, [caregiverId, packageDuration]);

  const loadAvailability = async () => {
    try {
      setLoading(true);
      setError(null);
      const slots = await getAvailableSlots(caregiverId, 14, packageDuration); // Next 14 days
      setAvailableSlots(slots);
    } catch (err) {
      console.error('Error loading availability:', err);
      setError('Không thể tải lịch trống. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleSlotSelect = (date: string, slot: TimeSlot) => {
    if (!slot.isAvailable) return;
    onSelect(date, slot.startTime, slot.endTime);
  };

  const isSelectedSlot = (date: string, slot: TimeSlot) => {
    return (
      selectedDate === date &&
      selectedTime?.start === slot.startTime &&
      selectedTime?.end === slot.endTime
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <ThemedText style={styles.loadingText}>Đang tải lịch trống...</ThemedText>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#E74C3C" />
        <ThemedText style={styles.errorText}>{error}</ThemedText>
        <TouchableOpacity style={styles.retryButton} onPress={loadAvailability}>
          <ThemedText style={styles.retryText}>Thử lại</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  if (availableSlots.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="calendar-outline" size={48} color="#95A5A6" />
        <ThemedText style={styles.emptyText}>
          Người chăm sóc này không có lịch trống trong 2 tuần tới
        </ThemedText>
        <ThemedText style={styles.emptySubtext}>
          Vui lòng chọn người chăm sóc khác hoặc thử lại sau
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="time-outline" size={20} color="#FF6B35" />
        <ThemedText style={styles.headerText}>
          Lịch trống trong 2 tuần tới
        </ThemedText>
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, styles.availableBox]} />
          <ThemedText style={styles.legendText}>Khả dụng</ThemedText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, styles.unavailableBox]} />
          <ThemedText style={styles.legendText}>Đã có lịch</ThemedText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, styles.selectedBox]} />
          <ThemedText style={styles.legendText}>Đang chọn</ThemedText>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {availableSlots.map((daySlot, index) => (
          <View key={daySlot.date} style={styles.dayContainer}>
            <View style={styles.dayHeader}>
              <Ionicons name="calendar" size={16} color="#2C3E50" />
              <ThemedText style={styles.dayName}>{daySlot.dayName}</ThemedText>
              <ThemedText style={styles.dayDate}>
                ({daySlot.slots.filter(s => s.isAvailable).length} ca trống)
              </ThemedText>
            </View>

            <View style={styles.slotsContainer}>
              {daySlot.slots.map((slot, slotIndex) => {
                const selected = isSelectedSlot(daySlot.date, slot);
                const canSelect = slot.isAvailable;

                return (
                  <TouchableOpacity
                    key={slotIndex}
                    style={[
                      styles.slotCard,
                      !canSelect && styles.slotUnavailable,
                      selected && styles.slotSelected,
                    ]}
                    onPress={() => handleSlotSelect(daySlot.date, slot)}
                    disabled={!canSelect}
                    activeOpacity={0.7}
                  >
                    <View style={styles.slotTime}>
                      <Ionicons
                        name={canSelect ? 'checkmark-circle' : 'close-circle'}
                        size={20}
                        color={
                          selected
                            ? '#FFFFFF'
                            : canSelect
                            ? '#27AE60'
                            : '#E74C3C'
                        }
                      />
                      <ThemedText
                        style={[
                          styles.slotTimeText,
                          !canSelect && styles.slotTimeUnavailable,
                          selected && styles.slotTimeSelected,
                        ]}
                      >
                        {slot.startTime} - {slot.endTime}
                      </ThemedText>
                    </View>

                    {!canSelect && slot.reason && (
                      <ThemedText style={styles.slotReason}>
                        {slot.reason}
                      </ThemedText>
                    )}

                    {selected && (
                      <View style={styles.selectedBadge}>
                        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {daySlot.slots.every(s => !s.isAvailable) && (
              <View style={styles.noSlotsMessage}>
                <ThemedText style={styles.noSlotsText}>
                  Không có ca trống trong ngày này
                </ThemedText>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {selectedDate && selectedTime && (
        <View style={styles.selectionSummary}>
          <Ionicons name="information-circle" size={20} color="#FF6B35" />
          <ThemedText style={styles.summaryText}>
            Đã chọn: {selectedTime.start} - {selectedTime.end} ({packageDuration}h)
          </ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    marginTop: 12,
    marginBottom: 20,
    fontSize: 14,
    color: '#E74C3C',
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#FF6B35',
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    textAlign: 'center',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendBox: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  availableBox: {
    backgroundColor: '#D5F4E6',
    borderWidth: 1,
    borderColor: '#27AE60',
  },
  unavailableBox: {
    backgroundColor: '#FADBD8',
    borderWidth: 1,
    borderColor: '#E74C3C',
  },
  selectedBox: {
    backgroundColor: '#FF6B35',
  },
  legendText: {
    fontSize: 12,
    color: '#5B7C8E',
  },
  scrollView: {
    flex: 1,
  },
  dayContainer: {
    marginBottom: 20,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  dayName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2C3E50',
  },
  dayDate: {
    fontSize: 13,
    color: '#7F8C8D',
  },
  slotsContainer: {
    gap: 8,
  },
  slotCard: {
    padding: 14,
    backgroundColor: '#D5F4E6',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#27AE60',
    position: 'relative',
  },
  slotUnavailable: {
    backgroundColor: '#FADBD8',
    borderColor: '#E74C3C',
    opacity: 0.6,
  },
  slotSelected: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
    borderWidth: 2,
  },
  slotTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  slotTimeText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#27AE60',
  },
  slotTimeUnavailable: {
    color: '#E74C3C',
  },
  slotTimeSelected: {
    color: '#FFFFFF',
  },
  slotReason: {
    marginTop: 4,
    fontSize: 12,
    color: '#E74C3C',
    fontStyle: 'italic',
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noSlotsMessage: {
    padding: 16,
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    marginTop: 8,
  },
  noSlotsText: {
    fontSize: 13,
    color: '#856404',
    textAlign: 'center',
  },
  selectionSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1565C0',
    flex: 1,
  },
});
