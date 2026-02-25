import React, { useEffect, useMemo, useState } from "react";
import { addMonths, buildMonthGrid, isSameDay } from "./utils";

export default function MiniMonthCalendar({ value, onPick }) {
  const [cursor, setCursor] = useState(() => new Date(value.getFullYear(), value.getMonth(), 1));

  useEffect(() => {
    setCursor(new Date(value.getFullYear(), value.getMonth(), 1));
  }, [value]);

  const days = useMemo(() => buildMonthGrid(cursor), [cursor]);

  return (
    <div className="mini-cal">
      <div className="mini-cal-head">
        <button className="mini-cal-nav" type="button" onClick={() => setCursor(addMonths(cursor, -1))}>
          ◀
        </button>
        <div className="mini-cal-title">{cursor.toLocaleDateString([], { month: "short", year: "numeric" })}</div>
        <button className="mini-cal-nav" type="button" onClick={() => setCursor(addMonths(cursor, 1))}>
          ▶
        </button>
      </div>

      <div className="mini-cal-dow">
        {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
          <div key={d} className="mini-cal-dow-cell">{d}</div>
        ))}
      </div>

      <div className="mini-cal-grid">
        {days.map((d, i) => {
          const isCurMonth = d.getMonth() === cursor.getMonth();
          const isSelected = isSameDay(d, value);
          return (
            <button
              key={i}
              className={`mini-cal-cell ${isCurMonth ? "" : "dim"} ${isSelected ? "sel" : ""}`}
              type="button"
              onClick={() => onPick(d)}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
