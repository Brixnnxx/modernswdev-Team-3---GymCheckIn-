import React, { useMemo, useState } from "react";
import POSMemberPicker from "../components/pos/POSMemberPicker";
import POSCart from "../components/pos/POSCart";
import POSCatalog from "../components/pos/POSCatalog";
import POSCheckout from "../components/pos/POSCheckout";
import POSReceipt from "../components/pos/POSReceipt";
import "../components/pos/pos.css";
import { calcSubtotal, calcTax, round2, upsertCartItem } from "../components/pos/pos.helpers";
import { computeDiscountAmount } from "../components/pos/utils/discount";
import { clampMoney } from "../components/pos/utils/money";

/**
 * POS container:
 * - Owns state + business rules
 * - Renders UI sections via components
 */

const CATALOG = {
  products: [
    { sku: "P-GATORADE", name: "Gatorade", price: 3.0 },
    { sku: "P-PROTEIN", name: "Protein Powder (Single Serve)", price: 5.5 },
    { sku: "P-TSHIRT", name: "Gym T-Shirt", price: 22.0 },
  ],
  services: [
    { sku: "S-PILATES", name: "Pilates Class", price: 18.0 },
    { sku: "S-PT-30", name: "Personal Training (30 min)", price: 35.0 },
    { sku: "S-PT-45", name: "Personal Training (45 min)", price: 50.0 },
    { sku: "S-PT-60", name: "Personal Training (60 min)", price: 65.0 },
  ],
  contracts: [
    { sku: "C-BASIC-JOIN", name: "Basic Membership (Join Fee)", price: 35.0, kind: "join_fee" },
    { sku: "C-BASIC-MONTH", name: "Basic Membership (Monthly)", price: 39.99, kind: "monthly" },
    { sku: "C-SENIOR-JOIN", name: "Senior Membership (Join Fee)", price: 25.0, kind: "join_fee" },
    { sku: "C-SENIOR-MONTH", name: "Senior Membership (Monthly)", price: 29.99, kind: "monthly" },
    { sku: "C-ADDON-JOIN", name: "Add-on Membership (Join Fee)", price: 20.0, kind: "join_fee" },
    { sku: "C-ADDON-MONTH", name: "Add-on Membership (Monthly)", price: 19.99, kind: "monthly" },
    { sku: "C-SADDON-JOIN", name: "Senior Add-on (Join Fee)", price: 15.0, kind: "join_fee" },
    { sku: "C-SADDON-MONTH", name: "Senior Add-on (Monthly)", price: 14.99, kind: "monthly" },
  ],
};

// Mock saved cards for demo UI
const MOCK_SAVED_CARDS = [
  { id: "card_1", brand: "Visa", last4: "4242", exp: "10/28" },
  { id: "card_2", brand: "Mastercard", last4: "4444", exp: "07/27" },
];

