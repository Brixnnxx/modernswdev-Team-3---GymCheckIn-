import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import NavItem from "./NavItem";
import MemberSearch from "./members/MemberSearch";

export default function AppLayout({ state, setState }) {
  const navigate = useNavigate();
  const members = state?.members ?? [];

  function handleLogout() {
    // Works whether you're bypassing login or using it
    setState((s) => ({
      ...s,
      session: { ...s.session, isLoggedIn: false },
      cart: [],
    }));
    navigate("/login");
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">
          <div className="logo">🏋️</div>
          <div>
            <div className="brand-title">Gym Check-In</div>
            <div className="brand-sub">React Router UI</div>
          </div>
        </div>

        <nav className="nav">
          <NavItem to="/dashboard" label="Home / Dashboard" />
          <NavItem to="/members" label="Members" />
          <NavItem to="/checkin" label="Check-In" />
          <NavItem to="/appointments" label="Appointments" />
          <NavItem to="/pos" label="POS" />
        </nav>

        <div className="sidebar-footer">
          <div className="muted">Logged in:</div>
          <div>{state?.session?.worker?.name || "Worker"}</div>

          <button className="btn btn-ghost" type="button" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <MemberSearch
            members={members}
            onPick={(member) => {
              // No global selected member anymore — just navigate to profile
              navigate(`/member/${member.member_id}`);
            }}
          />
        </header>

        <section className="content">
          {/* This is where /dashboard, /members, etc render */}
          <Outlet />
        </section>
      </div>
    </div>
  );
}
