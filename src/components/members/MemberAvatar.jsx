// src/components/members/MemberAvatar.jsx
import React, { useMemo, useState } from "react";

export default function MemberAvatar({
  member,
  size = 64,
  className = "",
  showNeedsPhotoLabel = false,
}) {
  const [imgError, setImgError] = useState(false);

  const photoUrl = useMemo(() => {
    // support a few possible names, use whichever exists
    const url =
      member?.photo_url ??
      member?.photoUrl ??
      member?.photo ??
      member?.photo_path ??
      "";
    return typeof url === "string" ? url.trim() : "";
  }, [member]);

  const hasPhoto = !!photoUrl && !imgError;

  if (hasPhoto) {
    return (
      <img
        src={photoUrl}
        alt={`${member?.first_name ?? "Member"} ${member?.last_name ?? ""}`}
        className={className}
        style={{
          width: size,
          height: size,
          borderRadius: 999,
          objectFit: "cover",
          display: "block",
        }}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.10)",
        display: "grid",
        placeItems: "center",
        position: "relative",
        overflow: "hidden",
      }}
      aria-label="Needs photo"
      title="Needs photo"
    >
      {/* Silhouette icon */}
      <svg
        width={Math.round(size * 0.58)}
        height={Math.round(size * 0.58)}
        viewBox="0 0 24 24"
        fill="none"
        style={{ opacity: 0.9 }}
      >
        <path
          d="M12 12c2.761 0 5-2.462 5-5.5S14.761 1 12 1 7 3.462 7 6.5 9.239 12 12 12Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M4 23c0-4.418 3.582-8 8-8h0c4.418 0 8 3.582 8 8"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>

      {showNeedsPhotoLabel ? (
        <div
          style={{
            position: "absolute",
            bottom: 6,
            left: 8,
            right: 8,
            fontSize: 11,
            textAlign: "center",
            opacity: 0.9,
          }}
        >
          Needs photo
        </div>
      ) : null}
    </div>
  );
}