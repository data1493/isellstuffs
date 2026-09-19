"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { stallById } from "@/lib/commerce";
import { stallEditPath, stallPath } from "@/lib/paths";
import { parseStallCard, type StallCardResult } from "@/lib/stall-card";
import { upsertStallCard } from "@/lib/stall-overlay";

export async function saveStallCard(
  formData: FormData,
): Promise<StallCardResult> {
  const parsed = parseStallCard(formData);
  if (!parsed.ok) {
    return parsed;
  }

  upsertStallCard(parsed.patch);
  const stall = stallById(parsed.patch.stallId);

  if (!stall) {
    return {
      ok: false,
      error: "That stall is not on this floor. You can only rewrite a booth that already exists.",
    };
  }

  revalidatePath(stallPath(stall.slug));
  revalidatePath(stallEditPath(stall.slug));
  redirect(stallPath(stall.slug));
}
