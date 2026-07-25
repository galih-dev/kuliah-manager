import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Konfigurasi supaya notifikasi tetap muncul walau app lagi dibuka
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission() {
  if (!Device.isDevice) {
    console.log("Notifikasi cuma bisa dites di HP fisik, bukan emulator/web");
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return false;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  return true;
}

// Jadwalkan notifikasi untuk deadline tugas (H-3 dan H-1)
export async function scheduleDeadlineReminder(taskId: string, judul: string, deadline: string) {
  const [year, month, day] = deadline.split("-").map(Number);
  const deadlineDate = new Date(year, month - 1, day, 9, 0, 0); // jam 9 pagi

  const h3 = new Date(deadlineDate);
  h3.setDate(h3.getDate() - 3);

  const h1 = new Date(deadlineDate);
  h1.setDate(h1.getDate() - 1);

  const now = new Date();

  // Cuma jadwalkan kalau waktunya masih di masa depan
  if (h3 > now) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Deadline 3 Hari Lagi!",
        body: `Tugas "${judul}" deadline-nya ${deadline}`,
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: h3 },
      identifier: `${taskId}-h3`,
    });
  }

  if (h1 > now) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Deadline Besok!",
        body: `Tugas "${judul}" deadline-nya ${deadline}. Jangan lupa!`,
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: h1 },
      identifier: `${taskId}-h1`,
    });
  }
}

export async function cancelDeadlineReminder(taskId: string) {
  await Notifications.cancelScheduledNotificationAsync(`${taskId}-h3`);
  await Notifications.cancelScheduledNotificationAsync(`${taskId}-h1`);
}

export async function getAllScheduledNotifications() {
  const notifications = await Notifications.getAllScheduledNotificationsAsync();
  return notifications;
}

export async function testNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Test Notifikasi (Interval)",
      body: "Ini pakai trigger TIME_INTERVAL, 5 detik",
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 5 },
  });
}

export async function testNotificationDate() {
  const targetDate = new Date();
  targetDate.setMinutes(targetDate.getMinutes() + 2); // 2 menit dari sekarang

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Test Notifikasi (Date)",
      body: "Ini pakai trigger DATE, 2 menit dari sekarang",
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: targetDate },
  });
}

const HARI_KE_ANGKA: Record<string, number> = {
  Minggu: 1, Senin: 2, Selasa: 3, Rabu: 4, Kamis: 5, Jumat: 6, Sabtu: 7,
};

export async function scheduleClassReminder(
  classId: string,
  matkul: string,
  hari: string,
  jamMulai: string,
  jamSebelum: number // berapa jam sebelum kelas
) {
  const [hours, minutes] = jamMulai.split(":").map(Number);
  let reminderHour = hours - jamSebelum;
  let reminderMinute = minutes;

  // Handle kalau jam reminder jadi negatif (misal kelas jam 07:00, reminder 2 jam sebelum jadi -05:00)
  let dayOffset = 0;
  if (reminderHour < 0) {
    reminderHour += 24;
    dayOffset = -1; // reminder jatuh di hari sebelumnya
  }

  const weekday = HARI_KE_ANGKA[hari];
  if (!weekday) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Kelas akan dimulai!",
      body: `${matkul} dimulai jam ${jamMulai} (${jamSebelum} jam lagi)`,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: dayOffset === -1 ? (weekday === 1 ? 7 : weekday - 1) : weekday,
      hour: reminderHour,
      minute: reminderMinute,
    },
    identifier: `class-${classId}`,
  });
}

export async function cancelClassReminder(classId: string) {
  await Notifications.cancelScheduledNotificationAsync(`class-${classId}`);
}

export async function requestExactAlarmPermission() {
  // Android 12+ butuh permission khusus untuk exact alarm
  // Fungsi ini placeholder, permission-nya di-declare lewat app.json
  // dan biasanya auto-granted untuk SCHEDULE_EXACT_ALARM di kebanyakan device
}

export async function testClassReminder() {
  const targetDate = new Date();
  targetDate.setMinutes(targetDate.getMinutes() + 2);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Test Reminder Kelas",
      body: "Simulasi: kelas kamu akan dimulai sebentar lagi!",
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: targetDate },
  });
}