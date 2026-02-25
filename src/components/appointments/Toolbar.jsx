// src/pages/appointments/Toolbar.jsx
import React, { useMemo } from "react";
import { SERVICE_CATEGORIES, addDays, goToday } from "./utils";

/**
 * Toolbar (best-practice notes)
 * - Single "View" dropdown (Daily/Weekly) replaces toggle buttons
 * - Trainer filter uses a stable value (worker_id as string) to avoid mismatches
 * - Weekly trainer dropdown only appears in weekly mode
 * - Prev/Next buttons move by 1 day or 7 days depending on view
 */
export default function Toolbar({
  mode,
  setMode,
  dayDate,
  setDayDate,
  weekAnchor,
  setWeekAnchor,
  headerDateLabel,
  trainers,
  serviceFilter,
  setServiceFilter,
  trainerFilter,
  setTrainerFilter,
  weeklyTrainerId,
  setWeeklyTrainerId,
}) {
  const trainerOptions = useMemo(() => {
    const list = trainers ?? [];
    return list.map((t) => ({
      id: String(t.worker_id),
      label: `${t.first_name ?? ""} ${t.last_name ?? ""}`.trim() || `Trainer ${t.worker_id}`,
    }));
  }, [trainers]);

  const viewValue = mode === "week" ? "weekly" : "daily";

  function onPrev() {
    if (mode === "day") setDayDate(addDays(dayDate, -1));
    else setWeekAnchor(addDays(weekAnchor, -7));
  }

  function onNext() {
    if (mode === "day") setDayDate(addDays(dayDate, 1));
    else setWeekAnchor(addDays(weekAnchor, 7));
  }

  function onChangeView(e) {
    const next = e.target.value === "weekly" ? "week" : "day";
    setMode(next);
  }

  return (
    <div className="mb-toolbar">
      <div className="mb-toolbar-left">
        <button
          className="btn btn-secondary"
          type="button"
          onClick={() => goToday(mode, setDayDate, setWeekAnchor)}
        >
          Today
        </button>

        <button className="btn btn-secondary" type="button" onClick={onPrev} title="Prev">
          ◀
        </button>

        <button className="btn btn-secondary" type="button" onClick={onNext} title="Next">
          ▶
        </button>

        <div className="mb-date-label">{headerDateLabel}</div>
      </div>

      <div className="mb-toolbar-right">
        {/* ✅ View dropdown: Daily / Weekly */}
        <label className="muted small" style={{ display: "grid", gap: 4 }}>
          View
          <div className="mb-select-wrap">
            <select
              className="select"
              value={viewValue}
              onChange={onChangeView}
              aria-label="Select calendar view"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
            <span className="mb-select-caret" aria-hidden="true">
              ▾
            </span>
          </div>
        </label>

        {/* Service category filter */}
        <select className="select" value={serviceFilter} onChange={(e) => setServiceFilter(e.target.value)}>
          {SERVICE_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* Trainer filter (use worker_id as value for consistency) */}
        <select
          className="select"
          value={String(trainerFilter ?? "All instructors")}
          onChange={(e) => setTrainerFilter(e.target.value)}
          title="All instructors"
        >
          <option value="All instructors">All instructors</option>
          {trainerOptions.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>

        {/* Weekly trainer pick only in weekly mode */}
        {mode === "week" ? (
          <select
            className="select"
            value={weeklyTrainerId != null ? String(weeklyTrainerId) : ""}
            onChange={(e) => setWeeklyTrainerId(e.target.value ? Number(e.target.value) : null)}
            title="Week view trainer"
          >
            {trainerOptions.map((t) => (
              <option key={t.id} value={t.id}>
                Week view: {t.label}
              </option>
            ))}
          </select>
        ) : null}
      </div>
    </div>
  );
}
