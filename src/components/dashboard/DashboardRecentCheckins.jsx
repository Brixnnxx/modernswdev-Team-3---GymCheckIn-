import React from "react";

export default function DashboardRecentCheckins({
  recentCheckins,
  onOpenCheckin,
  parseCheckinLabel,
  formatTimeCompact,
}) {
  return (
    <>
      <div className="row space">
        <h2 style={{ margin: 0 }}>Recent Check-ins</h2>
        <button className="btn btn-ghost" type="button" onClick={onOpenCheckin}>
          Open Check-In
        </button>
      </div>

      <div className="divider" />

      {recentCheckins.length ? (
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {recentCheckins.map((c, idx) => {
            const parsed = parseCheckinLabel(c?.label);
            return (
              <li key={c.checkin_id ?? idx} style={{ marginBottom: 10 }}>
                <div style={{ fontWeight: 900 }}>
                  {parsed?.name ? parsed.name : c.member_name ? c.member_name : "Check-in"}
                </div>
                <div className="muted small">
                  {parsed?.member_id ? `Member ID: ${parsed.member_id} • ` : ""}
                  {formatTimeCompact(c.time || c.created_at)}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="muted">No check-ins yet.</div>
      )}
    </>
  );
}