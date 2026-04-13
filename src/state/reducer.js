import { uid } from '../utils/helpers';

// ─── Default Lists ───
export const DEFAULT_LISTS = [
  { id: "personal", label: "Personal", icon: "\ud83d\ude42", color: "#38bdf8" },
  { id: "work", label: "Work", icon: "\ud83d\udcbc", color: "#60a5fa" },
  { id: "health", label: "Health", icon: "\ud83d\udc8a", color: "#34d399" },
  { id: "shopping", label: "Shopping", icon: "\ud83d\uded2", color: "#fbbf24" },
  { id: "errands", label: "Errands", icon: "\ud83d\udccd", color: "#f472b6" },
];

// ─── Priority definitions ───
export const PRIORITIES = [
  { id: "high", label: "High", color: "#f87171" },
  { id: "medium", label: "Medium", color: "#fbbf24" },
  { id: "low", label: "Low", color: "#38bdf8" },
];

// ─── Recurrence options ───
export const RECURS = [
  { id: "none", label: "None" },
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
];

export const init = {
  tab: "home",
  reminders: [],
  templates: [],
  lists: [...DEFAULT_LISTS],
  focusSessions: 0,
  loaded: false,
  onboarded: false,
  profile: { firstName: "", lastName: "", email: "" },
};

export function reducer(s, a) {
  switch (a.type) {
    case "INIT": return { ...s, ...a.p, loaded: true };
    case "TAB": return { ...s, tab: a.tab };
    case "ADD_REMINDER": {
      if (s.reminders.some(r => r.id === a.r.id)) return s;
      return { ...s, reminders: [a.r, ...s.reminders] };
    }
    case "DEL_REMINDER": return { ...s, reminders: s.reminders.filter(r => r.id !== a.id) };
    case "UPD_REMINDER": return { ...s, reminders: s.reminders.map(r => r.id === a.r.id ? { ...a.r } : r) };
    case "TOGGLE_REMINDER": {
      const r = s.reminders.find(x => x.id === a.id);
      if (!r) return s;
      const done = !r.done;
      let updated = { ...r, done, doneAt: done ? new Date().toISOString() : null };
      // Handle recurring reminders
      if (done && r.recur && r.recur !== "none" && r.date) {
        const dt = new Date(r.date + "T12:00:00");
        if (r.recur === "daily") dt.setDate(dt.getDate() + 1);
        else if (r.recur === "weekly") dt.setDate(dt.getDate() + 7);
        else if (r.recur === "monthly") dt.setMonth(dt.getMonth() + 1);
        const nextDate = dt.toISOString().split("T")[0];
        const next = { ...r, id: uid(), date: nextDate, done: false, doneAt: null, createdAt: new Date().toISOString() };
        return { ...s, reminders: [next, ...s.reminders.map(x => x.id === a.id ? updated : x)] };
      }
      return { ...s, reminders: s.reminders.map(x => x.id === a.id ? updated : x) };
    }
    case "SNOOZE_REMINDER": {
      return { ...s, reminders: s.reminders.map(r => r.id === a.id ? { ...r, date: a.date, time: a.time || r.time } : r) };
    }
    case "ADD_TEMPLATE": {
      if (s.templates.some(t => t.id === a.t.id)) return s;
      return { ...s, templates: [...s.templates, a.t] };
    }
    case "DEL_TEMPLATE": return { ...s, templates: s.templates.filter(t => t.id !== a.id) };
    case "ADD_LIST": return { ...s, lists: [...s.lists, a.list] };
    case "DEL_LIST": return { ...s, lists: s.lists.filter(l => l.id !== a.id), reminders: s.reminders.filter(r => r.list !== a.id) };
    case "INC_FOCUS": return { ...s, focusSessions: (s.focusSessions || 0) + 1 };
    case "SET_PROFILE": return { ...s, profile: { ...(s.profile || {}), ...a.profile } };
    case "ONBOARDED": return { ...s, onboarded: true };
    case "IMPORT": return { ...s, ...a.data, loaded: true };
    case "CLEAR_ALL": return { ...init, loaded: true, onboarded: true, profile: s.profile };
    default: return s;
  }
}
