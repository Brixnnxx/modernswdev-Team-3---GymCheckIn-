import React from "react";
import { SLOT_PX, formatTime } from "./utils";

export default function TimeGutter({ slots, gridHeight }) {
  return (
    <div className="mb-time-col" style={{ height: gridHeight }}>
      {slots.map((s) => (
        <div key={s.toISOString()} className={`mb-time-row ${s.getMinutes() === 0 ? "hour" : ""}`} style={{ height: SLOT_PX }}>
          {formatTime(s)}
        </div>
      ))}
    </div>
  );
}
