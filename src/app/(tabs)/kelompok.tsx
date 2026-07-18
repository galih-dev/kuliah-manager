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
import { auth } from "../../../services/firebase";
import {
  addMemberToGroup,
  addSubTask,
  createGroupProject,
  deleteGroupProject,
  deleteSubTask,
  GroupProject,
  listenToMyGroups,
  listenToSubTasks,
  SubTask,
  updateSubTaskStatus,
} from "../../../services/groupService";

export default function Kelompok() {
  const { user, loading } = useAuth();
  const [groups, setGroups] = useState<GroupProject[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [namaProyek, setNamaProyek] = useState("");
  const [deadline, setDeadline] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = listenToMyGroups(setGroups);
    return unsubscribe;
  }, [user]);

  const handleCreate = async () => {
    if (!namaProyek || !deadline) {
      Alert.alert("Error", "Nama proyek dan deadline wajib diisi");
      return;
    }
    try {
      await createGroupProject({ namaProyek, deadlineInternal: deadline });
      setNamaProyek("");
      setDeadline("");
      setShowForm(false);
    } catch (error: any) {
      Alert.alert("Gagal membuat proyek", error.message);
    }
  };

  const handleDeleteGroup = (id: string) => {
    if (Platform.OS === "web") {
      if (window.confirm("Yakin ingin menghapus proyek ini? Semua sub-tugas juga akan hilang.")) {
        deleteGroupProject(id);
      }
    } else {
      Alert.alert("Hapus Proyek", "Yakin ingin menghapus proyek ini?", [
        { text: "Batal", style: "cancel" },
        { text: "Hapus", style: "destructive", onPress: () => deleteGroupProject(id) },
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
        Tugas Kelompok
      </Text>

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
          {showForm ? "Tutup Form" : "+ Buat Proyek Baru"}
        </Text>
      </TouchableOpacity>

      {showForm && (
        <View style={{ backgroundColor: "#f3f4f6", padding: 16, borderRadius: 12, marginBottom: 16 }}>
          <TextInput
            placeholder="Nama Proyek (contoh: Tugas Besar Basis Data)"
            value={namaProyek}
            onChangeText={setNamaProyek}
            style={{ backgroundColor: "white", borderRadius: 8, padding: 10, marginBottom: 8 }}
          />
          <TextInput
            placeholder="Deadline Internal (YYYY-MM-DD)"
            value={deadline}
            onChangeText={setDeadline}
            style={{ backgroundColor: "white", borderRadius: 8, padding: 10, marginBottom: 12 }}
          />
          <TouchableOpacity
            onPress={handleCreate}
            style={{ backgroundColor: "#22c55e", padding: 12, borderRadius: 8, alignItems: "center" }}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>Buat Proyek</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", color: "#999", marginTop: 40 }}>
            Belum ada proyek kelompok. Buat yang pertama!
          </Text>
        }
        renderItem={({ item }) => (
          <GroupCard
            group={item}
            expanded={expandedId === item.id}
            onToggle={() => setExpandedId(expandedId === item.id ? null : item.id)}
            onDelete={() => handleDeleteGroup(item.id)}
          />
        )}
      />
    </View>
  );
}

function GroupCard({
  group,
  expanded,
  onToggle,
  onDelete,
}: {
  group: GroupProject;
  expanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberUid, setMemberUid] = useState("");
  const [memberEmail, setMemberEmail] = useState("");

  const [showAddTask, setShowAddTask] = useState(false);
  const [taskDesc, setTaskDesc] = useState("");
  const [taskAssignTo, setTaskAssignTo] = useState(0); // index anggota

  useEffect(() => {
    if (!expanded) return;
    const unsubscribe = listenToSubTasks(group.id, setSubtasks);
    return unsubscribe;
  }, [expanded]);

  const handleAddMember = async () => {
    if (!memberUid || !memberEmail) {
      Alert.alert("Error", "UID dan email anggota wajib diisi");
      return;
    }
    try {
      await addMemberToGroup(group.id, memberUid, memberEmail);
      setMemberUid("");
      setMemberEmail("");
      setShowAddMember(false);
    } catch (error: any) {
      Alert.alert("Gagal menambah anggota", error.message);
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

  const statusColor = { belum: "#999", proses: "#f59e0b", selesai: "#22c55e" };
  const statusLabel = { belum: "Belum Mulai", proses: "Sedang Dikerjakan", selesai: "Selesai" };

  const myUid = auth.currentUser?.uid;

  return (
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
      <TouchableOpacity onPress={onToggle}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: "bold", fontSize: 16 }}>{group.namaProyek}</Text>
            <Text style={{ color: "#3b82f6", marginTop: 2 }}>
              Deadline: {group.deadlineInternal}
            </Text>
            <Text style={{ color: "#666", fontSize: 12, marginTop: 2 }}>
              {group.anggota.length} anggota
            </Text>
          </View>
          {group.pembuatId === myUid && (
            <TouchableOpacity onPress={onDelete}>
              <Text style={{ color: "#ef4444", fontWeight: "bold" }}>Hapus</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={{ marginTop: 12, borderTopWidth: 1, borderTopColor: "#e5e7eb", paddingTop: 12 }}>
          {/* Daftar Anggota */}
          <Text style={{ fontWeight: "600", marginBottom: 4 }}>Anggota:</Text>
          {group.anggotaEmail.map((email, idx) => (
            <Text key={idx} style={{ color: "#666", fontSize: 13 }}>
              • {email}
            </Text>
          ))}

          <TouchableOpacity onPress={() => setShowAddMember(!showAddMember)} style={{ marginTop: 8 }}>
            <Text style={{ color: "#3b82f6", fontSize: 13, fontWeight: "600" }}>
              {showAddMember ? "Batal" : "+ Tambah Anggota"}
            </Text>
          </TouchableOpacity>

          {showAddMember && (
            <View style={{ backgroundColor: "#f3f4f6", padding: 10, borderRadius: 8, marginTop: 8 }}>
              <Text style={{ fontSize: 11, color: "#999", marginBottom: 6 }}>
                Minta temanmu cek UID-nya di halaman profil (fitur akan ditambah nanti), atau lihat manual di Firebase Console.
              </Text>
              <TextInput
                placeholder="UID Firebase teman"
                value={memberUid}
                onChangeText={setMemberUid}
                style={{ backgroundColor: "white", borderRadius: 6, padding: 8, marginBottom: 6, fontSize: 13 }}
              />
              <TextInput
                placeholder="Email teman"
                value={memberEmail}
                onChangeText={setMemberEmail}
                style={{ backgroundColor: "white", borderRadius: 6, padding: 8, marginBottom: 6, fontSize: 13 }}
              />
              <TouchableOpacity
                onPress={handleAddMember}
                style={{ backgroundColor: "#22c55e", padding: 8, borderRadius: 6, alignItems: "center" }}
              >
                <Text style={{ color: "white", fontWeight: "bold", fontSize: 13 }}>Tambah</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Sub-Tugas */}
          <Text style={{ fontWeight: "600", marginTop: 16, marginBottom: 4 }}>Pembagian Tugas:</Text>

          {subtasks.map((task) => (
            <View
              key={task.id}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "#f9fafb",
                padding: 10,
                borderRadius: 8,
                marginBottom: 6,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13 }}>{task.deskripsi}</Text>
                <Text style={{ fontSize: 11, color: "#999" }}>{task.assignedToEmail}</Text>
                <TouchableOpacity onPress={() => updateSubTaskStatus(group.id, task.id, cycleStatus(task.status))}>
                  <Text style={{ fontSize: 11, color: statusColor[task.status], fontWeight: "600", marginTop: 2 }}>
                    {statusLabel[task.status]} (tap untuk ubah)
                  </Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={() => deleteSubTask(group.id, task.id)}>
                <Text style={{ color: "#ef4444", fontSize: 12 }}>Hapus</Text>
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity onPress={() => setShowAddTask(!showAddTask)} style={{ marginTop: 4 }}>
            <Text style={{ color: "#3b82f6", fontSize: 13, fontWeight: "600" }}>
              {showAddTask ? "Batal" : "+ Tambah Sub-Tugas"}
            </Text>
          </TouchableOpacity>

          {showAddTask && (
            <View style={{ backgroundColor: "#f3f4f6", padding: 10, borderRadius: 8, marginTop: 8 }}>
              <TextInput
                placeholder="Deskripsi tugas (contoh: Kerjakan Bab 3)"
                value={taskDesc}
                onChangeText={setTaskDesc}
                style={{ backgroundColor: "white", borderRadius: 6, padding: 8, marginBottom: 6, fontSize: 13 }}
              />
              <Text style={{ fontSize: 12, marginBottom: 4 }}>Ditugaskan ke:</Text>
              <ScrollView horizontal style={{ marginBottom: 8 }}>
                {group.anggotaEmail.map((email, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => setTaskAssignTo(idx)}
                    style={{
                      backgroundColor: taskAssignTo === idx ? "#3b82f6" : "white",
                      paddingVertical: 6,
                      paddingHorizontal: 10,
                      borderRadius: 16,
                      marginRight: 6,
                    }}
                  >
                    <Text style={{ color: taskAssignTo === idx ? "white" : "black", fontSize: 12 }}>
                      {email}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                onPress={handleAddTask}
                style={{ backgroundColor: "#22c55e", padding: 8, borderRadius: 6, alignItems: "center" }}
              >
                <Text style={{ color: "white", fontWeight: "bold", fontSize: 13 }}>Tambah Tugas</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
}