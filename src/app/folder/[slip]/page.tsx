import type { Metadata } from "next";
import { cookies } from "next/headers";

import { FolderSlipView } from "@/components/folder/folder-views";
import { CHECKOUT_COOKIE, folderSlipFromCookie } from "@/lib/digital-folder";
import { folderPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slip: string }>;
}): Promise<Metadata> {
  const { slip } = await params;
  return shareMetadata({
    title: "Booth folder",
    description:
      "Stand-in files for digital lines on this checkout slip. A booth folder mock — not a CDN, not email.",
    path: folderPath(slip),
    robots: { index: false, follow: false },
  });
}

export default async function FolderSlipPage({
  params,
}: {
  params: Promise<{ slip: string }>;
}) {
  const { slip: rawSlip } = await params;
  const slip = decodeURIComponent(rawSlip);
  const jar = await cookies();
  const seed = folderSlipFromCookie(jar.get(CHECKOUT_COOKIE)?.value, slip);

  return <FolderSlipView slip={slip} seed={seed} />;
}
