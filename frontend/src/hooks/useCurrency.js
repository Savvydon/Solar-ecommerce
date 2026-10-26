import { useMemo } from "react";

/** Format a monetary amount consistently with the supplied currency. */
export default function useCurrency(currency = "NGN") {
  return useMemo(
    () => (amount) => new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(Number(amount) || 0),
    [currency],
  );
}
