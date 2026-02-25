import React from "react";

export default function DashboardUpcoming({
  upcomingAppointments,
  showAllUpcoming,
  onToggleShowAll,
  onManage,
  formatDateRange,
}) {
  return (
    <>
      <div className="row space">
        <h2 style={{ margin: 0 }}>Upcoming Appointments</h2>
        <div className="row gap">
          <button className="btn btn-ghost" type="button" onClick={onToggleShowAll}>
            {showAllUpcoming ? "Show less" : "Show more"}
          </button>
          <button className="btn btn-ghost" type="button" onClick={onManage}>
            Manage
          </button>
        </div>
      </div>

      <div className="divider" />

      {upcomingAppointments?.length ? (
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {upcomingAppointments.map((a) => (
            <li key={a.appointment_id ?? `${a.start}-${a.end}`} style={{ marginBottom: 10 }}>
              <div style={{ fontWeight: 900 }}>
                {a.member_name || "Walk-in"} • {a.category || "Appointment"}
              </div>
              <div className="muted small">
                {formatDateRange(a.start, a.end)} {a.status ? `• ${String(a.status)}` : ""}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="muted">No upcoming appointments.</div>
      )}
    </>
  );
}