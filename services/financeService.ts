import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  setDoc,
  updateDoc
} from "firebase/firestore";
import { auth, db } from "./firebase";

export type Transaction = {
  id: string;
  jumlah: number;
  kategori: string;
  tanggal: string; // YYYY-MM-DD
  catatan?: string;
};

export const KATEGORI_LIST = ["Makan", "Transport", "Jajan", "Belanja", "Lainnya"];

function getTransactionsRef() {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("User belum login");
  return collection(db, "transactions", userId, "items");
}

export async function addTransaction(data: Omit<Transaction, "id">) {
  const ref = getTransactionsRef();
  await addDoc(ref, data);
}

export async function deleteTransaction(transactionId: string) {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("User belum login");
  await deleteDoc(doc(db, "transactions", userId, "items", transactionId));
}

export async function updateTransaction(transactionId: string, data: Partial<Omit<Transaction, "id">>) {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("User belum login");
  await updateDoc(doc(db, "transactions", userId, "items", transactionId), data);
}

export function listenToTransactions(callback: (transactions: Transaction[]) => void) {
  const ref = getTransactionsRef();
  const q = query(ref);
  return onSnapshot(q, (snapshot) => {
    const transactions: Transaction[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Transaction, "id">),
    }));
    // Urutkan dari yang terbaru
    transactions.sort((a, b) => b.tanggal.localeCompare(a.tanggal));
    callback(transactions);
  });
}

export function listenToBudget(yyyymm: string, callback: (budget: number) => void) {
  const ref = getBudgetDocRef(yyyymm);
  return onSnapshot(ref, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data().totalBudget ?? 0);
    } else {
      callback(0);
    }
  });
}

// ==================== BUDGET BULANAN ====================

function getBudgetDocRef(yyyymm: string) {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("User belum login");
  return doc(db, "budgets", userId, "monthly", yyyymm);
}

export async function setBudget(yyyymm: string, totalBudget: number) {
  const ref = getBudgetDocRef(yyyymm);
  await setDoc(ref, { totalBudget }, { merge: true });
}

export async function getBudget(yyyymm: string): Promise<number | null> {
  const ref = getBudgetDocRef(yyyymm);
  const snapshot = await getDoc(ref);
  if (snapshot.exists()) {
    return snapshot.data().totalBudget ?? null;
  }
  return null;
}