import type { Metadata } from "next";
import { cookies } from "next/headers";

import { HuntBoard } from "@/components/wanted/hunt-board";
import { WANTED_COOKIE_NAME, parseWantedHunts } from "@/lib/wanted";
import { wantedMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = wantedMetadata();

type WantedPageProps = {
  searchParams?: Promise<{ error?: string | string[] }>;
};

export default async function WantedPage({ searchParams }: WantedPageProps) {
  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const hunts = parseWantedHunts(jar.get(WANTED_COOKIE_NAME)?.value);

  return <HuntBoard hunts={hunts} emptyTape={error === "empty"} />;
}
