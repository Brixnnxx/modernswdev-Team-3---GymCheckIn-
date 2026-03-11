import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function MemberNew({ state, setState }) {
  const navigate = useNavigate();
  const members = state?.members ?? [];

  // Only depend on members (not whole state) to avoid unnecessary recalcs
  const nextId = useMemo(() => {
    const ids = members.map((m) => Number(m.member_id)).filter(Number.isFinite);
    return (ids.length ? Math.max(...ids) : 0) + 1;
  }, [members]);

  // Initialize form AFTER nextId is known; don't overwrite if user started typing
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (form) return;
    setForm({
      member_id: nextId,
      first_name: "",
      last_name: "",
      phone: "",
      email: "",
      street_address_1: "",
      street_address_2: "",
      city: "",
      state: "",
      postal_code: "",
      country: "USA",
      emergency_contact_name: "",
      emergency_contact_phone: "",
      member_notes: "",
      photo_url: "",
      photo_alt_text: "",
      member_code: `QR-${String(nextId).padStart(4, "0")}`,
      status: "active",
      membership_plan: "",
    });
  }, [nextId, form]);

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate(current) {
    if (!current.first_name.trim() || !current.last_name.trim()) {
      return "First name and last name are required.";
    }
    if (current.email && !/^\S+@\S+\.\S+$/.test(current.email)) {
      return "Email looks invalid.";
    }

    // Ensure email uniqueness (spec says email is unique)
    const emailLower = current.email.trim().toLowerCase();
    if (emailLower) {
      const clash = members.some((m) => String(m.email ?? "").trim().toLowerCase() === emailLower);
      if (clash) return "That email is already used by another member.";
    }

    return "";
  }

  function onSave() {
    if (!form) return;

    setError("");
    const msg = validate(form);
    if (msg) {
      setError(msg);
      return;
    }

    const nowIso = new Date().toISOString();
    const newMember = {
      ...form,
      created_at: nowIso,
      updated_at: nowIso,
    };

    setState((s) => ({
      ...s,
      members: [...(s.members ?? []), newMember],
      selectedMemberId: newMember.member_id,
    }));

    navigate(`/member/${newMember.member_id}`);
  }

  if (!form) {
    return (
      <div className="panel">
        <div className="muted">Loading…</div>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="row space">
        <h2 style={{ margin: 0 }}>New Member</h2>
        <div className="row gap">
          <button className="btn btn-secondary" type="button" onClick={() => navigate("/members")}>
            Cancel
          </button>
          <button className="btn" type="button" onClick={onSave}>
            Save Member
          </button>
        </div>
      </div>

      <div className="divider" />
      {error ? <div className="alert alert-bad">{error}</div> : null}

      <div className="grid" style={{ marginTop: 12 }}>
        <div className="panel">
          <h3 style={{ marginTop: 0 }}>Basic Info</h3>

          <div className="kv" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
            <div>
              <label className="label">Member ID</label>
              <input value={form.member_id} disabled />
            </div>

            <div>
              <label className="label">Status</label>
              <select className="select" value={form.status} onChange={(e) => update("status", e.target.value)}>
                <option value="active">active</option>
                <option value="inactive">inactive</option>
                <option value="frozen">frozen</option>
                <option value="archived">archived</option>
              </select>
            </div>

<div>
  <label className="label">Membership Plan</label>
  <select
    className="select"
    value={form.membership_plan}
    onChange={(e) => update("membership_plan", e.target.value)}>
    <option value="">Select a plan</option>
    <option value="basic">Basic - $20/month</option>
    <option value="standard">Standard - $35/month</option>
    <option value="premium">Premium - $50/month</option>
  </select>
</div>
            
            <div>
              <label className="label">First Name</label>
              <input value={form.first_name} onChange={(e) => update("first_name", e.target.value)} />
            </div>

            <div>
              <label className="label">Last Name</label>
              <input value={form.last_name} onChange={(e) => update("last_name", e.target.value)} />
            </div>

            <div>
              <label className="label">Phone</label>
              <input value={form.phone} onChange={(e) => update("phone", e.target.value)} />
            </div>

            <div>
              <label className="label">Email (unique)</label>
              <input value={form.email} onChange={(e) => update("email", e.target.value)} />
            </div>

            <div>
              <label className="label">Member Code (QR/barcode)</label>
              <input value={form.member_code} onChange={(e) => update("member_code", e.target.value)} />
            </div>

           <div>
<label className="label">Notes</label>
  <textarea
    className="textarea"
    value={form.member_notes}
    onChange={(e) => update("member_notes", e.target.value)}
    rows={4}
    placeholder="Add notes about this member..."
  />
</div>

          </div>
        </div>

        <div className="panel">
          <h3 style={{ marginTop: 0 }}>Photo</h3>

          <label className="label">Photo URL</label>
          <input value={form.photo_url} onChange={(e) => update("photo_url", e.target.value)} placeholder="https://..." />

          <label className="label">Photo Alt Text</label>
          <input value={form.photo_alt_text} onChange={(e) => update("photo_alt_text", e.target.value)} />

          <div className="divider" />

          <div className="muted small">Preview</div>
          <div style={{ marginTop: 8 }}>
            {form.photo_url ? (
              <MemberPhoto
                src={form.photo_url}
                alt={form.photo_alt_text || "member"}
                fallbackText={initials(form.first_name, form.last_name)}
              />
            ) : (
              <div className="member-photo placeholder" style={{ width: 140, height: 140 }}>
                {initials(form.first_name, form.last_name)}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="divider" />

      <div className="grid">
        <div className="panel">
          <h3 style={{ marginTop: 0 }}>Address</h3>

          <label className="label">Street Address 1</label>
          <input value={form.street_address_1} onChange={(e) => update("street_address_1", e.target.value)} />

          <label className="label">Street Address 2</label>
          <input value={form.street_address_2} onChange={(e) => update("street_address_2", e.target.value)} />

          <div className="kv" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
            <div>
              <label className="label">City</label>
              <input value={form.city} onChange={(e) => update("city", e.target.value)} />
            </div>
            <div>
              <label className="label">State</label>
              <input value={form.state} onChange={(e) => update("state", e.target.value)} />
            </div>
            <div>
              <label className="label">Postal Code</label>
              <input value={form.postal_code} onChange={(e) => update("postal_code", e.target.value)} />
            </div>
          </div>

          <label className="label">Country</label>
          <input value={form.country} onChange={(e) => update("country", e.target.value)} />
        </div>

        <div className="panel">
          <h3 style={{ marginTop: 0 }}>Emergency Contact</h3>

          <label className="label">Emergency Contact Name</label>
          <input value={form.emergency_contact_name} onChange={(e) => update("emergency_contact_name", e.target.value)} />

          <label className="label">Emergency Contact Phone</label>
          <input value={form.emergency_contact_phone} onChange={(e) => update("emergency_contact_phone", e.target.value)} />

          <div className="divider" />

          <div className="muted small">
            These fields match your member schema (address, emergency contact, status, notes, photo, member_code).
          </div>
        </div>
      </div>
    </div>
  );
}

/** Photo preview that falls back to initials if the URL fails */
function MemberPhoto({ src, alt, fallbackText }) {
  const [broken, setBroken] = useState(false);

  if (broken) {
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

function initials(first, last) {
  const a = String(first || "").trim().slice(0, 1).toUpperCase();
  const b = String(last || "").trim().slice(0, 1).toUpperCase();
  return (a + b) || "??";
}

