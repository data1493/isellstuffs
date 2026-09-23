import Link from "next/link";

import { stallStashPath } from "@/lib/paths";

export function StashTableLink({ slug }: { slug: string }) {
  return (
    <p className="max-w-2xl">
      <Link
        href={stallStashPath(slug)}
        data-paid-stash-link={slug}
        className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        Paid stash
      </Link>
    </p>
  );
}
