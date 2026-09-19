import Link from "next/link";

import { stallBuyPath } from "@/lib/paths";

export function BoothBuysLink({ slug }: { slug: string }) {
  return (
    <p className="max-w-2xl">
      <Link
        href={stallBuyPath(slug)}
        data-booth-buy-link={slug}
        className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        I buy that
      </Link>
    </p>
  );
}
