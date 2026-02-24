import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function MemberLookup({ members }) {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const matches = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return [];
    return (members ?? [])
      .filter((m) => {
        const full = `${m.first_name} ${m.last_name}`.toLowerCase();
        return (
          full.includes(query) ||
          String(m.phone ?? "").toLowerCase().includes(query) ||
          String(m.email ?? "").toLowerCase().includes(query) ||
          String(m.member_code ?? "").toLowerCase().includes(query)
        );
      })
      .slice(0, 8);
  }, [q, members]);

  function goToMember(m) {
    setQ("");
    setOpen(false);
    navigate(`/member/${m.member_id}`);
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
          // small delay so click on item still registers
          setTimeout(() => setOpen(false), 120);
        }}
        placeholder="Look up member (name, phone, email, code)…"
      />

      {open && q.trim() && (
        <div className="search-results">
          {matches.length ? (
            matches.map((m) => (
              <button
                key={m.member_id}
                className="search-item"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => goToMember(m)}
                type="button"
              >
                <div className="row space">
                  <div className="name">
                    {m.first_name} {m.last_name}
                  </div>
                  <span className={`badge ${badgeClass(m.status)}`}>{m.status ?? "—"}</span>
                </div>
                <div className="muted small">
                  {(m.phone || "—")} • {(m.email || "—")} • {(m.member_code || "—")}
                </div>
              </button>
            ))
          ) : (
            <div className="search-empty muted">No matches</div>
          )}
        </div>
      )}
    </div>
  );
}

function badgeClass(status) {
  const s = String(status || "").toLowerCase();
  if (s === "active") return "badge-ok";
  if (s === "frozen") return "badge-warn";
  return "badge-bad";
}
