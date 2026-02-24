// src/components/members/MemberSearch.jsx
import React, { useMemo, useState } from "react";

export default function MemberSearch({
  members = [],
  onPick,
  placeholder = "Search member by name, phone, email, or member code...",
  maxResults = 6,
}) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const matches = useMemo(() => {
    const query = String(q || "").trim().toLowerCase();
    if (!query) return [];

    return (members ?? [])
      .filter((m) => {
        const first = String(m?.first_name ?? "").toLowerCase();
        const last = String(m?.last_name ?? "").toLowerCase();
        const full = `${first} ${last}`.trim();

        const phone = String(m?.phone ?? "").toLowerCase();
        const email = String(m?.email ?? "").toLowerCase();
        const code = String(m?.member_code ?? "").toLowerCase();
        const id = String(m?.member_id ?? "").toLowerCase();

        return (
          full.includes(query) ||
          phone.includes(query) ||
          email.includes(query) ||
          code.includes(query) ||
          id.includes(query)
        );
      })
      .slice(0, maxResults);
  }, [q, members, maxResults]);

  function pick(m) {
    onPick?.(m);
    setQ("");
    setOpen(false);
  }

  return (
    <div className="searchbox">
      <input
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          // small delay so click registers before closing
          setTimeout(() => setOpen(false), 120);
        }}
        placeholder={placeholder}
      />

      {open && q.trim() ? (
        <div className="search-results">
          {matches.length ? (
            matches.map((m) => (
              <button
                key={m.member_id ?? `${m.first_name}-${m.last_name}-${Math.random()}`}
                className="search-item"
                onMouseDown={(e) => e.preventDefault()} // prevent blur before click
                onClick={() => pick(m)}
                type="button"
              >
                <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
                  <div className="name">
                    {m.first_name} {m.last_name}
                  </div>
                  <span className={`badge ${badgeClass(m.status)}`}>{m.status}</span>
                </div>
                <div className="muted small">
                  {String(m.phone ?? "") || "—"} • {String(m.email ?? "") || "—"} •{" "}
                  {String(m.member_code ?? "") || "—"}
                </div>
              </button>
            ))
          ) : (
            <div className="search-empty muted">No matches</div>
          )}
        </div>
      ) : null}
    </div>
  );
}

function badgeClass(status) {
  const s = String(status ?? "").toLowerCase();
  if (s === "active") return "badge-ok";
  if (s === "frozen") return "badge-warn";
  return "badge-bad";
}
