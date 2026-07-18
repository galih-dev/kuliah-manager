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
  addTransaction,
  deleteTransaction,
  getBudget,
  KATEGORI_LIST,
  listenToTransactions,
  setBudget,
  Transaction,
} from "../../../services/financeService";

function getCurrentYYYYMM() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function getTodayString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatRupiah(angka: number) {
  return "Rp" + angka.toLocaleString("id-ID");
}

export default function Keuangan() {
  const { user, loading } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budget, setBudgetState] = useState<number>(0);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [budgetInput, setBudgetInput] = useState("");

  const [jumlah, setJumlah] = useState("");
  const [kategori, setKategori] = useState(KATEGORI_LIST[0]);
  const [catatan, setCatatan] = useState("");
  const [showForm, setShowForm] = useState(false);

  const currentMonth = getCurrentYYYYMM();

  useEffect(() => {
    if (!user) return;
    const unsubscribe = listenToTransactions(setTransactions);
    return unsubscribe;
  }, [user]);

  useEffect(() => {
    if (!user) return;
    getBudget(currentMonth).then((b) => {
      if (b !== null) setBudgetState(b);
    });
  }, [user]);

  // Filter transaksi bulan ini saja
  const transaksiBulanIni = transactions.filter((t) =>
    t.tanggal.startsWith(currentMonth)
  );
  const totalTerpakai = transaksiBulanIni.reduce((sum, t) => sum + t.jumlah, 0);
  const sisaSaldo = budget - totalTerpakai;

  const handleSaveBudget = async () => {
    const angka = Number(budgetInput);
    if (!angka || angka <= 0) {
      Alert.alert("Error", "Masukkan jumlah budget yang valid");
      return;
    }
    try {
      await setBudget(currentMonth, angka);
      setBudgetState(angka);
      setBudgetInput("");
      setShowBudgetForm(false);
    } catch (error: any) {
      Alert.alert("Gagal menyimpan budget", error.message);
    }
  };

  const handleAddTransaction = async () => {
    const angka = Number(jumlah);
    if (!angka || angka <= 0) {
      Alert.alert("Error", "Masukkan jumlah pengeluaran yang valid");
      return;
    }
    try {
      await addTransaction({
        jumlah: angka,
        kategori,
        tanggal: getTodayString(),
        catatan,
      });
      setJumlah("");
      setCatatan("");
      setShowForm(false);
    } catch (error: any) {
      Alert.alert("Gagal menambah transaksi", error.message);
    }
  };

  const handleDelete = (id: string) => {
    if (Platform.OS === "web") {
      if (window.confirm("Yakin ingin menghapus transaksi ini?")) {
        deleteTransaction(id);
      }
    } else {
      Alert.alert("Hapus Transaksi", "Yakin ingin menghapus transaksi ini?", [
        { text: "Batal", style: "cancel" },
        { text: "Hapus", style: "destructive", onPress: () => deleteTransaction(id) },
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
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>
        Keuangan
      </Text>

      {/* Kartu Ringkasan Budget */}
      <View
        style={{
          backgroundColor: sisaSaldo < 0 ? "#fef2f2" : "#eff6ff",
          borderRadius: 16,
          padding: 20,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: sisaSaldo < 0 ? "#fecaca" : "#bfdbfe",
        }}
      >
        <Text style={{ color: "#666", fontSize: 13 }}>Sisa Saldo Bulan Ini</Text>
        <Text
          style={{
            fontSize: 28,
            fontWeight: "bold",
            color: sisaSaldo < 0 ? "#ef4444" : "#1d4ed8",
            marginTop: 4,
          }}
        >
          {formatRupiah(sisaSaldo)}
        </Text>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 12 }}>
          <Text style={{ color: "#666", fontSize: 13 }}>
            Budget: {formatRupiah(budget)}
          </Text>
          <Text style={{ color: "#666", fontSize: 13 }}>
            Terpakai: {formatRupiah(totalTerpakai)}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => setShowBudgetForm(!showBudgetForm)}
          style={{ marginTop: 12 }}
        >
          <Text style={{ color: "#3b82f6", fontWeight: "600", fontSize: 13 }}>
            {showBudgetForm ? "Batal" : budget > 0 ? "Ubah Budget" : "Set Budget Bulan Ini"}
          </Text>
        </TouchableOpacity>

        {showBudgetForm && (
          <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
            <TextInput
              placeholder="Jumlah budget (contoh: 1000000)"
              value={budgetInput}
              onChangeText={setBudgetInput}
              keyboardType="numeric"
              style={{
                flex: 1,
                backgroundColor: "white",
                borderRadius: 8,
                padding: 10,
              }}
            />
            <TouchableOpacity
              onPress={handleSaveBudget}
              style={{
                backgroundColor: "#22c55e",
                paddingHorizontal: 16,
                borderRadius: 8,
                justifyContent: "center",
              }}
            >
              <Text style={{ color: "white", fontWeight: "bold" }}>Simpan</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Tombol Tambah Transaksi */}
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
          {showForm ? "Tutup Form" : "+ Catat Pengeluaran"}
        </Text>
      </TouchableOpacity>

      {showForm && (
        <View
          style={{
            backgroundColor: "#f3f4f6",
            padding: 16,
            borderRadius: 12,
            marginBottom: 16,
          }}
        >
          <TextInput
            placeholder="Jumlah (contoh: 15000)"
            value={jumlah}
            onChangeText={setJumlah}
            keyboardType="numeric"
            style={{
              backgroundColor: "white",
              borderRadius: 8,
              padding: 10,
              marginBottom: 8,
            }}
          />

          <Text style={{ marginBottom: 4, fontWeight: "600" }}>Kategori</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 8 }}>
            {KATEGORI_LIST.map((k) => (
              <TouchableOpacity
                key={k}
                onPress={() => setKategori(k)}
                style={{
                  backgroundColor: kategori === k ? "#3b82f6" : "white",
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  borderRadius: 20,
                  marginRight: 6,
                  marginBottom: 6,
                }}
              >
                <Text style={{ color: kategori === k ? "white" : "black" }}>{k}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            placeholder="Catatan (opsional)"
            value={catatan}
            onChangeText={setCatatan}
            style={{
              backgroundColor: "white",
              borderRadius: 8,
              padding: 10,
              marginBottom: 12,
            }}
          />

          <TouchableOpacity
            onPress={handleAddTransaction}
            style={{
              backgroundColor: "#22c55e",
              padding: 12,
              borderRadius: 8,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>Simpan</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* List Transaksi */}
      <Text style={{ fontWeight: "bold", fontSize: 16, marginBottom: 8 }}>
        Riwayat Transaksi
      </Text>
      <FlatList
        data={transaksiBulanIni}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", color: "#999", marginTop: 20 }}>
            Belum ada transaksi bulan ini.
          </Text>
        }
        renderItem={({ item }) => (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "white",
              borderRadius: 10,
              padding: 12,
              marginBottom: 8,
              borderWidth: 1,
              borderColor: "#e5e7eb",
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "600" }}>{item.kategori}</Text>
              {item.catatan ? (
                <Text style={{ color: "#999", fontSize: 12 }}>{item.catatan}</Text>
              ) : null}
              <Text style={{ color: "#999", fontSize: 12 }}>{item.tanggal}</Text>
            </View>
            <Text style={{ color: "#ef4444", fontWeight: "bold", marginRight: 12 }}>
              -{formatRupiah(item.jumlah)}
            </Text>
            <TouchableOpacity onPress={() => handleDelete(item.id)}>
              <Text style={{ color: "#ef4444" }}>Hapus</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}