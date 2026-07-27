import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";
import { COLORS, FONT, FONT_SIZE, RADIUS, SHADOW, SPACING } from "../../../constants/theme";
import { useAuth } from "../../../contexts/AuthContext";
import { cancelWellbeingReminder, getAllScheduledNotifications, scheduleWellbeingReminder, } from "../../../services/notificationService";
import { listenToWellbeingSettings, saveWellbeingSettings, WellbeingSettings } from "../../../services/wellbeingService";
import { TimePickerInput } from "../../components/TimePickerInput";

const TIPS = [
  "Jangan lupa minum air putih ya!",
  "Duduk kelamaan bikin pegal, coba stretching sebentar",
  "Istirahatkan mata dari layar tiap 20 menit sekali",
  "Tidur cukup itu penting buat fokus belajar",
  "Olahraga ringan 15 menit aja udah ngebantu banget",
];

export default function Wellbeing() {
  const { user, loading } = useAuth();
  const [settings, setSettings] = useState<WellbeingSettings>({ jamIstirahat: "15:00", jamOlahraga: "17:00", aktif: true });
  const [jamIstirahatInput, setJamIstirahatInput] = useState("15:00");
  const [jamOlahragaInput, setJamOlahragaInput] = useState("17:00");
  const [tipHariIni] = useState(TIPS[Math.floor(Math.random() * TIPS.length)]);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = listenToWellbeingSettings((data) => {
      setSettings(data);
      setJamIstirahatInput(data.jamIstirahat);
      setJamOlahragaInput(data.jamOlahraga);
    });
    return unsubscribe;
  }, [user]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.background }}>
        <Text style={{ color: COLORS.textSecondary, fontFamily: FONT.regular }}>Memuat...</Text>
      </View>
    );
  }

  const handleToggleAktif = async (value: boolean) => {
    try {
      await saveWellbeingSettings({ ...settings, aktif: value });

      if (value) {
        await scheduleWellbeingReminder("istirahat", jamIstirahatInput);
        await scheduleWellbeingReminder("olahraga", jamOlahragaInput);
      } else {
        await cancelWellbeingReminder("istirahat");
        await cancelWellbeingReminder("olahraga");
      }
    } catch (error: any) {
      Alert.alert("Gagal update", error.message);
    }
  };

  const handleSaveJam = async () => {
    const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!regex.test(jamIstirahatInput) || !regex.test(jamOlahragaInput)) {
      if (Platform.OS === "web") window.alert("Format jam harus HH:MM, contoh: 15:00");
      else Alert.alert("Error", "Format jam harus HH:MM, contoh: 15:00");
      return;
    }
    try {
      await saveWellbeingSettings({ ...settings, jamIstirahat: jamIstirahatInput, jamOlahraga: jamOlahragaInput });

      if (settings.aktif) {
        await scheduleWellbeingReminder("istirahat", jamIstirahatInput);
        await scheduleWellbeingReminder("olahraga", jamOlahragaInput);
      }

      if (Platform.OS === "web") window.alert("Berhasil! Pengaturan reminder disimpan.");
      else Alert.alert("Berhasil", "Pengaturan reminder disimpan!");
    } catch (error: any) {
      if (Platform.OS === "web") window.alert("Gagal menyimpan: " + error.message);
      else Alert.alert("Gagal menyimpan", error.message);
    }
  };

  const handleCheckNotifications = async () => {
    const notifs = await getAllScheduledNotifications();
    if (notifs.length === 0) {
      Alert.alert("Info", "Belum ada notifikasi yang terjadwal");
    } else {
      const list = notifs.map((n) => `${n.content.title}: ${n.content.body}`).join("\n\n");
      Alert.alert(`${notifs.length} Notifikasi Terjadwal`, list);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.background }} contentContainerStyle={{ padding: SPACING.lg }}>
      <Text style={{ fontSize: FONT_SIZE.xxl, fontFamily: FONT.bold, color: COLORS.textPrimary, marginBottom: SPACING.lg }}>
        Wellbeing
      </Text>

      <View style={{ backgroundColor: COLORS.primary, borderRadius: RADIUS.xl, padding: SPACING.xl, marginBottom: SPACING.lg, ...SHADOW.glow }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
          <Ionicons name="sparkles" size={16} color="rgba(255,255,255,0.8)" style={{ marginRight: 6 }} />
          <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: FONT_SIZE.sm, fontFamily: FONT.medium }}>Tips Hari Ini</Text>
        </View>
        <Text style={{ fontSize: FONT_SIZE.lg, fontFamily: FONT.bold, color: "white" }}>{tipHariIni}</Text>
      </View>

      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.md, ...SHADOW.card }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="notifications" size={18} color={COLORS.primary} style={{ marginRight: 10 }} />
          <View>
            <Text style={{ fontFamily: FONT.bold, fontSize: FONT_SIZE.base, color: COLORS.textPrimary }}>Aktifkan Reminder</Text>
            <Text style={{ color: COLORS.textMuted, fontSize: 12, marginTop: 2, fontFamily: FONT.regular }}>Pengingat istirahat & olahraga</Text>
          </View>
        </View>
        <Switch value={settings.aktif} onValueChange={handleToggleAktif} trackColor={{ false: COLORS.surfaceLight, true: COLORS.primary }} thumbColor="white" />
      </View>

      <View style={{ backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.lg, ...SHADOW.card }}>
        <Text style={{ fontFamily: FONT.bold, fontSize: FONT_SIZE.base, color: COLORS.textPrimary, marginBottom: SPACING.md }}>
          Atur Jam Reminder
        </Text>

        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
          <Ionicons name="bed" size={14} color={COLORS.textSecondary} style={{ marginRight: 6 }} />
          <Text style={{ fontSize: 13, color: COLORS.textSecondary, fontFamily: FONT.medium }}>Jam Istirahat</Text>
        </View>
        <TimePickerInput value={jamIstirahatInput} onChange={setJamIstirahatInput} placeholder="Pilih Jam Istirahat" />

        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
          <Ionicons name="fitness" size={14} color={COLORS.textSecondary} style={{ marginRight: 6 }} />
          <Text style={{ fontSize: 13, color: COLORS.textSecondary, fontFamily: FONT.medium }}>Jam Olahraga</Text>
        </View>
        <TimePickerInput value={jamOlahragaInput} onChange={setJamOlahragaInput} placeholder="Pilih Jam Olahraga" />

        <TouchableOpacity onPress={handleSaveJam} style={{ backgroundColor: COLORS.primary, padding: 12, borderRadius: RADIUS.sm, alignItems: "center" }}>
          <Text style={{ color: "white", fontFamily: FONT.semibold }}>Simpan Pengaturan</Text>
          </TouchableOpacity>
         </View>

      <Text style={{ color: COLORS.textMuted, fontSize: 11, marginTop: SPACING.lg, textAlign: "center", fontFamily: FONT.regular }}>
        Catatan: fitur notifikasi push belum aktif, ini baru pengaturan dasarnya dulu ya
      </Text>

    </ScrollView>
  </KeyboardAvoidingView>
  );
}