import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="home" options={{ title: "Home" }} />
      <Tabs.Screen name="jadwal" options={{ title: "Jadwal" }} />
      <Tabs.Screen name="todo" options={{ title: "To-Do" }} />
      <Tabs.Screen name="keuangan" options={{ title: "Keuangan" }} />
      <Tabs.Screen name="kelompok" options={{ title: "Kelompok" }} />
      <Tabs.Screen name="wellbeing" options={{ title: "Wellbeing" }} />
    </Tabs>
  );
}