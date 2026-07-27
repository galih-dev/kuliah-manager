import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Alert, FlatList, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { COLORS, FONT, FONT_SIZE, RADIUS, SHADOW, SPACING } from "../../../constants/theme";
import { useAuth } from "../../../contexts/AuthContext";
import { auth } from "../../../services/firebase";
import {
  addMemberToGroup,
  addSubTask,
  createGroupProject,
  deleteGroupProject,
  deleteSubTask,
  findUserByEmail,
  GroupProject,
  listenToMyGroups,
  listenToSubTasks,
  SubTask,
  updateGroupProject,
  updateSubTaskStatus,
} from "../../../services/groupService";

const inputStyle = {
  backgroundColor: COLORS.surfaceLight,
  borderRadius: RADIUS.sm,
  padding: 10,
  marginBottom: 6,
  fontSize: 13,
  color: COLORS.textPrimary,
  fontFamily: FONT.regular,
};

export default function Kelompok() {
  const { user, loading } = useAuth();
  const [groups, setGroups] = useState<GroupProject[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [namaProyek, setNamaProyek] = useState("");
  const [deadline, setDeadline] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = listenToMyGroups(setGroups);
    return unsubscribe;
  }, [user]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.background }}>
        <Text style={{ color: COLORS.textSecondary, fontFamily: FONT.regular }}>Memuat...</Text>
      </View>
    );
  }

  const handleCreate = async () => {
    if (!namaProyek || !deadline) {
      Alert.alert("Error", "Nama proyek dan deadline wajib diisi");
      return;
    }
    try {
      if (editingId) {
        await updateGroupProject(editingId, { namaProyek, deadlineInternal: deadline });
        setEditingId(null);
      } else {
        await createGroupProject({ namaProyek, deadlineInternal: deadline });
      }
      setNamaProyek("");
      setDeadline("");
      setShowForm(false);
    } catch (error: any) {
      Alert.alert("Gagal menyimpan proyek", error.message);
    }
  };

  const handleDeleteGroup = (id: string) => {
    if (Platform.OS === "web") {
      if (window.confirm("Yakin ingin menghapus proyek ini? Semua sub-tugas juga akan hilang.")) deleteGroupProject(id);
    } else {
      Alert.alert("Hapus Proyek", "Yakin ingin menghapus proyek ini?", [
        { text: "Batal", style: "cancel" },
        { text: "Hapus", style: "destructive", onPress: () => deleteGroupProject(id) },
      ]);
    }
  };

  const handleStartEdit = (group: GroupProject) => {
    setEditingId(group.id);
    setNamaProyek(group.namaProyek);
    setDeadline(group.deadlineInternal);
    setShowForm(true);
  };

  return (
    <KeyboardAvoidingView
    behavior={Platform.OS === "ios" ? "padding" : "height"}
    style={{ flex: 1, backgroundColor: COLORS.background, padding: SPACING.lg }}
  >
      <Text style={{ fontSize: FONT_SIZE.xxl, fontFamily: FONT.bold, color: COLORS.textPrimary, marginBottom: SPACING.lg }}>
        Tugas Kelompok
      </Text>

      <TouchableOpacity
        onPress={() => setShowForm(!showForm)}
        style={{ backgroundColor: COLORS.primary, paddingVertical: 12, borderRadius: RADIUS.md, alignItems: "center", marginBottom: SPACING.md, flexDirection: "row", justifyContent: "center", gap: 6 }}
      >
        <Ionicons name={showForm ? "close" : "add"} size={18} color="white" />
        <Text style={{ color: "white", fontFamily: FONT.semibold }}>{showForm ? "Tutup Form" : "Buat Proyek Baru"}</Text>
      </TouchableOpacity>

      {showForm && (
        <View style={{ backgroundColor: COLORS.surface, padding: SPACING.lg, borderRadius: RADIUS.lg, marginBottom: SPACING.lg }}>
          <TextInput placeholder="Nama Proyek" placeholderTextColor={COLORS.textMuted} value={namaProyek} onChangeText={setNamaProyek} style={inputStyle} />
          <TextInput placeholder="Deadline Internal (YYYY-MM-DD)" placeholderTextColor={COLORS.textMuted} value={deadline} onChangeText={setDeadline} style={inputStyle} />
         <TouchableOpacity onPress={handleCreate} style={{ backgroundColor: COLORS.success, padding: 12, borderRadius: RADIUS.sm, alignItems: "center", marginTop: 4 }}>
          <Text style={{ color: "white", fontFamily: FONT.semibold }}>{editingId ? "Update Proyek" : "Buat Proyek"}</Text>
        </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={{ textAlign: "center", color: COLORS.textMuted, marginTop: 40, fontFamily: FONT.regular }}>Belum ada proyek kelompok. Buat yang pertama!</Text>}
        renderItem={({ item }) => (
          <GroupCard
            group={item}
            expanded={expandedId === item.id}
            onToggle={() => setExpandedId(expandedId === item.id ? null : item.id)}
            onDelete={() => handleDeleteGroup(item.id)}
            onEdit={() => handleStartEdit(item)}
          />
        )}
      />
    </KeyboardAvoidingView>
  );
}

