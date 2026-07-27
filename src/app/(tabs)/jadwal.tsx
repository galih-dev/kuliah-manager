import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Alert, FlatList, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { COLORS, FONT, FONT_SIZE, RADIUS, SHADOW, SPACING } from "../../../constants/theme";
import { useAuth } from "../../../contexts/AuthContext";
import {
  ClassSchedule,
  Exam,
  Task,
  addClass,
  addExam,
  addTask,
  deleteClass,
  deleteExam,
  deleteTask,
  listenToClasses,
  listenToExams,
  listenToTasks,
  toggleTaskDone,
  updateClass,
  updateExam,
  updateTask,
} from "../../../services/scheduleService";
import { DatePickerInput } from "../../components/DatePickerInput";
import { TimePickerInput } from "../../components/TimePickerInput";

const HARI_LIST = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

const inputStyle = {
  backgroundColor: COLORS.surfaceLight,
  borderRadius: RADIUS.sm,
  padding: 12,
  marginBottom: SPACING.sm,
  color: COLORS.textPrimary,
  fontSize: FONT_SIZE.sm,
  fontFamily: FONT.regular,
};

const cardStyle = {
  backgroundColor: COLORS.surface,
  borderRadius: RADIUS.lg,
  padding: SPACING.lg,
  marginBottom: SPACING.sm,
  ...SHADOW.card,
};

export default function Jadwal() {
  const { loading } = useAuth();
  const [activeTab, setActiveTab] = useState<"kuliah" | "tugas" | "ujian">("kuliah");

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.background }}>
        <Text style={{ color: COLORS.textSecondary, fontFamily: FONT.regular }}>Memuat...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
    behavior={Platform.OS === "ios" ? "padding" : "height"}
    style={{ flex: 1, backgroundColor: COLORS.background, padding: SPACING.lg }}
  >
      <Text style={{ fontSize: FONT_SIZE.xxl, fontFamily: FONT.bold, color: COLORS.textPrimary, marginBottom: SPACING.lg }}>
        Jadwal Akademik
      </Text>

      <View style={{ flexDirection: "row", backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: 4, marginBottom: SPACING.lg }}>
        {(["kuliah", "tugas", "ujian"] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={{ flex: 1, paddingVertical: 10, borderRadius: RADIUS.sm, backgroundColor: activeTab === tab ? COLORS.primary : "transparent", alignItems: "center" }}
          >
            <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: activeTab === tab ? "white" : COLORS.textMuted }}>
              {tab === "kuliah" ? "Jadwal Kuliah" : tab === "tugas" ? "Deadline Tugas" : "Ujian"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === "kuliah" && <JadwalKuliahTab />}
      {activeTab === "tugas" && <DeadlineTugasTab />}
      {activeTab === "ujian" && <UjianTab />}
    </KeyboardAvoidingView>
  );
}

