// src/components/pos/POSCatalog.jsx
import React, { useMemo } from "react";

export default function POSCatalog({ tab, setTab, catalog, onAddToCart, disabled }) {
  // ✅ Always-available Membership items (injected into memberships list)
  const baseMembershipItems = useMemo(
    () => [
      { sku: "PASS_DAY_10", name: "Day Pass", price: 10.0, kind: "pass" },
      { sku: "TRIAL_7_FREE", name: "Free Trial (7 days)", price: 0.0, kind: "trial" },
      { sku: "TRIAL_3_FREE", name: "Free Trial (3 days)", price: 0.0, kind: "trial" },
      { sku: "PASS_WEEK_35", name: "Week Pass", price: 35.0, kind: "pass" },
    ],
    []
  );

  const items = useMemo(() => {
    const isMemberships = tab === "memberships";

    // ✅ Merge memberships + legacy contracts + always-available trials/passes
    const membershipItems = [
      ...baseMembershipItems,
      ...(catalog?.memberships ?? []),
      ...(catalog?.contracts ?? []).map((c) => ({ ...c, kind: c.kind ?? "contract" })),
    ];

    // ✅ Deduplicate by SKU (base items win if SKU matches)
    const dedupeBySku = (arr) => {
      const map = new Map();
      for (const it of arr) {
        const sku = String(it?.sku ?? "").trim();
        if (!sku) continue;
        if (!map.has(sku)) map.set(sku, it);
      }
      return [...map.values()];
    };

    const source = isMemberships ? dedupeBySku(membershipItems) : (catalog?.[tab] ?? []);
    const list = (source ?? []).slice();

    // ✅ Grouping on Memberships tab
    if (isMemberships) {
      const rank = (kind) => {
        const k = String(kind || "").toLowerCase();
        if (k === "pass") return 0;
        if (k === "trial") return 1;
        if (k === "membership") return 2;
        if (k === "contract") return 3;
        return 4;
      };
      list.sort((a, b) => rank(a.kind) - rank(b.kind) || String(a.name).localeCompare(String(b.name)));
    }

    return list;
  }, [catalog, tab, baseMembershipItems]);

  return (
    <div className="panel">
      <div className="row space">
        <h3 style={{ margin: 0 }}>Charge With</h3>
        <div className="muted small">Pick items to add</div>
      </div>

      <div className="divider" />

      <div className="tabbar">
        <button
          type="button"
          className={`tab ${tab === "products" ? "active" : ""}`}
          onClick={() => setTab("products")}
        >
          Products
        </button>

        <button
          type="button"
          className={`tab ${tab === "services" ? "active" : ""}`}
          onClick={() => setTab("services")}
        >
          Services
        </button>

        <button
          type="button"
          className={`tab ${tab === "memberships" ? "active" : ""}`}
          onClick={() => setTab("memberships")}
        >
          Memberships
        </button>
      </div>

      <div className="divider" />

      {tab === "memberships" ? (
        <div className="muted small" style={{ marginBottom: 10 }}>
          Passes + trial memberships + membership/contract options live here. Trials should be applied to the selected
          member at checkout.
        </div>
      ) : null}

      <div className="catalog">
        {items.length ? (
          items.map((item) => (
            <button
              key={item.sku}
              type="button"
              className="catalog-item"
              onClick={() => onAddToCart(item)}
              title={disabled ? "Select a member first" : "Add to cart"}
              disabled={disabled}
            >
              <div style={{ fontWeight: 900 }}>{item.name}</div>
              {item.kind ? <div className="muted small">{item.kind}</div> : null}
              <div className="muted small">${Number(item.price ?? 0).toFixed(2)}</div>
            </button>
          ))
        ) : (
          <div className="muted small" style={{ padding: 10 }}>
            No items in this tab. Add items to <b>catalog.{tab}</b>.
          </div>
        )}
      </div>

      {disabled ? (
        <div className="muted small" style={{ marginTop: 10 }}>
          Tip: select a member first before adding items.
        </div>
      ) : null}
    </div>
  );
}