function GroupCard({ group, expanded, onToggle, onDelete, onEdit }: { group: GroupProject; expanded: boolean; onToggle: () => void; onDelete: () => void; onEdit: () => void }) {
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberEmail, setMemberEmail] = useState("");
  const [searchingMember, setSearchingMember] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [taskDesc, setTaskDesc] = useState("");
  const [taskAssignTo, setTaskAssignTo] = useState(0);

  useEffect(() => {
    if (!expanded) return;
    const unsubscribe = listenToSubTasks(group.id, setSubtasks);
    return unsubscribe;
  }, [expanded]);

  const handleAddMember = async () => {
    if (!memberEmail.trim()) {
      Alert.alert("Error", "Email anggota wajib diisi");
      return;
    }
    setSearchingMember(true);
    try {
      const foundUser = await findUserByEmail(memberEmail);
      if (!foundUser) {
        Alert.alert("User Tidak Ditemukan", "Pastikan temanmu sudah pernah daftar/login di aplikasi ini.");
        setSearchingMember(false);
        return;
      }
      if (group.anggota.includes(foundUser.uid)) {
        Alert.alert("Info", "User ini sudah menjadi anggota proyek");
        setSearchingMember(false);
        return;
      }
      await addMemberToGroup(group.id, foundUser.uid, foundUser.email);
      setMemberEmail("");
      setShowAddMember(false);
    } catch (error: any) {
      Alert.alert("Gagal menambah anggota", error.message);
    } finally {
      setSearchingMember(false);
    }
  };

  const handleAddTask = async () => {
    if (!taskDesc) {
      Alert.alert("Error", "Deskripsi tugas wajib diisi");
      return;
    }
    try {
      await addSubTask(group.id, {
        deskripsi: taskDesc,
        assignedTo: group.anggota[taskAssignTo],
        assignedToEmail: group.anggotaEmail[taskAssignTo],
      });
      setTaskDesc("");
      setShowAddTask(false);
    } catch (error: any) {
      Alert.alert("Gagal menambah tugas", error.message);
    }
  };

  const cycleStatus = (current: SubTask["status"]): SubTask["status"] => {
    if (current === "belum") return "proses";
    if (current === "proses") return "selesai";
    return "belum";
  };

  const statusColor = { belum: COLORS.textMuted, proses: COLORS.warning, selesai: COLORS.success };
  const statusLabel = { belum: "Belum Mulai", proses: "Sedang Dikerjakan", selesai: "Selesai" };
  const myUid = auth.currentUser?.uid;

  return (
    <View style={{ backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.sm, ...SHADOW.card }}>
      <TouchableOpacity onPress={onToggle}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: FONT.bold, fontSize: FONT_SIZE.base, color: COLORS.textPrimary }}>{group.namaProyek}</Text>
            <Text style={{ color: COLORS.primary, marginTop: 4, fontSize: FONT_SIZE.xs, fontFamily: FONT.semibold }}>Deadline: {group.deadlineInternal}</Text>
            <Text style={{ color: COLORS.textMuted, fontSize: 11, marginTop: 2, fontFamily: FONT.regular }}>{group.anggota.length} anggota</Text>
          </View>
          {group.pembuatId === myUid && (
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity onPress={onEdit}>
                <Ionicons name="pencil-outline" size={18} color={COLORS.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={onDelete}>
                <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={{ marginTop: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: SPACING.md }}>
          <Text style={{ fontFamily: FONT.semibold, marginBottom: 4, color: COLORS.textPrimary, fontSize: FONT_SIZE.sm }}>Anggota:</Text>
          {group.anggotaEmail.map((email, idx) => (
            <Text key={idx} style={{ color: COLORS.textSecondary, fontSize: 13, fontFamily: FONT.regular }}>• {email}</Text>
          ))}

          <TouchableOpacity onPress={() => setShowAddMember(!showAddMember)} style={{ marginTop: SPACING.sm }}>
            <Text style={{ color: COLORS.primaryLight, fontSize: 13, fontFamily: FONT.semibold }}>{showAddMember ? "Batal" : "+ Tambah Anggota"}</Text>
          </TouchableOpacity>

          {showAddMember && (
            <View style={{ backgroundColor: COLORS.surfaceLight, padding: 10, borderRadius: RADIUS.sm, marginTop: SPACING.sm }}>
              <Text style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 6, fontFamily: FONT.regular }}>Masukkan email temanmu (harus sudah pernah daftar)</Text>
              <TextInput
                placeholder="Email teman"
                placeholderTextColor={COLORS.textMuted}
                value={memberEmail}
                onChangeText={setMemberEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                style={{ backgroundColor: COLORS.surface, borderRadius: RADIUS.sm, padding: 8, marginBottom: 6, fontSize: 13, color: COLORS.textPrimary, fontFamily: FONT.regular }}
              />
              <TouchableOpacity onPress={handleAddMember} disabled={searchingMember} style={{ backgroundColor: COLORS.success, padding: 8, borderRadius: RADIUS.sm, alignItems: "center" }}>
                <Text style={{ color: "white", fontFamily: FONT.semibold, fontSize: 13 }}>{searchingMember ? "Mencari..." : "Tambah"}</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={{ fontFamily: FONT.semibold, marginTop: SPACING.lg, marginBottom: 4, color: COLORS.textPrimary, fontSize: FONT_SIZE.sm }}>Pembagian Tugas:</Text>

          {subtasks.map((task) => (
            <View key={task.id} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: COLORS.surfaceLight, padding: 10, borderRadius: RADIUS.sm, marginBottom: 6 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, color: COLORS.textPrimary, fontFamily: FONT.regular }}>{task.deskripsi}</Text>
                <Text style={{ fontSize: 11, color: COLORS.textMuted, fontFamily: FONT.regular }}>{task.assignedToEmail}</Text>
                <TouchableOpacity onPress={() => updateSubTaskStatus(group.id, task.id, cycleStatus(task.status))}>
                  <Text style={{ fontSize: 11, color: statusColor[task.status], fontFamily: FONT.semibold, marginTop: 2 }}>
                    {statusLabel[task.status]} (tap untuk ubah)
                  </Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={() => deleteSubTask(group.id, task.id)}>
                <Ionicons name="trash-outline" size={16} color={COLORS.danger} />
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity onPress={() => setShowAddTask(!showAddTask)} style={{ marginTop: 4 }}>
            <Text style={{ color: COLORS.primaryLight, fontSize: 13, fontFamily: FONT.semibold }}>{showAddTask ? "Batal" : "+ Tambah Sub-Tugas"}</Text>
          </TouchableOpacity>

          {showAddTask && (
            <View style={{ backgroundColor: COLORS.surfaceLight, padding: 10, borderRadius: RADIUS.sm, marginTop: SPACING.sm }}>
              <TextInput
                placeholder="Deskripsi tugas"
                placeholderTextColor={COLORS.textMuted}
                value={taskDesc}
                onChangeText={setTaskDesc}
                style={{ backgroundColor: COLORS.surface, borderRadius: RADIUS.sm, padding: 8, marginBottom: 6, fontSize: 13, color: COLORS.textPrimary, fontFamily: FONT.regular }}
              />
              <Text style={{ fontSize: 12, marginBottom: 4, color: COLORS.textSecondary, fontFamily: FONT.regular }}>Ditugaskan ke:</Text>
              <ScrollView horizontal style={{ marginBottom: SPACING.sm }}>
                {group.anggotaEmail.map((email, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => setTaskAssignTo(idx)}
                    style={{ backgroundColor: taskAssignTo === idx ? COLORS.primary : COLORS.surface, paddingVertical: 6, paddingHorizontal: 10, borderRadius: RADIUS.full, marginRight: 6 }}
                  >
                    <Text style={{ color: taskAssignTo === idx ? "white" : COLORS.textSecondary, fontSize: 12, fontFamily: FONT.medium }}>{email}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity onPress={handleAddTask} style={{ backgroundColor: COLORS.success, padding: 8, borderRadius: RADIUS.sm, alignItems: "center" }}>
                <Text style={{ color: "white", fontFamily: FONT.semibold, fontSize: 13 }}>Tambah Tugas</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
}