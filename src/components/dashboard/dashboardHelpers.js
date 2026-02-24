// src/components/dashboard/dashboardHelpers.js
export const SOON_WINDOW_MIN = 120;
export const RENEWAL_WINDOW_DAYS = 7;
export const TRIAL_END_WINDOW_DAYS = 3;

export function buildStats({ members, checkins, appointments, cart, transactions }) {
  const memberStatus = { active: 0, frozen: 0, inactive: 0, other: 0 };

  for (const m of members ?? []) {
    const s = String(m.status || "").toLowerCase();
    if (s === "active") memberStatus.active += 1;
    else if (s === "frozen") memberStatus.frozen += 1;
    else if (s === "inactive") memberStatus.inactive += 1;
    else memberStatus.other += 1;
  }

  const cartItems = (cart ?? []).reduce((sum, item) => sum + Number(item.qty ?? 1), 0);
  const cartTotal = (cart ?? []).reduce((sum, item) => sum + Number(item.qty ?? 1) * Number(item.price ?? 0), 0);

  const checkinsToday = countCheckinsToday(checkins);
  const apptsNext2Hours = getAppointmentsSoon(appointments, SOON_WINDOW_MIN).length;

  const txTodayArr = getTransactionsToday(transactions);
  const revenueToday = txTodayArr.reduce((sum, t) => sum + Number(t.total ?? t.amount ?? 0), 0);
  const txToday = txTodayArr.length;
  const avgTicket = txToday ? revenueToday / txToday : 0;

  return {
    memberCount: (members ?? []).length,
    appointmentCount: (appointments ?? []).length,
    checkinsToday,
    cartTotal,
    cartItems,
    memberStatus,
    apptsNext2Hours,
    revenueToday,
    txToday,
    avgTicket,
  };
}

export function buildAlerts({
  members,
  appointments,
  renewalsSoonCount,
  trialsEndingSoonCount,
  onGoMembers,
  onGoMembersFrozen,
  onGoMembersInactive,
  onGoAppointments,
}) {
  const frozen = (members ?? []).filter((m) => String(m.status || "").toLowerCase() === "frozen").length;
  const inactive = (members ?? []).filter((m) => String(m.status || "").toLowerCase() === "inactive").length;
  const missingPhotos = (members ?? []).filter((m) => !String(m.photo_url ?? "").trim()).length;

  const overdue = (appointments ?? []).filter((a) => {
    const t = new Date(a.start).getTime();
    if (!Number.isFinite(t)) return false;
    const status = String(a.status || "").toLowerCase();
    return t < Date.now() && (status === "" || status === "scheduled");
  }).length;

  const alerts = [];

  if (overdue)
    alerts.push({
      key: "overdueAppts",
      label: "Overdue appointments",
      sub: "Scheduled in the past, not completed/cancelled",
      value: overdue,
      badgeClass: "badge-bad",
      onClick: onGoAppointments,
    });

  if (trialsEndingSoonCount)
    alerts.push({
      key: "trialsEnding",
      label: "Trials ending soon",
      sub: "Follow up to convert before they expire",
      value: trialsEndingSoonCount,
      badgeClass: "badge-warn",
      onClick: onGoMembers,
    });

  if (renewalsSoonCount)
    alerts.push({
      key: "renewalsSoon",
      label: "Renewals expiring soon",
      sub: `Ending within next ${RENEWAL_WINDOW_DAYS} days`,
      value: renewalsSoonCount,
      badgeClass: "badge-warn",
      onClick: onGoMembers,
    });

  if (frozen)
    alerts.push({
      key: "frozen",
      label: "Frozen members",
      sub: "May require staff approval",
      value: frozen,
      badgeClass: "badge-warn",
      onClick: onGoMembersFrozen,
    });

  if (inactive)
    alerts.push({
      key: "inactive",
      label: "Inactive members",
      sub: "Likely expired or cancelled",
      value: inactive,
      badgeClass: "badge-warn",
      onClick: onGoMembersInactive,
    });

  if (missingPhotos)
    alerts.push({
      key: "missingPhotos",
      label: "Members missing photos",
      sub: "Improve check-in speed + verification",
      value: missingPhotos,
      badgeClass: "badge-warn",
      onClick: onGoMembers,
    });

  return alerts;
}

export function countCheckinsToday(checkins) {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return (checkins ?? []).filter((c) => {
    const t = new Date(c.time || c.created_at).getTime();
    return Number.isFinite(t) && t >= startOfDay;
  }).length;
}

export function getRecentCheckins(checkins, limit = 6) {
  const sorted = (checkins ?? []).slice().sort((a, b) => {
    const ta = new Date(a.time || a.created_at).getTime();
    const tb = new Date(b.time || b.created_at).getTime();
    return (tb || 0) - (ta || 0);
  });
  return sorted.slice(0, limit);
}

export function getUpcomingAppointments(appointments, limit = 5) {
  const now = Date.now();
  return (appointments ?? [])
    .filter((a) => Number.isFinite(new Date(a.start).getTime()) && new Date(a.start).getTime() >= now)
    .slice()
    .sort((a, b) => new Date(a.start) - new Date(b.start))
    .slice(0, limit);
}

