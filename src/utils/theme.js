import { LS } from './storage';

export const DARK_THEME = {
  bg: "#03090f", card: "rgba(56,189,248,0.04)", cardBorder: "rgba(56,189,248,0.1)",
  accent: "#38bdf8", accent2: "#7dd3fc", blue2: "#60a5fa", purple: "#a78bfa",
  green: "#34d399", pink: "#f472b6", warn: "#fbbf24", danger: "#f87171",
  text: "#e0f2fe", text2: "#7dd3fc", text3: "#2d5a72",
  font: "'Outfit', sans-serif", mono: "'JetBrains Mono', monospace",
  sheetBg: "linear-gradient(180deg,#080f1a,#03090f)", navBg: "rgba(3,9,15,0.96)", mode: "dark",
};
export const LIGHT_THEME = {
  bg: "#f0f9ff", card: "rgba(14,165,233,0.04)", cardBorder: "rgba(14,165,233,0.12)",
  accent: "#0ea5e9", accent2: "#38bdf8", blue2: "#3b82f6", purple: "#a78bfa",
  green: "#10b981", pink: "#ec4899", warn: "#d97706", danger: "#dc2626",
  text: "#0c4a6e", text2: "#0369a1", text3: "#64748b",
  font: "'Outfit', sans-serif", mono: "'JetBrains Mono', monospace",
  sheetBg: "linear-gradient(180deg,#ffffff,#f0f9ff)", navBg: "rgba(240,249,255,0.97)", mode: "light",
};
export const V = { ...(LS.get("rl-theme") === "light" ? LIGHT_THEME : DARK_THEME) };
export const setTheme = (mode) => {
  const t = mode === "light" ? LIGHT_THEME : DARK_THEME;
  Object.assign(V, t);
  LS.set("rl-theme", mode);
  document.body.style.background = V.bg;
  document.body.style.color = V.text;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", V.bg);
};

export const Haptic = {
  light: () => { try { navigator.vibrate?.(10); } catch (e) {} },
  medium: () => { try { navigator.vibrate?.(25); } catch (e) {} },
  heavy: () => { try { navigator.vibrate?.([30, 20, 50]); } catch (e) {} },
  success: () => { try { navigator.vibrate?.([10, 30, 10, 30, 50]); } catch (e) {} },
  priority: (p) => {
    try {
      if (!navigator.vibrate) return;
      if (p === "high") navigator.vibrate([20, 40, 20, 40, 30]);
      else if (p === "medium") navigator.vibrate([12, 30, 12]);
      else navigator.vibrate([8]);
    } catch (e) {}
  },
};
