import { useMemo } from "react";
import { isSameDay, isInWeek } from "./utils";

/**
 * Helpers: support BOTH old shape (trainerId/start/end)
 * and new DB-style shape (worker_id/appointment_start/appointment_end)
 * so the UI works during migration.
 */
function getTrainerId(a) {
  const id = a?.worker_id ?? a?.trainerId ?? a?.trainer_id ?? null;
  return id == null ? null : Number(id);
}

function getStart(a) {
  return a?.appointment_start ?? a?.start ?? null;
}

function getEnd(a) {
  return a?.appointment_end ?? a?.end ?? null;
}

function isUnavailable(a) {
  const cat = String(a?.category ?? "").trim().toLowerCase();
  const status = String(a?.status ?? "").trim().toLowerCase();
  return status === "unavailable" || cat === "unavailable";
}

function passesServiceFilter(a, serviceFilter) {
  if (serviceFilter === "All service categories") return true;

  const cat = String(a?.category ?? "").trim();

  if (serviceFilter === "Unavailable") {
    return isUnavailable(a);
  }

  return cat === serviceFilter;
}

export function useFilteredTrainers(trainers, trainerFilter) {
  return useMemo(() => {
    if (trainerFilter === "All instructors") return trainers;
    const id = Number(trainerFilter);
    return trainers.filter((t) => Number(t.worker_id) === id);
  }, [trainers, trainerFilter]);
}

export function useDayApptsByTrainer({ trainers, appointments, dayDate, serviceFilter }) {
  return useMemo(() => {
    const map = new Map();

    // Always create a bucket for each trainer (so columns always exist)
    for (const t of trainers) map.set(Number(t.worker_id), []);

    for (const a of appointments ?? []) {
      const startIso = getStart(a);
      const trainerId = getTrainerId(a);

      if (!startIso || trainerId == null) continue;

      const s = new Date(startIso);
      if (Number.isNaN(s.getTime())) continue;

      if (!isSameDay(s, dayDate)) continue;
      if (!passesServiceFilter(a, serviceFilter)) continue;

      if (!map.has(trainerId)) map.set(trainerId, []);
      map.get(trainerId).push(a);
    }

    // sort by start time per trainer bucket
    for (const [k, list] of map.entries()) {
      list.sort((x, y) => new Date(getStart(x)) - new Date(getStart(y)));
      map.set(k, list);
    }

    return map;
  }, [appointments, trainers, dayDate, serviceFilter]);
}

export function useWeekApptsForTrainer({ appointments, weeklyTrainerId, weekDays, serviceFilter }) {
  return useMemo(() => {
    const id = weeklyTrainerId == null ? null : Number(weeklyTrainerId);
    if (!id) return [];

    return (appointments ?? [])
      .filter((a) => {
        const trainerId = getTrainerId(a);
        if (trainerId !== id) return false;

        const startIso = getStart(a);
        if (!startIso) return false;

        const d = new Date(startIso);
        if (Number.isNaN(d.getTime())) return false;

        if (!isInWeek(d, weekDays[0], weekDays[6])) return false;
        if (!passesServiceFilter(a, serviceFilter)) return false;

        return true;
      })
      .slice()
      .sort((x, y) => new Date(getStart(x)) - new Date(getStart(y)));
  }, [appointments, weeklyTrainerId, weekDays, serviceFilter]);
}