import React from "react";
import { STEP_MIN, SLOT_PX, minutesBetween, formatTime } from "./utils";

export default function AppointmentBlock({ appt, onDelete, dayStart }) {
  const start = new Date(appt.start);
  const end = new Date(appt.end);

  const minsFromStart = minutesBetween(
    new Date(start.getFullYear(), start.getMonth(), start.getDate(), dayStart.getHours(), dayStart.getMinutes(), 0),
    start
  );

  const durMin = Math.max(15, minutesBetween(start, end));
  const top = (minsFromStart / STEP_MIN) * SLOT_PX;
  const height = (durMin / STEP_MIN) * SLOT_PX;

  const cls =
    appt.status === "unavailable"
      ? "appt appt-gray"
      : appt.confirmed || appt.arrived
      ? "appt appt-green"
      : "appt appt-blue";

  return (
    <div className={cls} style={{ top, height }} title={`${appt.member_name}\n${formatTime(start)}–${formatTime(end)}`}>
      <div className="appt-inner">
        <div className="appt-title">
          {formatTime(start)} — {appt.category || "Appointment"}
        </div>
        <div className="appt-sub">{appt.member_name || "Walk-in"}</div>
      </div>

      <button
        className="appt-del"
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(appt.appointment_id);
        }}
      >
        ✕
      </button>
    </div>
  );
}
