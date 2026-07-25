import {
    EmailAuthProvider,
    reauthenticateWithCredential,
    signOut,
    updatePassword,
    updateProfile,
} from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

export async function updateUserName(newName: string) {
  const user = auth.currentUser;
  if (!user) throw new Error("User belum login");

  await updateProfile(user, { displayName: newName });
  await updateDoc(doc(db, "users", user.uid), { nama: newName });
}

export async function updateUserPassword(currentPassword: string, newPassword: string) {
  const user = auth.currentUser;
  if (!user || !user.email) throw new Error("User belum login");

  // Firebase mengharuskan re-autentikasi sebelum ganti password, demi keamanan
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, newPassword);
}

export async function logoutUser() {
  await signOut(auth);
}