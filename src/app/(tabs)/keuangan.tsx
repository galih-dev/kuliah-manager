import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Alert, FlatList, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from "react-native";
import { COLORS, FONT, FONT_SIZE, RADIUS, SHADOW, SPACING } from "../../../constants/theme";
import { useAuth } from "../../../contexts/AuthContext";
import {
  addTransaction, deleteTransaction,
  getBudget,
  KATEGORI_LIST,
  listenToTransactions,
  setBudget,
  Transaction,
} from "../../../services/financeService";

function getCurrentYYYYMM() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
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

const inputStyle = {
  backgroundColor: COLORS.surfaceLight,
  borderRadius: RADIUS.sm,
  padding: 12,
  marginBottom: SPACING.sm,
  color: COLORS.textPrimary,
  fontSize: FONT_SIZE.sm,
  fontFamily: FONT.regular,
};

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

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.background }}>
        <Text style={{ color: COLORS.textSecondary, fontFamily: FONT.regular }}>Memuat...</Text>
      </View>
    );
  }

  const transaksiBulanIni = transactions.filter((t) => t.tanggal.startsWith(currentMonth));
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
      await addTransaction({ jumlah: angka, kategori, tanggal: getTodayString(), catatan });
      setJumlah("");
      setCatatan("");
      setShowForm(false);
    } catch (error: any) {
      Alert.alert("Gagal menambah transaksi", error.message);
    }
  };

  const handleDelete = (id: string) => {
    if (Platform.OS === "web") {
      if (window.confirm("Yakin ingin menghapus transaksi ini?")) deleteTransaction(id);
    } else {
      Alert.alert("Hapus Transaksi", "Yakin ingin menghapus transaksi ini?", [
        { text: "Batal", style: "cancel" },
        { text: "Hapus", style: "destructive", onPress: () => deleteTransaction(id) },
      ]);
    }
  };

  return (
    <KeyboardAvoidingView
    behavior={Platform.OS === "ios" ? "padding" : "height"}
    style={{ flex: 1, backgroundColor: COLORS.background, padding: SPACING.lg }}
  >
      <Text style={{ fontSize: FONT_SIZE.xxl, fontFamily: FONT.bold, color: COLORS.textPrimary, marginBottom: SPACING.lg }}>
        Keuangan
      </Text>

      <View style={{ backgroundColor: sisaSaldo < 0 ? COLORS.danger : COLORS.primary, borderRadius: RADIUS.xl, padding: SPACING.xl, marginBottom: SPACING.lg, ...SHADOW.glow }}>
        <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: FONT_SIZE.sm, fontFamily: FONT.medium }}>Sisa Saldo Bulan Ini</Text>
        <Text style={{ fontSize: 32, fontFamily: FONT.bold, color: "white", marginTop: 4 }}>{formatRupiah(sisaSaldo)}</Text>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: SPACING.md }}>
          <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: FONT_SIZE.xs, fontFamily: FONT.regular }}>Budget: {formatRupiah(budget)}</Text>
          <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: FONT_SIZE.xs, fontFamily: FONT.regular }}>Terpakai: {formatRupiah(totalTerpakai)}</Text>
        </View>

        <TouchableOpacity onPress={() => setShowBudgetForm(!showBudgetForm)} style={{ marginTop: SPACING.md }}>
          <Text style={{ color: "white", fontFamily: FONT.semibold, fontSize: FONT_SIZE.xs, textDecorationLine: "underline" }}>
            {showBudgetForm ? "Batal" : budget > 0 ? "Ubah Budget" : "Set Budget Bulan Ini"}
          </Text>
        </TouchableOpacity>

        {showBudgetForm && (
          <View style={{ flexDirection: "row", gap: 8, marginTop: SPACING.md }}>
            <TextInput
              placeholder="Jumlah budget"
              placeholderTextColor="rgba(255,255,255,0.6)"
              value={budgetInput}
              onChangeText={setBudgetInput}
              keyboardType="numeric"
              style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: RADIUS.sm, padding: 10, color: "white", fontFamily: FONT.regular }}
            />
            <TouchableOpacity onPress={handleSaveBudget} style={{ backgroundColor: "white", paddingHorizontal: 16, borderRadius: RADIUS.sm, justifyContent: "center" }}>
              <Text style={{ color: COLORS.primary, fontFamily: FONT.semibold }}>Simpan</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <TouchableOpacity
        onPress={() => setShowForm(!showForm)}
        style={{ backgroundColor: COLORS.surface, paddingVertical: 12, borderRadius: RADIUS.md, alignItems: "center", marginBottom: SPACING.md, ...SHADOW.card, flexDirection: "row", justifyContent: "center", gap: 6 }}
      >
        <Ionicons name={showForm ? "close" : "add"} size={18} color={COLORS.primary} />
        <Text style={{ color: COLORS.primary, fontFamily: FONT.semibold }}>{showForm ? "Tutup Form" : "Catat Pengeluaran"}</Text>
      </TouchableOpacity>

      {showForm && (
        <View style={{ backgroundColor: COLORS.surface, padding: SPACING.lg, borderRadius: RADIUS.lg, marginBottom: SPACING.lg }}>
          <TextInput placeholder="Jumlah (contoh: 15000)" placeholderTextColor={COLORS.textMuted} value={jumlah} onChangeText={setJumlah} keyboardType="numeric" style={inputStyle} />
          <Text style={{ color: COLORS.textSecondary, marginBottom: 6, fontFamily: FONT.semibold, fontSize: FONT_SIZE.sm }}>Kategori</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: SPACING.sm }}>
            {KATEGORI_LIST.map((k) => (
              <TouchableOpacity key={k} onPress={() => setKategori(k)} style={{ backgroundColor: kategori === k ? COLORS.primary : COLORS.surfaceLight, paddingVertical: 6, paddingHorizontal: 12, borderRadius: RADIUS.full, marginRight: 6, marginBottom: 6 }}>
                <Text style={{ color: kategori === k ? "white" : COLORS.textSecondary, fontSize: FONT_SIZE.xs, fontFamily: FONT.medium }}>{k}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput placeholder="Catatan (opsional)" placeholderTextColor={COLORS.textMuted} value={catatan} onChangeText={setCatatan} style={inputStyle} />
          <TouchableOpacity onPress={handleAddTransaction} style={{ backgroundColor: COLORS.success, padding: 12, borderRadius: RADIUS.sm, alignItems: "center" }}>
            <Text style={{ color: "white", fontFamily: FONT.semibold }}>Simpan</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={{ fontFamily: FONT.bold, fontSize: FONT_SIZE.base, color: COLORS.textPrimary, marginBottom: SPACING.sm }}>
        Riwayat Transaksi
      </Text>
      <FlatList
        data={transaksiBulanIni}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={{ textAlign: "center", color: COLORS.textMuted, marginTop: 20, fontFamily: FONT.regular }}>Belum ada transaksi bulan ini.</Text>}
        renderItem={({ item }) => (
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: 14, marginBottom: SPACING.sm, ...SHADOW.card }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: FONT.semibold, color: COLORS.textPrimary, fontSize: FONT_SIZE.sm }}>{item.kategori}</Text>
              {item.catatan ? <Text style={{ color: COLORS.textMuted, fontSize: 11, fontFamily: FONT.regular }}>{item.catatan}</Text> : null}
              <Text style={{ color: COLORS.textMuted, fontSize: 11, fontFamily: FONT.regular }}>{item.tanggal}</Text>
            </View>
            <Text style={{ color: COLORS.danger, fontFamily: FONT.bold, marginRight: 12, fontSize: FONT_SIZE.sm }}>-{formatRupiah(item.jumlah)}</Text>
            <TouchableOpacity onPress={() => handleDelete(item.id)}>
              <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
            </TouchableOpacity>
          </View>
        )}
      />
    </KeyboardAvoidingView>
  );
}