export function round2(n) {
  return Math.round(Number(n) * 100) / 100;
}

export function calcSubtotal(cart) {
  return (cart ?? []).reduce((sum, item) => {
    const qty = Number(item.qty ?? 1);
    const price = Number(item.price ?? 0);
    return sum + qty * price;
  }, 0);
}

export function calcTax(subtotal, rate = 0.085) {
  return round2(Number(subtotal) * rate);
}

export function upsertCartItem(cart, item) {
  const list = cart ?? [];
  const idx = list.findIndex((c) => c.sku && item.sku && c.sku === item.sku);
  if (idx === -1) return [...list, item];

  return list.map((c, i) =>
    i === idx ? { ...c, qty: Number(c.qty ?? 1) + 1 } : c
  );
}
