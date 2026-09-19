import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";

export function OrdersEmpty() {
  return (
    <MallNotice
      tone="empty"
      eyebrow="Order slips"
      title="No slips on this desk."
      body="Pay a tote and the mall files a stand-in receipt in this browser. No account. No database. Cancelled checkouts do not get a slip."
      actions={
        <>
          <Button className="rounded-full px-5" render={<Link href="/cart" />}>
            Back to tote
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href="/explore" />}
          >
            Walk the floor
          </Button>
        </>
      }
    />
  );
}

export function OrderMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Missing slip"
      title="That order is not in this browser."
      body="The slip is reconstructed from the last checkout in this tab. A different machine, a cleared desk, or an id that never paid will look like this."
      actions={
        <>
          <Button className="rounded-full px-5" render={<Link href="/orders" />}>
            All slips
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href="/cart" />}
          >
            Back to tote
          </Button>
        </>
      }
    />
  );
}
