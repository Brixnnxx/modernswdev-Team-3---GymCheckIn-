import React from "react";

export default function DashboardTrainerWorkload({ trainerLoad }) {
  return (
    <>
      {trainerLoad.length ? (
        <div style={{ display: "grid", gap: 10 }}>
          {trainerLoad.slice(0, 6).map((t) => (
            <div key={t.key} className="workload-row">
              <div style={{ fontWeight: 900 }}>{t.name}</div>
              <div className="muted small">{t.count} appt(s) today</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="muted">No trainer workload data yet.</div>
      )}

      <div className="divider" />

      <div className="muted small">
        Tip: This uses appointments with trainer/worker IDs. If your appointment objects don’t include trainerId yet,
        add it and this will instantly become useful.
      </div>
    </>
  );
}