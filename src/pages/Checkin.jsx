import React, { useEffect, useMemo, useRef, useState } from "react";
import MemberAvatar from "../components/members/MemberAvatar";

const DISPLAY_MS = 20000;
const RECENT_MAX = 8;

export default function Checkin({ state, setState }) {
  const members = state?.members ?? [];
  const checkins = state?.checkins ?? [];

  // Always-visible scan bar
  const [entry, setEntry] = useState("");

  // Queue of scan entries (strings)
  const [queue, setQueue] = useState([]);

  // Most recent displayed member card
  const [current, setCurrent] = useState(null);

  // Previous cards pushed down here
  // items: { member, message, error, atIso }
  const [recentCards, setRecentCards] = useState([]);

  // UI feedback (for current only)
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const inputRef = useRef(null);
  const clearTimerRef = useRef(null);

  // Focus on load
  useEffect(() => {
    inputRef.current?.focus();
    return () => {
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
    };
  }, []);

  const currentCheckInfo = useMemo(() => {
    if (!current) return { hasToday: false, lastText: "—" };

    const memberId = current.member_id;

    const logs = (checkins ?? [])
      .filter((c) => typeof c?.label === "string" && c.label.includes(`member_id:${memberId}`))
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

    const last = logs.length ? logs[logs.length - 1] : null;

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    const hasToday = logs.some((c) => {
      const t = new Date(c.time).getTime();
      return Number.isFinite(t) && t >= startOfDay;
    });

    return {
      hasToday,
      lastText: last ? new Date(last.time).toLocaleString() : "No check-ins yet",
    };
  }, [current, checkins]);

  function resetDisplayTimer() {
    if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
    clearTimerRef.current = setTimeout(() => {
      clearCurrentCardOnly();
    }, DISPLAY_MS);
  }

  function clearCurrentCardOnly() {
    setCurrent(null);
    setError("");
    setMessage("");
    setEntry("");
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function findMemberByIdString(raw) {
    const q = String(raw || "").trim();
    if (!q) return null;
    if (!/^\d+$/.test(q)) return null;
    const id = Number(q);
    return members.find((m) => Number(m.member_id) === id) || null;
  }

  function statusCardClass(status) {
    const s = String(status || "").toLowerCase();
    if (s === "active") return "status-active";
    if (s === "frozen") return "status-frozen";
    return "status-bad";
  }

  function canCheckIn(m) {
    return String(m?.status || "").toLowerCase() === "active";
  }

  function alreadyCheckedInToday(memberId) {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    return (checkins ?? []).some((c) => {
      if (typeof c?.label !== "string") return false;
      if (!c.label.includes(`member_id:${memberId}`)) return false;
      const t = new Date(c.time).getTime();
      return Number.isFinite(t) && t >= startOfDay;
    });
  }

  function finalizeCheckIn(m) {
    const status = String(m.status || "").toLowerCase();

    if (status !== "active") {
      return { ok: false, msg: `Blocked: member status is "${m.status}".` };
    }

    if (alreadyCheckedInToday(m.member_id)) {
      return { ok: true, msg: "Already checked in today." };
    }

    const nowIso = new Date().toISOString();
    const label = `CHECKIN member_id:${m.member_id} name:${m.first_name} ${m.last_name}`;

    setState((prev) => ({
      ...prev,
      checkins: [...(prev.checkins ?? []), { label, time: nowIso }],
    }));

    return { ok: true, msg: "Checked in successfully ✅" };
  }

  // Queue processor
  useEffect(() => {
    if (!queue.length) return;

    const next = queue[0];
    setQueue((q) => q.slice(1));

    setError("");
    setMessage("");

    const found = findMemberByIdString(next);

    if (!found) {
      const atIso = new Date().toISOString();
      setRecentCards((prev) =>
        [
          {
            member: null,
            atIso,
            error: "Member not found. Enter a numeric Member ID (example: 1).",
            message: "",
          },
          ...prev,
        ].slice(0, RECENT_MAX)
      );
      resetDisplayTimer();
      return;
    }

    const atIso = new Date().toISOString();

    // push current down into recent feed (if exists)
    setRecentCards((prev) => {
      const pushed = current
        ? [
            {
              member: current,
              atIso,
              error,
              message,
            },
            ...prev,
          ]
        : [...prev];

      return pushed.slice(0, RECENT_MAX);
    });

    // set new current + finalize
    setCurrent(found);

    const result = finalizeCheckIn(found);
    setMessage(result.msg);
    setError(result.ok ? "" : result.msg);

    resetDisplayTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queue]);

  function submitScan(e) {
    e.preventDefault();
    const raw = entry.trim();
    if (!raw) return;

    if (!/^\d+$/.test(raw)) {
      const atIso = new Date().toISOString();
      setRecentCards((prev) =>
        [
          {
            member: null,
            atIso,
            error: "Please enter a numeric Member ID (example: 1).",
            message: "",
          },
          ...prev,
        ].slice(0, RECENT_MAX)
      );
      setEntry("");
      setTimeout(() => inputRef.current?.focus(), 0);
      return;
    }

    setQueue((q) => [...q, raw]);
    setEntry("");
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function forceNextNow() {
    clearCurrentCardOnly();
  }

  const photoUrl = String(current?.photo_url ?? "").trim();
  const needsPhoto = current ? !photoUrl : false;

  return (
    <div className="panel">
      <div className="row space">
        <h2 style={{ margin: 0 }}>Check-In</h2>
        <div className="muted small">
          Queue: <b>{queue.length}</b>
        </div>
      </div>

      <div className="divider" />

      {/* ALWAYS VISIBLE CHECK-IN BAR */}
      <form onSubmit={submitScan} className="checkin-bar-inline">
        <div style={{ flex: 1, minWidth: 260 }}>
          <label className="label">Member ID</label>
          <input
            ref={inputRef}
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            placeholder="Type member ID and press Enter..."
          />
          <div className="muted small" style={{ marginTop: 6 }}>
            This bar stays up. New scans become the top card; older ones move down.
          </div>
        </div>

        <button className="btn" type="submit">
          Enter
        </button>

        <button
          className="btn btn-ghost"
          type="button"
          onClick={forceNextNow}
          title="Clear display now"
        >
          Clear Now
        </button>
      </form>

      {(error || message || current || recentCards.length) ? <div className="divider" /> : null}

      {/* CURRENT (MOST RECENT) */}
      {current ? (
        <div className={`checkin-card ${statusCardClass(current.status)}`}>
          <div>
            {/* ✅ Photo or silhouette placeholder */}
            <MemberAvatar
              member={current}
              size={72}
              className="member-photo"
              showNeedsPhotoLabel={false}
            />
          </div>

          <div style={{ minWidth: 0 }}>
            <div className="row space">
              <div style={{ minWidth: 0 }}>
                <div className="big">
                  {current.first_name} {current.last_name}
                </div>

                <div className="muted small">
                  ID: <b>{current.member_id}</b>
                  {needsPhoto ? (
                    <>
                      {" "}
                      • <b>Needs photo</b>
                    </>
                  ) : null}
                </div>
              </div>

              <span className={`badge ${badgeClass(current.status)}`}>{current.status}</span>
            </div>

            <div className="divider" />

            {error ? <div className="alert alert-bad">{error}</div> : null}
            {!error && message ? <div className="alert alert-ok">{message}</div> : null}

            <div className="divider" />

            <div className="kv">
              <div>
                <div className="muted">Phone</div>
                <div>{current.phone || "-"}</div>
              </div>
              <div>
                <div className="muted">Email</div>
                <div>{current.email || "-"}</div>
              </div>
              <div>
                <div className="muted">Checked in today</div>
                <div>{currentCheckInfo.hasToday ? "Yes ✅" : "No"}</div>
              </div>
            </div>

            <div style={{ marginTop: 10 }}>
              <div className="muted">Last check-in</div>
              <div>{currentCheckInfo.lastText}</div>
            </div>

            <div className="divider" />

            <div className="row gap">
              <button
                className="btn"
                type="button"
                disabled={!canCheckIn(current)}
                onClick={() => {
                  setError("");
                  setMessage("");
                  const res = finalizeCheckIn(current);
                  setMessage(res.msg);
                  setError(res.ok ? "" : res.msg);
                  resetDisplayTimer();
                }}
              >
                Check In Again
              </button>
            </div>

            <div className="muted small" style={{ marginTop: 10 }}>
              Auto clears in {Math.floor(DISPLAY_MS / 1000)} seconds. New scans will still stack on
              top.
            </div>
          </div>
        </div>
      ) : null}

      {/* RECENT FEED (MOST RECENT FIRST BELOW CURRENT) */}
      {recentCards.length ? (
        <div style={{ marginTop: 12 }}>
          <div className="row space">
            <h3 style={{ margin: 0 }}>Recent check-ins</h3>
            <span className="muted small">Latest on top</span>
          </div>

          <div className="divider" />

          <div style={{ display: "grid", gap: 10 }}>
            {recentCards.map((card, idx) => (
              <div key={idx} className="panel" style={{ background: "rgba(255,255,255,0.02)" }}>
                {card.member ? (
                  <>
                    <div className="row space">
                      <div style={{ fontWeight: 900 }}>
                        {card.member.first_name} {card.member.last_name}
                      </div>
                      <span className={`badge ${badgeClass(card.member.status)}`}>
                        {card.member.status}
                      </span>
                    </div>
                    <div className="muted small">
                      ID: {card.member.member_id} • {card.member.phone || "—"} •{" "}
                      {card.member.email || "—"}
                    </div>
                    {card.message ? (
                      <div className="muted small" style={{ marginTop: 6 }}>
                        {card.message}
                      </div>
                    ) : null}
                    {card.error ? (
                      <div className="muted small" style={{ marginTop: 6 }}>
                        {card.error}
                      </div>
                    ) : null}
                  </>
                ) : (
                  <>
                    <div style={{ fontWeight: 900 }}>Scan error</div>
                    <div className="muted small">{card.error || "Unknown error"}</div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* helpers */

function badgeClass(status) {
  const s = String(status || "").toLowerCase();
  if (s === "active") return "badge-ok";
  if (s === "frozen") return "badge-warn";
  return "badge-bad";
}