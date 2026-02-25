import React, { useCallback } from "react";
import { SLOT_PX } from "./utils";
import AppointmentBlock from "./AppointmentBlock";

export default function TrainerDayCol({ trainer, slots, height, appts, onCreate, onCreateUnavailable, onDelete, timeFromY }) {
  const handleClick = useCallback(
    (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const start = timeFromY(y);
      if (e.shiftKey) onCreateUnavailable(trainer.worker_id, start);
      else onCreate(trainer.worker_id, start);
    },
    [trainer.worker_id, onCreate, onCreateUnavailable, timeFromY]
  );

  return (
    <div className="mb-col" style={{ height }} onClick={handleClick} role="button" tabIndex={0}>
      {slots.map((s) => (
        <div key={s.toISOString()} className={`mb-slot-line ${s.getMinutes() === 0 ? "hour" : ""}`} style={{ height: SLOT_PX }} />
      ))}

      {appts.map((a) => (
        <AppointmentBlock key={a.appointment_id} appt={a} onDelete={onDelete} dayStart={slots[0]} />
      ))}
    </div>
  );
}
