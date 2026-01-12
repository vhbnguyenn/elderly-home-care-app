import { Ionicons } from '@expo/vector-icons';
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { groqAddressService, ParsedAddress } from '@/services/groq-address.service';

interface AIAddressInputProps {
  onAddressChange: (parsedAddress: ParsedAddress) => void;
  initialAddress?: string;
}

export const AIAddressInput: React.FC<AIAddressInputProps> = ({
  onAddressChange,
  initialAddress,
}) => {
  const [inputText, setInputText] = useState(initialAddress || '');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [parsedAddress, setParsedAddress] = useState<ParsedAddress | null>(null);
  const [validationMessage, setValidationMessage] = useState<string>('');

  // Debounce timeout
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);

  // Auto-suggest when typing (debounced)
  const handleTextChange = (text: string) => {
    setInputText(text);
    setValidationMessage('');

    // Clear previous timeout
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    // Set new timeout for suggestions
    if (text.length >= 5) {
      const timeout = setTimeout(() => {
        loadSuggestions(text);
      }, 1000); // Wait 1s after user stops typing
      setDebounceTimeout(timeout);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Load suggestions from Groq AI
  const loadSuggestions = async (text: string) => {
    setIsLoadingSuggestions(true);
    try {
      const results = await groqAddressService.suggestAddress(text);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    } catch (error) {
      console.error('Error loading suggestions:', error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // Parse address using Groq AI
  const handleParseAddress = async () => {
    if (!inputText.trim()) {
      setValidationMessage('Vui lòng nhập địa chỉ');
      return;
    }

    setIsProcessing(true);
    setValidationMessage('');

    try {
      const parsed = await groqAddressService.parseAddress(inputText);
      setParsedAddress(parsed);
      onAddressChange(parsed);

      if (parsed.confidence < 0.7) {
        setValidationMessage('⚠️ AI không chắc chắn về địa chỉ này. Vui lòng kiểm tra lại.');
      } else {
        setValidationMessage('✅ Địa chỉ đã được phân tích thành công!');
      }
    } catch (error) {
      console.error('Error parsing address:', error);
      setValidationMessage('❌ Không thể phân tích địa chỉ. Vui lòng thử lại.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Select a suggestion
  const handleSelectSuggestion = async (suggestion: string) => {
    setInputText(suggestion);
    setShowSuggestions(false);
    setSuggestions([]);

    // Auto-parse the selected suggestion
    setIsProcessing(true);
    try {
      const parsed = await groqAddressService.parseAddress(suggestion);
      setParsedAddress(parsed);
      onAddressChange(parsed);
      setValidationMessage('✅ Địa chỉ đã được phân tích thành công!');
    } catch (error) {
      console.error('Error parsing suggestion:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* AI Address Input */}
      <View>
        <View style={styles.labelRow}>
          <Text style={styles.fieldLabel}>
            Địa chỉ <Text style={styles.requiredStar}>*</Text>
          </Text>
          <View style={styles.aiBadge}>
            <Ionicons name="sparkles" size={12} color="#FFFFFF" />
            <Text style={styles.aiBadgeText}>AI</Text>
          </View>
        </View>

        <View style={styles.inputWrapper}>
          <TextInput
            style={[styles.input, isProcessing && styles.inputProcessing]}
            placeholder="Nhập địa chỉ tự nhiên (VD: 123 Nguyễn Huệ quận 1 HCM)"
            placeholderTextColor="#9CA3AF"
            value={inputText}
            onChangeText={handleTextChange}
            multiline
            numberOfLines={2}
            editable={!isProcessing}
          />

          {/* Parse Button */}
          <TouchableOpacity
            style={[styles.parseButton, isProcessing && styles.parseButtonDisabled]}
            onPress={handleParseAddress}
            disabled={isProcessing || !inputText.trim()}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="flash" size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>

        {/* Loading Suggestions Indicator */}
        {isLoadingSuggestions && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color="#FF5722" />
            <Text style={styles.loadingText}>AI đang gợi ý...</Text>
          </View>
        )}

        {/* Validation Message */}
        {validationMessage && (
          <Text
            style={[
              styles.validationText,
              validationMessage.includes('✅') && styles.validationSuccess,
              validationMessage.includes('⚠️') && styles.validationWarning,
              validationMessage.includes('❌') && styles.validationError,
            ]}
          >
            {validationMessage}
          </Text>
        )}

        {/* AI Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>Gợi ý từ AI:</Text>
            {suggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionItem}
                onPress={() => handleSelectSuggestion(suggestion)}
              >
                <Ionicons name="location-outline" size={16} color="#FF5722" />
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Parsed Address Display */}
      {parsedAddress && parsedAddress.confidence >= 0.7 && (
        <View style={styles.parsedContainer}>
          <View style={styles.parsedHeader}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.parsedTitle}>Địa chỉ đã phân tích:</Text>
            <Text style={styles.confidenceText}>
              {Math.round(parsedAddress.confidence * 100)}%
            </Text>
          </View>

          {parsedAddress.street && (
            <View style={styles.parsedRow}>
              <Text style={styles.parsedLabel}>Số nhà/Đường:</Text>
              <Text style={styles.parsedValue}>{parsedAddress.street}</Text>
            </View>
          )}

          {parsedAddress.ward && (
            <View style={styles.parsedRow}>
              <Text style={styles.parsedLabel}>Phường/Xã:</Text>
              <Text style={styles.parsedValue}>{parsedAddress.ward}</Text>
            </View>
          )}

          {parsedAddress.district && (
            <View style={styles.parsedRow}>
              <Text style={styles.parsedLabel}>Quận/Huyện:</Text>
              <Text style={styles.parsedValue}>{parsedAddress.district}</Text>
            </View>
          )}

          {parsedAddress.province && (
            <View style={styles.parsedRow}>
              <Text style={styles.parsedLabel}>Tỉnh/TP:</Text>
              <Text style={styles.parsedValue}>{parsedAddress.province}</Text>
            </View>
          )}
        </View>
      )}

      {/* Help Text */}
      <View style={styles.helpContainer}>
        <Ionicons name="information-circle-outline" size={16} color="#6B7280" />
        <Text style={styles.helpText}>
          AI sẽ tự động phân tích địa chỉ và gợi ý khi bạn nhập. Hỗ trợ viết tắt và tiếng Việt không dấu.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  requiredStar: {
    color: '#EF4444',
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 4,
  },
  aiBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    minHeight: 80,
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingRight: 60,
    fontSize: 16,
    color: '#2C3E50',
    textAlignVertical: 'top',
  },
  inputProcessing: {
    borderColor: '#8B5CF6',
    backgroundColor: '#F5F3FF',
  },
  parseButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    width: 40,
    height: 40,
    backgroundColor: '#FF5722',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  parseButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  loadingText: {
    fontSize: 13,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  validationText: {
    fontSize: 13,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  validationSuccess: {
    color: '#10B981',
  },
  validationWarning: {
    color: '#F59E0B',
  },
  validationError: {
    color: '#EF4444',
  },
  suggestionsContainer: {
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  suggestionsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    marginBottom: 6,
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    color: '#2C3E50',
  },
  parsedContainer: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  parsedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  parsedTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#166534',
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  parsedRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  parsedLabel: {
    fontSize: 13,
    color: '#166534',
    fontWeight: '600',
    width: 110,
  },
  parsedValue: {
    flex: 1,
    fontSize: 13,
    color: '#166534',
  },
  helpContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  helpText: {
    flex: 1,
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
});

