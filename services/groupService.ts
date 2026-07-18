import {
    addDoc,
    arrayUnion,
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    updateDoc,
    where,
} from "firebase/firestore";
import { auth, db } from "./firebase";

export type GroupProject = {
  id: string;
  namaProyek: string;
  anggota: string[]; // array of user UID
  anggotaEmail: string[]; // array email, buat ditampilkan
  deadlineInternal: string; // YYYY-MM-DD
  pembuatId: string;
};

export type SubTask = {
  id: string;
  deskripsi: string;
  assignedTo: string; // UID anggota
  assignedToEmail: string;
  status: "belum" | "proses" | "selesai";
};

// ==================== GROUP PROJECTS ====================

export async function createGroupProject(data: {
  namaProyek: string;
  deadlineInternal: string;
}) {
  const userId = auth.currentUser?.uid;
  const userEmail = auth.currentUser?.email;
  if (!userId || !userEmail) throw new Error("User belum login");

  const ref = collection(db, "groupTasks");
  const docRef = await addDoc(ref, {
    namaProyek: data.namaProyek,
    deadlineInternal: data.deadlineInternal,
    anggota: [userId],
    anggotaEmail: [userEmail],
    pembuatId: userId,
  });
  return docRef.id;
}

export function listenToMyGroups(callback: (groups: GroupProject[]) => void) {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("User belum login");

  const ref = collection(db, "groupTasks");
  const q = query(ref, where("anggota", "array-contains", userId));

  return onSnapshot(q, (snapshot) => {
    const groups: GroupProject[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<GroupProject, "id">),
    }));
    callback(groups);
  });
}

export async function deleteGroupProject(groupId: string) {
  await deleteDoc(doc(db, "groupTasks", groupId));
}

// Catatan: undang anggota di sini cuma nyimpen UID secara manual.
// Untuk versi awal, kita asumsikan anggota input UID temannya secara manual
// (nanti bisa dikembangkan pakai sistem invite by email yang lebih canggih)
export async function addMemberToGroup(
  groupId: string,
  memberUid: string,
  memberEmail: string
) {
  const ref = doc(db, "groupTasks", groupId);
  await updateDoc(ref, {
    anggota: arrayUnion(memberUid),
    anggotaEmail: arrayUnion(memberEmail),
  });
}

// ==================== SUB-TASKS ====================

function getSubTasksRef(groupId: string) {
  return collection(db, "groupTasks", groupId, "subtasks");
}

export async function addSubTask(
  groupId: string,
  data: { deskripsi: string; assignedTo: string; assignedToEmail: string }
) {
  const ref = getSubTasksRef(groupId);
  await addDoc(ref, { ...data, status: "belum" });
}

export async function updateSubTaskStatus(
  groupId: string,
  subTaskId: string,
  status: SubTask["status"]
) {
  const ref = doc(db, "groupTasks", groupId, "subtasks", subTaskId);
  await updateDoc(ref, { status });
}

export async function deleteSubTask(groupId: string, subTaskId: string) {
  await deleteDoc(doc(db, "groupTasks", groupId, "subtasks", subTaskId));
}

export function listenToSubTasks(
  groupId: string,
  callback: (subtasks: SubTask[]) => void
) {
  const ref = getSubTasksRef(groupId);
  const q = query(ref);
  return onSnapshot(q, (snapshot) => {
    const subtasks: SubTask[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<SubTask, "id">),
    }));
    callback(subtasks);
  });
}