import Link from "next/link";

import { stallFreePath } from "@/lib/paths";

export function FreeBoxLink({ slug }: { slug: string }) {
  return (
    <p className="max-w-2xl">
      <Link
        href={stallFreePath(slug)}
        data-free-box-link={slug}
        className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        Tape a free-box title
      </Link>
    </p>
  );
}
