import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { CHECKOUT_COOKIE, formatPlanMoney, parseCheckoutSession } from "@/lib/checkout";
import { groupListingsByStall } from "@/lib/checkout-display";
import { checkoutCancelMetadata } from "@/lib/seo";

export const metadata: Metadata = checkoutCancelMetadata();

export default async function CheckoutCancelPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string | string[] }>;
}) {
  const params = await searchParams;
  const sessionId = Array.isArray(params.session_id)
    ? params.session_id[0]
    : params.session_id;
  const jar = await cookies();
  const session = parseCheckoutSession(jar.get(CHECKOUT_COOKIE)?.value);
  const groups = session ? groupListingsByStall(session.listingIds) : [];

  return (
    <MallNotice
      tone="cancel"
      eyebrow="Walked away"
      title="You put the bag back on the hook."
      body="Nothing was charged. The tote still holds whatever you picked up. Come back when you are ready to pay the mall."
      actions={
        <>
          <Button className="rounded-full px-5" render={<Link href="/cart" />}>
            Return to tote
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href="/" />}
          >
            Concourse
          </Button>
        </>
      }
    >
      {session ? (
        <div className="rounded-xl bg-card/80 px-4 py-4 ring-1 ring-foreground/10">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Still waiting
          </p>
          <p className="mt-2 text-sm text-foreground">
            {session.listingIds.length}{" "}
            {session.listingIds.length === 1 ? "find" : "finds"} ·{" "}
            {formatPlanMoney(session.subtotalCents, session.currency)}
          </p>
          {groups.length > 0 ? (
            <ul className="mt-3 space-y-3">
              {groups.map((group) => (
                <li key={group.stall.id}>
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                    {group.stall.boothName}
                  </p>
                  <ul className="mt-1 space-y-1 text-sm">
                    {group.lines.map(({ listing }) => (
                      <li key={listing.id}>{listing.title}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          ) : null}
          <p className="mt-3 break-all font-mono text-xs text-muted-foreground">
            {sessionId ?? session.id}
          </p>
        </div>
      ) : (
        <p className="text-center text-sm text-muted-foreground">
          Open the tote to try checkout again.
        </p>
      )}
    </MallNotice>
  );
}
