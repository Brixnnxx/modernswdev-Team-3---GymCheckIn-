// src/components/pos/utils/money.js

export const round2 = (n) => {
  const x = Number(n);
  if (Number.isNaN(x) || !Number.isFinite(x)) return 0;
  return Math.round(x * 100) / 100;
};

export const clampMoney = (n) => {
  const x = Number(n);
  if (Number.isNaN(x) || !Number.isFinite(x)) return 0;
  return Math.max(0, round2(x));
};

export const toNumberSafe = (v) => {
  if (typeof v === "string" && v.trim() === "") return 0;
  const x = Number(v);
  if (Number.isNaN(x) || !Number.isFinite(x)) return 0;
  return x;
};