import Link from "next/link";

import { Button } from "@/components/ui/button";
import { mallHubs } from "@/lib/commerce";

export default function HubNotFound() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
      <div className="rounded-xl border border-dashed border-border bg-card/60 px-5 py-12 text-center sm:px-8">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Not on the map
        </p>
        <h1 className="mt-3 font-heading text-3xl tracking-tight text-balance sm:text-4xl">
          That aisle is not in this mall.
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground text-pretty">
          No artisan-home wing. No junk drawer. The floors are Yard Sale,
          Closet Overflow, Garage Tech, and Download Stall.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button className="rounded-full px-5" render={<Link href="/hubs" />}>
            See the hubs
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href="/explore" />}
          >
            Explore the concourse
          </Button>
        </div>
        <ul className="mt-8 flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm">
          {mallHubs.map((hub) => (
            <li key={hub.id}>
              <Link
                href={hub.href}
                className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                {hub.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
