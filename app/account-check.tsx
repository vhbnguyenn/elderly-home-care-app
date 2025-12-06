import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function AccountCheckScreen() {
  return (
    <View style={styles.container}>
      {/* Decorative Background Blobs */}
      <View style={styles.decorativeBackground}>
        <LinearGradient
          colors={['#FF5722', '#FF6F2C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBlob1}
        />
        <LinearGradient
          colors={['#FF6F2C', '#FF8A50']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBlob2}
        />
      </View>

      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <View style={styles.backButtonCircle}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </View>
      </TouchableOpacity>

      {/* Content */}
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoWrapper}>
          <Image 
            source={require('../assets/images/logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.greeting}>Xin chào! 👋</Text>
        <Text style={styles.question}>Bạn đã có tài khoản chưa?</Text>

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          {/* Login Button */}
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/login')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#FF5722', '#FF6F2C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.buttonGradient}
            >
              <Ionicons name="log-in-outline" size={24} color="#FFFFFF" />
              <Text style={styles.loginButtonText}>Có rồi, đăng nhập</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Register Button */}
          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => router.push('/register')}
            activeOpacity={0.8}
          >
            <Ionicons name="person-add-outline" size={24} color="#FF5722" />
            <Text style={styles.registerButtonText}>Chưa, tạo tài khoản mới</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom hint */}
        <Text style={styles.hint}>
          Tạo tài khoản để kết nối với người chăm sóc tốt nhất
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  decorativeBackground: {
    position: 'absolute',
    width: '100%',
    height: '50%',
    top: 0,
  },
  gradientBlob1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    top: -150,
    right: -100,
    opacity: 0.15,
  },
  gradientBlob2: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    top: 100,
    left: -80,
    opacity: 0.1,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  backButtonCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  logoWrapper: {
    marginBottom: 30,
    shadowColor: '#FF5722',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  logo: {
    width: 120,
    height: 120,
  },
  iconWrapper: {
    marginBottom: 30,
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF5722',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  iconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 12,
    textAlign: 'center',
  },
  question: {
    fontSize: 18,
    color: '#666',
    marginBottom: 50,
    textAlign: 'center',
  },
  buttonsContainer: {
    width: '100%',
    gap: 16,
  },
  loginButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#FF5722',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  loginButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FF5722',
    backgroundColor: '#FFFFFF',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  registerButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FF5722',
  },
  hint: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 30,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
});
