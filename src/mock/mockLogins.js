// src/mock/mockLogins.js

/**
 * Mock users for demo auth
 * - You asked: front desk + admin use the SAME username/password
 * - We'll still store different roles so you can expand later.
 */
export const MOCK_LOGIN_USERNAME = "gym";
export const MOCK_LOGIN_PASSWORD = "gym123";

export const mockUsers = [
  {
    username: MOCK_LOGIN_USERNAME,
    password: MOCK_LOGIN_PASSWORD,
    role: "front_desk",
    first_name: "Front",
    last_name: "Desk",
    worker_id: 9001,
    worker_status: "active",
  },
  {
    username: MOCK_LOGIN_USERNAME,
    password: MOCK_LOGIN_PASSWORD,
    role: "admin",
    first_name: "Admin",
    last_name: "User",
    worker_id: 9002,
    worker_status: "active",
  },
];

/**
 * Very simple auth check
 * If multiple users share the same username/password, we return the first match.
 * (If you later want to pick role, add a role selector on the Login page.)
 */
export function authenticate(username, password) {
  const u = String(username ?? "").trim();
  const p = String(password ?? "");

  return (
    mockUsers.find(
      (user) => String(user.username) === u && String(user.password) === p
    ) || null
  );
}