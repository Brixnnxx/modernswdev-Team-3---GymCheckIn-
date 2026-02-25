import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function NavItem({ to, label }) {
  const navigate = useNavigate();
  const loc = useLocation();
  const active = loc.pathname === to || (to !== "/" && loc.pathname.startsWith(to + "/"));

  return (
    <button
      className={`navlink ${active ? "active" : ""}`}
      onClick={() => navigate(to)}
      type="button"
    >
      {label}
    </button>
  );
}
