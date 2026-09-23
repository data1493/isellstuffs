"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { cn } from "@/lib/utils";

function toteLabel(count: number) {
  return count > 0 ? `Tote · ${count}` : "Tote";
}

export function ToteNavLink({ className }: { className?: string }) {
  const { count } = useCart();

  return (
    <Link
      href="/cart"
      className={cn(
        "shrink-0 text-muted-foreground underline-offset-4 hover:text-foreground hover:underline",
        className,
      )}
    >
      {toteLabel(count)}
    </Link>
  );
}

export function ToteHeaderButton({ className }: { className?: string }) {
  const { count } = useCart();

  return (
    <Button
      size="sm"
      variant="outline"
      className={cn("h-8 rounded-full px-3 text-sm", className)}
      render={<Link href="/cart" />}
    >
      {toteLabel(count)}
    </Button>
  );
}
