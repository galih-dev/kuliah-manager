import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Alert, FlatList, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from "react-native";
import { COLORS, FONT, FONT_SIZE, RADIUS, SHADOW, SPACING } from "../../../constants/theme";
import { useAuth } from "../../../contexts/AuthContext";
import { addTodo, deleteTodo, listenToTodos, Todo, toggleTodoDone } from "../../../services/scheduleService";

function getTodayString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function TodoScreen() {
  const { user, loading } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [judul, setJudul] = useState("");
  const [tipe, setTipe] = useState<"harian" | "mingguan">("harian");
  const [filter, setFilter] = useState<"semua" | "harian" | "mingguan">("semua");

  useEffect(() => {
    if (!user) return;
    const unsubscribe = listenToTodos(setTodos);
    return unsubscribe;
  }, [user]);

  const handleAdd = async () => {
    if (!judul.trim()) {
      Alert.alert("Error", "Judul to-do tidak boleh kosong");
      return;
    }
    try {
      await addTodo({ judul, tipe, tanggal: getTodayString() });
      setJudul("");
    } catch (error: any) {
      Alert.alert("Gagal menambah to-do", error.message);
    }
  };

  const handleDelete = (id: string) => {
    if (Platform.OS === "web") {
      if (window.confirm("Yakin ingin menghapus to-do ini?")) deleteTodo(id);
    } else {
      Alert.alert("Hapus To-Do", "Yakin ingin menghapus to-do ini?", [
        { text: "Batal", style: "cancel" },
        { text: "Hapus", style: "destructive", onPress: () => deleteTodo(id) },
      ]);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.background }}>
        <Text style={{ color: COLORS.textSecondary, fontFamily: FONT.regular }}>Memuat...</Text>
      </View>
    );
  }

  const filteredTodos = todos.filter((t) => filter === "semua" || t.tipe === filter);
  const sortedTodos = [...filteredTodos].sort((a, b) => {
    if (a.selesai === b.selesai) return 0;
    return a.selesai ? 1 : -1;
  });
  const totalSelesai = todos.filter((t) => t.selesai).length;

  return (
    <KeyboardAvoidingView
    behavior={Platform.OS === "ios" ? "padding" : "height"}
    style={{ flex: 1, backgroundColor: COLORS.background, padding: SPACING.lg }}
  >
      <Text style={{ fontSize: FONT_SIZE.xxl, fontFamily: FONT.bold, color: COLORS.textPrimary, marginBottom: 2 }}>
        To-Do List
      </Text>
      <Text style={{ color: COLORS.textSecondary, marginBottom: SPACING.lg, fontSize: FONT_SIZE.sm, fontFamily: FONT.regular }}>
        {totalSelesai} dari {todos.length} selesai
      </Text>

      <View style={{ flexDirection: "row", gap: 8, marginBottom: SPACING.md }}>
        <TextInput
          placeholder="Tambah to-do baru..."
          placeholderTextColor={COLORS.textMuted}
          value={judul}
          onChangeText={setJudul}
          onSubmitEditing={handleAdd}
          style={{ flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.sm, padding: 12, color: COLORS.textPrimary, fontFamily: FONT.regular }}
        />
        <TouchableOpacity onPress={handleAdd} style={{ backgroundColor: COLORS.primary, paddingHorizontal: 18, borderRadius: RADIUS.sm, justifyContent: "center", alignItems: "center" }}>
          <Ionicons name="add" size={22} color="white" />
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: "row", gap: 8, marginBottom: SPACING.lg }}>
        {(["harian", "mingguan"] as const).map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTipe(t)}
            style={{ paddingVertical: 6, paddingHorizontal: 14, borderRadius: RADIUS.full, backgroundColor: tipe === t ? COLORS.primary : COLORS.surface }}
          >
            <Text style={{ color: tipe === t ? "white" : COLORS.textMuted, fontSize: 12, fontFamily: FONT.semibold }}>
              {t === "harian" ? "Harian" : "Mingguan"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ flexDirection: "row", backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: 4, marginBottom: SPACING.lg }}>
        {(["semua", "harian", "mingguan"] as const).map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={{ flex: 1, paddingVertical: 8, borderRadius: RADIUS.sm, backgroundColor: filter === f ? COLORS.primary : "transparent", alignItems: "center" }}
          >
            <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: filter === f ? "white" : COLORS.textMuted }}>
              {f === "semua" ? "Semua" : f === "harian" ? "Harian" : "Mingguan"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={sortedTodos}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={{ textAlign: "center", color: COLORS.textMuted, marginTop: 40, fontFamily: FONT.regular }}>Belum ada to-do. Tambahkan yang pertama!</Text>}
        renderItem={({ item }) => (
          <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: 14, marginBottom: SPACING.sm, opacity: item.selesai ? 0.5 : 1, ...SHADOW.card }}>
            <TouchableOpacity onPress={() => toggleTodoDone(item.id, !item.selesai)} style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
              <Ionicons name={item.selesai ? "checkmark-circle" : "ellipse-outline"} size={22} color={item.selesai ? COLORS.success : COLORS.textMuted} style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: FONT_SIZE.sm, color: COLORS.textPrimary, fontFamily: FONT.medium, textDecorationLine: item.selesai ? "line-through" : "none" }}>
                  {item.judul}
                </Text>
                <Text style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2, fontFamily: FONT.regular }}>
                  {item.tipe === "harian" ? "Harian" : "Mingguan"}
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item.id)}>
              <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
            </TouchableOpacity>
          </View>
        )}
      />
    </KeyboardAvoidingView>
  );
}