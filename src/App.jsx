// src/App.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import AppLayout from "./components/AppLayout";

import Dashboard from "./pages/Dashboard";
import MembersList from "./pages/MembersList";
import MemberNew from "./pages/MemberNew";
import MemberDetails from "./pages/MemberDetails";
import Checkin from "./pages/Checkin";
import Appointments from "./pages/Appointments";
import POS from "./pages/POS";
import NotFound from "./pages/NotFound";

import Login from "./pages/Login";
import RequireAuth from "./components/RequireAuth";

import mockMembers from "./mock/mockMembers";

function isoNow() {
  return new Date().toISOString();
}

function makeInitialState() {
  const now = isoNow();

  return {
    session: {
      isLoggedIn: false,
      worker: null,
    },

    trainers: [
      { worker_id: 101, first_name: "Alex", last_name: "Johnson", worker_status: "active", role: "trainer", created_at: now },
      { worker_id: 102, first_name: "Maria", last_name: "Lopez", worker_status: "active", role: "trainer", created_at: now },
      { worker_id: 103, first_name: "Chris", last_name: "Kim", worker_status: "inactive", role: "trainer", created_at: now },
      { worker_id: 104, first_name: "Taylor", last_name: "Brown", worker_status: "active", role: "trainer", created_at: now },
    ],

    selectedMemberId: null,
    members: [],
    checkins: [],
    appointments: [],
    cart: [],
  };
}

export default function App() {
  const [state, setState] = useState(makeInitialState());

  // DEV ONLY
  const USE_MOCKS = true;

  // seed members once (won't overwrite if you already have members)
  useEffect(() => {
    if (!USE_MOCKS) return;

    setState((s) => {
      if ((s.members ?? []).length) return s;
      return { ...s, members: mockMembers };
    });
  }, []);

  const selectedMember = useMemo(() => {
    if (state.selectedMemberId == null) return null;
    return state.members.find((m) => Number(m.member_id) === Number(state.selectedMemberId)) || null;
  }, [state.members, state.selectedMemberId]);

  const isLoggedIn = Boolean(state?.session?.isLoggedIn);

  // ✅ UPDATED: use the worker returned from mock login (Login.jsx -> mockLogins.js)
  function handleLogin(auth) {
    const worker = auth?.worker ?? null;

    setState((s) => ({
      ...s,
      session: {
        isLoggedIn: true,
        worker: worker
          ? { ...worker, last_login_at: isoNow() }
          : {
              worker_id: 9001,
              first_name: "Front",
              last_name: "Desk",
              name: "Front Desk",
              role: "front_desk",
              worker_status: "active",
              username: String(auth?.username ?? "gym"),
              last_login_at: isoNow(),
            },
      },
    }));
  }

  function handleLogout() {
    setState((s) => ({
      ...s,
      session: { isLoggedIn: false, worker: null },
      selectedMemberId: null,
      cart: [],
    }));
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Login route */}
      <Route path="/login" element={<Login onLogin={handleLogin} />} />

      {/* Protected area */}
      <Route
        element={
          <RequireAuth isLoggedIn={isLoggedIn}>
            <AppLayout state={state} setState={setState} onLogout={handleLogout} selectedMember={selectedMember} />
          </RequireAuth>
        }
      >
        <Route path="/dashboard" element={<Dashboard state={state} />} />

        <Route path="/members" element={<MembersList state={state} setState={setState} />} />
        <Route path="/members/new" element={<MemberNew state={state} setState={setState} />} />
        <Route path="/member/:id" element={<MemberDetails state={state} setState={setState} />} />

        <Route path="/checkin" element={<Checkin state={state} setState={setState} />} />

        <Route path="/appointments" element={<Appointments state={state} setState={setState} />} />

        <Route path="/pos" element={<POS state={state} setState={setState} />} />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}