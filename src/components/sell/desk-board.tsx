"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { ListingTypeBadge } from "@/components/listing-type-badge";
import { MallNotice } from "@/components/mall-notice";
import { SoldButton } from "@/components/sell/sold-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  formatMoney,
  isCartEligible,
  money,
  type Listing,
  type Stall,
} from "@/lib/commerce";
import {
  listingFact,
  listingFactLabel,
  listingHubName,
  listingStatusLabel,
} from "@/lib/listing-display";
import { listingPath, sellNewPath } from "@/lib/paths";
import {
  isOverlayListing,
  mergeDeskListings,
} from "@/lib/seller-desk";
import {
  SELLER_LISTINGS_CHANGED,
  readSellerListings,
} from "@/lib/seller-overlay";
import {
  SOLD_CHANGED_EVENT,
  canStampSold,
  stampSoldListings,
} from "@/lib/sold-overlay";
import { feePercent, splitOnTag } from "@/lib/seller-payouts";
import {
  SELLER_STALLS_CHANGED,
  stallCardById,
} from "@/lib/stall-overlay";

export function DeskBoard({
  stall,
  listings,
}: {
  stall: Stall;
  listings: Listing[];
}) {
  const [rows, setRows] = useState(listings);
  const [card, setCard] = useState({
    boothName: stall.boothName,
    blurb: stall.blurb,
  });

  useEffect(() => {
    function apply() {
      setRows(
        stampSoldListings(mergeDeskListings(listings, readSellerListings())),
      );
      const patch = stallCardById(stall.id);
      if (patch) {
        setCard({ boothName: patch.boothName, blurb: patch.blurb });
      }
    }

    apply();
    window.addEventListener(SELLER_LISTINGS_CHANGED, apply);
    window.addEventListener(SELLER_STALLS_CHANGED, apply);
    window.addEventListener(SOLD_CHANGED_EVENT, apply);
    window.addEventListener("storage", apply);
    return () => {
      window.removeEventListener(SELLER_LISTINGS_CHANGED, apply);
      window.removeEventListener(SELLER_STALLS_CHANGED, apply);
      window.removeEventListener(SOLD_CHANGED_EVENT, apply);
      window.removeEventListener("storage", apply);
    };
  }, [listings, stall.id]);

  const paper = useMemo(() => {
    const eligible = rows.filter(isCartEligible);
    const tagCents = eligible.reduce(
      (sum, listing) => sum + listing.price.amountCents,
      0,
    );
    return {
      count: eligible.length,
      ...splitOnTag(money(tagCents)),
    };
  }, [rows]);

  return (
    <div className="space-y-10">
      <div className="max-w-2xl space-y-2">
        <p className="font-heading text-2xl tracking-tight sm:text-3xl">
          {card.boothName}
        </p>
        <p className="text-sm leading-6 text-muted-foreground">{card.blurb}</p>
      </div>

      {rows.length === 0 ? (
        <MallNotice
          tone="empty"
          padded={false}
          titleAs="h2"
          eyebrow="Empty table"
          title="Nothing on this table tonight."
          body="The fixtures are gone and you have not listed anything on this booth. Put a thing or a file on Folding Table Tuesday and it shows up here."
          actions={
            <Button
              className="rounded-full px-5"
              render={<Link href={sellNewPath()} />}
            >
              List something
            </Button>
          }
        />
      ) : (
        <div>
        <p className="mb-3 text-sm leading-6 text-muted-foreground">
          Sold sticker is on the table. Putting back is restock, not a refund.
        </p>
        <ul className="grid gap-3">
          {rows.map((listing) => {
            const overlay = isOverlayListing(listing);
            const gone = listing.status !== "available";
            const stamp = canStampSold(listing);

            return (
              <li key={listing.id}>
                <Card className="bg-card">
                  <CardHeader className="sm:grid-cols-[1fr_auto]">
                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <ListingTypeBadge listing={listing} />
                        <Badge variant={gone ? "destructive" : "ghost"}>
                          {listingStatusLabel(listing)}
                        </Badge>
                        {overlay ? (
                          <Badge variant="outline">Listed tonight</Badge>
                        ) : null}
                      </div>
                      <CardTitle className="font-heading text-xl tracking-tight">
                        <Link
                          href={listingPath(listing.id)}
                          className="underline-offset-4 hover:underline"
                        >
                          {listing.title}
                        </Link>
                      </CardTitle>
                      <CardDescription className="text-sm leading-6">
                        {listing.summary}
                      </CardDescription>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {listingFactLabel(listing)}:
                        </span>{" "}
                        {listingFact(listing)}
                        <span className="mx-2 text-foreground/30">·</span>
                        {listingHubName(listing)}
                      </p>
                      {stamp ? (
                        <SoldButton
                          listingId={listing.id}
                          intent={listing.status === "available" ? "sold" : "open"}
                        />
                      ) : null}
                    </div>
                    <p
                      className={
                        gone
                          ? "font-heading text-2xl text-muted-foreground line-through"
                          : "font-heading text-2xl tracking-tight"
                      }
                    >
                      {formatMoney(listing.price)}
                    </p>
                  </CardHeader>
                </Card>
              </li>
            );
          })}
        </ul>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-card">
          <CardHeader>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              If it sold tonight
            </p>
            <CardTitle className="font-heading text-3xl">
              {formatMoney(paper.tag)}
            </CardTitle>
            <CardDescription className="text-base leading-6">
              {paper.count === 0
                ? "Nothing still for sale on this table."
                : `${paper.count} ${paper.count === 1 ? "thing" : "things"} still on the table.`}
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-card">
          <CardHeader>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Mall keeps
            </p>
            <CardTitle className="font-heading text-3xl">
              {formatMoney(paper.mallCut)}
            </CardTitle>
            <CardDescription className="text-base leading-6">
              {feePercent}% from the stall, not on top of the buyer.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-card">
          <CardHeader>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Stall is owed
            </p>
            <CardTitle className="font-heading text-3xl">
              {formatMoney(paper.stallOwed)}
            </CardTitle>
            <CardDescription className="text-base leading-6">
              Paper only. No Connect, no bank.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
