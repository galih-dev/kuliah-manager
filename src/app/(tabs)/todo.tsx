import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../../contexts/AuthContext";
import {
  addTodo,
  deleteTodo,
  listenToTodos,
  Todo,
  toggleTodoDone,
} from "../../../services/scheduleService";


function getTodayString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function TodoScreen() {
  const { user, loading } = useAuth;
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
      if (window.confirm("Yakin ingin menghapus to-do ini?")) {
        deleteTodo(id);
      }
    } else {
      Alert.alert("Hapus To-Do", "Yakin ingin menghapus to-do ini?", [
        { text: "Batal", style: "cancel" },
        { text: "Hapus", style: "destructive", onPress: () => deleteTodo(id) },
      ]);
    }
  };

  const filteredTodos = todos.filter((t) => {
    if (filter === "semua") return true;
    return t.tipe === filter;
  });

  // Urutkan: yang belum selesai duluan
  const sortedTodos = [...filteredTodos].sort((a, b) => {
    if (a.selesai === b.selesai) return 0;
    return a.selesai ? 1 : -1;
  });

  const totalSelesai = todos.filter((t) => t.selesai).length;

if (loading) {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Memuat...</Text>
    </View>
  );
}

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 4 }}>
        To-Do List
      </Text>
      <Text style={{ color: "#666", marginBottom: 16 }}>
        {totalSelesai} dari {todos.length} selesai
      </Text>

      {/* Form Tambah */}
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
        <TextInput
          placeholder="Tambah to-do baru..."
          value={judul}
          onChangeText={setJudul}
          onSubmitEditing={handleAdd}
          style={{
            flex: 1,
            backgroundColor: "#f3f4f6",
            borderRadius: 8,
            padding: 12,
          }}
        />
        <TouchableOpacity
          onPress={handleAdd}
          style={{
            backgroundColor: "#3b82f6",
            paddingHorizontal: 16,
            borderRadius: 8,
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Pilih tipe: harian/mingguan */}
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
        {(["harian", "mingguan"] as const).map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTipe(t)}
            style={{
              paddingVertical: 6,
              paddingHorizontal: 14,
              borderRadius: 20,
              backgroundColor: tipe === t ? "#3b82f6" : "#f3f4f6",
            }}
          >
            <Text style={{ color: tipe === t ? "white" : "#666", fontSize: 12 }}>
              {t === "harian" ? "Harian" : "Mingguan"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Filter Tampilan */}
      <View
        style={{
          flexDirection: "row",
          backgroundColor: "#f3f4f6",
          borderRadius: 10,
          padding: 4,
          marginBottom: 16,
        }}
      >
        {(["semua", "harian", "mingguan"] as const).map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={{
              flex: 1,
              paddingVertical: 8,
              borderRadius: 8,
              backgroundColor: filter === f ? "white" : "transparent",
              alignItems: "center",
            }}
          >
            <Text style={{ fontWeight: "600", fontSize: 13 }}>
              {f === "semua" ? "Semua" : f === "harian" ? "Harian" : "Mingguan"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List To-Do */}
      <FlatList
        data={sortedTodos}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", color: "#999", marginTop: 40 }}>
            Belum ada to-do. Tambahkan yang pertama!
          </Text>
        }
        renderItem={({ item }) => (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "white",
              borderRadius: 10,
              padding: 12,
              marginBottom: 8,
              borderWidth: 1,
              borderColor: "#e5e7eb",
              opacity: item.selesai ? 0.5 : 1,
            }}
          >
            <TouchableOpacity
              onPress={() => toggleTodoDone(item.id, !item.selesai)}
              style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
            >
              <Text style={{ fontSize: 18, marginRight: 10 }}>
                {item.selesai ? "✅" : "⬜"}
              </Text>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 15,
                    textDecorationLine: item.selesai ? "line-through" : "none",
                  }}
                >
                  {item.judul}
                </Text>
                <Text style={{ fontSize: 11, color: "#999", marginTop: 2 }}>
                  {item.tipe === "harian" ? "Harian" : "Mingguan"}
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item.id)}>
              <Text style={{ color: "#ef4444", fontWeight: "bold" }}>Hapus</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}