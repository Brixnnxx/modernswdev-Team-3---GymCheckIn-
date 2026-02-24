// src/components/pos/POSCheckout.jsx
import React, { useMemo } from "react";
import { computeDiscountAmount } from "./utils/discount";
import { clampMoney, toNumberSafe } from "./utils/money";

const PAYMENT_METHODS = ["Card on file", "Cash", "Check", "Account", "Swipe new card"];
const RECEIPT_TYPES = ["Digital", "Physical", "Both"];

export default function POSCheckout({
  step,
  setStep,

  subtotal = 0,
  tax = 0,
  discount,

  paymentMethod,
  setPaymentMethod,
  receiptType,
  setReceiptType,
  savedCards,
  savedCardId,
  setSavedCardId,
  cashGiven,
  setCashGiven,
  checkNumber,
  setCheckNumber,
  accountRef,
  setAccountRef,
  swipeLast4,
  setSwipeLast4,
  swipeAuth,
  setSwipeAuth,
  checkoutError,
  onContinuePayment,
  onGenerateReceipt,
  onCancelCheckout,
  onBackToPayment,

  changeDue,
}) {
  if (!step) return null;

  const safeSubtotal = clampMoney(subtotal);
  const safeTax = clampMoney(tax);

  const discountAmount = computeDiscountAmount(safeSubtotal, discount);
  const totalDue = clampMoney(safeSubtotal + safeTax - discountAmount);

  const localChangeDue =
    paymentMethod === "Cash"
      ? Math.max(0, clampMoney(toNumberSafe(cashGiven) - totalDue))
      : 0;

  const effectiveChangeDue =
    typeof changeDue === "number" && Number.isFinite(changeDue) ? changeDue : localChangeDue;

  const isPaymentValid = useMemo(() => {
    if (!paymentMethod) return false;

    if (paymentMethod === "Card on file") {
      return (savedCards ?? []).length > 0 && !!savedCardId;
    }
    if (paymentMethod === "Cash") {
      return toNumberSafe(cashGiven) >= totalDue;
    }
    if (paymentMethod === "Check") {
      return String(checkNumber ?? "").trim().length > 0;
    }
    if (paymentMethod === "Account") {
      return String(accountRef ?? "").trim().length > 0;
    }
    if (paymentMethod === "Swipe new card") {
      return String(swipeLast4 ?? "").trim().length === 4 && String(swipeAuth ?? "").trim().length > 0;
    }
    return true;
  }, [
    paymentMethod,
    savedCards,
    savedCardId,
    cashGiven,
    totalDue,
    checkNumber,
    accountRef,
    swipeLast4,
    swipeAuth,
  ]);

  return (
    <div className="panel" style={{ background: "#0b0c10" }}>
      {step === "payment" ? (
        <>
          <h3 style={{ marginTop: 0 }}>Payment Method</h3>

          <div className="row gap" style={{ marginBottom: 10 }}>
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m}
                type="button"
                className={`chip ${paymentMethod === m ? "active" : ""}`}
                onClick={() => setPaymentMethod(m)}
              >
                {m}
              </button>
            ))}
          </div>

          <div className="panel" style={{ background: "#0f1117", marginTop: 10 }}>
            <div className="muted small" style={{ marginBottom: 8 }}>
              <div className="row space">
                <span>Subtotal</span>
                <b>${safeSubtotal.toFixed(2)}</b>
              </div>
              <div className="row space">
                <span>Tax</span>
                <b>${safeTax.toFixed(2)}</b>
              </div>
              <div className="row space">
                <span>Discount</span>
                <b>- ${discountAmount.toFixed(2)}</b>
              </div>
              <div className="row space" style={{ marginTop: 6 }}>
                <span>Total due</span>
                <b>${totalDue.toFixed(2)}</b>
              </div>
            </div>

            {paymentMethod === "Card on file" ? (
              <>
                <div className="muted small">Choose saved card</div>
                <select
                  className="select"
                  value={savedCardId}
                  onChange={(e) => setSavedCardId(e.target.value)}
                >
                  {(savedCards ?? []).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.brand} •••• {c.last4} (exp {c.exp})
                    </option>
                  ))}
                </select>
                {(savedCards ?? []).length === 0 ? (
                  <div className="muted small" style={{ marginTop: 8 }}>
                    No saved cards available.
                  </div>
                ) : null}
              </>
            ) : null}

            {paymentMethod === "Cash" ? (
              <>
                <div className="muted small">Cash given</div>
                <input
                  value={cashGiven}
                  onChange={(e) => setCashGiven(e.target.value)}
                  placeholder="Example: 50.00"
                />
                <div className="muted small" style={{ marginTop: 8 }}>
                  Change due: <b>${effectiveChangeDue.toFixed(2)}</b>
                </div>
                {toNumberSafe(cashGiven) < totalDue ? (
                  <div className="muted small" style={{ marginTop: 6 }}>
                    Cash must be at least <b>${totalDue.toFixed(2)}</b>.
                  </div>
                ) : null}
              </>
            ) : null}

            {paymentMethod === "Check" ? (
              <>
                <div className="muted small">Check number</div>
                <input
                  value={checkNumber}
                  onChange={(e) => setCheckNumber(e.target.value)}
                  placeholder="Example: 1048"
                />
              </>
            ) : null}

            {paymentMethod === "Account" ? (
              <>
                <div className="muted small">Account / reference</div>
                <input
                  value={accountRef}
                  onChange={(e) => setAccountRef(e.target.value)}
                  placeholder="Example: ACCT-77821"
                />
              </>
            ) : null}

            {paymentMethod === "Swipe new card" ? (
              <>
                <div className="kv" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
                  <div>
                    <div className="muted small">Last 4 digits</div>
                    <input
                      value={swipeLast4}
                      onChange={(e) => setSwipeLast4(e.target.value)}
                      placeholder="1234"
                      maxLength={4}
                    />
                  </div>
                  <div>
                    <div className="muted small">Auth / approval code</div>
                    <input
                      value={swipeAuth}
                      onChange={(e) => setSwipeAuth(e.target.value)}
                      placeholder="APPROVED123"
                    />
                  </div>
                </div>
                <div className="muted small" style={{ marginTop: 8 }}>
                  (Demo) In a real system this comes from the card reader.
                </div>
              </>
            ) : null}
          </div>

          {checkoutError ? (
            <>
              <div className="divider" />
              <div className="alert alert-bad">{checkoutError}</div>
            </>
          ) : null}

          <div className="divider" />

          <div className="row space">
            <button className="btn btn-secondary" type="button" onClick={onCancelCheckout}>
              Cancel
            </button>
            <button className="btn" type="button" onClick={onContinuePayment} disabled={!isPaymentValid}>
              Continue
            </button>
          </div>
        </>
      ) : null}

      {step === "receiptType" ? (
        <>
          <h3 style={{ marginTop: 0 }}>Receipt Type</h3>

          <div className="row gap">
            {RECEIPT_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                className={`chip ${receiptType === t ? "active" : ""}`}
                onClick={() => setReceiptType(t)}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="divider" />

          <div className="row space">
            <button className="btn btn-secondary" type="button" onClick={onBackToPayment}>
              Back
            </button>
            <button className="btn" type="button" onClick={onGenerateReceipt}>
              Generate Receipt
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}