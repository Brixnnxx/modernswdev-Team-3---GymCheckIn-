import React from "react";
import { SOON_WINDOW_MIN } from "./dashboardHelpers";

export default function DashboardNowNext({
  nowNext,
  appointmentsSoonCount,
  onOpenAppointments,
  onCheckin,
  onFindMember,
  formatDateRange,
}) {
  return nowNext ? (
    <div className="now-next">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: 16 }}>
            {nowNext.member_name || "Walk-in"} • {nowNext.category || "Appointment"}
          </div>

          <div className="muted small" style={{ marginTop: 2 }}>
            {formatDateRange(nowNext.start, nowNext.end)}
            {nowNext.trainer_name ? ` • Trainer: ${nowNext.trainer_name}` : ""}
          </div>

          {nowNext.status ? <div className="muted small">Status: {String(nowNext.status)}</div> : null}
        </div>

        <span className={`badge ${nowNext.kind === "now" ? "badge-ok" : "badge-warn"}`}>
          {nowNext.kind === "now" ? "Happening now" : "Next up"}
        </span>
      </div>

      <div className="row gap" style={{ marginTop: 12, flexWrap: "wrap" }}>
        <button className="btn" type="button" onClick={onOpenAppointments}>
          Open Appointments
        </button>
        <button className="btn btn-secondary" type="button" onClick={onCheckin}>
          Check-In
        </button>
        <button className="btn btn-ghost" type="button" onClick={onFindMember}>
          Find Member
        </button>
      </div>

      {appointmentsSoonCount ? (
        <div className="muted small" style={{ marginTop: 10 }}>
          <b>{appointmentsSoonCount}</b> appointment(s) starting within the next {SOON_WINDOW_MIN} minutes.
        </div>
      ) : null}
    </div>
  ) : (
    <div className="muted">No scheduled appointments coming up.</div>
  );
}