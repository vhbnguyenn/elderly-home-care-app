import { Ionicons } from '@expo/vector-icons';
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { groqAddressService } from '@/services/groq-address.service';

interface SimpleAddressInputProps {
  value: string;
  onAddressSelect: (address: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
}

export const SimpleAddressInput: React.FC<SimpleAddressInputProps> = ({
  value,
  onAddressSelect,
  placeholder = "Nhập địa chỉ (VD: 123 Nguyễn Huệ Q1 HCM)",
  label = "Địa chỉ",
  required = true,
}) => {
  const [inputText, setInputText] = useState(value);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);

  // Handle text input change with debounce
  const handleTextChange = (text: string) => {
    setInputText(text);
    onAddressSelect(text); // Update parent immediately

    // Clear previous timeout
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    // Load suggestions after user stops typing (1 second)
    if (text.length >= 5) {
      const timeout = setTimeout(() => {
        loadSuggestions(text);
      }, 1000);
      setDebounceTimeout(timeout);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Load suggestions from backend AI
  const loadSuggestions = async (text: string) => {
    console.log('[SimpleAddressInput] Loading suggestions for:', text);
    setIsLoadingSuggestions(true);
    try {
      const results = await groqAddressService.suggestAddress(text);
      console.log('[SimpleAddressInput] Got suggestions:', results);
      console.log('[SimpleAddressInput] Suggestions length:', results.length);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
      console.log('[SimpleAddressInput] Show suggestions:', results.length > 0);
    } catch (error) {
      console.error('[SimpleAddressInput] Error loading suggestions:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // Handle suggestion selection
  const handleSelectSuggestion = (suggestion: string) => {
    setInputText(suggestion);
    onAddressSelect(suggestion);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  return (
    <View style={styles.container}>
      {/* Label */}
      <Text style={styles.fieldLabel}>
        {label} {required && <Text style={styles.requiredStar}>*</Text>}
      </Text>

      {/* Input Field */}
      <View style={styles.inputWrapper}>
        <Ionicons name="location-outline" size={20} color="#FF5722" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={inputText}
          onChangeText={handleTextChange}
          onFocus={() => {
            // Re-show suggestions if available
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
        />
        {isLoadingSuggestions && (
          <ActivityIndicator size="small" color="#FF5722" style={styles.loader} />
        )}
      </View>

      {/* AI Badge Hint */}
      {inputText.length < 5 && (
        <View style={styles.hintRow}>
          <View style={styles.aiBadge}>
            <Ionicons name="sparkles" size={10} color="#FFFFFF" />
            <Text style={styles.aiBadgeText}>AI</Text>
          </View>
          <Text style={styles.hintText}>
            AI sẽ gợi ý địa chỉ khi bạn nhập ít nhất 5 ký tự
          </Text>
        </View>
      )}

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsDropdown}>
          <Text style={styles.debugText}>
            📍 {suggestions.length} địa chỉ gợi ý
          </Text>
          {suggestions.map((item, index) => (
            <React.Fragment key={`${index}-${item}`}>
              {index > 0 && <View style={styles.separator} />}
              <TouchableOpacity
                style={styles.suggestionItem}
                onPress={() => handleSelectSuggestion(item)}
                activeOpacity={0.7}
              >
                <Ionicons name="location" size={16} color="#FF5722" />
                <Text style={styles.suggestionText} numberOfLines={2}>
                  {item}
                </Text>
                <Ionicons name="arrow-forward" size={14} color="#9CA3AF" />
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </View>
      )}
      
      {/* Debug info */}
      {__DEV__ && (
        <Text style={styles.debugText}>
          Debug: showSuggestions={showSuggestions.toString()}, suggestions={suggestions.length}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    zIndex: 999,
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
  inputWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  input: {
    flex: 1,
    height: 56,
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingLeft: 48,
    paddingRight: 48,
    fontSize: 16,
    color: '#2C3E50',
  },
  loader: {
    position: 'absolute',
    right: 16,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 3,
  },
  aiBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  hintText: {
    flex: 1,
    fontSize: 12,
    color: '#6B7280',
  },
  suggestionsDropdown: {
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    maxHeight: 250,
    zIndex: 9999,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    color: '#2C3E50',
    lineHeight: 20,
  },
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  debugText: {
    fontSize: 10,
    color: '#6B7280',
    padding: 8,
    backgroundColor: '#FEF3C7',
  },
});

