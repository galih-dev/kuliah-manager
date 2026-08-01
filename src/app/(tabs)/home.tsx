import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { COLORS, FONT, FONT_SIZE, RADIUS, SHADOW, SPACING } from "../../../constants/theme";
import { useAuth } from "../../../contexts/AuthContext";
import { listenToBudget, listenToTransactions, Transaction } from "../../../services/financeService";
import { ClassSchedule, listenToClasses, listenToTasks, listenToTodos, Task, Todo } from "../../../services/scheduleService";

function getTodayHari() {
  const hariList = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  return hariList[new Date().getDay()];
}

function getTomorrowHari() {
  const hariList = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return hariList[tomorrow.getDay()];
}

function getCurrentYYYYMM() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
}

function formatRupiah(angka: number) {
  return "Rp" + angka.toLocaleString("id-ID");
}

function getDaysLeft(deadline: string) {
  const [year, month, day] = deadline.split("-").map(Number);
  const target = new Date(year, month - 1, day);
  target.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export default function Home() {
  const { user, loading } = useAuth();
  const [classes, setClasses] = useState<ClassSchedule[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budget, setBudget] = useState(0);

  const todayHari = getTodayHari();
  const tomorrowHari = getTomorrowHari();
  const currentMonth = getCurrentYYYYMM();

 useEffect(() => {
    if (!user) return;
    const unsub1 = listenToClasses(setClasses);
    const unsub2 = listenToTasks(setTasks);
    const unsub3 = listenToTodos(setTodos);
    const unsub4 = listenToTransactions(setTransactions);
    const unsub5 = listenToBudget(currentMonth, setBudget);
    return () => {
      unsub1();
      unsub2();
      unsub3();
      unsub4();
      unsub5();
    };
  }, [user]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.background }}>
        <Text style={{ color: COLORS.textSecondary, fontFamily: FONT.regular }}>Memuat...</Text>
      </View>
    );
  }

  const jadwalHariIni = classes.filter((c) => c.hari === todayHari).sort((a, b) => a.jamMulai.localeCompare(b.jamMulai));
  const jadwalBesok = classes.filter((c) => c.hari == tomorrowHari).sort((a, b) => a.jamMulai.localeCompare(b.jamMulai));
  const deadlineTerdekat = tasks.filter((t) => !t.selesai).sort((a, b) => a.deadline.localeCompare(b.deadline)).slice(0, 3);
  const todoBelumSelesai = todos.filter((t) => !t.selesai);
  const transaksiBulanIni = transactions.filter((t) => t.tanggal.startsWith(currentMonth));
  const totalTerpakai = transaksiBulanIni.reduce((sum, t) => sum + t.jumlah, 0);
  const sisaSaldo = budget - totalTerpakai;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.background }} contentContainerStyle={{ padding: SPACING.lg }}>
      <Text style={{ fontSize: FONT_SIZE.xxl, fontFamily: FONT.bold, color: COLORS.textPrimary, marginBottom: 2 }}>
        Halo, {user?.displayName || "Kamu"}!
      </Text>
      <Text style={{ fontSize: FONT_SIZE.base, fontFamily: FONT.regular, color: COLORS.textSecondary, marginBottom: SPACING.xl }}>
        Hari ini {todayHari}, semangat kuliahnya!
      </Text>

      <Animated.View entering={FadeInDown.duration(400).delay(0)}>
      <TouchableOpacity
        onPress={() => router.push("/keuangan")}
        activeOpacity={0.8}
        style={{ backgroundColor: COLORS.primary, borderRadius: RADIUS.xl, padding: SPACING.xl, marginBottom: SPACING.md, ...SHADOW.card }}
      >
        <Text style={{ color: "#dbeafe", fontSize: FONT_SIZE.sm, fontFamily: FONT.medium, marginBottom: 4 }}>
          Sisa Saldo Bulan Ini
        </Text>
        <Text style={{ color: "white", fontSize: 32, fontFamily: FONT.bold }}>
          {formatRupiah(sisaSaldo)}
        </Text>
        <Text style={{ color: "#bfdbfe", fontSize: FONT_SIZE.xs, fontFamily: FONT.regular, marginTop: SPACING.sm }}>
          dari budget {formatRupiah(budget)}
        </Text>
      </TouchableOpacity>
      </Animated.View>


      <Animated.View entering={FadeInDown.duration(400).delay(100)}>
      <TouchableOpacity
        onPress={() => router.push("/jadwal")}
        activeOpacity={0.8}
        style={{ backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.md, ...SHADOW.card }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: SPACING.sm }}>
          <Ionicons name="calendar" size={18} color={COLORS.primary} style={{ marginRight: 8 }} />
          <Text style={{ fontFamily: FONT.semibold, fontSize: FONT_SIZE.base, color: COLORS.textPrimary }}>Jadwal Hari Ini</Text>
        </View>
        {jadwalHariIni.length === 0 ? (
          <Text style={{ color: COLORS.textMuted, fontFamily: FONT.regular, fontSize: FONT_SIZE.sm }}>Tidak ada kelas hari ini. Santuy!</Text>
        ) : (
          jadwalHariIni.map((c) => (
            <View key={c.id} style={{ marginBottom: SPACING.sm }}>
              <Text style={{ fontFamily: FONT.semibold, color: COLORS.textPrimary, fontSize: FONT_SIZE.sm }}>{c.matkul}</Text>
              <Text style={{ color: COLORS.primary, fontFamily: FONT.regular, fontSize: FONT_SIZE.xs, marginTop: 2 }}>
                {c.jamMulai} - {c.jamSelesai} {c.ruangan ? `• ${c.ruangan}` : ""}
              </Text>
            </View>
          ))
        )}
      </TouchableOpacity>
      </Animated.View>


      {/* Kartu Jadwal Besok */}
      <Animated.View entering={FadeInDown.duration(400).delay(200)}>
      <TouchableOpacity
        onPress={() => router.push("/jadwal")}
        activeOpacity={0.8}
        style={{
          backgroundColor: COLORS.surface,
          borderRadius: RADIUS.lg,
          padding: SPACING.lg,
          marginBottom: SPACING.md,
          ...SHADOW.card,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: SPACING.sm }}>
          <Ionicons name="calendar-outline" size={18} color={COLORS.textSecondary} style={{ marginRight: 8 }} />
          <Text style={{ fontFamily: FONT.semibold, fontSize: FONT_SIZE.base, color: COLORS.textPrimary }}>
            Jadwal Besok ({tomorrowHari})
          </Text>
        </View>
        {jadwalBesok.length === 0 ? (
          <Text style={{ color: COLORS.textMuted, fontFamily: FONT.regular, fontSize: FONT_SIZE.sm }}>
            Tidak ada kelas besok, santai dulu gak sih.
          </Text>
        ) : (
          jadwalBesok.map((c) => (
            <View key={c.id} style={{ marginBottom: SPACING.sm }}>
              <Text style={{ fontFamily: FONT.semibold, color: COLORS.textPrimary, fontSize: FONT_SIZE.sm }}>{c.matkul}</Text>
              <Text style={{ color: COLORS.textSecondary, fontSize: FONT_SIZE.xs, marginTop: 2 }}>
                {c.jamMulai} - {c.jamSelesai} {c.ruangan ? `• ${c.ruangan}` : ""}
              </Text>
            </View>
          ))
        )}
      </TouchableOpacity>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(400).delay(300)}>
      <TouchableOpacity
        onPress={() => router.push("/jadwal")}
        activeOpacity={0.8}
        style={{ backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.md, ...SHADOW.card }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: SPACING.sm }}>
          <Ionicons name="document-text" size={18} color={COLORS.warning} style={{ marginRight: 8 }} />
          <Text style={{ fontFamily: FONT.semibold, fontSize: FONT_SIZE.base, color: COLORS.textPrimary }}>Deadline Terdekat</Text>
        </View>
        {deadlineTerdekat.length === 0 ? (
          <Text style={{ color: COLORS.textMuted, fontFamily: FONT.regular, fontSize: FONT_SIZE.sm }}>Tidak ada deadline mendatang.</Text>
        ) : (
          deadlineTerdekat.map((t) => {
            const daysLeft = getDaysLeft(t.deadline);
            const urgent = daysLeft <= 3;
            return (
              <View key={t.id} style={{ marginBottom: SPACING.sm }}>
                <Text style={{ fontFamily: FONT.semibold, color: COLORS.textPrimary, fontSize: FONT_SIZE.sm }}>{t.judul}</Text>
                <Text style={{ color: urgent ? COLORS.danger : COLORS.textSecondary, fontFamily: FONT.regular, fontSize: FONT_SIZE.xs, marginTop: 2 }}>
                  {t.deadline} • {daysLeft === 0 ? "Hari ini!" : daysLeft < 0 ? "Sudah lewat" : `${daysLeft} hari lagi`}
                </Text>
              </View>
            );
          })
        )}
      </TouchableOpacity>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(400).delay(400)}>
      <TouchableOpacity
        onPress={() => router.push("/todo")}
        activeOpacity={0.8}
        style={{ backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.md, ...SHADOW.card, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="checkmark-circle" size={18} color={COLORS.success} style={{ marginRight: 8 }} />
          <View>
            <Text style={{ fontFamily: FONT.semibold, fontSize: FONT_SIZE.base, color: COLORS.textPrimary, marginBottom: 4 }}>To-Do</Text>
            <Text style={{ color: COLORS.textSecondary, fontFamily: FONT.regular, fontSize: FONT_SIZE.sm }}>
              {todoBelumSelesai.length === 0 ? "Semua to-do udah beres!" : `${todoBelumSelesai.length} to-do belum selesai`}
            </Text>
          </View>
        </View>
        {todoBelumSelesai.length > 0 && (
          <View style={{ backgroundColor: COLORS.primaryLight + "22", borderRadius: RADIUS.full, width: 32, height: 32, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ color: COLORS.primaryLight, fontFamily: FONT.bold, fontSize: FONT_SIZE.sm }}>{todoBelumSelesai.length}</Text>
          </View>
        )}
      </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );
}