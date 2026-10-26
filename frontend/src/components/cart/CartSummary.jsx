const money = (amount) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount || 0);

/** Shared order total display for cart and checkout screens. */
export default function CartSummary({ subtotal, shipping = 0, total }) {
  const finalTotal = total ?? subtotal + shipping;
  return (
    <section className="cart-summary" aria-label="Order summary">
      <div><span>Subtotal</span><strong>{money(subtotal)}</strong></div>
      <div><span>Shipping</span><strong>{shipping === 0 ? "Calculated at checkout" : money(shipping)}</strong></div>
      <div className="cart-summary-total"><span>Total</span><strong>{money(finalTotal)}</strong></div>
    </section>
  );
}
