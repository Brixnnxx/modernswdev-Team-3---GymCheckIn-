import React from "react";

export default function DashboardAlerts({ alerts = [] }) {
  if (!alerts.length) {
    return <div className="muted">No alerts right now.</div>;
  }

  return (
    <div style={{ display: "grid", gap: 10 }}>
      {alerts.map((a) => (
        <div key={a.key} className="alert-card">
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 900 }}>{a.label}</div>
              {a.sub ? <div className="muted small">{a.sub}</div> : null}
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span className={`badge ${a.badgeClass || "badge-warn"}`}>{a.value}</span>
              <button className="btn btn-secondary" type="button" onClick={a.onClick}>
                View
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}