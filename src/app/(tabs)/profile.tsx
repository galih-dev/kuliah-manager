import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { COLORS, FONT, FONT_SIZE, RADIUS, SHADOW, SPACING } from "../../../constants/theme";
import { useAuth } from "../../../contexts/AuthContext";
import { logoutUser, updateUserName, updateUserPassword } from "../../../services/authService";

const inputStyle = {
  backgroundColor: COLORS.surfaceLight,
  borderRadius: RADIUS.sm,
  padding: 12,
  marginBottom: SPACING.sm,
  color: COLORS.textPrimary,
  fontSize: FONT_SIZE.sm,
  fontFamily: FONT.regular,
};

export default function Profile() {
  const { user, loading, refreshUser } = useAuth();

  const [namaInput, setNamaInput] = useState(user?.displayName || "");
  const [savingName, setSavingName] = useState(false);

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.background }}>
        <Text style={{ color: COLORS.textSecondary, fontFamily: FONT.regular }}>Memuat...</Text>
      </View>
    );
  }

 const handleSaveName = async () => {
    if (!namaInput.trim()) {
      if (Platform.OS === "web") window.alert("Nama tidak boleh kosong");
      else Alert.alert("Error", "Nama tidak boleh kosong");
      return;
    }
    setSavingName(true);
    try {
      await updateUserName(namaInput);
      await refreshUser();
      if (Platform.OS === "web") window.alert("Nama berhasil diperbarui!");
      else Alert.alert("Berhasil", "Nama berhasil diperbarui!");
    } catch (error: any) {
      if (Platform.OS === "web") window.alert("Gagal update nama: " + error.message);
      else Alert.alert("Gagal update nama", error.message);
    } finally {
      setSavingName(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
        if (Platform.OS === "web") window.alert("Semua field password wajib diisi");
        else Alert.alert("Error", "Semua field password wajib diisi");
        return;
    }
    if (newPassword.length < 6) {
        if (Platform.OS === "web") window.alert("Password baru minimal 6 karakter");
        else Alert.alert("Error", "Password baru minimal 6 karakter");
        return;
    }
    if (newPassword !== confirmPassword) {
        if (Platform.OS === "web") window.alert("Konfirmasi password baru tidak cocok");
        else Alert.alert("Error", "Konfirmasi password baru tidak cocok");
        return;
    }
    setSavingPassword(true);
    try {
        await updateUserPassword(currentPassword, newPassword);
        if (Platform.OS === "web") window.alert("Password berhasil diubah!");
        else Alert.alert("Berhasil", "Password berhasil diubah!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setShowPasswordForm(false);
    } catch (error: any) {
        const msg = "Pastikan password saat ini sudah benar. " + error.message;
        if (Platform.OS === "web") window.alert("Gagal ubah password: " + msg);
        else Alert.alert("Gagal ubah password", msg);
    } finally {
        setSavingPassword(false);
    }
    };

  const handleLogout = () => {
    if (Platform.OS === "web") {
      if (window.confirm("Yakin ingin logout?")) {
        logoutUser();
      }
    } else {
      Alert.alert("Logout", "Yakin ingin logout?", [
        { text: "Batal", style: "cancel" },
        { text: "Logout", style: "destructive", onPress: () => logoutUser() },
      ]);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.background }} contentContainerStyle={{ padding: SPACING.lg }}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: SPACING.xl }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: SPACING.md }}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={{ fontSize: FONT_SIZE.xxl, fontFamily: FONT.bold, color: COLORS.textPrimary }}>
          Profile
        </Text>
      </View>

      {/* Kartu Avatar & Email */}
      <View style={{ alignItems: "center", marginBottom: SPACING.xl }}>
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: RADIUS.full,
            backgroundColor: COLORS.primary,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: SPACING.md,
          }}
        >
          <Text style={{ fontSize: 32, fontFamily: FONT.bold, color: "white" }}>
            {(user?.displayName || user?.email || "?")[0].toUpperCase()}
          </Text>
        </View>
        <Text style={{ fontFamily: FONT.bold, fontSize: FONT_SIZE.lg, color: COLORS.textPrimary }}>
          {user?.displayName || "Tanpa Nama"}
        </Text>
        <Text style={{ fontFamily: FONT.regular, fontSize: FONT_SIZE.sm, color: COLORS.textMuted, marginTop: 2 }}>
          {user?.email}
        </Text>
      </View>

      {/* Ubah Nama */}
      <View style={{ backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.md, ...SHADOW.card }}>
        <Text style={{ fontFamily: FONT.bold, fontSize: FONT_SIZE.base, color: COLORS.textPrimary, marginBottom: SPACING.md }}>
          Ubah Nama
        </Text>
        <TextInput
          placeholder="Nama Lengkap"
          placeholderTextColor={COLORS.textMuted}
          value={namaInput}
          onChangeText={setNamaInput}
          style={inputStyle}
        />
        <TouchableOpacity
          onPress={handleSaveName}
          disabled={savingName}
          style={{ backgroundColor: COLORS.primary, padding: 12, borderRadius: RADIUS.sm, alignItems: "center", marginTop: 4 }}
        >
          <Text style={{ color: "white", fontFamily: FONT.semibold }}>{savingName ? "Menyimpan..." : "Simpan Nama"}</Text>
        </TouchableOpacity>
      </View>

      {/* Ubah Password */}
      <View style={{ backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.md, ...SHADOW.card }}>
        <TouchableOpacity
          onPress={() => setShowPasswordForm(!showPasswordForm)}
          style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
        >
          <Text style={{ fontFamily: FONT.bold, fontSize: FONT_SIZE.base, color: COLORS.textPrimary }}>
            Ubah Password
          </Text>
          <Ionicons name={showPasswordForm ? "chevron-up" : "chevron-down"} size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>

        {showPasswordForm && (
          <View style={{ marginTop: SPACING.md }}>
            <TextInput
              placeholder="Password Saat Ini"
              placeholderTextColor={COLORS.textMuted}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
              style={inputStyle}
            />
            <TextInput
              placeholder="Password Baru (min. 6 karakter)"
              placeholderTextColor={COLORS.textMuted}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              style={inputStyle}
            />
            <TextInput
              placeholder="Konfirmasi Password Baru"
              placeholderTextColor={COLORS.textMuted}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              style={inputStyle}
            />
            <TouchableOpacity
              onPress={handleChangePassword}
              disabled={savingPassword}
              style={{ backgroundColor: COLORS.primary, padding: 12, borderRadius: RADIUS.sm, alignItems: "center", marginTop: 4 }}
            >
              <Text style={{ color: "white", fontFamily: FONT.semibold }}>{savingPassword ? "Menyimpan..." : "Ubah Password"}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Tombol Logout */}
      <TouchableOpacity
        onPress={handleLogout}
        style={{
          backgroundColor: COLORS.danger + "22",
          borderRadius: RADIUS.lg,
          padding: SPACING.lg,
          alignItems: "center",
          flexDirection: "row",
          justifyContent: "center",
          gap: 8,
        }}
      >
        <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
        <Text style={{ color: COLORS.danger, fontFamily: FONT.bold, fontSize: FONT_SIZE.base }}>
          Logout
        </Text>
      </TouchableOpacity>
    </ScrollView>
  </KeyboardAvoidingView>
  );
}