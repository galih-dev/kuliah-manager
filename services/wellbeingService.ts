import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

export type WellbeingSettings = {
  jamIstirahat: string; // format "HH:MM"
  jamOlahraga: string;
  aktif: boolean;
};

const DEFAULT_SETTINGS: WellbeingSettings = {
  jamIstirahat: "15:00",
  jamOlahraga: "17:00",
  aktif: true,
};

function getSettingsRef() {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("User belum login");
  return doc(db, "wellbeingReminders", userId, "settings", "config");
}

export async function saveWellbeingSettings(settings: WellbeingSettings) {
  const ref = getSettingsRef();
  await setDoc(ref, settings);
}

export function listenToWellbeingSettings(
  callback: (settings: WellbeingSettings) => void
) {
  const ref = getSettingsRef();
  return onSnapshot(ref, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data() as WellbeingSettings);
    } else {
      callback(DEFAULT_SETTINGS);
    }
  });
}