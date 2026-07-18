import { useEffect, useState } from "react";
import { Alert, Platform, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";
import {
  listenToWellbeingSettings,
  saveWellbeingSettings,
  WellbeingSettings,
} from "../../../services/wellbeingService";

const TIPS = [
  "Jangan lupa minum air putih ya! 💧",
  "Duduk kelamaan bikin pegal, coba stretching sebentar 🧘",
  "Istirahatkan mata dari layar tiap 20 menit sekali 👀",
  "Tidur cukup itu penting buat fokus belajar 😴",
  "Olahraga ringan 15 menit aja udah ngebantu banget 🏃",
];

export default function Wellbeing() {
  const [settings, setSettings] = useState<WellbeingSettings>({
    jamIstirahat: "15:00",
    jamOlahraga: "17:00",
    aktif: true,
  });
  const [jamIstirahatInput, setJamIstirahatInput] = useState("15:00");
  const [jamOlahragaInput, setJamOlahragaInput] = useState("17:00");
  const [tipHariIni] = useState(TIPS[Math.floor(Math.random() * TIPS.length)]);

  useEffect(() => {
    const unsubscribe = listenToWellbeingSettings((data) => {
      setSettings(data);
      setJamIstirahatInput(data.jamIstirahat);
      setJamOlahragaInput(data.jamOlahraga);
    });
    return unsubscribe;
  }, []);

  const handleToggleAktif = async (value: boolean) => {
    try {
      await saveWellbeingSettings({ ...settings, aktif: value });
    } catch (error: any) {
      Alert.alert("Gagal update", error.message);
    }
  };

  const handleSaveJam = async () => {
  const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!regex.test(jamIstirahatInput) || !regex.test(jamOlahragaInput)) {
    if (Platform.OS === "web") {
      window.alert("Format jam harus HH:MM, contoh: 15:00");
    } else {
      Alert.alert("Error", "Format jam harus HH:MM, contoh: 15:00");
    }
    return;
  }
  try {
    await saveWellbeingSettings({
      ...settings,
      jamIstirahat: jamIstirahatInput,
      jamOlahraga: jamOlahragaInput,
    });
    if (Platform.OS === "web") {
      window.alert("Berhasil! Pengaturan reminder disimpan.");
    } else {
      Alert.alert("Berhasil", "Pengaturan reminder disimpan!");
    }
  } catch (error: any) {
    if (Platform.OS === "web") {
      window.alert("Gagal menyimpan: " + error.message);
    } else {
      Alert.alert("Gagal menyimpan", error.message);
    }
  }
};

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>
        Wellbeing
      </Text>

      {/* Kartu Tips Hari Ini */}
      <View
        style={{
          backgroundColor: "#eff6ff",
          borderRadius: 16,
          padding: 20,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: "#bfdbfe",
        }}
      >
        <Text style={{ color: "#666", fontSize: 13, marginBottom: 6 }}>
          Tips Hari Ini
        </Text>
        <Text style={{ fontSize: 16, fontWeight: "600", color: "#1d4ed8" }}>
          {tipHariIni}
        </Text>
      </View>

      {/* Toggle Aktifkan Reminder */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "white",
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: "#e5e7eb",
        }}
      >
        <View>
          <Text style={{ fontWeight: "600", fontSize: 15 }}>Aktifkan Reminder</Text>
          <Text style={{ color: "#999", fontSize: 12, marginTop: 2 }}>
            Pengingat istirahat & olahraga
          </Text>
        </View>
        <Switch value={settings.aktif} onValueChange={handleToggleAktif} />
      </View>

      {/* Pengaturan Jam */}
      <View
        style={{
          backgroundColor: "white",
          borderRadius: 12,
          padding: 16,
          borderWidth: 1,
          borderColor: "#e5e7eb",
        }}
      >
        <Text style={{ fontWeight: "600", fontSize: 15, marginBottom: 12 }}>
          Atur Jam Reminder
        </Text>

        <Text style={{ fontSize: 13, color: "#666", marginBottom: 4 }}>
          Jam Istirahat
        </Text>
        <TextInput
          placeholder="15:00"
          value={jamIstirahatInput}
          onChangeText={setJamIstirahatInput}
          style={{
            backgroundColor: "#f3f4f6",
            borderRadius: 8,
            padding: 10,
            marginBottom: 12,
          }}
        />

        <Text style={{ fontSize: 13, color: "#666", marginBottom: 4 }}>
          Jam Olahraga
        </Text>
        <TextInput
          placeholder="17:00"
          value={jamOlahragaInput}
          onChangeText={setJamOlahragaInput}
          style={{
            backgroundColor: "#f3f4f6",
            borderRadius: 8,
            padding: 10,
            marginBottom: 16,
          }}
        />

        <TouchableOpacity
          onPress={handleSaveJam}
          style={{
            backgroundColor: "#3b82f6",
            padding: 12,
            borderRadius: 8,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>Simpan Pengaturan</Text>
        </TouchableOpacity>
      </View>

      <Text style={{ color: "#999", fontSize: 11, marginTop: 16, textAlign: "center" }}>
        Catatan: fitur notifikasi push belum aktif, ini baru pengaturan dasarnya dulu ya
      </Text>
    </ScrollView>
  );
}