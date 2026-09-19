import type { Metadata } from "next";
import { cookies } from "next/headers";

import { StallMissing } from "@/components/mall-missing";
import { BoothWifiBoard } from "@/components/stalls/booth-wifi-board";
import { stallBySlug } from "@/lib/commerce";
import {
  BOOTH_WIFI_COOKIE_NAME,
  BOOTH_WIFI_PAPER_LINE,
  boothWifiFor,
  parseBoothWifi,
  stallWifiPath,
} from "@/lib/booth-wifi";
import { PACKED_COOKIE_NAME, parsePackedStallIds } from "@/lib/packed-stall";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallWifiPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: StallWifiPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `I don't have wifi · ${stall.boothName}`,
    description: `${BOOTH_WIFI_PAPER_LINE} Tape the wifi note on ${stall.boothName}. Pay first.`,
    path: stallWifiPath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallWifiPage({
  params,
  searchParams,
}: StallWifiPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseBoothWifi(jar.get(BOOTH_WIFI_COOKIE_NAME)?.value);
  const current = boothWifiFor(stall.id, map);
  const packed = parsePackedStallIds(
    jar.get(PACKED_COOKIE_NAME)?.value,
  ).includes(stall.id);

  return (
    <BoothWifiBoard
      stall={stall}
      map={map}
      current={current}
      packed={packed}
      emptyTape={error === "empty"}
    />
  );
}
