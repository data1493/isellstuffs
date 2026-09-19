"use client";

import Link from "next/link";
import { useEffect, useSyncExternalStore } from "react";

import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import {
  FolderTapeEmpty,
  FolderTapeNotFiles,
} from "@/components/sell/folder-tape-empty";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  readOrderSlips,
  subscribeOrderSlips,
  writeOrderSlip,
  type OrderSlip,
} from "@/lib/order-history";
import {
  folderPath,
  listingPath,
  sellDeskPath,
  sellPath,
  stallPath,
} from "@/lib/paths";
import {
  folderTapeBoothsFromSlips,
  folderTapeHasFiles,
  mergeFolderTapeSlips,
} from "@/lib/seller-folders";

const emptyOrders: OrderSlip[] = [];

export function FolderTapeView({ seed }: { seed: OrderSlip | null }) {
  const stored = useSyncExternalStore(
    subscribeOrderSlips,
    readOrderSlips,
    () => emptyOrders,
  );

  useEffect(() => {
    if (seed) {
      writeOrderSlip(seed);
    }
  }, [seed]);

  const orders = mergeFolderTapeSlips(stored, seed);

  if (orders.length === 0) {
    return <FolderTapeEmpty />;
  }

  if (!folderTapeHasFiles(orders)) {
    return <FolderTapeNotFiles />;
  }

  const booths = folderTapeBoothsFromSlips(orders);

  return (
    <div data-seller-folders="">
      <MallHero>
        <MallCrumb label="Folder tape">
          <CrumbSep />
          <Link
            href={sellPath()}
            className="hover:text-foreground hover:underline"
          >
            Sell
          </Link>
          <CrumbSep />
          <Link
            href={sellDeskPath()}
            className="hover:text-foreground hover:underline"
          >
            Desk
          </Link>
          <CrumbSep />
          <span className="text-foreground">Folders</span>
        </MallCrumb>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            Files that walked
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Not a CDN
          </Badge>
        </div>

        <div className="max-w-2xl space-y-3">
          <MallEyebrow>Stallholder folder tape</MallEyebrow>
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            What walked into a folder.
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            Paid files from slips in this browser. Codes stay at the gift desk.
            Lamps stay on the driveway. Pulled from the table is not a refund.
          </p>
        </div>
      </MallHero>

      <MallSection innerClassName="grid gap-4">
        {booths.map((booth) => (
          <Card
            key={booth.stall.id}
            data-folder-tape-booth={booth.stall.id}
            className="bg-card"
          >
            <CardHeader>
              <CardTitle className="font-heading text-xl">
                <Link
                  href={stallPath(booth.stall.slug)}
                  className="hover:underline"
                >
                  {booth.stall.boothName}
                </Link>
              </CardTitle>
              <CardDescription className="leading-6">
                Files that left this table. The buyer folder is still the
                download.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {booth.files.map((file) => (
                  <li
                    key={`${file.slipId}:${file.listing.id}`}
                    data-folder-tape-listing={file.listing.id}
                    className="rounded-xl bg-card/80 p-4 ring-1 ring-primary/15"
                  >
                    <Link
                      href={listingPath(file.listing.id)}
                      className="font-medium text-foreground hover:underline"
                    >
                      {file.listing.title}
                    </Link>
                    <span className="mt-0.5 block text-sm text-muted-foreground">
                      {file.listing.fileFormat} · {booth.stall.boothName}
                    </span>
                    <span className="mt-1 block text-sm">
                      slip{" "}
                      <Link
                        href={folderPath(file.slipId)}
                        className="font-mono text-xs text-foreground hover:underline"
                      >
                        {file.slipId}
                      </Link>
                    </span>
                    {file.pulled ? (
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        Pulled from the table is not a refund.
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button
            variant="outline"
            className="w-full rounded-full sm:w-auto"
            render={<Link href={sellDeskPath()} />}
          >
            Back to the desk
          </Button>
        </div>
      </MallSection>
    </div>
  );
}
