// utils.js

// ✅ Updated to match your scheduler requirement: 5 AM → 9 PM
export const START_HOUR = 5;
export const END_HOUR = 21; // exclusive (so 21:00 is last hour shown; slots stop before 9:00 PM ends)
export const STEP_MIN = 15;
export const DEFAULT_BLOCK_MIN = 30;
export const SLOT_PX = 18;

export const SERVICE_CATEGORIES = [
  "All service categories",
  "Private Member Appointments",
  "Private Non-Member Appts",
  "Unavailable",
];

export function buildTimeSlots(date) {
  const slots = [];
  for (let h = START_HOUR; h < END_HOUR; h++) {
    for (let m = 0; m < 60; m += STEP_MIN) {
      slots.push(new Date(date.getFullYear(), date.getMonth(), date.getDate(), h, m, 0));
    }
  }
  return slots;
}

export function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
}

export function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return startOfDay(x);
}

export function addMonths(d, n) {
  const x = new Date(d);
  x.setMonth(x.getMonth() + n);
  return new Date(x.getFullYear(), x.getMonth(), 1);
}

export function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function buildWeekDays(anchor) {
  // Monday -> Sunday
  const d = new Date(anchor);
  const day = d.getDay(); // 0 Sun .. 6 Sat
  const mondayOffset = (day + 6) % 7;
  const monday = addDays(d, -mondayOffset);
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

export function isInWeek(date, monday, sunday) {
  const t = startOfDay(date).getTime();
  return t >= startOfDay(monday).getTime() && t <= startOfDay(sunday).getTime();
}

export function rangesOverlap(s1, e1, s2, e2) {
  return s1.getTime() < e2.getTime() && s2.getTime() < e1.getTime();
}

export function formatTime(d) {
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export function formatHeaderDate(d) {
  return d.toLocaleDateString([], { weekday: "short", month: "long", day: "numeric", year: "numeric" });
}

export function formatDateShort(d) {
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export function weekdayShort(d) {
  return d.toLocaleDateString([], { weekday: "short" });
}

export function minutesBetween(a, b) {
  return Math.round((b.getTime() - a.getTime()) / 60000);
}

export function cryptoId() {
  return "appt_" + Math.random().toString(16).slice(2) + "_" + Date.now().toString(16);
}

export function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

export function goToday(mode, setDayDate, setWeekAnchor) {
  if (mode === "day") setDayDate(startOfDay(new Date()));
  else setWeekAnchor(startOfDay(new Date()));
}

export function buildMonthGrid(firstOfMonth) {
  const first = new Date(firstOfMonth.getFullYear(), firstOfMonth.getMonth(), 1);
  const startDay = first.getDay(); // sunday = 0
  const start = new Date(first);
  start.setDate(first.getDate() - startDay);

  const cells = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    cells.push(d);
  }
  return cells;
}
