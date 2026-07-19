import { Link, router } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { COLORS, FONT, FONT_SIZE, RADIUS, SPACING } from "../../../constants/theme";
import { auth, db } from "../../../services/firebase";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Email dan password harus diisi");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Error", "Password minimal 6 karakter");
      return;
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email: userCredential.user.email,
        uid: userCredential.user.uid,
      });
      router.replace("/home");
    } catch (error: any) {
      Alert.alert("Registrasi Gagal", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: "center", padding: SPACING.xl }}>
      <Text style={{ fontSize: 32, fontFamily: FONT.bold, color: COLORS.textPrimary, marginBottom: 4 }}>
        Daftar
      </Text>
      <Text style={{ fontSize: FONT_SIZE.base, fontFamily: FONT.regular, color: COLORS.textSecondary, marginBottom: SPACING.xxl }}>
        Buat akun baru untuk mulai
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
        placeholder="Password (min. 6 karakter)"
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
        onPress={handleRegister}
        disabled={loading}
        style={{
          backgroundColor: COLORS.primary,
          padding: 15,
          borderRadius: RADIUS.md,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white", fontFamily: FONT.bold, fontSize: FONT_SIZE.base }}>
          {loading ? "Memproses..." : "Daftar"}
        </Text>
      </TouchableOpacity>

      <Link href="/login" style={{ marginTop: SPACING.lg, textAlign: "center" }}>
        <Text style={{ color: COLORS.primaryLight, fontFamily: FONT.medium, fontSize: FONT_SIZE.sm }}>
          Sudah punya akun? Masuk
        </Text>
      </Link>
    </View>
  );
}