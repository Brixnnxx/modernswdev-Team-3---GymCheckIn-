// src/components/pos/utils/discount.js
import { clampMoney } from "./money";

/**
 * discount shape:
 * { type: "amount" | "percent", value: string|number, reason?: string }
 *
 * Rules:
 * - Discount can never be negative
 * - % discount is clamped to 0..100
 * - $ discount is clamped to 0..subtotal
 * - Computed discount is always clamped to 0..subtotal (prevents negative totals)
 */
export const computeDiscountAmount = (subtotal, discount) => {
  const sub = clampMoney(subtotal);
  if (!discount) return 0;

  const type = discount.type === "percent" ? "percent" : "amount";
  const raw = clampMoney(discount.value);

  let computed = 0;

  if (type === "percent") {
    const pct = Math.min(100, Math.max(0, raw));
    computed = clampMoney((pct / 100) * sub);
  } else {
    computed = clampMoney(raw);
  }

  // Final safety clamp: discount can never exceed subtotal
  return Math.min(computed, sub);
};

export const normalizeDiscount = (discount) => {
  if (!discount) return { type: "amount", value: "", reason: "" };
  return {
    type: discount.type === "percent" ? "percent" : "amount",
    value: discount.value ?? "",
    reason: discount.reason ?? "",
  };
};