import type { Metadata } from "next";
import { cookies } from "next/headers";

import { FreeBoxBoard } from "@/components/stalls/free-box-board";
import { StallMissing } from "@/components/mall-missing";
import { stallBySlug } from "@/lib/commerce";
import {
  FREE_BOX_COOKIE_NAME,
  parseFreeBox,
  titlesForStall,
} from "@/lib/free-box";
import { stallFreePath } from "@/lib/paths";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type FreeBoxPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: FreeBoxPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return missingStallMetadata();
  }

  return shareMetadata({
    title: `Free box · ${stall.boothName}`,
    description: `Cardboard free pile on ${stall.boothName}. Titles, not a $0 listing. Not tote math. Tags stay prices.`,
    path: stallFreePath(stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallFreePage({
  params,
  searchParams,
}: FreeBoxPageProps) {
  const { slug } = await params;
  const stall = stallBySlug(slug);

  if (!stall) {
    return <StallMissing />;
  }

  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const titles = titlesForStall(
    parseFreeBox(jar.get(FREE_BOX_COOKIE_NAME)?.value),
    stall.id,
  );

  return (
    <FreeBoxBoard stall={stall} titles={titles} emptyTape={error === "empty"} />
  );
}
