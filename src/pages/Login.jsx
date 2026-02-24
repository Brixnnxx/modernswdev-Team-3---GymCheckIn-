// src/pages/Login.jsx
import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { authenticate, MOCK_LOGIN_USERNAME, MOCK_LOGIN_PASSWORD } from "../mock/mockLogins";

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const loc = useLocation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const redirectTo = useMemo(() => loc.state?.from || "/dashboard", [loc.state]);

  function handleLogin() {
    setError("");

    const user = authenticate(username, password);

    if (!user) {
      setError("Invalid username or password.");
      return;
    }

    // Pass worker info up to App.jsx
    onLogin?.({
      username: user.username,
      role: user.role,
      worker: {
        worker_id: user.worker_id,
        first_name: user.first_name,
        last_name: user.last_name,
        name: `${user.first_name} ${user.last_name}`.trim(),
        role: user.role,
        worker_status: user.worker_status,
        username: user.username,
      },
    });

    navigate(redirectTo, { replace: true });
  }

  return (
    <div className="login">
      <div className="card">
        <h1 style={{ marginTop: 0 }}>Gym Check-In</h1>
        <p className="muted">Worker login</p>

        {error ? <div className="alert alert-bad">{error}</div> : null}

        <label className="label">Username</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="gym"
          autoComplete="username"
        />

        <label className="label">Password</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="gym123"
          autoComplete="current-password"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleLogin();
          }}
        />

        <button className="btn" onClick={handleLogin} type="button" style={{ width: "100%", marginTop: 12 }}>
          Log in
        </button>

        <p className="muted small" style={{ marginBottom: 0 }}>
          Demo login: <b>{MOCK_LOGIN_USERNAME}</b> / <b>{MOCK_LOGIN_PASSWORD}</b>
        </p>
      </div>
    </div>
  );
}