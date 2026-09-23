import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { browseMetadata } from "@/lib/seo";

export const metadata: Metadata = browseMetadata();

export default function BrowsePage() {
  redirect("/explore");
}
