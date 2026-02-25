import React, { useEffect, useMemo, useState } from "react";
import MiniMonthCalendar from "./MiniMonthCalendar";
import MemberSearch from "../members/MemberSearch";

export default function Sidebar({
  mode,
  dayDate,
  weekAnchor,
  onPick,

  pendingSlot,
  members,
  trainers,
  onConfirmSlot,
  onCancelSlot,
}) {
  const [pickedMember, setPickedMember] = useState(null); // store full member for nice display
  const [duration, setDuration] = useState(30);

  useEffect(() => {
    if (pendingSlot) {
      setPickedMember(null);
      setDuration(30);
    }
  }, [pendingSlot]);

  const trainerName = useMemo(() => {
    if (!pendingSlot?.trainerId) return "";
    const t = (trainers ?? []).find((x) => Number(x.worker_id) === Number(pendingSlot.trainerId));
    return t ? `${t.first_name} ${t.last_name}` : "";
  }, [pendingSlot, trainers]);

  const slotLabel = useMemo(() => {
    if (!pendingSlot?.start) return "";
    const d = new Date(pendingSlot.start);
    return d.toLocaleString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }, [pendingSlot]);

  const canSchedule = Boolean(pendingSlot) && [30, 45, 60].includes(Number(duration));

  return (
    <aside className="mb-left">
      <div className="mb-mini-cal">
        <MiniMonthCalendar value={mode === "day" ? dayDate : weekAnchor} onPick={onPick} />
      </div>

      <div className="mb-slot-form">
        {!pendingSlot ? (
          <>
            <div className="mb-slot-form-title">Schedule</div>
            <div className="muted small">Click a time slot to schedule an appointment.</div>
          </>
        ) : (
          <>
            <div className="mb-slot-form-title">Schedule this slot</div>

            <div className="muted small" style={{ marginBottom: 10 }}>
              {trainerName ? (
                <>
                  <div>
                    <strong>Trainer:</strong> {trainerName}
                  </div>
                  <div>
                    <strong>Time:</strong> {slotLabel}
                  </div>
                </>
              ) : (
                <div>
                  <strong>Time:</strong> {slotLabel}
                </div>
              )}
            </div>

            <label className="small" style={{ display: "block", marginTop: 10 }}>
              Who is this for?
            </label>

            {/* ✅ Searchable member picker */}
            <MemberSearch
              members={members}
              onPick={(m) => setPickedMember(m)}
              placeholder="Search member name, phone, email, code…"
            />

            {/* Selected pill */}
            <div style={{ marginTop: 8 }}>
              {pickedMember ? (
                <div className="muted small">
                  Selected:{" "}
                  <b>
                    {pickedMember.first_name} {pickedMember.last_name}
                  </b>{" "}
                  (ID: {pickedMember.member_id})
                  <button
                    type="button"
                    className="btn btn-ghost"
                    style={{ marginLeft: 8 }}
                    onClick={() => setPickedMember(null)}
                  >
                    Clear
                  </button>
                </div>
              ) : (
                <div className="muted small">No member selected → this will be a Walk-in / Non-member appt.</div>
              )}
            </div>

            <label className="small" style={{ display: "block", marginTop: 12 }}>
              Duration
            </label>

            <div className="row gap" style={{ marginTop: 6 }}>
              {[30, 45, 60].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  className={`chip ${Number(duration) === mins ? "active" : ""}`}
                  onClick={() => setDuration(mins)}
                >
                  {mins} min
                </button>
              ))}
            </div>

            <div className="row gap" style={{ marginTop: 12 }}>
              <button
                className="btn"
                type="button"
                disabled={!canSchedule}
                onClick={() =>
                  onConfirmSlot({
                    memberId: pickedMember ? Number(pickedMember.member_id) : null,
                    duration: Number(duration),
                  })
                }
              >
                Schedule
              </button>

              <button className="btn btn-secondary" type="button" onClick={onCancelSlot}>
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