export function getAppointmentsSoon(appointments, minutes = 120) {
  const now = Date.now();
  const end = now + minutes * 60 * 1000;
  return (appointments ?? []).filter((a) => {
    const t = new Date(a.start).getTime();
    if (!Number.isFinite(t)) return false;
    const status = String(a.status || "").toLowerCase();
    if (status && status !== "scheduled") return false;
    return t >= now && t <= end;
  });
}

export function getNowNextAppointment(appointments) {
  const now = Date.now();
  const upcoming = (appointments ?? [])
    .map((a) => ({ ...a, _start: new Date(a.start).getTime(), _end: new Date(a.end).getTime() }))
    .filter((a) => Number.isFinite(a._start))
    .sort((a, b) => a._start - b._start);

  const nowAppt = upcoming.find((a) => Number.isFinite(a._end) && a._start <= now && now <= a._end);
  if (nowAppt) return { ...nowAppt, kind: "now" };

  const next = upcoming.find((a) => a._start >= now);
  if (next) return { ...next, kind: "next" };

  return null;
}

export function buildTrainerWorkload({ appointments, trainers }) {
  const todayStart = startOfTodayMs();
  const todayEnd = todayStart + 24 * 60 * 60 * 1000;

  const counts = new Map();
  for (const a of appointments ?? []) {
    const t = new Date(a.start).getTime();
    if (!Number.isFinite(t) || t < todayStart || t >= todayEnd) continue;
    const trainerId = a.trainerId ?? a.worker_id ?? a.workerId ?? a.trainer_id;
    const key = trainerId != null ? String(trainerId) : "unassigned";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const trainerNameById = new Map(
    (trainers ?? []).map((t) => [
      String(t.worker_id ?? t.id ?? t.trainer_id ?? ""),
      `${t.first_name ?? ""} ${t.last_name ?? ""}`.trim() || "Trainer",
    ])
  );

  return [...counts.entries()]
    .map(([key, count]) => ({
      key,
      name: key === "unassigned" ? "Unassigned" : trainerNameById.get(key) || `Trainer #${key}`,
      count,
    }))
    .sort((a, b) => b.count - a.count);
}

/* Renewals + Trials */
export function getRenewalsEndingSoon(members, days = 7) {
  const now = Date.now();
  const end = now + days * 24 * 60 * 60 * 1000;
  return (members ?? [])
    .filter((m) => {
      const t = getMemberRenewalDate(m)?.getTime();
      return Number.isFinite(t) && t >= now && t <= end;
    })
    .sort((a, b) => getMemberRenewalDate(a) - getMemberRenewalDate(b));
}

export function getTrialsEndingSoon(members, days = 3) {
  const now = Date.now();
  const end = now + days * 24 * 60 * 60 * 1000;
  return (members ?? [])
    .filter((m) => {
      const t = getMemberTrialEndDate(m)?.getTime();
      return Number.isFinite(t) && t >= now && t <= end;
    })
    .sort((a, b) => getMemberTrialEndDate(a) - getMemberTrialEndDate(b));
}

export function getMemberRenewalDate(m) {
  const raw =
    m.membership_end ??
    m.membership_end_date ??
    m.membership_expires_at ??
    m.expires_at ??
    m.renewal_date ??
    m.membership_renewal_date;

  const d = raw ? new Date(raw) : null;
  return d && Number.isFinite(d.getTime()) ? d : null;
}

export function getMemberTrialEndDate(m) {
  const raw =
    m.trial_end ??
    m.trial_end_date ??
    m.trial_ends_at ??
    m.trial_expires_at ??
    m.trialExpiresAt;

  const d = raw ? new Date(raw) : null;
  return d && Number.isFinite(d.getTime()) ? d : null;
}

/* Transactions */
export function getTransactionsToday(transactions) {
  const start = startOfTodayMs();
  return (transactions ?? []).filter((t) => {
    const time = t.created_at ?? t.time ?? t.createdAt ?? t.timestamp;
    const ms = new Date(time).getTime();
    return Number.isFinite(ms) && ms >= start;
  });
}

/* Formatting */
export function formatNowBadge() {
  const d = new Date();
  const time = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const date = d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
  return `${date} • ${time}`;
}

export function formatTimeCompact(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  const date = d.toLocaleDateString([], { month: "short", day: "numeric" });
  const time = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  return `${date} • ${time}`;
}

export function formatDateRange(startIso, endIso) {
  const s = new Date(startIso);
  const e = new Date(endIso);
  if (Number.isNaN(s.getTime())) return "";
  const day = s.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
  const st = s.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const et = !Number.isNaN(e.getTime()) ? e.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "";
  return et ? `${day} • ${st}–${et}` : `${day} • ${st}`;
}

export function formatShortDate(d) {
  if (!d) return "—";
  const dd = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(dd.getTime())) return "—";
  return dd.toLocaleDateString([], { month: "short", day: "numeric" });
}

export function parseCheckinLabel(label) {
  const s = String(label || "");
  const idMatch = s.match(/member_id:(\d+)/);
  const nameMatch = s.match(/name:([^]+)$/);
  return { member_id: idMatch ? idMatch[1] : "", name: nameMatch ? nameMatch[1].trim() : "" };
}

export function startOfTodayMs() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
}