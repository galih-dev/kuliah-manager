import { Link } from "expo-router";
import { sendPasswordResetEmail } from "firebase/auth";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from "react-native";
import { COLORS, FONT, FONT_SIZE, RADIUS, SPACING } from "../../../constants/theme";
import { auth } from "../../../services/firebase";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    if (!email) {
      Alert.alert("Error", "Masukkan email kamu dulu");
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
    } catch (error: any) {
      Alert.alert("Gagal Mengirim Email", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
    behavior={Platform.OS === "ios" ? "padding" : "height"}
    style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: "center", padding: SPACING.xl }}
  >
      <Text style={{ fontSize: 28, fontFamily: FONT.bold, color: COLORS.textPrimary, marginBottom: 4 }}>
        Lupa Password
      </Text>
      <Text style={{ fontSize: FONT_SIZE.base, fontFamily: FONT.regular, color: COLORS.textSecondary, marginBottom: SPACING.xxl }}>
        Masukkan email kamu, kami akan kirim link reset password
      </Text>

      {sent ? (
        <View style={{ backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.lg, marginBottom: SPACING.xl }}>
          <Text style={{ color: COLORS.success, fontFamily: FONT.semibold, fontSize: FONT_SIZE.sm, textAlign: "center" }}>
            Email reset password sudah dikirim! Cek inbox (atau folder spam) email kamu.
          </Text>
        </View>
      ) : (
        <>
          <TextInput
            placeholder="Email"
            placeholderTextColor={COLORS.textMuted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={{ backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: 14, marginBottom: SPACING.xl, color: COLORS.textPrimary, fontFamily: FONT.regular }}
          />

          <TouchableOpacity
            onPress={handleReset}
            disabled={loading}
            style={{ backgroundColor: COLORS.primary, padding: 15, borderRadius: RADIUS.md, alignItems: "center" }}
          >
            <Text style={{ color: "white", fontFamily: FONT.bold, fontSize: FONT_SIZE.base }}>
              {loading ? "Mengirim..." : "Kirim Link Reset"}
            </Text>
          </TouchableOpacity>
        </>
      )}

      <Link href="/login" style={{ marginTop: SPACING.lg, textAlign: "center" }}>
        <Text style={{ color: COLORS.primaryLight, fontFamily: FONT.medium, fontSize: FONT_SIZE.sm }}>
          Kembali ke Login
        </Text>
      </Link>
    </KeyboardAvoidingView>
  );
}