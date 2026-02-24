import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function MemberDetails({ state, setState }) {
  const navigate = useNavigate();
  const { id } = useParams();

  const memberId = Number(id);
  const members = state?.members ?? [];

  const member = useMemo(() => {
    return members.find((m) => Number(m.member_id) === memberId) || null;
  }, [members, memberId]);

  const [edit, setEdit] = useState(false);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState(null);

  // Keep draft updated when the route/member changes
  useEffect(() => {
    setDraft(member ? { ...member } : null);
    setEdit(false);
    setError("");
  }, [member]);

  function update(key, value) {
    setDraft((d) => ({ ...(d ?? {}), [key]: value }));
  }

  function validate(current) {
    if (!String(current.first_name ?? "").trim() || !String(current.last_name ?? "").trim()) {
      return "First name and last name are required.";
    }
    if (current.email && !/^\S+@\S+\.\S+$/.test(String(current.email))) {
      return "Email looks invalid.";
    }

    // Email uniqueness (ignore current member id)
    const emailLower = String(current.email ?? "").trim().toLowerCase();
    if (emailLower) {
      const clash = members.some(
        (m) =>
          Number(m.member_id) !== Number(current.member_id) &&
          String(m.email ?? "").trim().toLowerCase() === emailLower
      );
      if (clash) return "That email is already used by another member.";
    }

    return "";
  }

  function onSave() {
    if (!draft) return;
    setError("");

    const msg = validate(draft);
    if (msg) {
      setError(msg);
      return;
    }

    const nowIso = new Date().toISOString();

    setState((s) => ({
      ...s,
      members: (s.members ?? []).map((m) =>
        Number(m.member_id) === Number(draft.member_id) ? { ...draft, updated_at: nowIso } : m
      ),
      selectedMemberId: Number(draft.member_id),
    }));

    setEdit(false);
  }

  function onDelete() {
    if (!member) return;
    const ok = window.confirm(`Delete member ${member.first_name} ${member.last_name}?`);
    if (!ok) return;

    setState((s) => ({
      ...s,
      members: (s.members ?? []).filter((m) => Number(m.member_id) !== Number(member.member_id)),
      selectedMemberId: null,
    }));

    navigate("/members");
  }

  if (!member || !draft) {
    return (
      <div className="panel">
        <h2 style={{ marginTop: 0 }}>Member Details</h2>
        <div className="muted">Member not found.</div>
        <div className="divider" />
        <button className="btn btn-secondary" type="button" onClick={() => navigate("/members")}>
          Back to Members
        </button>
      </div>
    );
  }

  const isTrial = String(draft.status || "").toLowerCase() === "trial";
  const trialEndValue = draft.trial_end || draft.trial_end_date || draft.trial_ends_at;

  return (
    <div className="panel">
      <div className="row space">
        <div>
          <h2 style={{ margin: 0 }}>
            {member.first_name} {member.last_name}
          </h2>
          <div className="muted small">
            Member ID: <b>{member.member_id}</b> • Member Code: <b>{member.member_code || "—"}</b>
          </div>
        </div>

        <div className="row gap">
          <span className={`badge ${badgeClass(draft.status)}`}>{draft.status ?? "—"}</span>

          <button className="btn btn-secondary" type="button" onClick={() => navigate("/members")}>
            Back
          </button>

          <button
            className="btn"
            type="button"
            onClick={() => {
              setError("");
              setEdit((v) => !v);
            }}
          >
            {edit ? "Stop Editing" : "Edit"}
          </button>

          {edit ? (
            <button className="btn" type="button" onClick={onSave}>
              Save Changes
            </button>
          ) : null}

          <button className="btn btn-secondary" type="button" onClick={onDelete}>
            Delete
          </button>
        </div>
      </div>

      <div className="divider" />
      {error ? <div className="alert alert-bad">{error}</div> : null}

      {/* Top: Photo + Basic */}
      <div className="grid">
        <div className="panel">
          <h3 style={{ marginTop: 0 }}>Photo</h3>

          <div className="row gap" style={{ alignItems: "flex-start" }}>
            <MemberPhoto
              src={draft.photo_url || ""}
              alt={draft.photo_alt_text || "member"}
              fallbackText={initials(draft.first_name, draft.last_name)}
            />

            <div style={{ flex: 1, minWidth: 260 }}>
              <label className="label">Photo URL</label>
              <input
                value={draft.photo_url || ""}
                onChange={(e) => update("photo_url", e.target.value)}
                disabled={!edit}
                placeholder="https://..."
              />

              <label className="label">Photo Alt Text</label>
              <input
                value={draft.photo_alt_text || ""}
                onChange={(e) => update("photo_alt_text", e.target.value)}
                disabled={!edit}
              />
            </div>
          </div>
        </div>

        <div className="panel">
          <h3 style={{ marginTop: 0 }}>Basic</h3>

          <div className="kv" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
            <div>
              <label className="label">First Name</label>
              <input
                value={draft.first_name || ""}
                onChange={(e) => update("first_name", e.target.value)}
                disabled={!edit}
              />
            </div>

            <div>
              <label className="label">Last Name</label>
              <input
                value={draft.last_name || ""}
                onChange={(e) => update("last_name", e.target.value)}
                disabled={!edit}
              />
            </div>

            <div>
              <label className="label">Phone</label>
              <input value={draft.phone || ""} onChange={(e) => update("phone", e.target.value)} disabled={!edit} />
            </div>

            <div>
              <label className="label">Email (unique)</label>
              <input value={draft.email || ""} onChange={(e) => update("email", e.target.value)} disabled={!edit} />
            </div>

            <div>
              <label className="label">Member Code</label>
              <input
                value={draft.member_code || ""}
                onChange={(e) => update("member_code", e.target.value)}
                disabled={!edit}
              />
            </div>

            <div>
              <label className="label">Status</label>
              <select
                className="select"
                value={draft.status || "active"}
                onChange={(e) => update("status", e.target.value)}
                disabled={!edit}
              >
                <option value="active">active</option>
                <option value="trial">trial</option>
                <option value="frozen">frozen</option>
                <option value="inactive">inactive</option>
                <option value="archived">archived</option>
              </select>

              {/* ✅ Read-only trial end display (POS sets this) */}
              {isTrial ? (
                <div className="muted small" style={{ marginTop: 6 }}>
                  Trial ends: <b>{formatMaybeDate(trialEndValue)}</b>
                </div>
              ) : null}
            </div>

            {/* Notes bigger */}
            <div style={{ gridColumn: "1 / -1" }}>
              <label className="label">Notes</label>
              <textarea
                className="textarea"
                value={draft.member_notes || ""}
                onChange={(e) => update("member_notes", e.target.value)}
                disabled={!edit}
                rows={6}
                placeholder="Notes about this member…"
              />
            </div>
          </div>

          <div className="divider" />

          {edit ? (
            <div className="row gap">
              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => {
                  setDraft({ ...member });
                  setError("");
                }}
              >
                Reset
              </button>
            </div>
          ) : (
            <div className="muted small">
              Member fields include contact info, address, emergency contact, notes, photo metadata, member code, status,
              and timestamps.
            </div>
          )}
        </div>
      </div>

      <div className="divider" />

      {/* Address + Emergency */}
      <div className="grid">
        <div className="panel">
          <h3 style={{ marginTop: 0 }}>Address</h3>

          <label className="label">Street Address 1</label>
          <input
            value={draft.street_address_1 || ""}
            onChange={(e) => update("street_address_1", e.target.value)}
            disabled={!edit}
          />

          <label className="label">Street Address 2</label>
          <input
            value={draft.street_address_2 || ""}
            onChange={(e) => update("street_address_2", e.target.value)}
            disabled={!edit}
          />

          <div className="kv" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
            <div>
              <label className="label">City</label>
              <input value={draft.city || ""} onChange={(e) => update("city", e.target.value)} disabled={!edit} />
            </div>
            <div>
              <label className="label">State</label>
              <input value={draft.state || ""} onChange={(e) => update("state", e.target.value)} disabled={!edit} />
            </div>
            <div>
              <label className="label">Postal Code</label>
              <input
                value={draft.postal_code || ""}
                onChange={(e) => update("postal_code", e.target.value)}
                disabled={!edit}
              />
            </div>
          </div>

          <label className="label">Country</label>
          <input value={draft.country || ""} onChange={(e) => update("country", e.target.value)} disabled={!edit} />
        </div>

        <div className="panel">
          <h3 style={{ marginTop: 0 }}>Emergency Contact</h3>

          <label className="label">Emergency Contact Name</label>
          <input
            value={draft.emergency_contact_name || ""}
            onChange={(e) => update("emergency_contact_name", e.target.value)}
            disabled={!edit}
          />

          <label className="label">Emergency Contact Phone</label>
          <input
            value={draft.emergency_contact_phone || ""}
            onChange={(e) => update("emergency_contact_phone", e.target.value)}
            disabled={!edit}
          />

          <div className="divider" />
          <div className="muted small">One emergency contact per member (name + phone).</div>
        </div>
      </div>

      <div className="divider" />

      <div className="row space">
        <div className="muted small">
          Created: <b>{member.created_at ? new Date(member.created_at).toLocaleString() : "—"}</b> • Updated:{" "}
          <b>{member.updated_at ? new Date(member.updated_at).toLocaleString() : "—"}</b>
        </div>
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

function formatMaybeDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString([], { weekday: "short", year: "numeric", month: "short", day: "numeric" });
}

function initials(first, last) {
  const a = String(first || "").trim().slice(0, 1).toUpperCase();
  const b = String(last || "").trim().slice(0, 1).toUpperCase();
  return (a + b) || "??";
}

function MemberPhoto({ src, alt, fallbackText }) {
  const [broken, setBroken] = useState(false);

  if (!src || broken) {
    return (
      <div className="member-photo placeholder" style={{ width: 140, height: 140 }}>
        {fallbackText}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      style={{
        width: 140,
        height: 140,
        borderRadius: 16,
        objectFit: "cover",
        border: "1px solid #222",
      }}
      onError={() => setBroken(true)}
    />
  );
}