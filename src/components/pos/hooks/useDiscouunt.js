// src/components/pos/hooks/useDiscount.js

import { useMemo, useState } from "react";
import { normalizeDiscount, computeDiscountAmount } from "../utils/discount";
import { clampMoney } from "../utils/money";

/**
 * POS-only discount hook.
 * Keeps discount state + gives you helpers to compute discount amount and total due.
 */
export function useDiscount(initial = { type: "amount", value: "", reason: "" }) {
  const [discount, setDiscount] = useState(() => normalizeDiscount(initial));

  const getDiscountAmount = (subtotal) => computeDiscountAmount(subtotal, discount);

  const getTotalDue = (subtotal, tax = 0) => {
    const sub = clampMoney(subtotal);
    const t = clampMoney(tax);
    const disc = getDiscountAmount(sub);
    return clampMoney(sub + t - disc);
  };

  const summary = useMemo(() => discount, [discount]);

  return { discount: summary, setDiscount, getDiscountAmount, getTotalDue };
}