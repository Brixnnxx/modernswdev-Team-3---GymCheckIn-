import React, { useCallback, useEffect, useMemo, useState } from "react";
import Sidebar from "./Sidebar";
import Toolbar from "./Toolbar";
import DayView from "./DayView";
import WeekView from "./WeekView";
import "./appointments.css";

import {
  DEFAULT_BLOCK_MIN,
  buildTimeSlots,
  buildWeekDays,
  cryptoId,
  formatDateShort,
  formatHeaderDate,
  rangesOverlap,
  startOfDay,
} from "./utils";

import { useDayApptsByTrainer, useFilteredTrainers, useWeekApptsForTrainer } from "./hooks";

export default function AppointmentsView({ state, setState }) {
  const trainers = state?.trainers ?? [];
  const appointments = state?.appointments ?? [];
  const members = state?.members ?? [];

  const [mode, setMode] = useState("day");
  const [dayDate, setDayDate] = useState(() => startOfDay(new Date()));
  const [weekAnchor, setWeekAnchor] = useState(() => startOfDay(new Date()));
  const [weeklyTrainerId, setWeeklyTrainerId] = useState(() => trainers?.[0]?.worker_id ?? null);

  const [serviceFilter, setServiceFilter] = useState("All service categories");
  const [trainerFilter, setTrainerFilter] = useState("All instructors");

  const [pendingSlot, setPendingSlot] = useState(null);

  const daySlots = useMemo(() => buildTimeSlots(dayDate), [dayDate]);
  const weekDays = useMemo(() => buildWeekDays(weekAnchor), [weekAnchor]);
  const weekSlots = useMemo(() => buildTimeSlots(weekDays[0]), [weekDays]);

  const filteredTrainers = useFilteredTrainers(trainers, trainerFilter);

  // ✅ Normalize any older appointment objects so views/hooks always work
  useEffect(() => {
    const needsNormalize = (appointments ?? []).some(
      (a) =>
        (a && a.trainerId != null) ||
        (a && a.start != null) ||
        (a && a.end != null)
    );
    if (!needsNormalize) return;

    setState((s) => {
      const normalized = (s.appointments ?? []).map((a) => normalizeAppointment(a));
      return { ...s, appointments: normalized };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dayApptsByTrainer = useDayApptsByTrainer({
    trainers,
    appointments,
    dayDate,
    serviceFilter,
  });

  const weekApptsForTrainer = useWeekApptsForTrainer({
    appointments,
    weeklyTrainerId,
    weekDays,
    serviceFilter,
  });

  const headerDateLabel = useMemo(() => {
    if (mode === "day") return formatHeaderDate(dayDate);
    return `Week of ${formatDateShort(weekDays[0])} → ${formatDateShort(weekDays[6])}`;
  }, [mode, dayDate, weekDays]);

  useEffect(() => {
    if (!weeklyTrainerId && trainers.length) setWeeklyTrainerId(trainers[0].worker_id);
  }, [weeklyTrainerId, trainers]);

  useEffect(() => {
    setPendingSlot(null);
  }, [mode, dayDate, weekAnchor]);

  const addAppointment = useCallback(
    ({ trainerId, start, end, category, memberId }) => {
      if (!trainerId || !start || !end) return;

      const workerId = Number(trainerId);

      // ✅ only compare appointments for THIS trainer (worker_id)
      const existingForTrainer = (appointments ?? []).filter(
        (a) => Number(a.worker_id) === workerId
      );

      const overlaps = existingForTrainer.some((a) =>
        rangesOverlap(
          new Date(a.appointment_start),
          new Date(a.appointment_end),
          start,
          end
        )
      );

      if (overlaps) {
        alert("That time overlaps an existing appointment for this trainer.");
        return;
      }

      const member =
        memberId != null
          ? members.find((m) => Number(m.member_id) === Number(memberId)) || null
          : null;

      const isUnavailable = category === "Unavailable";

      const newAppt = {
        appointment_id: cryptoId(),
        worker_id: workerId, // ✅ DB-style
        member_id: member?.member_id ?? null,
        member_name: member ? `${member.first_name} ${member.last_name}` : "Walk-in",
        appointment_start: start.toISOString(), // ✅ DB-style
        appointment_end: end.toISOString(),     // ✅ DB-style
        status: isUnavailable ? "unavailable" : "scheduled",
        confirmed: false,
        arrived: false,
        category:
          category ||
          (member ? "Private Member Appointments" : "Private Non-Member Appts"),
        notes: "",
      };

      setState((s) => ({
        ...s,
        appointments: [...(s.appointments ?? []).map(normalizeAppointment), newAppt],
      }));
    },
    [appointments, members, setState]
  );

  const deleteAppointment = useCallback(
    (appointment_id) => {
      setState((s) => ({
        ...s,
        appointments: (s.appointments ?? []).filter((a) => a.appointment_id !== appointment_id),
      }));
    },
    [setState]
  );

  const onPickCalendarDate = useCallback(
    (d) => {
      if (mode === "day") setDayDate(startOfDay(d));
      else setWeekAnchor(startOfDay(d));
    },
    [mode]
  );

  return (
    <div className="mb-wrap">
      <Sidebar
        mode={mode}
        dayDate={dayDate}
        weekAnchor={weekAnchor}
        onPick={onPickCalendarDate}
        pendingSlot={pendingSlot}
        members={members}
        trainers={trainers}
        onCancelSlot={() => setPendingSlot(null)}
        onConfirmSlot={({ memberId, duration }) => {
          if (!pendingSlot) return;

          const { trainerId, start } = pendingSlot;
          const end = new Date(start.getTime() + duration * 60_000);

          addAppointment({
            trainerId,
            start,
            end,
            category: memberId ? "Private Member Appointments" : "Private Non-Member Appts",
            memberId,
          });

          setPendingSlot(null);
        }}
      />

      <section className="mb-main">
        <Toolbar
          mode={mode}
          setMode={setMode}
          dayDate={dayDate}
          setDayDate={setDayDate}
          weekAnchor={weekAnchor}
          setWeekAnchor={setWeekAnchor}
          headerDateLabel={headerDateLabel}
          trainers={trainers}
          serviceFilter={serviceFilter}
          setServiceFilter={setServiceFilter}
          trainerFilter={trainerFilter}
          setTrainerFilter={setTrainerFilter}
          weeklyTrainerId={weeklyTrainerId}
          setWeeklyTrainerId={setWeeklyTrainerId}
        />

        {mode === "day" ? (
          <DayView
            slots={daySlots}
            trainers={filteredTrainers}
            apptsByTrainer={dayApptsByTrainer}
            onDelete={deleteAppointment}
            onCreate={(trainerId, start) => setPendingSlot({ trainerId, start })}
            onCreateUnavailable={(trainerId, start) => {
              const end = new Date(start.getTime() + 90 * 60_000);
              addAppointment({ trainerId, start, end, category: "Unavailable" });
            }}
          />
        ) : (
          <WeekView
            weekDays={weekDays}
            slots={weekSlots}
            trainerId={weeklyTrainerId}
            appts={weekApptsForTrainer}
            onDelete={deleteAppointment}
            onCreate={(start) => setPendingSlot({ trainerId: weeklyTrainerId, start })}
          />
        )}
      </section>
    </div>
  );
}

/** ✅ Converts any older shape to the DB-style shape */
function normalizeAppointment(a) {
  if (!a) return a;

  // already normalized
  if (a.worker_id != null && a.appointment_start && a.appointment_end) return a;

  const worker_id = a.worker_id ?? a.trainerId ?? a.trainer_id ?? null;
  const appointment_start = a.appointment_start ?? a.start ?? null;
  const appointment_end = a.appointment_end ?? a.end ?? null;

  return {
    ...a,
    worker_id: worker_id != null ? Number(worker_id) : null,
    appointment_start,
    appointment_end,
  };
}