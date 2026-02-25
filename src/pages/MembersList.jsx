import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function MembersList({ state, setState }) {
  const navigate = useNavigate();
  const location = useLocation();
  const members = state?.members ?? [];

  const [q, setQ] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState("all"); // all | active | trial | frozen | inactive
  const [trainingFilter, setTrainingFilter] = useState("any"); // any | has | none
  const [contactFilter, setContactFilter] = useState("any"); // any | has_email | has_phone | has_both | missing_all

  // ✅ Pull filters from URL (ex: /members?status=frozen)
  useEffect(() => {
    const params = new URLSearchParams(location.search);

    const s = String(params.get("status") || "all").toLowerCase();
    const t = String(params.get("training") || "any").toLowerCase();
    const c = String(params.get("contact") || "any").toLowerCase();

    if (["all", "active", "trial", "frozen", "inactive"].includes(s)) setStatusFilter(s);
    if (["any", "has", "none"].includes(t)) setTrainingFilter(t);
    if (["any", "has_email", "has_phone", "has_both", "missing_all"].includes(c)) setContactFilter(c);

    // auto-open filter panel if any filter is set by URL
    if (s !== "all" || t !== "any" || c !== "any") setShowFilters(true);
  }, [location.search]);

  // ✅ Keep URL in sync when you change filters in UI
  function setFilterAndUrl(kind, value) {
    const params = new URLSearchParams(location.search);

    if (kind === "status") {
      setStatusFilter(value);
      value === "all" ? params.delete("status") : params.set("status", value);
    }
    if (kind === "training") {
      setTrainingFilter(value);
      value === "any" ? params.delete("training") : params.set("training", value);
    }
    if (kind === "contact") {
      setContactFilter(value);
      value === "any" ? params.delete("contact") : params.set("contact", value);
    }

    const qs = params.toString();
    navigate(qs ? `/members?${qs}` : "/members", { replace: true });
  }

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    return members
      // search
      .filter((m) => {
        if (!query) return true;
        const full = `${m.first_name ?? ""} ${m.last_name ?? ""}`.toLowerCase();
        const id = String(m.member_id ?? "");
        const phone = String(m.phone ?? "").toLowerCase();
        const email = String(m.email ?? "").toLowerCase();
        const code = String(m.member_code ?? "").toLowerCase();
        return (
          full.includes(query) ||
          id.includes(query) ||
          phone.includes(query) ||
          email.includes(query) ||
          code.includes(query)
        );
      })
      // status
      .filter((m) => {
        if (statusFilter === "all") return true;
        const s = String(m.status ?? "").toLowerCase();
        return s === statusFilter;
      })
      // training purchased (supports a few possible field names; otherwise treated as "none")
      .filter((m) => {
        if (trainingFilter === "any") return true;

        const hasTraining =
          Boolean(m.has_training) ||
          Number(m.training_sessions_remaining ?? 0) > 0 ||
          Number(m.training_sessions ?? 0) > 0 ||
          Number(m.training_package_count ?? 0) > 0;

        return trainingFilter === "has" ? hasTraining : !hasTraining;
      })
      // contact info
      .filter((m) => {
        if (contactFilter === "any") return true;
        const hasEmail = Boolean(String(m.email ?? "").trim());
        const hasPhone = Boolean(String(m.phone ?? "").trim());

        if (contactFilter === "has_email") return hasEmail;
        if (contactFilter === "has_phone") return hasPhone;
        if (contactFilter === "has_both") return hasEmail && hasPhone;
        if (contactFilter === "missing_all") return !hasEmail && !hasPhone;
        return true;
      });
  }, [members, q, statusFilter, trainingFilter, contactFilter]);

  const activeFilterCount =
    (statusFilter !== "all" ? 1 : 0) +
    (trainingFilter !== "any" ? 1 : 0) +
    (contactFilter !== "any" ? 1 : 0);

  function resetFilters() {
    setStatusFilter("all");
    setTrainingFilter("any");
    setContactFilter("any");
    navigate("/members", { replace: true });
  }

  return (
    <div className="panel">
      <div className="row space">
        <h2 style={{ margin: 0 }}>Members</h2>
        <div className="row gap">
          <button
            className="btn btn-secondary"
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            aria-expanded={showFilters}
          >
            Filters{activeFilterCount ? ` (${activeFilterCount})` : ""}
          </button>

          <button className="btn" type="button" onClick={() => navigate("/members/new")}>
            + New Member
          </button>
        </div>
      </div>

      {showFilters ? (
        <div className="filter-panel" style={{ marginTop: 10 }}>
          <div className="row gap" style={{ flexWrap: "wrap", alignItems: "flex-end" }}>
            <div style={{ minWidth: 200 }}>
              <label className="label">Status</label>
              <select
                className="select"
                value={statusFilter}
                onChange={(e) => setFilterAndUrl("status", e.target.value)}
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="trial">Trial</option>
                <option value="frozen">Frozen</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div style={{ minWidth: 220 }}>
              <label className="label">Training</label>
              <select
                className="select"
                value={trainingFilter}
                onChange={(e) => setFilterAndUrl("training", e.target.value)}
              >
                <option value="any">Any</option>
                <option value="has">Has training</option>
                <option value="none">No training</option>
              </select>
              <div className="muted small" style={{ marginTop: 4 }}>
                Uses: has_training OR training_sessions_remaining OR training_sessions OR training_package_count
              </div>
            </div>

            <div style={{ minWidth: 220 }}>
              <label className="label">Contact info</label>
              <select
                className="select"
                value={contactFilter}
                onChange={(e) => setFilterAndUrl("contact", e.target.value)}
              >
                <option value="any">Any</option>
                <option value="has_email">Has email</option>
                <option value="has_phone">Has phone</option>
                <option value="has_both">Has email + phone</option>
                <option value="missing_all">Missing both</option>
              </select>
            </div>

            <div className="row gap" style={{ marginLeft: "auto" }}>
              <button className="btn btn-ghost" type="button" onClick={resetFilters}>
                Reset
              </button>
              <button className="btn btn-secondary" type="button" onClick={() => setShowFilters(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="divider" />

      <div className="row gap" style={{ alignItems: "flex-end" }}>
        <div style={{ flex: 1, minWidth: 260 }}>
          <label className="label">Search</label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, member ID, phone, email, or member code..."
          />
        </div>
        <div className="muted small">
          Showing <b>{filtered.length}</b> / {members.length}
        </div>
      </div>

      <div className="divider" />

      <div style={{ display: "grid", gap: 10 }}>
        {filtered.map((m) => (
          <button
            key={m.member_id}
            type="button"
            className="member-row"
            onClick={() => navigate(`/member/${m.member_id}`)}
            title="Open profile"
          >
            <div className="row space" style={{ gap: 12 }}>
              <div>
                <div style={{ fontWeight: 900 }}>
                  {m.first_name} {m.last_name}
                </div>
                <div className="muted small">
                  ID: <b>{m.member_id}</b>
                </div>
              </div>

              <span className={`badge ${badgeClass(m.status)}`}>{m.status ?? "—"}</span>
            </div>

            <div className="divider" style={{ margin: "10px 0" }} />

            <div className="kv">
              <div>
                <div className="muted">Phone</div>
                <div>{m.phone || "—"}</div>
              </div>

              <div>
                <div className="muted">Email</div>
                <div>{m.email || "—"}</div>
              </div>

              <div>
                <div className="muted">Notes</div>
                <div className="muted small" style={{ lineHeight: 1.25 }}>
                  {m.member_notes ? truncate(m.member_notes, 80) : "—"}
                </div>
              </div>
            </div>
          </button>
        ))}

        {!filtered.length ? <div className="muted">No members match that search.</div> : null}
      </div>
    </div>
  );
}

function badgeClass(status) {
  const s = String(status || "").toLowerCase();
  if (s === "active") return "badge-ok";
  if (s === "trial") return "badge-warn";
  if (s === "frozen") return "badge-warn";
  return "badge-bad";
}

function truncate(str, n) {
  const s = String(str ?? "");
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}