// src/components/appointments/DayView.jsx
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

export default function DayView({
  slots,
  trainers,
  apptsByTrainer,
  onDelete,
  onCreate,
  onCreateUnavailable,
}) {
  const bodyScrollRef = useRef(null);
  const headScrollRef = useRef(null);

  // sync header horizontal scroll with body
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

  const colCount = trainers.length || 1;

  const gridStyle = useMemo(
    () => ({
      gridTemplateColumns: `repeat(${colCount}, minmax(220px, 1fr))`,
      minWidth: `${colCount * 220}px`,
    }),
    [colCount]
  );

  return (
    <div className="mb-sched">
      {/* HEADER (trainer names) */}
      <div className="mb-sched-head">
        <div className="mb-time-head" />
        <div className="mb-trainer-scrollhead" ref={headScrollRef}>
          <div className="mb-trainer-head-row" style={gridStyle}>
            {trainers.map((t) => (
              <div key={t.worker_id} className="mb-trainer-head">
                <div>
                  {t.first_name} {t.last_name}
                </div>
                <div className="muted small">Trainer</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BODY (CONTAINED SCROLLER) */}
      <div className="mb-sched-body mb-sched-body-scroll" ref={bodyScrollRef}>
        {/* sticky left time column */}
        <div className="mb-time-col">
          {slots.map((d, i) => (
            <div key={i} className="mb-time-row" style={{ height: 44 }}>
              {d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
            </div>
          ))}
        </div>

        {/* trainer columns */}
        <div className="mb-trainer-cols" style={gridStyle}>
          {trainers.map((t) => (
            <DayColumn
              key={t.worker_id}
              trainer={t}
              slots={slots}
              appts={
                // ✅ apptsByTrainer is a Map in your hooks
                apptsByTrainer instanceof Map
                  ? apptsByTrainer.get(t.worker_id) ?? []
                  : apptsByTrainer?.[t.worker_id] ?? []
              }
              onDelete={onDelete}
              onCreate={onCreate}
              onCreateUnavailable={onCreateUnavailable}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function DayColumn({ trainer, slots, appts, onDelete, onCreate, onCreateUnavailable }) {
  const rowH = 44; // must match mb-time-row height
  const slotMs = slots?.[1] ? slots[1].getTime() - slots[0].getTime() : 30 * 60_000; // fallback 30m

  // Build a fast lookup: timestamp -> index
  const slotIndex = useMemo(() => {
    const map = new Map();
    for (let i = 0; i < slots.length; i++) map.set(slots[i].getTime(), i);
    return map;
  }, [slots]);

  function yFor(date) {
    // For day view, your start times should match slots exactly.
    const idx = slotIndex.get(date.getTime());
    return idx == null ? 0 : idx * rowH;
  }

  function heightFor(start, end) {
    const mins = (end.getTime() - start.getTime()) / 60000;
    const slotMins = Math.max(1, Math.round(slotMs / 60000));
    return Math.max(32, (mins / slotMins) * rowH);
  }

  return (
    <div className="mb-col" style={{ minHeight: slots.length * rowH }}>
      {/* slot grid lines + click areas */}
      {slots.map((s, i) => (
        <div
          key={i}
          className="mb-slot-line"
          style={{ height: rowH }}
          onClick={(e) => {
            if (e.shiftKey && onCreateUnavailable) return onCreateUnavailable(trainer.worker_id, s);
            onCreate(trainer.worker_id, s);
          }}
          title="Click to schedule • Shift+Click to block unavailable"
        />
      ))}

      {/* appointments */}
      {(appts ?? []).map((a) => {
        const start = normalizeDate(getApptStart(a));
        const end = normalizeDate(getApptEnd(a));
        if (!start || !end) return null;

        const top = yFor(start);
        const h = heightFor(start, end);

        const cls = a.status === "unavailable" ? "appt appt-gray" : "appt appt-blue";

        return (
          <div key={a.appointment_id ?? `${trainer.worker_id}_${start.toISOString()}`} className={cls} style={{ top, height: h }}>
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