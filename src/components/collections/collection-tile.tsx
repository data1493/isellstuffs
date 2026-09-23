import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatMoney } from "@/lib/commerce";
import type { Collection, RackItem } from "@/lib/collections";

export function CollectionTile({
  collection,
  items,
}: {
  collection: Collection;
  items: RackItem[];
}) {
  const preview = items.slice(0, 3);
  const leftover = items.length - preview.length;

  return (
    <Link href={collection.href} className="group block h-full min-w-0">
      <Card className="h-full gap-0 overflow-hidden py-0 ring-1 ring-foreground/10 transition-colors group-hover:bg-secondary/30">
        <div className="border-b border-dashed border-border bg-[oklch(0.96_0.02_85)] px-5 py-5">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-foreground/60">
            {collection.eyebrow}
          </p>
          <h3 className="mt-1 font-heading text-2xl tracking-tight">
            {collection.name}
          </h3>
        </div>
        <CardHeader className="pt-4">
          <CardTitle className="sr-only">{collection.name}</CardTitle>
          <CardDescription className="text-pretty text-sm leading-6 text-foreground/80">
            {collection.blurb}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pb-5">
          <p className="text-xs leading-5 text-muted-foreground">
            {collection.rule}
          </p>
          {preview.length === 0 ? (
            <p className="text-sm text-muted-foreground">This rack is empty.</p>
          ) : (
            <ul className="space-y-2">
              {preview.map((item) => (
                <li
                  key={item.listing.id}
                  className="flex items-baseline justify-between gap-3 text-sm"
                >
                  <span className="min-w-0 truncate font-medium">
                    {item.listing.title}
                  </span>
                  <span className="shrink-0 font-heading">
                    {formatMoney(item.listing.price)}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Badge variant="outline" className="rounded-full">
            {items.length === 0
              ? "Nothing taped down"
              : leftover > 0
                ? `${items.length} on the rack`
                : `${items.length} ${items.length === 1 ? "thing" : "things"}`}
          </Badge>
        </CardContent>
      </Card>
    </Link>
  );
}
