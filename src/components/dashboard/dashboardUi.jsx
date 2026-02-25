// src/components/dashboard/dashboardUi.js
import React from "react";

export function Panel({ children }) {
  return <div className="panel">{children}</div>;
}

export function Header({ title, right }) {
  return (
    <div className="row space">
      <h2 style={{ margin: 0 }}>{title}</h2>
      {right}
    </div>
  );
}

export function Divider() {
  return <div className="divider" />;
}

export function QuickActions({ onNewMember, onMembers, onCheckin, onPOS, onAppointments }) {
  return (
    <div className="row gap" style={{ flexWrap: "wrap" }}>
      <button className="btn" type="button" onClick={onNewMember}>
        + New Member
      </button>
      <button className="btn btn-secondary" type="button" onClick={onMembers}>
        View Members
      </button>
      <button className="btn btn-secondary" type="button" onClick={onCheckin}>
        Check-In
      </button>
      <button className="btn btn-secondary" type="button" onClick={onPOS}>
        POS
      </button>
      <button className="btn btn-secondary" type="button" onClick={onAppointments}>
        Appointments
      </button>
    </div>
  );
}

export function StatCard({ label, value, hint }) {
  return (
    <div className="stat" style={{ minHeight: 78 }}>
      <div className="muted">{label}</div>
      <div className="big">{value}</div>
      {hint ? <div className="muted small">{hint}</div> : null}
    </div>
  );
}

export function MiniMetric({ title, value, hint, onClick }) {
  return (
    <button
      type="button"
      className="btn btn-secondary"
      style={{ justifyContent: "space-between", textAlign: "left" }}
      onClick={onClick}
    >
      <div>
        <div style={{ fontWeight: 900 }}>{title}</div>
        {hint ? <div className="muted small">{hint}</div> : null}
      </div>
      <span className="badge badge-warn">{value}</span>
    </button>
  );
}