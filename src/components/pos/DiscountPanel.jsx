// src/components/pos/DiscountPanel.jsx
import React, { useMemo } from "react";
import { computeDiscountAmount } from "./utils/discount";
import { clampMoney } from "./utils/money";

export default function DiscountPanel({
  subtotal = 0,
  tax = 0,
  discount,
  setDiscount,
  open,
  onClose,
}) {
  if (!open) return null;

  const safeSubtotal = clampMoney(subtotal);
  const safeTax = clampMoney(tax);

  const discountAmount = computeDiscountAmount(safeSubtotal, discount);
  const totalDue = clampMoney(safeSubtotal + safeTax - discountAmount);

  // Detect "entered discount would exceed subtotal" (so we can message the user)
  const showCappedMessage = useMemo(() => {
    if (!discount) return false;
    const type = discount.type === "percent" ? "percent" : "amount";

    if (type === "percent") {
      const n = Number(discount.value);
      return Number.isFinite(n) && n > 100 && safeSubtotal > 0;
    }

    const n = Number(discount.value);
    return Number.isFinite(n) && n > safeSubtotal && safeSubtotal > 0;
  }, [discount, safeSubtotal]);

  return (
    <div className="panel" style={{ background: "#0f1117", marginTop: 10 }}>
      <div className="row space" style={{ alignItems: "center" }}>
        <h4 style={{ margin: 0 }}>Discount</h4>
        <button className="btn btn-ghost" type="button" onClick={onClose}>
          Close
        </button>
      </div>

      <div className="divider" />

      <div className="row gap" style={{ marginBottom: 10 }}>
        <button
          type="button"
          className={`chip ${discount?.type === "amount" ? "active" : ""}`}
          onClick={() => setDiscount((prev) => ({ ...(prev ?? {}), type: "amount" }))}
        >
          $ off
        </button>

        <button
          type="button"
          className={`chip ${discount?.type === "percent" ? "active" : ""}`}
          onClick={() => setDiscount((prev) => ({ ...(prev ?? {}), type: "percent" }))}
        >
          % off
        </button>

        <button
          type="button"
          className="chip"
          onClick={() => setDiscount({ type: "amount", value: "", reason: "" })}
          title="Clear discount"
        >
          Clear
        </button>
      </div>

      <div className="kv" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
        <div>
          <div className="muted small">{discount?.type === "percent" ? "Percent" : "Amount"}</div>
          <input
            value={discount?.value ?? ""}
            onChange={(e) =>
              setDiscount((prev) => ({
                ...(prev ?? {}),
                value: e.target.value,
              }))
            }
            placeholder={discount?.type === "percent" ? "Example: 10" : "Example: 5.00"}
            inputMode="decimal"
          />
        </div>

        <div>
          <div className="muted small">Reason (optional)</div>
          <input
            value={discount?.reason ?? ""}
            onChange={(e) =>
              setDiscount((prev) => ({
                ...(prev ?? {}),
                reason: e.target.value,
              }))
            }
            placeholder="Example: Member promo"
          />
        </div>
      </div>

      <div className="muted small" style={{ marginTop: 8 }}>
        Subtotal: <b>${safeSubtotal.toFixed(2)}</b> • Tax: <b>${safeTax.toFixed(2)}</b>
        <br />
        Discount applied: <b>${discountAmount.toFixed(2)}</b> • New total: <b>${totalDue.toFixed(2)}</b>
      </div>

      {showCappedMessage ? (
        <div className="muted small" style={{ marginTop: 6 }}>
          Discount was capped so the total can’t go below <b>$0.00</b>.
        </div>
      ) : null}
    </div>
  );
}