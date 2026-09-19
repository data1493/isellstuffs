import Link from "next/link";

import { mallHubs } from "@/lib/commerce";
import { yardSaleTuesdayLanderPath } from "@/lib/ads-display";
import {
  aboutPath,
  collectionsPath,
  feesPath,
  helpPath,
  pickupPath,
  savedPath,
  sellDeskPath,
  thisWeekPath,
} from "@/lib/paths";
import { site } from "@/lib/site";

const browse = [
  { href: aboutPath(), label: "About" },
  { href: helpPath(), label: "Help" },
  { href: "/explore", label: "Explore" },
  { href: "/hubs", label: "Hubs" },
  { href: thisWeekPath(), label: "This week" },
  { href: collectionsPath(), label: "Collections" },
  { href: "/sell", label: "Sell" },
  { href: sellDeskPath(), label: "Seller desk" },
  { href: feesPath(), label: "Fees" },
  { href: "/advertise", label: "Advertise" },
  { href: yardSaleTuesdayLanderPath, label: "Yard Sale campaign" },
  { href: "/cart", label: "Tote" },
  { href: pickupPath(), label: "Pickup" },
  { href: savedPath(), label: "Later pile" },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-card">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-12">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link
              href="/"
              className="font-heading text-xl lowercase tracking-tight"
            >
              {site.name}
            </Link>
            <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
              Many stalls. One mall. Physical and digital from the same table.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 sm:gap-10">
            <nav aria-label="Browse" className="flex flex-col gap-2 text-sm">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Walk the floor
              </p>
              {browse.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <nav aria-label="Hubs" className="flex flex-col gap-2 text-sm">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                The aisles
              </p>
              {mallHubs.map((hub) => (
                <Link
                  key={hub.id}
                  href={hub.href}
                  className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  {hub.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
          Paid corners stay labeled. Sold stickers stay on the table.
        </p>
      </div>
    </footer>
  );
}
