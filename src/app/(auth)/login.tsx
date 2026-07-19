import { Link, router } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { COLORS, FONT, FONT_SIZE, RADIUS, SPACING } from "../../../constants/theme";
import { auth } from "../../../services/firebase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Email dan password harus diisi");
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace("/home");
    } catch (error: any) {
      Alert.alert("Login Gagal", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: "center", padding: SPACING.xl }}>
      <Text style={{ fontSize: 32, fontFamily: FONT.bold, color: COLORS.textPrimary, marginBottom: 4 }}>
        Masuk
      </Text>
      <Text style={{ fontSize: FONT_SIZE.base, fontFamily: FONT.regular, color: COLORS.textSecondary, marginBottom: SPACING.xxl }}>
        Selamat datang kembali!
      </Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor={COLORS.textMuted}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={{
          backgroundColor: COLORS.surface,
          borderRadius: RADIUS.md,
          padding: 14,
          marginBottom: SPACING.md,
          color: COLORS.textPrimary,
          fontFamily: FONT.regular,
        }}
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor={COLORS.textMuted}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{
          backgroundColor: COLORS.surface,
          borderRadius: RADIUS.md,
          padding: 14,
          marginBottom: SPACING.xl,
          color: COLORS.textPrimary,
          fontFamily: FONT.regular,
        }}
      />

      <TouchableOpacity
        onPress={handleLogin}
        disabled={loading}
        style={{
          backgroundColor: COLORS.primary,
          padding: 15,
          borderRadius: RADIUS.md,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white", fontFamily: FONT.bold, fontSize: FONT_SIZE.base }}>
          {loading ? "Memproses..." : "Masuk"}
        </Text>
      </TouchableOpacity>

      <Link href="/forgot-password" style={{ marginTop: SPACING.lg, textAlign: "center" }}>
        <Text style={{ color: COLORS.textSecondary, fontFamily: FONT.medium, fontSize: FONT_SIZE.sm }}>
          Lupa Password?
        </Text>
      </Link>

      <Link href="/register" style={{ marginTop: SPACING.md, textAlign: "center" }}>
        <Text style={{ color: COLORS.primaryLight, fontFamily: FONT.medium, fontSize: FONT_SIZE.sm }}>
          Belum punya akun? Daftar
        </Text>
      </Link>
    </View>
  );
}