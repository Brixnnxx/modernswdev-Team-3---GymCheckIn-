// src/components/pos/POSMemberPicker.jsx
import React, { useMemo } from "react";
import MemberSearch from "../members/MemberSearch";

/**
 * POSMemberPicker
 * - Uses MemberSearch for scalable selection
 * - Shows recents
 * - Displays current selection
 *
 * Fixes added:
 * - Robust member id getter (supports member_id/memberId/id)
 * - Robust name/email getters (supports snake_case or camelCase)
 * - Recents lookup won’t silently fail if member shape changes
 */

const getMemberId = (m) => m?.member_id ?? m?.memberId ?? m?.id ?? null;
const getFirstName = (m) => m?.first_name ?? m?.firstName ?? "";
const getLastName = (m) => m?.last_name ?? m?.lastName ?? "";
const getEmail = (m) => m?.email ?? "";

export default function POSMemberPicker({
  members = [],
  selectedMember = null,
  recents = [],
  onPickMember,
}) {
  const recentMembers = useMemo(() => {
    return (recents ?? [])
      .map((id) => members.find((m) => Number(getMemberId(m)) === Number(id)))
      .filter(Boolean);
  }, [recents, members]);

  const selectedLabel = selectedMember
    ? `${getFirstName(selectedMember)} ${getLastName(selectedMember)}`.trim()
    : "";

  const selectedId = selectedMember ? getMemberId(selectedMember) : null;
  const selectedEmail = selectedMember ? getEmail(selectedMember) : "";

  return (
    <div className="panel" style={{ background: "#0b0c10", overflow: "visible" }}>
      <div className="row space" style={{ gap: 12, alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 260 }}>
          <div className="muted small" style={{ marginBottom: 6 }}>
            Select who is getting charged
          </div>

          <MemberSearch
            members={members}
            onPick={onPickMember}
            placeholder="Search by name, phone, email, or member code…"
          />

          {recentMembers.length ? (
            <div style={{ marginTop: 10 }}>
              <div className="muted small" style={{ marginBottom: 6 }}>
                Recently visited
              </div>
              <div className="bubble-row">
                {recentMembers.map((m) => {
                  const id = getMemberId(m);
                  const label = `${getFirstName(m)} ${getLastName(m)}`.trim() || `Member ${id}`;
                  return (
                    <button
                      key={String(id)}
                      type="button"
                      className="bubble"
                      onClick={() => onPickMember?.(m)}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>

        <div style={{ minWidth: 260 }}>
          <div className="muted small">Current selection</div>
          <div className="big" style={{ marginTop: 6 }}>
            {selectedMember ? selectedLabel || "Selected member" : "None selected"}
          </div>
          <div className="muted small" style={{ marginTop: 6 }}>
            {selectedMember
              ? `ID: ${selectedId ?? "—"} • ${selectedEmail || "—"}`
              : "Use the search to select a member."}
          </div>
        </div>
      </div>
    </div>
  );
}
