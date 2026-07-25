import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "./firebase";
import { cancelClassReminder, cancelDeadlineReminder, scheduleClassReminder, scheduleDeadlineReminder } from "./notificationService";

export type ClassSchedule = {
  id: string;
  matkul: string;
  hari: string;
  jamMulai: string;
  jamSelesai: string;
  ruangan: string;
  dosen: string;
  jamSebelum?: number;
};

// Ambil referensi collection sesuai user yang login
function getClassesRef() {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("User belum login");
  return collection(db, "schedules", userId, "classes");
}

// Tambah jadwal baru
export async function addClass(data: Omit<ClassSchedule, "id"> & { jamSebelum?: number }) {
  const ref = getClassesRef();

  const dataToSave: any = { ...data };
  if (dataToSave.jamSebelum === undefined) {
    delete dataToSave.jamSebelum;
  }

  const docRef = await addDoc(ref, dataToSave);

  if (data.jamSebelum) {
    await scheduleClassReminder(docRef.id, data.matkul, data.hari, data.jamMulai, data.jamSebelum);
  }
}

// Hapus jadwal
export async function deleteClass(classId: string) {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("User belum login");
  await deleteDoc(doc(db, "schedules", userId, "classes", classId));
  await cancelClassReminder(classId);
}

// Dengarkan perubahan data secara real-time
export function listenToClasses(
  callback: (classes: ClassSchedule[]) => void
) {
  const ref = getClassesRef();
  const q = query(ref);
  return onSnapshot(q, (snapshot) => {
    const classes: ClassSchedule[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<ClassSchedule, "id">),
    }));
    callback(classes);
  });
}

// ==================== TUGAS/DEADLINE ====================

export type Task = {
  id: string;
  judul: string;
  matkul: string;
  deadline: string; // format: YYYY-MM-DD
  selesai: boolean;
};

function getTasksRef() {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("User belum login");
  return collection(db, "tasks", userId, "items");
}

export async function addTask(data: Omit<Task, "id" | "selesai">) {
  const ref = getTasksRef();
  const docRef = await addDoc(ref, { ...data, selesai: false });
  await scheduleDeadlineReminder(docRef.id, data.judul, data.deadline);
}

export async function deleteTask(taskId: string) {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("User belum login");
  await deleteDoc(doc(db, "tasks", userId, "items", taskId));
  await cancelDeadlineReminder(taskId);
}

export async function toggleTaskDone(taskId: string, selesai: boolean) {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("User belum login");
  await updateDoc(doc(db, "tasks", userId, "items", taskId), { selesai });
}

export function listenToTasks(callback: (tasks: Task[]) => void) {
  const ref = getTasksRef();
  const q = query(ref);
  return onSnapshot(q, (snapshot) => {
    const tasks: Task[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Task, "id">),
    }));
    // Urutkan berdasarkan deadline terdekat
    tasks.sort((a, b) => a.deadline.localeCompare(b.deadline));
    callback(tasks);
  });
}

// ==================== TO-DO ====================

export type Todo = {
  id: string;
  judul: string;
  tipe: "harian" | "mingguan";
  selesai: boolean;
  tanggal: string; // YYYY-MM-DD, buat filter todo harian
};

function getTodosRef() {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("User belum login");
  return collection(db, "todos", userId, "items");
}

export async function addTodo(data: Omit<Todo, "id" | "selesai">) {
  const ref = getTodosRef();
  await addDoc(ref, { ...data, selesai: false });
}

export async function deleteTodo(todoId: string) {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("User belum login");
  await deleteDoc(doc(db, "todos", userId, "items", todoId));
}

export async function toggleTodoDone(todoId: string, selesai: boolean) {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("User belum login");
  await updateDoc(doc(db, "todos", userId, "items", todoId), { selesai });
}

export function listenToTodos(callback: (todos: Todo[]) => void) {
  const ref = getTodosRef();
  const q = query(ref);
  return onSnapshot(q, (snapshot) => {
    const todos: Todo[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Todo, "id">),
    }));
    callback(todos);
  });
}

// ==================== UJIAN ====================

export type Exam = {
  id: string;
  matkul: string;
  jenis: "UTS" | "UAS";
  tanggal: string; // YYYY-MM-DD
  ruangan: string;
};

function getExamsRef() {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("User belum login");
  return collection(db, "exams", userId, "items");
}

export async function addExam(data: Omit<Exam, "id">) {
  const ref = getExamsRef();
  await addDoc(ref, data);
}

export async function deleteExam(examId: string) {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("User belum login");
  await deleteDoc(doc(db, "exams", userId, "items", examId));
}

export function listenToExams(callback: (exams: Exam[]) => void) {
  const ref = getExamsRef();
  const q = query(ref);
  return onSnapshot(q, (snapshot) => {
    const exams: Exam[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Exam, "id">),
    }));
    exams.sort((a, b) => a.tanggal.localeCompare(b.tanggal));
    callback(exams);
  });
}