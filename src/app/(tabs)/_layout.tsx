import { Ionicons } from "@expo/vector-icons";
import { Redirect, router, Tabs } from "expo-router";
import { useEffect } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../../../constants/theme";
import { useAuth } from "../../../contexts/AuthContext";
import { requestNotificationPermission } from "../../../services/notificationService";

export default function TabsLayout() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user) {
      requestNotificationPermission();
    }
  }, [user]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.background }}>
        <Text style={{ color: COLORS.textSecondary }}>Memuat...</Text>
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  const ProfileButton = () => (
    <TouchableOpacity onPress={() => router.push("/profile")} style={{ marginRight: 16 }}>
      <Ionicons name="person-circle-outline" size={26} color={COLORS.textPrimary} />
    </TouchableOpacity>
  );

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.background },
        headerTintColor: COLORS.textPrimary,
        headerShadowVisible: false,
        headerRight: () => <ProfileButton />,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: 72,
          paddingBottom: 12,
          paddingTop: 8,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600", lineHeight: 14 },
      }}
    >
      <Tabs.Screen name="home" options={{ title: "Home", tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} /> }} />
      <Tabs.Screen name="jadwal" options={{ title: "Jadwal", tabBarIcon: ({ color, size }) => <Ionicons name="calendar" size={size} color={color} /> }} />
      <Tabs.Screen name="todo" options={{ title: "To-Do", tabBarIcon: ({ color, size }) => <Ionicons name="checkmark-circle" size={size} color={color} /> }} />
      <Tabs.Screen name="keuangan" options={{ title: "Dompet", tabBarIcon: ({ color, size }) => <Ionicons name="wallet" size={size} color={color} /> }} />
      <Tabs.Screen name="kelompok" options={{ title: "Grup", tabBarIcon: ({ color, size }) => <Ionicons name="people" size={size} color={color} /> }} />
      <Tabs.Screen name="wellbeing" options={{ title: "Health", tabBarIcon: ({ color, size }) => <Ionicons name="heart" size={size} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ href: null, title: "Profile" }} />
    </Tabs>
  );
}