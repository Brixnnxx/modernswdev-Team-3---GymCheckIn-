// src/components/auth/RequireAuth.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function RequireAuth({ isLoggedIn, children }) {
  const loc = useLocation();

  if (!isLoggedIn) {
    // send user to login and remember where they were trying to go
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  }

  return children;
}