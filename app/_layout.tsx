import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { NavigationProvider } from "@/contexts/NavigationContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useDatabase } from "@/hooks/useDatabase";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import "react-native-reanimated";
import { useEffect, useState } from "react";
import { seedAll } from "@/services/database.seed";
import { StorageService, STORAGE_KEYS } from "@/services/storage.service";

export const unstable_settings = {
  initialRouteName: "index",
};

function RootNavigator() {
  const { user } = useAuth();

  if (!user) {
    // Guest - Show landing page
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
      </Stack>
    );
  }

  if (user.role === "Caregiver") {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="caregiver" options={{ headerShown: false }} />
      </Stack>
    );
  }

  // Logged in seeker - Show careseeker with tabs
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="careseeker" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { isReady, error } = useDatabase();
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedError, setSeedError] = useState<string | null>(null);

  // Auto-seed data on first launch
  useEffect(() => {
    const checkAndSeedData = async () => {
      if (!isReady) return;
      
      try {
        // Check if users exist
        const users = await StorageService.getAll(STORAGE_KEYS.USERS);
        
        if (users.length === 0) {
          console.log('🌱 No data found, seeding...');
          setIsSeeding(true);
          await seedAll();
          console.log('✅ Seeding completed');
          setIsSeeding(false);
        } else {
          console.log('✅ Data already exists, skipping seed');
        }
      } catch (err) {
        console.error('❌ Seeding error:', err);
        setSeedError((err as Error).message);
        setIsSeeding(false);
      }
    };

    checkAndSeedData();
  }, [isReady]);

  if (!isReady || isSeeding) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2DC2D7" />
        <Text style={styles.loadingText}>
          {!isReady ? 'Đang khởi tạo storage...' : 'Đang tạo dữ liệu mẫu...'}
        </Text>
      </View>
    );
  }

  if (error || seedError) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>
          Lỗi: {error?.message || seedError}
        </Text>
      </View>
    );
  }

  return (
    <AuthProvider>
      <NavigationProvider>
        <NotificationProvider>
          <ThemeProvider
            value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
          >
            <RootNavigator />
            <StatusBar style="auto" />
          </ThemeProvider>
        </NotificationProvider>
      </NavigationProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    fontSize: 16,
    color: "#ff0000",
    textAlign: "center",
    paddingHorizontal: 20,
  },
});
