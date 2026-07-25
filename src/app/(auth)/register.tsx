import { Link, router } from "expo-router";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity } from "react-native";
import { COLORS, FONT, FONT_SIZE, RADIUS, SPACING } from "../../../constants/theme";
import { auth, db } from "../../../services/firebase";

export default function Register() {
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [konfirmasiPassword, setKonfirmasiPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!nama || !email || !password || !konfirmasiPassword) {
      if (Platform.OS === "web") window.alert("Semua field wajib diisi");
      else Alert.alert("Error", "Semua field wajib diisi");
      return;
    }
    if (password.length < 6) {
      if (Platform.OS === "web") window.alert("Password minimal 6 karakter");
      else Alert.alert("Error", "Password minimal 6 karakter");
      return;
    }
    if (password !== konfirmasiPassword) {
      if (Platform.OS === "web") window.alert("Konfirmasi password tidak cocok");
      else Alert.alert("Error", "Konfirmasi password tidak cocok");
      return;
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: nama });
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email: userCredential.user.email,
        uid: userCredential.user.uid,
        nama,
      });
      router.replace("/home");
    } catch (error: any) {
      if (Platform.OS === "web") window.alert("Registrasi Gagal: " + error.message);
      else Alert.alert("Registrasi Gagal", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
    behavior={Platform.OS === "ios" ? "padding" : "height"}
    style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: "center", padding: SPACING.xl }}
  >
      <Text style={{ fontSize: 32, fontFamily: FONT.bold, color: COLORS.textPrimary, marginBottom: 4 }}>
        Daftar
      </Text>
      <Text style={{ fontSize: FONT_SIZE.base, fontFamily: FONT.regular, color: COLORS.textSecondary, marginBottom: SPACING.xxl }}>
        Buat akun baru untuk mulai
      </Text>

      <TextInput
        placeholder="Nama Lengkap"
        placeholderTextColor={COLORS.textMuted}
        value={nama}
        onChangeText={setNama}
        style={{ backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: 14, marginBottom: SPACING.md, color: COLORS.textPrimary, fontFamily: FONT.regular }}
      />

      <TextInput
        placeholder="Email"
        placeholderTextColor={COLORS.textMuted}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={{ backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: 14, marginBottom: SPACING.md, color: COLORS.textPrimary, fontFamily: FONT.regular }}
      />

      <TextInput
        placeholder="Password (min. 6 karakter)"
        placeholderTextColor={COLORS.textMuted}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: 14, marginBottom: SPACING.md, color: COLORS.textPrimary, fontFamily: FONT.regular }}
      />

      <TextInput
        placeholder="Konfirmasi Password"
        placeholderTextColor={COLORS.textMuted}
        value={konfirmasiPassword}
        onChangeText={setKonfirmasiPassword}
        secureTextEntry
        style={{ backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: 14, marginBottom: SPACING.xl, color: COLORS.textPrimary, fontFamily: FONT.regular }}
      />

      <TouchableOpacity
        onPress={handleRegister}
        disabled={loading}
        style={{ backgroundColor: COLORS.primary, padding: 15, borderRadius: RADIUS.md, alignItems: "center" }}
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
    </KeyboardAvoidingView>
  );
}