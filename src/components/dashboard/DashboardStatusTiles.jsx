// src/components/dashboard/DashboardStatusTiles.jsx
import React from "react";

export default function DashboardStatusTiles({ memberStatus, onActive, onFrozen, onInactive, onOther }) {
  return (
    <div className="kv" style={{ gap: 10 }}>
      <button type="button" className="btn btn-secondary" style={{ justifyContent: "space-between", textAlign: "left" }} onClick={onActive}>
        <div>
          <div className="muted">Active</div>
          <div className="big">{memberStatus.active}</div>
        </div>
        <span className="badge badge-ok">View</span>
      </button>

      <button type="button" className="btn btn-secondary" style={{ justifyContent: "space-between", textAlign: "left" }} onClick={onFrozen}>
        <div>
          <div className="muted">Frozen</div>
          <div className="big">{memberStatus.frozen}</div>
        </div>
        <span className="badge badge-warn">View</span>
      </button>

      <button type="button" className="btn btn-secondary" style={{ justifyContent: "space-between", textAlign: "left" }} onClick={onInactive}>
        <div>
          <div className="muted">Inactive</div>
          <div className="big">{memberStatus.inactive}</div>
        </div>
        <span className="badge badge-bad">View</span>
      </button>

      <button type="button" className="btn btn-secondary" style={{ justifyContent: "space-between", textAlign: "left" }} onClick={onOther}>
        <div>
          <div className="muted">Other</div>
          <div className="big">{memberStatus.other}</div>
        </div>
        <span className="badge">View</span>
      </button>
    </div>
  );
}