function JadwalKuliahTab() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [classes, setClasses] = useState<ClassSchedule[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [matkul, setMatkul] = useState("");
  const [hari, setHari] = useState("Senin");
  const [jamMulai, setJamMulai] = useState("");
  const [jamSelesai, setJamSelesai] = useState("");
  const [ruangan, setRuangan] = useState("");
  const [dosen, setDosen] = useState("");
  const [jamSebelum, setJamSebelum] = useState<number | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = listenToClasses(setClasses);
    return unsubscribe;
  }, []);

  const resetForm = () => {
    setMatkul(""); setHari("Senin"); setJamMulai(""); setJamSelesai(""); setRuangan(""); setDosen(""); setJamSebelum(undefined); setShowForm(false); setEditingId(null);
  };

  const handleAdd = async () => {
    if (!matkul || !jamMulai || !jamSelesai) {
      Alert.alert("Error", "Mata kuliah, jam mulai, dan jam selesai wajib diisi");
      return;
    }
    try {
      if (editingId) {
        await updateClass(editingId, { matkul, hari, jamMulai, jamSelesai, ruangan, dosen, jamSebelum });
        setEditingId(null);
      } else {
        await addClass({ matkul, hari, jamMulai, jamSelesai, ruangan, dosen, jamSebelum });
      }
      resetForm();
    } catch (error: any) {
      Alert.alert("Gagal menyimpan jadwal", error.message);
    }
  };

  const handleDelete = (id: string) => {
    if (Platform.OS === "web") {
      if (window.confirm("Yakin ingin menghapus jadwal ini?")) deleteClass(id);
    } else {
      Alert.alert("Hapus Jadwal", "Yakin ingin menghapus jadwal ini?", [
        { text: "Batal", style: "cancel" },
        { text: "Hapus", style: "destructive", onPress: () => deleteClass(id) },
      ]);
    }
  };

  const handleStartEdit = (item: ClassSchedule) => {
    setEditingId(item.id);
    setMatkul(item.matkul);
    setHari(item.hari);
    setJamMulai(item.jamMulai);
    setJamSelesai(item.jamSelesai);
    setRuangan(item.ruangan);
    setDosen(item.dosen);
    setJamSebelum(item.jamSebelum);
    setShowForm(true);
  };

  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity
        onPress={() => setShowForm(!showForm)}
        style={{ backgroundColor: COLORS.primary, paddingVertical: 12, borderRadius: RADIUS.md, alignItems: "center", marginBottom: SPACING.md, flexDirection: "row", justifyContent: "center", gap: 6 }}
      >
        <Ionicons name={showForm ? "close" : "add"} size={18} color="white" />
        <Text style={{ color: "white", fontFamily: FONT.semibold }}>{showForm ? "Tutup Form" : "Tambah Jadwal Kuliah"}</Text>
      </TouchableOpacity>

      {showForm && (
        <ScrollView style={{ backgroundColor: COLORS.surface, padding: SPACING.lg, borderRadius: RADIUS.lg, marginBottom: SPACING.lg, maxHeight: 400 }}>
          <TextInput placeholder="Nama Mata Kuliah" placeholderTextColor={COLORS.textMuted} value={matkul} onChangeText={setMatkul} style={inputStyle} />
          <Text style={{ color: COLORS.textSecondary, marginBottom: 6, fontFamily: FONT.semibold, fontSize: FONT_SIZE.sm }}>Hari</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: SPACING.sm }}>
            {HARI_LIST.map((h) => (
              <TouchableOpacity key={h} onPress={() => setHari(h)} style={{ backgroundColor: hari === h ? COLORS.primary : COLORS.surfaceLight, paddingVertical: 6, paddingHorizontal: 12, borderRadius: RADIUS.full, marginRight: 6, marginBottom: 6 }}>
                <Text style={{ color: hari === h ? "white" : COLORS.textSecondary, fontSize: FONT_SIZE.xs, fontFamily: FONT.medium }}>{h}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ flex: 1 }}>
              <TimePickerInput value={jamMulai} onChange={setJamMulai} placeholder="Jam Mulai" />
            </View>
            <View style={{ flex: 1 }}>
              <TimePickerInput value={jamSelesai} onChange={setJamSelesai} placeholder="Jam Selesai" />
            </View>
          </View>
          <TextInput placeholder="Ruangan" placeholderTextColor={COLORS.textMuted} value={ruangan} onChangeText={setRuangan} style={inputStyle} />
          <TextInput placeholder="Nama Dosen" placeholderTextColor={COLORS.textMuted} value={dosen} onChangeText={setDosen} style={inputStyle} />
         <TouchableOpacity onPress={handleAdd} style={{ backgroundColor: COLORS.success, padding: 12, borderRadius: RADIUS.sm, alignItems: "center", marginTop: 4 }}>
          <Text style={{ color: "white", fontFamily: FONT.semibold }}>{editingId ? "Update" : "Simpan"}</Text>
        </TouchableOpacity>

          <Text style={{ color: COLORS.textSecondary, marginBottom: 6, fontFamily: FONT.semibold, fontSize: FONT_SIZE.sm }}>
            Ingatkan Sebelum Kelas Dimulai
          </Text>
          <View style={{ flexDirection: "row", marginBottom: SPACING.md }}>
            {[
              { label: "Tanpa Reminder", value: undefined },
              { label: "1 Jam Sebelum", value: 1 },
              { label: "2 Jam Sebelum", value: 2 },
            ].map((opt) => (
              <TouchableOpacity
                key={opt.label}
                onPress={() => setJamSebelum(opt.value)}
                style={{
                  backgroundColor: jamSebelum === opt.value ? COLORS.primary : COLORS.surfaceLight,
                  paddingVertical: 6,
                  paddingHorizontal: 10,
                  borderRadius: RADIUS.full,
                  marginRight: 6,
                  marginBottom: 6,
                }}
              >
                <Text style={{ color: jamSebelum === opt.value ? "white" : COLORS.textSecondary, fontSize: 11 }}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}

      <FlatList
        data={classes}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={{ textAlign: "center", color: COLORS.textMuted, marginTop: 40, fontFamily: FONT.regular }}>Belum ada jadwal. Tambahkan jadwal kuliahmu!</Text>}
        renderItem={({ item }) => (
          <View style={cardStyle}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: FONT.bold, fontSize: FONT_SIZE.base, color: COLORS.textPrimary }}>{item.matkul}</Text>
                <Text style={{ color: COLORS.primary, marginTop: 4, fontSize: FONT_SIZE.sm, fontFamily: FONT.semibold }}>{item.hari}, {item.jamMulai} - {item.jamSelesai}</Text>
                {item.ruangan ? <Text style={{ color: COLORS.textSecondary, marginTop: 2, fontSize: FONT_SIZE.xs, fontFamily: FONT.regular }}>Ruangan: {item.ruangan}</Text> : null}
                {item.dosen ? <Text style={{ color: COLORS.textSecondary, fontSize: FONT_SIZE.xs, fontFamily: FONT.regular }}>Dosen: {item.dosen}</Text> : null}
              </View>
              <TouchableOpacity onPress={() => handleStartEdit(item)} style={{ marginRight: 12 }}>
                <Ionicons name="pencil-outline" size={18} color={COLORS.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

function DeadlineTugasTab() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [judul, setJudul] = useState("");
  const [matkul, setMatkul] = useState("");
  const [deadline, setDeadline] = useState("");

  useEffect(() => {
    const unsubscribe = listenToTasks(setTasks);
    return unsubscribe;
  }, []);

  const resetForm = () => { setJudul(""); setMatkul(""); setDeadline(""); setShowForm(false); setEditingId(null); };

  const handleAdd = async () => {
    if (!judul || !deadline) {
      Alert.alert("Error", "Judul tugas dan deadline wajib diisi");
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(deadline)) {
      Alert.alert("Error", "Format deadline harus YYYY-MM-DD");
      return;
    }
    try {
      if (editingId) {
        await updateTask(editingId, { judul, matkul, deadline });
        setEditingId(null);
      } else {
        await addTask({ judul, matkul, deadline });
      }
      resetForm();
    } catch (error: any) {
      Alert.alert("Gagal menyimpan tugas", error.message);
    }
  };

  const handleDelete = (id: string) => {
    if (Platform.OS === "web") {
      if (window.confirm("Yakin ingin menghapus tugas ini?")) deleteTask(id);
    } else {
      Alert.alert("Hapus Tugas", "Yakin ingin menghapus tugas ini?", [
        { text: "Batal", style: "cancel" },
        { text: "Hapus", style: "destructive", onPress: () => deleteTask(id) },
      ]);
    }
  };

  const getDaysLeft = (deadline: string) => {
    const [year, month, day] = deadline.split("-").map(Number);
    const target = new Date(year, month - 1, day);
    target.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const handleStartEdit = (item: Task) => {
    setEditingId(item.id);
    setJudul(item.judul);
    setMatkul(item.matkul);
    setDeadline(item.deadline);
    setShowForm(true);
  };

  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity
        onPress={() => setShowForm(!showForm)}
        style={{ backgroundColor: COLORS.primary, paddingVertical: 12, borderRadius: RADIUS.md, alignItems: "center", marginBottom: SPACING.md, flexDirection: "row", justifyContent: "center", gap: 6 }}
      >
        <Ionicons name={showForm ? "close" : "add"} size={18} color="white" />
        <Text style={{ color: "white", fontFamily: FONT.semibold }}>{showForm ? "Tutup Form" : "Tambah Deadline Tugas"}</Text>
      </TouchableOpacity>

      {showForm && (
        <View style={{ backgroundColor: COLORS.surface, padding: SPACING.lg, borderRadius: RADIUS.lg, marginBottom: SPACING.lg }}>
          <TextInput placeholder="Judul Tugas" placeholderTextColor={COLORS.textMuted} value={judul} onChangeText={setJudul} style={inputStyle} />
          <TextInput placeholder="Mata Kuliah (opsional)" placeholderTextColor={COLORS.textMuted} value={matkul} onChangeText={setMatkul} style={inputStyle} />
          <DatePickerInput value={deadline} onChange={setDeadline} placeholder="Pilih Deadline" />
         <TouchableOpacity onPress={handleAdd} style={{ backgroundColor: COLORS.success, padding: 12, borderRadius: RADIUS.sm, alignItems: "center" }}>
          <Text style={{ color: "white", fontFamily: FONT.semibold }}>{editingId ? "Update" : "Simpan"}</Text>
        </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={{ textAlign: "center", color: COLORS.textMuted, marginTop: 40, fontFamily: FONT.regular }}>Belum ada deadline tugas.</Text>}
        renderItem={({ item }) => {
          const daysLeft = getDaysLeft(item.deadline);
          let urgencyColor = COLORS.textSecondary;
          let urgencyText = `${daysLeft} hari lagi`;
          if (daysLeft < 0) { urgencyColor = COLORS.textMuted; urgencyText = "Sudah lewat"; }
          else if (daysLeft === 0) { urgencyColor = COLORS.danger; urgencyText = "Hari ini!"; }
          else if (daysLeft <= 3) urgencyColor = COLORS.danger;
          else if (daysLeft <= 7) urgencyColor = COLORS.warning;

          return (
            <View style={{ ...cardStyle, opacity: item.selesai ? 0.5 : 1 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                <TouchableOpacity style={{ flex: 1, flexDirection: "row", alignItems: "flex-start" }} onPress={() => toggleTaskDone(item.id, !item.selesai)}>
                  <Ionicons name={item.selesai ? "checkmark-circle" : "ellipse-outline"} size={20} color={item.selesai ? COLORS.success : COLORS.textMuted} style={{ marginRight: 10, marginTop: 2 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: FONT.bold, fontSize: FONT_SIZE.base, color: COLORS.textPrimary, textDecorationLine: item.selesai ? "line-through" : "none" }}>{item.judul}</Text>
                    {item.matkul ? <Text style={{ color: COLORS.textSecondary, marginTop: 2, fontSize: FONT_SIZE.xs, fontFamily: FONT.regular }}>{item.matkul}</Text> : null}
                    <Text style={{ color: urgencyColor, marginTop: 4, fontFamily: FONT.semibold, fontSize: FONT_SIZE.xs }}>{item.deadline} • {urgencyText}</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleStartEdit(item)} style={{ marginRight: 12 }}>
                  <Ionicons name="pencil-outline" size={18} color={COLORS.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                  <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

function UjianTab() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [matkul, setMatkul] = useState("");
  const [jenis, setJenis] = useState<"UTS" | "UAS">("UTS");
  const [tanggal, setTanggal] = useState("");
  const [ruangan, setRuangan] = useState("");

  useEffect(() => {
    const unsubscribe = listenToExams(setExams);
    return unsubscribe;
  }, []);

  const resetForm = () => { setMatkul(""); setJenis("UTS"); setTanggal(""); setRuangan(""); setShowForm(false); setEditingId(null) };

 const handleAdd = async () => {
    if (!matkul || !tanggal) {
      Alert.alert("Error", "Mata kuliah dan tanggal wajib diisi");
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(tanggal)) {
      Alert.alert("Error", "Format tanggal harus YYYY-MM-DD");
      return;
    }
    try {
      if (editingId) {
        await updateExam(editingId, { matkul, jenis, tanggal, ruangan });
        setEditingId(null);
      } else {
        await addExam({ matkul, jenis, tanggal, ruangan });
      }
      resetForm();
    } catch (error: any) {
      Alert.alert("Gagal menyimpan jadwal ujian", error.message);
    }
  };

  const handleDelete = (id: string) => {
    if (Platform.OS === "web") {
      if (window.confirm("Yakin ingin menghapus jadwal ujian ini?")) deleteExam(id);
    } else {
      Alert.alert("Hapus Ujian", "Yakin ingin menghapus jadwal ujian ini?", [
        { text: "Batal", style: "cancel" },
        { text: "Hapus", style: "destructive", onPress: () => deleteExam(id) },
      ]);
    }
  };

  const getDaysLeft = (tanggal: string) => {
    const [year, month, day] = tanggal.split("-").map(Number);
    const target = new Date(year, month - 1, day);
    target.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const handleStartEdit = (item: Exam) => {
    setEditingId(item.id);
    setMatkul(item.matkul);
    setJenis(item.jenis);
    setTanggal(item.tanggal);
    setRuangan(item.ruangan);
    setShowForm(true);
  };

  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity
        onPress={() => setShowForm(!showForm)}
        style={{ backgroundColor: COLORS.primary, paddingVertical: 12, borderRadius: RADIUS.md, alignItems: "center", marginBottom: SPACING.md, flexDirection: "row", justifyContent: "center", gap: 6 }}
      >
        <Ionicons name={showForm ? "close" : "add"} size={18} color="white" />
        <Text style={{ color: "white", fontFamily: FONT.semibold }}>{showForm ? "Tutup Form" : "Tambah Jadwal Ujian"}</Text>
      </TouchableOpacity>

      {showForm && (
        <View style={{ backgroundColor: COLORS.surface, padding: SPACING.lg, borderRadius: RADIUS.lg, marginBottom: SPACING.lg }}>
          <TextInput placeholder="Nama Mata Kuliah" placeholderTextColor={COLORS.textMuted} value={matkul} onChangeText={setMatkul} style={inputStyle} />
          <Text style={{ color: COLORS.textSecondary, marginBottom: 6, fontFamily: FONT.semibold, fontSize: FONT_SIZE.sm }}>Jenis Ujian</Text>
          <View style={{ flexDirection: "row", marginBottom: SPACING.sm }}>
            {(["UTS", "UAS"] as const).map((j) => (
              <TouchableOpacity key={j} onPress={() => setJenis(j)} style={{ backgroundColor: jenis === j ? COLORS.primary : COLORS.surfaceLight, paddingVertical: 6, paddingHorizontal: 16, borderRadius: RADIUS.full, marginRight: 8 }}>
                <Text style={{ color: jenis === j ? "white" : COLORS.textSecondary, fontFamily: FONT.medium }}>{j}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <DatePickerInput value={tanggal} onChange={setTanggal} placeholder="Pilih Tanggal Ujian" />
          <TextInput placeholder="Ruangan (opsional)" placeholderTextColor={COLORS.textMuted} value={ruangan} onChangeText={setRuangan} style={inputStyle} />
          <TouchableOpacity onPress={handleAdd} style={{ backgroundColor: COLORS.success, padding: 12, borderRadius: RADIUS.sm, alignItems: "center" }}>
            <Text style={{ color: "white", fontFamily: FONT.semibold }}>{editingId ? "Update" : "Simpan"}</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={exams}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={{ textAlign: "center", color: COLORS.textMuted, marginTop: 40, fontFamily: FONT.regular }}>Belum ada jadwal ujian.</Text>}
        renderItem={({ item }) => {
          const daysLeft = getDaysLeft(item.tanggal);
          let urgencyColor = COLORS.textSecondary;
          let urgencyText = `${daysLeft} hari lagi`;
          if (daysLeft < 0) { urgencyColor = COLORS.textMuted; urgencyText = "Sudah lewat"; }
          else if (daysLeft === 0) { urgencyColor = COLORS.danger; urgencyText = "Hari ini!"; }
          else if (daysLeft <= 3) urgencyColor = COLORS.danger;
          else if (daysLeft <= 7) urgencyColor = COLORS.warning;

          return (
            <View style={cardStyle}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <View style={{ backgroundColor: item.jenis === "UTS" ? COLORS.primaryLight + "22" : COLORS.danger + "22", paddingHorizontal: 8, paddingVertical: 2, borderRadius: RADIUS.sm }}>
                      <Text style={{ fontSize: 11, fontFamily: FONT.bold, color: item.jenis === "UTS" ? COLORS.primaryLight : COLORS.danger }}>{item.jenis}</Text>
                    </View>
                    <Text style={{ fontFamily: FONT.bold, fontSize: FONT_SIZE.base, color: COLORS.textPrimary }}>{item.matkul}</Text>
                  </View>
                  {item.ruangan ? <Text style={{ color: COLORS.textSecondary, marginTop: 6, fontSize: FONT_SIZE.xs, fontFamily: FONT.regular }}>Ruangan: {item.ruangan}</Text> : null}
                  <Text style={{ color: urgencyColor, marginTop: 4, fontFamily: FONT.semibold, fontSize: FONT_SIZE.xs }}>{item.tanggal} • {urgencyText}</Text>
                </View>
                <TouchableOpacity onPress={() => handleStartEdit(item)} style={{ marginRight: 12 }}>
                  <Ionicons name="pencil-outline" size={18} color={COLORS.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                  <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}