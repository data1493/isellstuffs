import type { Metadata } from "next";
import { cookies } from "next/headers";

import { FolderEmpty } from "@/components/folder/folder-empty";
import { FolderSlip } from "@/components/folder/folder-slip";
import {
  CHECKOUT_COOKIE,
  digitalLinesOnSlip,
  folderSlipFromCookie,
} from "@/lib/digital-folder";
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
  const session = folderSlipFromCookie(jar.get(CHECKOUT_COOKIE)?.value, slip);
  const lines = session ? digitalLinesOnSlip(session.listingIds) : [];

  if (!session || lines.length === 0) {
    return <FolderEmpty />;
  }

  return <FolderSlip slip={session.id} lines={lines} />;
}
