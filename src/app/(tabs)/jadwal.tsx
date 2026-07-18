import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../../contexts/AuthContext";
import {
  addClass,
  addTask,
  ClassSchedule,
  deleteClass,
  deleteTask,
  listenToClasses,
  listenToTasks,
  Task,
  toggleTaskDone,
} from "../../../services/scheduleService";

const HARI_LIST = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

export default function Jadwal() {
  const { loading } = useAuth();
  const [activeTab, setActiveTab] = useState<"kuliah" | "tugas">("kuliah");

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Memuat...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>
        Jadwal Akademik
      </Text>

      {/* Tab Switcher */}
      <View
        style={{
          flexDirection: "row",
          backgroundColor: "#f3f4f6",
          borderRadius: 10,
          padding: 4,
          marginBottom: 16,
        }}
      >
        <TouchableOpacity
          onPress={() => setActiveTab("kuliah")}
          style={{
            flex: 1,
            paddingVertical: 10,
            borderRadius: 8,
            backgroundColor: activeTab === "kuliah" ? "white" : "transparent",
            alignItems: "center",
          }}
        >
          <Text style={{ fontWeight: "600" }}>Jadwal Kuliah</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("tugas")}
          style={{
            flex: 1,
            paddingVertical: 10,
            borderRadius: 8,
            backgroundColor: activeTab === "tugas" ? "white" : "transparent",
            alignItems: "center",
          }}
        >
          <Text style={{ fontWeight: "600" }}>Deadline Tugas</Text>
        </TouchableOpacity>
      </View>

      {activeTab === "kuliah" ? <JadwalKuliahTab /> : <DeadlineTugasTab />}
    </View>
  );
}

// ==================== TAB 1: JADWAL KULIAH ====================

