import Link from "next/link";

import { stallTapePath } from "@/lib/paths";

export function TapeTableLink({ slug }: { slug: string }) {
  return (
    <p className="max-w-2xl">
      <Link
        href={stallTapePath(slug)}
        data-tape-table-link={slug}
        className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        Tape the table
      </Link>
    </p>
  );
}
