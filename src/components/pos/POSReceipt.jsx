import React from "react";

export default function POSReceipt({ receipt, onBack, onFinish }) {
  if (!receipt) return null;

  return (
    <div className="panel" style={{ background: "#0b0c10" }}>
      <h3 style={{ marginTop: 0 }}>Receipt</h3>

      <div className="receipt">
        <div className="row space">
          <div style={{ fontWeight: 900 }}>Gym Check-In</div>
          <div className="muted small">
            {new Date(receipt.created_at).toLocaleString()}
          </div>
        </div>

        <div className="divider" />

        <div className="muted small">Member</div>
        <div style={{ fontWeight: 900 }}>
          {receipt.member?.name || "—"} (ID: {receipt.member?.member_id ?? "—"})
        </div>

        <div className="muted small" style={{ marginTop: 6 }}>
          {receipt.member?.email || "—"} • {receipt.member?.phone || "—"}
        </div>

        <div className="divider" />

        <div className="muted small">Items</div>
        <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
          {receipt.items.map((it) => (
            <div key={it.sku} className="row space">
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 900 }}>
                  {it.description} × {it.qty}
                </div>
                <div className="muted small">${it.price.toFixed(2)} each</div>
              </div>
              <div style={{ fontWeight: 900 }}>${it.line_total.toFixed(2)}</div>
            </div>
          ))}
        </div>

        <div className="divider" />

        <div className="row space">
          <div className="muted">Subtotal</div>
          <div>${receipt.subtotal.toFixed(2)}</div>
        </div>
        <div className="row space">
          <div className="muted">Tax</div>
          <div>${receipt.tax.toFixed(2)}</div>
        </div>
        <div className="row space" style={{ fontWeight: 900 }}>
          <div>Total</div>
          <div>${receipt.total.toFixed(2)}</div>
        </div>

        <div className="divider" />

        <div className="muted small">
          Payment: <b>{receipt.payment_method}</b>
        </div>
        <div className="muted small">
          Details: <b>{receipt.payment_details}</b>
        </div>
        {receipt.payment_method === "Cash" ? (
          <div className="muted small">
            Change due: <b>${receipt.change_due.toFixed(2)}</b>
          </div>
        ) : null}

        <div className="muted small">
          Receipt type: <b>{receipt.receipt_type}</b>
        </div>
        <div className="muted small">Receipt ID: {receipt.receipt_id}</div>
      </div>

      <div className="divider" />

      <div className="row space">
        <button className="btn btn-secondary" type="button" onClick={onBack}>
          Back
        </button>
        <button className="btn" type="button" onClick={onFinish}>
          Finish (Reset POS)
        </button>
      </div>
    </div>
  );
}