function JadwalKuliahTab() {
  const { user, loading } = useAuth();
  const [classes, setClasses] = useState<ClassSchedule[]>([]);
  const [showForm, setShowForm] = useState(false);

  const [matkul, setMatkul] = useState("");
  const [hari, setHari] = useState("Senin");
  const [jamMulai, setJamMulai] = useState("");
  const [jamSelesai, setJamSelesai] = useState("");
  const [ruangan, setRuangan] = useState("");
  const [dosen, setDosen] = useState("");

  useEffect(() => {
    if (!user) return;
    const unsubscribe = listenToClasses(setClasses);
    return unsubscribe;
  }, []);

  const resetForm = () => {
    setMatkul("");
    setHari("Senin");
    setJamMulai("");
    setJamSelesai("");
    setRuangan("");
    setDosen("");
    setShowForm(false);
  };

  const handleAdd = async () => {
    if (!matkul || !jamMulai || !jamSelesai) {
      Alert.alert("Error", "Mata kuliah, jam mulai, dan jam selesai wajib diisi");
      return;
    }
    try {
      await addClass({ matkul, hari, jamMulai, jamSelesai, ruangan, dosen });
      resetForm();
    } catch (error: any) {
      Alert.alert("Gagal menambah jadwal", error.message);
    }
  };

  const handleDelete = (id: string) => {
    if (Platform.OS === "web") {
      if (window.confirm("Yakin ingin menghapus jadwal ini?")) {
        deleteClass(id);
      }
    } else {
      Alert.alert("Hapus Jadwal", "Yakin ingin menghapus jadwal ini?", [
        { text: "Batal", style: "cancel" },
        { text: "Hapus", style: "destructive", onPress: () => deleteClass(id) },
      ]);
    }
  };

  if (loading) {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Memuat...</Text>
    </View>
  );
}

  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity
        onPress={() => setShowForm(!showForm)}
        style={{
          backgroundColor: "#3b82f6",
          paddingVertical: 10,
          borderRadius: 8,
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <Text style={{ color: "white", fontWeight: "bold" }}>
          {showForm ? "Tutup Form" : "+ Tambah Jadwal Kuliah"}
        </Text>
      </TouchableOpacity>

      {showForm && (
        <ScrollView
          style={{
            backgroundColor: "#f3f4f6",
            padding: 16,
            borderRadius: 12,
            marginBottom: 16,
            maxHeight: 400,
          }}
        >
          <TextInput
            placeholder="Nama Mata Kuliah"
            value={matkul}
            onChangeText={setMatkul}
            style={{ backgroundColor: "white", borderRadius: 8, padding: 10, marginBottom: 8 }}
          />

          <Text style={{ marginBottom: 4, fontWeight: "600" }}>Hari</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 8 }}>
            {HARI_LIST.map((h) => (
              <TouchableOpacity
                key={h}
                onPress={() => setHari(h)}
                style={{
                  backgroundColor: hari === h ? "#3b82f6" : "white",
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  borderRadius: 20,
                  marginRight: 6,
                  marginBottom: 6,
                }}
              >
                <Text style={{ color: hari === h ? "white" : "black" }}>{h}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}>
            <TextInput
              placeholder="Jam Mulai (08:00)"
              value={jamMulai}
              onChangeText={setJamMulai}
              style={{ flex: 1, backgroundColor: "white", borderRadius: 8, padding: 10 }}
            />
            <TextInput
              placeholder="Jam Selesai (10:00)"
              value={jamSelesai}
              onChangeText={setJamSelesai}
              style={{ flex: 1, backgroundColor: "white", borderRadius: 8, padding: 10 }}
            />
          </View>

          <TextInput
            placeholder="Ruangan"
            value={ruangan}
            onChangeText={setRuangan}
            style={{ backgroundColor: "white", borderRadius: 8, padding: 10, marginBottom: 8 }}
          />

          <TextInput
            placeholder="Nama Dosen"
            value={dosen}
            onChangeText={setDosen}
            style={{ backgroundColor: "white", borderRadius: 8, padding: 10, marginBottom: 12 }}
          />

          <TouchableOpacity
            onPress={handleAdd}
            style={{ backgroundColor: "#22c55e", padding: 12, borderRadius: 8, alignItems: "center" }}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>Simpan</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      <FlatList
        data={classes}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", color: "#999", marginTop: 40 }}>
            Belum ada jadwal. Tambahkan jadwal kuliahmu!
          </Text>
        }
        renderItem={({ item }) => (
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 12,
              padding: 14,
              marginBottom: 10,
              borderWidth: 1,
              borderColor: "#e5e7eb",
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: "bold", fontSize: 16 }}>{item.matkul}</Text>
                <Text style={{ color: "#3b82f6", marginTop: 2 }}>
                  {item.hari}, {item.jamMulai} - {item.jamSelesai}
                </Text>
                {item.ruangan && <Text style={{ color: "#666", marginTop: 2 }}>Ruangan: {item.ruangan}</Text>}
                {item.dosen && <Text style={{ color: "#666" }}>Dosen: {item.dosen}</Text>}
              </View>
              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Text style={{ color: "#ef4444", fontWeight: "bold" }}>Hapus</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

// ==================== TAB 2: DEADLINE TUGAS ====================

function DeadlineTugasTab() {
  const { user, loading } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showForm, setShowForm] = useState(false);

  const [judul, setJudul] = useState("");
  const [matkul, setMatkul] = useState("");
  const [deadline, setDeadline] = useState("");

  useEffect(() => {
    const unsubscribe = listenToTasks(setTasks);
    return unsubscribe;
  }, []);

  const resetForm = () => {
    setJudul("");
    setMatkul("");
    setDeadline("");
    setShowForm(false);
  };

  const handleAdd = async () => {
    if (!judul || !deadline) {
      Alert.alert("Error", "Judul tugas dan deadline wajib diisi");
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(deadline)) {
      Alert.alert("Error", "Format deadline harus YYYY-MM-DD, contoh: 2026-07-25");
      return;
    }
    try {
      await addTask({ judul, matkul, deadline });
      resetForm();
    } catch (error: any) {
      Alert.alert("Gagal menambah tugas", error.message);
    }
  };

  const handleDelete = (id: string) => {
    if (Platform.OS === "web") {
      if (window.confirm("Yakin ingin menghapus tugas ini?")) {
        deleteTask(id);
      }
    } else {
      Alert.alert("Hapus Tugas", "Yakin ingin menghapus tugas ini?", [
        { text: "Batal", style: "cancel" },
        { text: "Hapus", style: "destructive", onPress: () => deleteTask(id) },
      ]);
    }
  };

  const getDaysLeft = (deadline: string) => {
  const [year, month, day] = deadline.split("-").map(Number);
  const target = new Date(year, month - 1, day); // dibaca sebagai waktu lokal
  target.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
  };

  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity
        onPress={() => setShowForm(!showForm)}
        style={{
          backgroundColor: "#3b82f6",
          paddingVertical: 10,
          borderRadius: 8,
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <Text style={{ color: "white", fontWeight: "bold" }}>
          {showForm ? "Tutup Form" : "+ Tambah Deadline Tugas"}
        </Text>
      </TouchableOpacity>

      {showForm && (
        <View style={{ backgroundColor: "#f3f4f6", padding: 16, borderRadius: 12, marginBottom: 16 }}>
          <TextInput
            placeholder="Judul Tugas"
            value={judul}
            onChangeText={setJudul}
            style={{ backgroundColor: "white", borderRadius: 8, padding: 10, marginBottom: 8 }}
          />
          <TextInput
            placeholder="Mata Kuliah (opsional)"
            value={matkul}
            onChangeText={setMatkul}
            style={{ backgroundColor: "white", borderRadius: 8, padding: 10, marginBottom: 8 }}
          />
          <TextInput
            placeholder="Deadline (YYYY-MM-DD, contoh: 2026-07-25)"
            value={deadline}
            onChangeText={setDeadline}
            style={{ backgroundColor: "white", borderRadius: 8, padding: 10, marginBottom: 12 }}
          />
          <TouchableOpacity
            onPress={handleAdd}
            style={{ backgroundColor: "#22c55e", padding: 12, borderRadius: 8, alignItems: "center" }}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>Simpan</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", color: "#999", marginTop: 40 }}>
            Belum ada deadline tugas.
          </Text>
        }
        renderItem={({ item }) => {
          const daysLeft = getDaysLeft(item.deadline);
          let urgencyColor = "#666";
          let urgencyText = `${daysLeft} hari lagi`;
          if (daysLeft < 0) {
            urgencyColor = "#999";
            urgencyText = "Sudah lewat";
          } else if (daysLeft === 0) {
            urgencyColor = "#ef4444";
            urgencyText = "Hari ini!";
          } else if (daysLeft <= 3) {
            urgencyColor = "#ef4444";
          } else if (daysLeft <= 7) {
            urgencyColor = "#f59e0b";
          }

          return (
            <View
              style={{
                backgroundColor: "white",
                borderRadius: 12,
                padding: 14,
                marginBottom: 10,
                borderWidth: 1,
                borderColor: "#e5e7eb",
                opacity: item.selesai ? 0.5 : 1,
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                <TouchableOpacity
                  style={{ flex: 1 }}
                  onPress={() => toggleTaskDone(item.id, !item.selesai)}
                >
                  <Text
                    style={{
                      fontWeight: "bold",
                      fontSize: 16,
                      textDecorationLine: item.selesai ? "line-through" : "none",
                    }}
                  >
                    {item.selesai ? "✅ " : "⬜ "}
                    {item.judul}
                  </Text>
                  {item.matkul ? <Text style={{ color: "#666", marginTop: 2 }}>{item.matkul}</Text> : null}
                  <Text style={{ color: urgencyColor, marginTop: 4, fontWeight: "600" }}>
                    {item.deadline} • {urgencyText}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                  <Text style={{ color: "#ef4444", fontWeight: "bold" }}>Hapus</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}