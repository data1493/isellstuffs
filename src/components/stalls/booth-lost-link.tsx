import Link from "next/link";

import { stallLostPath } from "@/lib/paths";

export function BoothLostLink({ slug }: { slug: string }) {
  return (
    <p className="max-w-2xl">
      <Link
        href={stallLostPath(slug)}
        data-booth-lost-link={slug}
        className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        Tape a lost title
      </Link>
    </p>
  );
}