export default function POS({ state, setState }) {
  const members = state?.members ?? [];
  const cart = state?.cart ?? [];

  // selection + recents
  const [posMemberId, setPosMemberId] = useState(state?.selectedMemberId ?? null);
  const [recents, setRecents] = useState([]);

  // catalog tab
  const [tab, setTab] = useState("products");

  // checkout flow
  const [checkoutStep, setCheckoutStep] = useState(null); // null | payment | receiptType | receipt
  const [receipt, setReceipt] = useState(null);

  // ✅ NEW: discount state (this fixes typing/toggling)
  const [discount, setDiscount] = useState({ type: "amount", value: "", reason: "" });

  // payment
  const [paymentMethod, setPaymentMethod] = useState("Card on file");
  const [receiptType, setReceiptType] = useState("Digital");
  const [savedCardId, setSavedCardId] = useState(MOCK_SAVED_CARDS[0]?.id ?? "");
  const [cashGiven, setCashGiven] = useState("");
  const [checkNumber, setCheckNumber] = useState("");
  const [accountRef, setAccountRef] = useState("");
  const [swipeLast4, setSwipeLast4] = useState("");
  const [swipeAuth, setSwipeAuth] = useState("");
  const [checkoutError, setCheckoutError] = useState("");

  const selectedMember = useMemo(() => {
    if (posMemberId == null) return null;
    return members.find((m) => Number(m.member_id) === Number(posMemberId)) || null;
  }, [posMemberId, members]);

  const subtotal = useMemo(() => calcSubtotal(cart), [cart]);
  const tax = useMemo(() => calcTax(subtotal, 0.085), [subtotal]);

  // ✅ NEW: compute discount + totalDue
  const discountAmount = useMemo(
    () => computeDiscountAmount(subtotal, discount),
    [subtotal, discount]
  );

  const totalDue = useMemo(
    () => clampMoney(clampMoney(subtotal) + clampMoney(tax) - discountAmount),
    [subtotal, tax, discountAmount]
  );

  // NOTE: You used `total` in a few places. Keep it, but it should equal totalDue now.
  const total = totalDue;

  const changeDue = useMemo(() => {
    if (paymentMethod !== "Cash") return 0;
    const given = Number(cashGiven);
    if (!Number.isFinite(given)) return 0;
    return round2(Math.max(0, given - totalDue));
  }, [cashGiven, totalDue, paymentMethod]);

  function pickMember(member) {
    setPosMemberId(member.member_id);

    // keep global selectedMemberId for other tabs if you want
    setState((s) => ({ ...s, selectedMemberId: member.member_id }));

    setRecents((r) => {
      const next = [member.member_id, ...r.filter((id) => id !== member.member_id)];
      return next.slice(0, 8);
    });
  }

  function addToCart(item) {
    if (!selectedMember) {
      alert("Select a member to charge first.");
      return;
    }

    setState((s) => ({
      ...s,
      cart: upsertCartItem(s.cart ?? [], {
        sku: item.sku,
        description: item.name,
        price: item.price,
        qty: 1,
        category: tab,
      }),
    }));
  }

  function incItem(sku) {
    setState((s) => ({
      ...s,
      cart: (s.cart ?? []).map((it) =>
        it.sku === sku ? { ...it, qty: Number(it.qty ?? 1) + 1 } : it
      ),
    }));
  }

  function decItem(sku) {
    setState((s) => ({
      ...s,
      cart: (s.cart ?? []).map((it) =>
        it.sku === sku ? { ...it, qty: Math.max(1, Number(it.qty ?? 1) - 1) } : it
      ),
    }));
  }

  function removeItem(sku) {
    setState((s) => ({
      ...s,
      cart: (s.cart ?? []).filter((it) => it.sku !== sku),
    }));
  }

  function clearCart() {
    setState((s) => ({ ...s, cart: [] }));
    // optional: clear discount when cart clears
    setDiscount({ type: "amount", value: "", reason: "" });
  }

  function resetPaymentDetails() {
    setSavedCardId(MOCK_SAVED_CARDS[0]?.id ?? "");
    setCashGiven("");
    setCheckNumber("");
    setAccountRef("");
    setSwipeLast4("");
    setSwipeAuth("");
    setCheckoutError("");
  }

  function startCheckout() {
    if (!selectedMember) return alert("Select a member to charge first.");
    if (!cart.length) return alert("Cart is empty.");
    setCheckoutStep("payment");
    setReceipt(null);
    resetPaymentDetails();
  }

  function validatePaymentDetails() {
    if (paymentMethod === "Card on file") {
      if (!savedCardId) return "Select a saved card.";
    }

    if (paymentMethod === "Cash") {
      const given = Number(cashGiven);
      if (!Number.isFinite(given) || String(cashGiven).trim() === "") return "Enter cash given.";
      if (given < totalDue) return "Cash given must be at least the total.";
    }

    if (paymentMethod === "Check") {
      if (!String(checkNumber).trim()) return "Enter a check number.";
    }

    if (paymentMethod === "Account") {
      if (!String(accountRef).trim()) return "Enter an account/reference number.";
    }

    if (paymentMethod === "Swipe new card") {
      if (!/^\d{4}$/.test(String(swipeLast4).trim())) return "Enter last 4 digits (4 numbers).";
      if (!String(swipeAuth).trim()) return "Enter an auth/approval code.";
    }

    return "";
  }

  function buildPaymentDetailsForReceipt() {
    if (paymentMethod === "Card on file") {
      const card = MOCK_SAVED_CARDS.find((c) => c.id === savedCardId) || null;
      return card ? `${card.brand} •••• ${card.last4} (exp ${card.exp})` : "Saved card";
    }
    if (paymentMethod === "Cash")
      return `Cash: $${Number(cashGiven).toFixed(2)} • Change: $${changeDue.toFixed(2)}`;
    if (paymentMethod === "Check") return `Check #: ${String(checkNumber).trim()}`;
    if (paymentMethod === "Account") return `Account/ref: ${String(accountRef).trim()}`;
    if (paymentMethod === "Swipe new card")
      return `New card •••• ${String(swipeLast4).trim()} • Auth: ${String(swipeAuth).trim()}`;
    return "";
  }

  function continuePayment() {
    setCheckoutError("");
    const err = validatePaymentDetails();
    if (err) {
      setCheckoutError(err);
      return;
    }
    setCheckoutStep("receiptType");
  }

  function generateReceipt() {
    const now = new Date();

    const receiptObj = {
      receipt_id: "rcpt_" + Math.random().toString(16).slice(2) + "_" + Date.now().toString(16),
      created_at: now.toISOString(),
      member: selectedMember
        ? {
            member_id: selectedMember.member_id,
            name: `${selectedMember.first_name} ${selectedMember.last_name}`,
            email: selectedMember.email || "",
            phone: selectedMember.phone || "",
          }
        : null,
      items: cart.map((c) => ({
        sku: c.sku,
        description: c.description,
        price: Number(c.price ?? 0),
        qty: Number(c.qty ?? 1),
        line_total: round2(Number(c.price ?? 0) * Number(c.qty ?? 1)),
      })),
      subtotal,
      tax,
      discount: {
        type: discount?.type ?? "amount",
        value: discount?.value ?? "",
        reason: discount?.reason ?? "",
        amount: discountAmount,
      },
      total: totalDue,
      payment_method: paymentMethod,
      payment_details: buildPaymentDetailsForReceipt(),
      receipt_type: receiptType,
      change_due: paymentMethod === "Cash" ? changeDue : 0,
    };

    setReceipt(receiptObj);
    setCheckoutStep("receipt");
  }

  function finishTransaction() {
    clearCart();
    setCheckoutStep(null);
    setReceipt(null);
    setPaymentMethod("Card on file");
    setReceiptType("Digital");
    resetPaymentDetails();
    setDiscount({ type: "amount", value: "", reason: "" });
  }

  return (
    <div className="panel">
      <div className="row space">
        <h2 style={{ margin: 0 }}>POS</h2>
        <div className="muted small">Point of Sale</div>
      </div>

      <div className="divider" />

      <POSMemberPicker
        members={members}
        selectedMember={selectedMember}
        recents={recents}
        onPickMember={pickMember}
      />

      <div className="divider" />

      <div className="pos-grid">
        <POSCart
          cart={cart}
          selectedMember={selectedMember}
          subtotal={subtotal}
          tax={tax}
          discount={discount}
          setDiscount={setDiscount}
          onClearCart={clearCart}
          onIncItem={incItem}
          onDecItem={decItem}
          onRemoveItem={removeItem}
          onStartCheckout={startCheckout}
        />

        <POSCatalog
          tab={tab}
          setTab={setTab}
          catalog={CATALOG}
          onAddToCart={addToCart}
          disabled={!selectedMember}
        />
      </div>

      {checkoutStep ? <div className="divider" /> : null}

      {/* Checkout steps */}
      {checkoutStep && checkoutStep !== "receipt" ? (
        <POSCheckout
          step={checkoutStep}
          setStep={setCheckoutStep}
          subtotal={subtotal}
          tax={tax}
          discount={discount}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          receiptType={receiptType}
          setReceiptType={setReceiptType}
          savedCards={MOCK_SAVED_CARDS}
          savedCardId={savedCardId}
          setSavedCardId={setSavedCardId}
          cashGiven={cashGiven}
          setCashGiven={setCashGiven}
          checkNumber={checkNumber}
          setCheckNumber={setCheckNumber}
          accountRef={accountRef}
          setAccountRef={setAccountRef}
          swipeLast4={swipeLast4}
          setSwipeLast4={setSwipeLast4}
          swipeAuth={swipeAuth}
          setSwipeAuth={setSwipeAuth}
          checkoutError={checkoutError}
          onContinuePayment={continuePayment}
          onGenerateReceipt={generateReceipt}
          onCancelCheckout={() => setCheckoutStep(null)}
          onBackToPayment={() => setCheckoutStep("payment")}
          changeDue={changeDue}
        />
      ) : null}

      {/* Receipt step */}
      {checkoutStep === "receipt" ? (
        <POSReceipt
          receipt={receipt}
          onBack={() => setCheckoutStep("payment")}
          onFinish={finishTransaction}
        />
      ) : null}
    </div>
  );
}