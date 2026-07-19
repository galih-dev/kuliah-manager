export const COLORS = {
  primary: "#3b82f6",
  primaryLight: "#60a5fa",
  primaryDark: "#1d4ed8",

  background: "#0b1120",     // navy gelap, background utama
  surface: "#131b2e",        // sedikit lebih terang, buat card
  surfaceLight: "#1c2740",   // buat elemen di dalam card

  textPrimary: "#f8fafc",
  textSecondary: "#94a3b8",
  textMuted: "#64748b",

  success: "#22c55e",
  danger: "#ef4444",
  warning: "#f59e0b",
  purple: "#a855f7",
  cyan: "#06b6d4",

  border: "#1e293b",
};

export const GRADIENTS = {
  primary: ["#3b82f6", "#1d4ed8"] as const,
  purple: ["#a855f7", "#7c3aed"] as const,
  cyan: ["#06b6d4", "#0891b2"] as const,
  success: ["#22c55e", "#15803d"] as const,
  dark: ["#1c2740", "#131b2e"] as const,
};

export const RADIUS = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  full: 999,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

export const SHADOW = {
  glow: {
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
};

export const FONT_SIZE = {
  xs: 12,
  sm: 13,
  base: 15,
  lg: 17,
  xl: 22,
  xxl: 30,
};

export const FONT = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
};