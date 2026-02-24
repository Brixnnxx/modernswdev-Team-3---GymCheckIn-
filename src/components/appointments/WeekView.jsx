// src/components/appointments/WeekView.jsx
import React, { useEffect, useMemo, useRef } from "react";

/**
 * Supports BOTH appointment shapes:
 *  - UI shape: { trainerId, start, end, member_name, status }
 *  - DB shape: { worker_id, appointment_start, appointment_end, member_name, status }
 */

function getApptStart(a) {
  return a?.appointment_start ?? a?.start ?? null;
}
function getApptEnd(a) {
  return a?.appointment_end ?? a?.end ?? null;
}
function normalizeDate(v) {
  const d = v ? new Date(v) : null;
  if (!d || Number.isNaN(d.getTime())) return null;
  return d;
}

export default function WeekView({ weekDays, slots, trainerId, appts, onDelete, onCreate }) {
  const bodyScrollRef = useRef(null);
  const headScrollRef = useRef(null);

  useEffect(() => {
    const body = bodyScrollRef.current;
    const head = headScrollRef.current;
    if (!body || !head) return;

    function onBodyScroll() {
      head.scrollLeft = body.scrollLeft;
    }
    body.addEventListener("scroll", onBodyScroll, { passive: true });
    return () => body.removeEventListener("scroll", onBodyScroll);
  }, []);

  const colCount = 7;

  const gridStyle = useMemo(
    () => ({
      gridTemplateColumns: `repeat(${colCount}, minmax(220px, 1fr))`,
      minWidth: `${colCount * 220}px`,
    }),
    []
  );

  return (
    <div className="mb-sched">
      {/* HEADER */}
      <div className="mb-sched-head">
        <div className="mb-time-head" />
        <div className="mb-trainer-scrollhead" ref={headScrollRef}>
          <div className="mb-trainer-head-row" style={gridStyle}>
            {weekDays.map((d, idx) => (
              <div key={idx} className="mb-trainer-head">
                <div>{d.toLocaleDateString([], { weekday: "short" })}</div>
                <div className="muted small">
                  {d.toLocaleDateString([], { month: "short", day: "numeric" })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BODY (CONTAINED SCROLLER) */}
      <div className="mb-sched-body mb-sched-body-scroll" ref={bodyScrollRef}>
        <div className="mb-time-col">
          {slots.map((d, i) => (
            <div key={i} className="mb-time-row" style={{ height: 44 }}>
              {d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
            </div>
          ))}
        </div>

        <div className="mb-trainer-cols" style={gridStyle}>
          {weekDays.map((day, idx) => (
            <WeekDayCol key={idx} day={day} slots={slots} appts={appts} onDelete={onDelete} onCreate={onCreate} />
          ))}
        </div>
      </div>
    </div>
  );
}

function WeekDayCol({ day, slots, appts, onDelete, onCreate }) {
  const rowH = 44;
  const slotMs = slots?.[1] ? slots[1].getTime() - slots[0].getTime() : 30 * 60_000;
  const slotMins = Math.max(1, Math.round(slotMs / 60000));

  const dayStart = useMemo(() => {
    const d = new Date(day);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [day]);

  const dayEnd = useMemo(() => {
    const d = new Date(dayStart);
    d.setDate(d.getDate() + 1);
    return d;
  }, [dayStart]);

  // Fast mapping: "HH:MM" => index
  const timeIndex = useMemo(() => {
    const map = new Map();
    for (let i = 0; i < slots.length; i++) {
      const key = `${slots[i].getHours()}:${slots[i].getMinutes()}`;
      map.set(key, i);
    }
    return map;
  }, [slots]);

  const dayAppts = useMemo(() => {
    return (appts ?? [])
      .map((a) => {
        const s = normalizeDate(getApptStart(a));
        const e = normalizeDate(getApptEnd(a));
        if (!s || !e) return null;
        return { ...a, __s: s, __e: e };
      })
      .filter(Boolean)
      .filter((a) => a.__s >= dayStart && a.__s < dayEnd);
  }, [appts, dayStart, dayEnd]);

  function yFor(date) {
    const key = `${date.getHours()}:${date.getMinutes()}`;
    const idx = timeIndex.get(key);
    return idx == null ? 0 : idx * rowH;
  }

  function heightFor(start, end) {
    const mins = (end.getTime() - start.getTime()) / 60000;
    return Math.max(32, (mins / slotMins) * rowH);
  }

  return (
    <div className="mb-col" style={{ minHeight: slots.length * rowH }}>
      {slots.map((s, i) => {
        const start = new Date(day);
        start.setHours(s.getHours(), s.getMinutes(), 0, 0);

        return (
          <div key={i} className="mb-slot-line" style={{ height: rowH }} onClick={() => onCreate(start)} title="Click to schedule" />
        );
      })}

      {dayAppts.map((a) => {
        const start = a.__s;
        const end = a.__e;

        const top = yFor(start);
        const h = heightFor(start, end);

        const cls = a.status === "unavailable" ? "appt appt-gray" : "appt appt-blue";

        return (
          <div key={a.appointment_id ?? `${start.toISOString()}`} className={cls} style={{ top, height: h }}>
            <button className="appt-del" type="button" onClick={() => onDelete(a.appointment_id)}>
              ✕
            </button>

            <div className="appt-inner">
              <div className="appt-title">{a.member_name || "Walk-in"}</div>
              <div className="appt-sub">
                {start.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} –{" "}
                {end.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}