import Link from "next/link";

import { stallSignPath } from "@/lib/paths";

export function YardSignLink({ slug }: { slug: string }) {
  return (
    <p className="max-w-2xl">
      <Link
        href={stallSignPath(slug)}
        data-yard-sign-link={slug}
        className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        Print a yard sign
      </Link>
    </p>
  );
}
