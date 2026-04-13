import React, { useReducer, useEffect, useRef } from 'react';
import { V } from './utils/theme';
import { LS } from './utils/storage';
import { CloudSync } from './utils/sync';
import { SessionManager } from './utils/auth';
import { SentryUtil } from './utils/sentry';
import { today } from './utils/helpers';
import { reducer, init, DEFAULT_LISTS } from './state/reducer';
import ErrorBoundary from './components/ErrorBoundary';
import { GlobalConfirm, SuccessToast } from './components/ui';
import { Onboarding } from './tabs/Onboarding';
import { HomeTab } from './tabs/HomeTab';
import { SettingsTab } from './tabs/SettingsTab';

export default function App() {
  const [s, d] = useReducer(reducer, init);

  // ─── Load persisted state ───
  useEffect(() => {
    const p = {
      reminders: LS.get("rl-reminders") || [],
      templates: LS.get("rl-templates") || [],
      lists: LS.get("rl-lists") || [...DEFAULT_LISTS],
      focusSessions: LS.get("rl-focus-sessions") || 0,
      profile: LS.get("rl-profile") || init.profile,
      onboarded: !!LS.get("rl-onboarded"),
    };
    d({ type: "INIT", p });

    // Identify in Sentry
    if (p.profile?.email) SentryUtil.identify(p.profile.email, `${p.profile.firstName} ${p.profile.lastName}`);

    // Check admin
    SessionManager.checkAdmin();

    // Device ID
    if (!LS.get("ft-device-id")) {
      LS.set("ft-device-id", "dev_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36));
    }
  }, []);

  // ─── Persist state changes ───
  useEffect(() => {
    if (!s.loaded) return;
    LS.set("rl-reminders", s.reminders);
    LS.set("rl-templates", s.templates);
    LS.set("rl-lists", s.lists);
    LS.set("rl-focus-sessions", s.focusSessions);
    LS.set("rl-profile", s.profile);
    if (s.onboarded) LS.set("rl-onboarded", true);

    // Auto-sync to cloud
    if (s.onboarded && s.profile?.email) CloudSync.debouncedPush(s);
  }, [s.reminders, s.templates, s.lists, s.focusSessions, s.profile, s.onboarded, s.loaded]);

  // ─── Sync on app open ───
  useEffect(() => {
    if (s.loaded && s.onboarded && s.profile?.email) CloudSync.push(s);
  }, [s.loaded, s.onboarded]);

  // ─── Loading ───
  if (!s.loaded) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: V.bg }}>
      <div style={{ width: 36, height: 36, border: `3px solid ${V.accent}20`, borderTopColor: V.accent, borderRadius: "50%", animation: "spin .8s linear infinite" }} />
    </div>
  );

  // ─── Onboarding ───
  if (!s.onboarded) return <ErrorBoundary><Onboarding d={d} /><GlobalConfirm /><SuccessToast /></ErrorBoundary>;

  // ─── Main App ───
  const tabs = [
    { id: "home", label: "Home", icon: "\ud83c\udfe0" },
    { id: "reminders", label: "Reminders", icon: "\ud83d\udd14" },
    { id: "focus", label: "Focus", icon: "\ud83c\udfaf" },
    { id: "settings", label: "More", icon: "\u2699\ufe0f" },
  ];

  return (
    <ErrorBoundary>
      <div style={{ display: "flex", flexDirection: "column", height: "100%", background: V.bg }}>
        {/* Main content area */}
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", WebkitOverflowScrolling: "touch", overscrollBehavior: "contain" }}>
          <div style={{ padding: "16px 16px 16px", maxWidth: 700, margin: "0 auto" }}>
            {s.tab === "home" && <HomeTab s={s} d={d} />}
            {s.tab === "reminders" && (
              <div style={{ color: V.text3, textAlign: "center", padding: 40 }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>{"\ud83d\udd14"}</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: V.text2, marginBottom: 6 }}>Reminders Tab</div>
                <div style={{ fontSize: 12 }}>Full reminder list view -- coming from extraction</div>
              </div>
            )}
            {s.tab === "focus" && (
              <div style={{ color: V.text3, textAlign: "center", padding: 40 }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>{"\ud83c\udfaf"}</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: V.text2, marginBottom: 6 }}>Focus Mode</div>
                <div style={{ fontSize: 12 }}>Pomodoro timer -- coming from extraction</div>
              </div>
            )}
            {s.tab === "settings" && <SettingsTab s={s} d={d} />}
          </div>
        </div>

        {/* Bottom Nav */}
        <nav style={{ display: "flex", background: V.navBg, borderTop: `1px solid ${V.cardBorder}`,
          paddingBottom: "max(8px, env(safe-area-inset-bottom, 8px))", flexShrink: 0, backdropFilter: "blur(20px)" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => d({ type: "TAB", tab: t.id })}
              style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "8px 4px",
                background: "none", border: "none", cursor: "pointer", fontFamily: V.font,
                color: s.tab === t.id ? V.accent : V.text3, WebkitTapHighlightColor: "transparent" }}>
              <span style={{ fontSize: 18 }}>{t.icon}</span>
              <span style={{ fontSize: 9, fontWeight: s.tab === t.id ? 700 : 500 }}>{t.label}</span>
            </button>
          ))}
        </nav>
      </div>
      <GlobalConfirm />
      <SuccessToast />
    </ErrorBoundary>
  );
}
