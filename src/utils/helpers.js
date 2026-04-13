// ─── Helpers ───
export const uid = () => (typeof crypto !== "undefined" && crypto.randomUUID) ? crypto.randomUUID() : (Date.now().toString(36) + Math.random().toString(36).slice(2, 11));
export const today = () => new Date().toISOString().split("T")[0];
export const ago = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().split("T")[0]; };
export const daysFromNow = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().split("T")[0]; };

export const fmtShort = (d) => new Date(d + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
export const fmtFull = (d) => new Date(d + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

export const fmtDate = (d) => {
  if (!d) return "";
  if (d === today()) return "Today";
  if (d === daysFromNow(1)) return "Tomorrow";
  if (d === ago(1)) return "Yesterday";
  return fmtShort(d);
};

export const isOverdue = (r) => {
  if (r.done || !r.date) return false;
  return r.date < today();
};

export const isToday = (r) => r.date === today();

export const overdueByDays = (r) => {
  if (!isOverdue(r)) return 0;
  const t = new Date(); t.setHours(0, 0, 0, 0);
  return Math.round((t - new Date(r.date + "T12:00:00")) / 86400000);
};

export const dueDiffDays = (r) => {
  if (!r.date) return null;
  const t = new Date(); t.setHours(0, 0, 0, 0);
  return Math.round((new Date(r.date + "T12:00:00") - t) / 86400000);
};

// Validation
export const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
