// src/components/pos/POSCart.jsx
import React, { useState } from "react";
import DiscountPanel from "./DiscountPanel";
import { computeDiscountAmount } from "./utils/discount";
import { clampMoney } from "./utils/money";

export default function POSCart({
  cart,
  selectedMember,
  subtotal,
  tax,
  discount,
  setDiscount,
  onClearCart,
  onIncItem,
  onDecItem,
  onRemoveItem,
  onStartCheckout,
}) {
  const [showDiscount, setShowDiscount] = useState(false);

  const discountAmount = computeDiscountAmount(subtotal, discount);
  const total = clampMoney(clampMoney(subtotal) + clampMoney(tax) - discountAmount);

  return (
    <div className="panel">
      <div className="row space">
        <h3 style={{ margin: 0 }}>Transaction</h3>

        <div className="row gap">
          <button
            className="btn btn-secondary"
            type="button"
            onClick={() => setShowDiscount((v) => !v)}
            disabled={!cart.length}
            title={!cart.length ? "Add an item first" : "Add a discount"}
          >
            {showDiscount ? "Hide Discount" : "Discount"}
          </button>

          <button className="btn btn-ghost" type="button" onClick={onClearCart}>
            Clear
          </button>
        </div>
      </div>

      <div className="divider" />

      <div className="muted small">Charging</div>
      <div className="big" style={{ marginTop: 6 }}>
        {selectedMember
          ? `${selectedMember.first_name} ${selectedMember.last_name}`
          : "No member selected"}
      </div>

      <div className="divider" />

      {cart.length ? (
        <div className="pos-cart">
          {cart.map((item) => (
            <div key={item.sku} className="pos-cart-row">
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: 900,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {item.description}
                </div>
                <div className="muted small">
                  ${Number(item.price ?? 0).toFixed(2)} each
                </div>
              </div>

              <div className="row gap" style={{ justifyContent: "flex-end" }}>
                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={() => onDecItem(item.sku)}
                >
                  −
                </button>

                <div style={{ width: 26, textAlign: "center", fontWeight: 900 }}>
                  {item.qty}
                </div>

                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={() => onIncItem(item.sku)}
                >
                  +
                </button>

                <button
                  className="btn btn-ghost"
                  type="button"
                  onClick={() => onRemoveItem(item.sku)}
                >
                  ✕
                </button>
              </div>

              <div style={{ textAlign: "right", fontWeight: 900 }}>
                ${(Number(item.price ?? 0) * Number(item.qty ?? 1)).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="muted">Cart is empty. Add items from the right panel.</div>
      )}

      {/* Collapsible Discount Panel */}
      <DiscountPanel
        open={showDiscount}
        onClose={() => setShowDiscount(false)}
        subtotal={subtotal}
        tax={tax}
        discount={discount}
        setDiscount={setDiscount}
      />

      <div className="divider" />

      <div className="pos-totals">
        <div className="row space">
          <div className="muted">Subtotal</div>
          <div>${clampMoney(subtotal).toFixed(2)}</div>
        </div>

        <div className="row space">
          <div className="muted">Tax</div>
          <div>${clampMoney(tax).toFixed(2)}</div>
        </div>

        <div className="row space">
          <div className="muted">Discount</div>
          <div>- ${discountAmount.toFixed(2)}</div>
        </div>

        <div className="row space" style={{ fontWeight: 900 }}>
          <div>Total</div>
          <div>${total.toFixed(2)}</div>
        </div>
      </div>

      <div className="divider" />

      <button
        className="btn"
        type="button"
        style={{ width: "100%" }}
        onClick={onStartCheckout}
        disabled={!cart.length}
      >
        Checkout
      </button>
    </div>
  );
}