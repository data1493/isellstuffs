export const currencies = ["usd"] as const;
export type Currency = (typeof currencies)[number];

/** Integer cents. Format at the edge — do not store display strings as the source of truth. */
export type Money = {
  amountCents: number;
  currency: Currency;
};

export function money(
  amountCents: number,
  currency: Currency = "usd",
): Money {
  if (!Number.isInteger(amountCents)) {
    throw new Error("Money amount must be integer cents");
  }
  return { amountCents, currency };
}

export function formatMoney({ amountCents, currency }: Money): string {
  const value = amountCents / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(value);
}

export function addMoney(left: Money, right: Money): Money {
  if (left.currency !== right.currency) {
    throw new Error("Cannot add money in different currencies");
  }
  return money(left.amountCents + right.amountCents, left.currency);
}

export function isZero(value: Money): boolean {
  return value.amountCents === 0;
}
