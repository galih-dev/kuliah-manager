import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../../contexts/AuthContext";
import { getBudget, listenToTransactions, Transaction } from "../../../services/financeService";
import { ClassSchedule, listenToClasses, listenToTasks, listenToTodos, Task, Todo } from "../../../services/scheduleService";

function getTodayHari() {
  const hariList = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  return hariList[new Date().getDay()];
}

function getCurrentYYYYMM() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
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
  const diffTime = target.getTime() - today.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

export default function Home() {
  const { user, loading } = useAuth();
  const [classes, setClasses] = useState<ClassSchedule[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budget, setBudget] = useState(0);

  const todayHari = getTodayHari();
  const currentMonth = getCurrentYYYYMM();

  useEffect(() => {
    if (!user) return;
    const unsub1 = listenToClasses(setClasses);
    const unsub2 = listenToTasks(setTasks);
    const unsub3 = listenToTodos(setTodos);
    const unsub4 = listenToTransactions(setTransactions);
    getBudget(currentMonth).then((b) => {
      if (b !== null) setBudget(b);
    });
    return () => {
      unsub1();
      unsub2();
      unsub3();
      unsub4();
    };
  }, [user]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Memuat...</Text>
      </View>
    );
  }

  const jadwalHariIni = classes
    .filter((c) => c.hari === todayHari)
    .sort((a, b) => a.jamMulai.localeCompare(b.jamMulai));

  const deadlineTerdekat = tasks
    .filter((t) => !t.selesai)
    .sort((a, b) => a.deadline.localeCompare(b.deadline))
    .slice(0, 3);

  const todoBelumSelesai = todos.filter((t) => !t.selesai);

  const transaksiBulanIni = transactions.filter((t) => t.tanggal.startsWith(currentMonth));
  const totalTerpakai = transaksiBulanIni.reduce((sum, t) => sum + t.jumlah, 0);
  const sisaSaldo = budget - totalTerpakai;

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 4 }}>
        Halo! 👋
      </Text>
      <Text style={{ color: "#666", marginBottom: 20 }}>
        Hari ini {todayHari}, semangat kuliahnya!
      </Text>

      {/* Kartu Jadwal Hari Ini */}
      <TouchableOpacity
        onPress={() => router.push("/jadwal")}
        style={{
          backgroundColor: "white",
          borderRadius: 16,
          padding: 16,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: "#e5e7eb",
        }}
      >
        <Text style={{ fontWeight: "bold", fontSize: 16, marginBottom: 8 }}>
          📅 Jadwal Hari Ini
        </Text>
        {jadwalHariIni.length === 0 ? (
          <Text style={{ color: "#999" }}>Tidak ada kelas hari ini. Santuy!</Text>
        ) : (
          jadwalHariIni.map((c) => (
            <View key={c.id} style={{ marginBottom: 6 }}>
              <Text style={{ fontWeight: "600" }}>{c.matkul}</Text>
              <Text style={{ color: "#3b82f6", fontSize: 13 }}>
                {c.jamMulai} - {c.jamSelesai} {c.ruangan ? `• ${c.ruangan}` : ""}
              </Text>
            </View>
          ))
        )}
      </TouchableOpacity>

      {/* Kartu Deadline Tugas */}
      <TouchableOpacity
        onPress={() => router.push("/jadwal")}
        style={{
          backgroundColor: "white",
          borderRadius: 16,
          padding: 16,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: "#e5e7eb",
        }}
      >
        <Text style={{ fontWeight: "bold", fontSize: 16, marginBottom: 8 }}>
          📝 Deadline Terdekat
        </Text>
        {deadlineTerdekat.length === 0 ? (
          <Text style={{ color: "#999" }}>Tidak ada deadline mendatang.</Text>
        ) : (
          deadlineTerdekat.map((t) => {
            const daysLeft = getDaysLeft(t.deadline);
            const urgent = daysLeft <= 3;
            return (
              <View key={t.id} style={{ marginBottom: 6 }}>
                <Text style={{ fontWeight: "600" }}>{t.judul}</Text>
                <Text style={{ color: urgent ? "#ef4444" : "#666", fontSize: 13 }}>
                  {t.deadline} • {daysLeft === 0 ? "Hari ini!" : daysLeft < 0 ? "Sudah lewat" : `${daysLeft} hari lagi`}
                </Text>
              </View>
            );
          })
        )}
      </TouchableOpacity>

      {/* Kartu Keuangan */}
      <TouchableOpacity
        onPress={() => router.push("/keuangan")}
        style={{
          backgroundColor: sisaSaldo < 0 ? "#fef2f2" : "#eff6ff",
          borderRadius: 16,
          padding: 16,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: sisaSaldo < 0 ? "#fecaca" : "#bfdbfe",
        }}
      >
        <Text style={{ fontWeight: "bold", fontSize: 16, marginBottom: 4 }}>
          💰 Sisa Saldo Bulan Ini
        </Text>
        <Text style={{ fontSize: 22, fontWeight: "bold", color: sisaSaldo < 0 ? "#ef4444" : "#1d4ed8" }}>
          {formatRupiah(sisaSaldo)}
        </Text>
      </TouchableOpacity>

      {/* Kartu To-Do */}
      <TouchableOpacity
        onPress={() => router.push("/todo")}
        style={{
          backgroundColor: "white",
          borderRadius: 16,
          padding: 16,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: "#e5e7eb",
        }}
      >
        <Text style={{ fontWeight: "bold", fontSize: 16, marginBottom: 8 }}>
          ✅ To-Do
        </Text>
        <Text style={{ color: "#666" }}>
          {todoBelumSelesai.length === 0
            ? "Semua to-do udah beres! 🎉"
            : `${todoBelumSelesai.length} to-do belum selesai`}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}