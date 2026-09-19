"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { isCartEligible, listingById } from "@/lib/commerce";
import {
  addToCartLabel,
  addedCopy,
  alreadyInCartCopy,
  inCartLabel,
  unavailableCartLabel,
} from "@/lib/listing-display";
import { useCart } from "@/hooks/use-cart";
import { cn } from "@/lib/utils";

export function AddToCartButton({
  listingId,
  size = "lg",
  compact = false,
  className,
}: {
  listingId: string;
  size?: "lg" | "default" | "sm";
  compact?: boolean;
  className?: string;
}) {
  const listing = listingById(listingId);
  const cart = useCart();
  const [justAdded, setJustAdded] = useState(false);

  if (!listing) {
    return null;
  }

  const eligible = isCartEligible(listing);
  const inCart = cart.has(listingId);
  const buttonClass = cn(
    "rounded-full px-5",
    compact ? "w-full sm:w-auto" : "w-full sm:w-auto",
    className,
  );

  if (!eligible) {
    return (
      <Button
        type="button"
        size={size}
        variant="secondary"
        disabled
        className={buttonClass}
      >
        {unavailableCartLabel(listing)}
      </Button>
    );
  }

  const note = justAdded
    ? addedCopy(listing, cart.count)
    : inCart
      ? alreadyInCartCopy(listing)
      : null;

  return (
    <div className={cn("space-y-2", compact && "min-w-0 flex-1")}>
      <Button
        type="button"
        size={size}
        className={buttonClass}
        disabled={inCart}
        onClick={() => {
          const result = cart.add(listingId);
          if (result.ok && !result.already) {
            setJustAdded(true);
          }
        }}
      >
        {inCart ? inCartLabel(listing) : addToCartLabel(listing)}
      </Button>
      <p
        aria-live="polite"
        className={cn(
          "text-muted-foreground",
          compact ? "text-xs leading-5" : "text-sm leading-6",
        )}
      >
        {note}
      </p>
    </div>
  );
}
