import React, { useState, useMemo, useRef } from 'react';
import { V, Haptic } from '../utils/theme';
import { Card, Btn, Progress, Stat, Field, SuccessToastCtrl } from '../components/ui';
import { Icons } from '../components/Icons';
import { today, fmtDate, isOverdue, isToday, uid, dueDiffDays, overdueByDays, daysFromNow } from '../utils/helpers';
import { PRIORITIES, DEFAULT_LISTS } from '../state/reducer';

export function HomeTab({ s, d }) {
  const [quickText, setQuickText] = useState("");
  const [quickList, setQuickList] = useState("personal");
  const inputRef = useRef(null);

  const todayReminders = useMemo(() => s.reminders.filter(r => !r.done && isToday(r)), [s.reminders]);
  const overdueReminders = useMemo(() => s.reminders.filter(r => isOverdue(r)), [s.reminders]);
  const doneToday = useMemo(() => s.reminders.filter(r => r.done && r.doneAt && r.doneAt.startsWith(today())), [s.reminders]);
  const totalActive = s.reminders.filter(r => !r.done).length;
  const totalDone = s.reminders.filter(r => r.done).length;

  // Streak calculation
  const streak = useMemo(() => {
    const doneByDay = {};
    s.reminders.filter(r => r.done && r.doneAt).forEach(r => {
      const d = r.doneAt.slice(0, 10);
      doneByDay[d] = (doneByDay[d] || 0) + 1;
    });
    let count = 0;
    const td = today();
    let checkDate = new Date(td + "T12:00:00");
    for (let i = 0; i < 365; i++) {
      const ds = checkDate.toISOString().split("T")[0];
      if (doneByDay[ds]) { count++; checkDate.setDate(checkDate.getDate() - 1); }
      else if (ds === td) { checkDate.setDate(checkDate.getDate() - 1); }
      else break;
    }
    return count;
  }, [s.reminders]);

  // Completion ring
  const todayTotal = todayReminders.length + doneToday.length;
  const ringPct = todayTotal > 0 ? Math.round(doneToday.length / todayTotal * 100) : 0;

  const greeting = (() => {
    const hr = new Date().getHours();
    if (hr < 12) return "Good morning";
    if (hr < 18) return "Good afternoon";
    return "Good evening";
  })();

  const quickAdd = () => {
    if (!quickText.trim()) return;
    const r = {
      id: uid(), title: quickText.trim(), list: quickList, priority: "medium",
      date: today(), time: "", notes: "", recur: "none", subtasks: [], tags: [],
      done: false, createdAt: new Date().toISOString(),
    };
    d({ type: "ADD_REMINDER", r });
    setQuickText("");
    Haptic.success();
    SuccessToastCtrl.show("Reminder added");
    if (inputRef.current) inputRef.current.focus();
  };

  const toggleReminder = (id) => {
    d({ type: "TOGGLE_REMINDER", id });
    Haptic.success();
    SuccessToastCtrl.show("Done! +8 XP");
  };

  const priColor = (p) => {
    const obj = PRIORITIES.find(x => x.id === p);
    return obj ? obj.color : V.text3;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Greeting */}
      <div style={{ marginBottom: 4 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: V.text }}>{greeting}, {s.profile?.firstName || "there"}</div>
        <div style={{ fontSize: 11, color: V.text3 }}>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</div>
      </div>

      {/* Today Summary Card */}
      <Card style={{ padding: 16, background: `linear-gradient(135deg,${V.accent}08,${V.accent2}05)`, border: `1px solid ${V.accent}20` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* Ring */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <svg width={72} height={72} style={{ transform: "rotate(-90deg)" }}>
              <circle cx={36} cy={36} r={28} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={5} />
              <circle cx={36} cy={36} r={28} fill="none"
                stroke={ringPct === 100 ? V.green : V.accent} strokeWidth={5}
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 28}
                strokeDashoffset={2 * Math.PI * 28 - (ringPct / 100) * 2 * Math.PI * 28}
                style={{ transition: "stroke-dashoffset .7s ease" }} />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 14, fontWeight: 900, color: ringPct === 100 ? V.green : V.accent, fontFamily: V.mono }}>{ringPct}%</span>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, color: V.text3, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 4 }}>Today's Progress</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: V.text, fontFamily: V.mono }}>{doneToday.length}/{todayTotal}</div>
            <div style={{ fontSize: 10, color: V.text3 }}>
              {totalActive} active · {totalDone} completed{streak > 0 ? ` · ${streak} day streak` : ""}
            </div>
          </div>
          {streak > 0 && <div style={{ fontSize: 24 }}>{"🔥"}</div>}
        </div>
      </Card>

      {/* Quick Add */}
      <Card style={{ padding: 12, background: `${V.accent}06`, border: `1px solid ${V.accent}15` }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <input ref={inputRef} value={quickText} onChange={e => setQuickText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && quickAdd()}
            placeholder="Quick add a reminder..."
            style={{ flex: 1, padding: "10px 14px", background: "rgba(255,255,255,0.05)", border: `1px solid ${V.cardBorder}`,
              borderRadius: 10, color: V.text, fontSize: 15, fontFamily: V.font, outline: "none", minHeight: 44 }} />
          <button onClick={quickAdd} disabled={!quickText.trim()}
            style={{ padding: "10px 16px", borderRadius: 10,
              background: quickText.trim() ? `linear-gradient(135deg,${V.accent},${V.accent2})` : "rgba(255,255,255,0.04)",
              border: "none", cursor: quickText.trim() ? "pointer" : "default", fontSize: 20, lineHeight: 1, opacity: quickText.trim() ? 1 : .3 }}>+</button>
        </div>
        <div style={{ display: "flex", gap: 5, overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          {s.lists.map(l => (
            <button key={l.id} onClick={() => setQuickList(l.id)} style={{
              padding: "5px 10px", borderRadius: 16, border: `1px solid ${quickList === l.id ? l.color : V.cardBorder}`,
              background: quickList === l.id ? `${l.color}15` : "transparent",
              color: quickList === l.id ? l.color : V.text3, fontSize: 11, fontWeight: 600,
              cursor: "pointer", whiteSpace: "nowrap", fontFamily: V.font
            }}>
              {l.icon} {l.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Overdue */}
      {overdueReminders.length > 0 && (
        <Card style={{ padding: 14, background: `${V.danger}08`, border: `1px solid ${V.danger}20` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: V.danger, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 10 }}>
            {"⚠"} Overdue ({overdueReminders.length})
          </div>
          {overdueReminders.slice(0, 5).map(r => (
            <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid rgba(255,255,255,0.03)` }}>
              <button onClick={() => toggleReminder(r.id)} style={{
                width: 22, height: 22, borderRadius: 6, border: `2px solid ${priColor(r.priority)}`,
                background: "transparent", cursor: "pointer", flexShrink: 0
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: V.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.title}</div>
                <div style={{ fontSize: 10, color: V.danger }}>{overdueByDays(r)}d overdue</div>
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* Today's Reminders */}
      <Card style={{ padding: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: V.text3, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 10 }}>
          Today ({todayReminders.length})
        </div>
        {todayReminders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "16px 0", color: V.text3, fontSize: 12 }}>
            {doneToday.length > 0 ? "All done for today! Great work." : "No reminders due today."}
          </div>
        ) : (
          todayReminders.slice(0, 8).map(r => {
            const listObj = s.lists.find(l => l.id === r.list) || s.lists[0];
            return (
              <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid rgba(255,255,255,0.03)` }}>
                <button onClick={() => toggleReminder(r.id)} style={{
                  width: 22, height: 22, borderRadius: 6, border: `2px solid ${priColor(r.priority)}`,
                  background: "transparent", cursor: "pointer", flexShrink: 0
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: V.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.title}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {r.time && <span style={{ fontSize: 10, color: V.text3 }}>{r.time}</span>}
                    <span style={{ fontSize: 10, color: listObj.color }}>{listObj.icon} {listObj.label}</span>
                  </div>
                </div>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: priColor(r.priority), opacity: .8, flexShrink: 0 }} />
              </div>
            );
          })
        )}
      </Card>

      {/* Stats Overview */}
      <Card style={{ padding: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: V.text3, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 10 }}>Overview</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          <Stat label="Active" value={totalActive} color={V.accent} />
          <Stat label="Done" value={totalDone} color={V.green} />
          <Stat label="Streak" value={streak > 0 ? `${streak}d` : "0"} color={V.warn} />
        </div>
      </Card>

      {/* View All */}
      <Btn full onClick={() => d({ type: "TAB", tab: "reminders" })} s={{ marginTop: 4 }}>
        {Icons.list({ size: 16, color: "#03090f" })} View All Reminders
      </Btn>
    </div>
  );
}
