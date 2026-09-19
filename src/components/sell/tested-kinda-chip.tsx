"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import {
  TESTED_KINDA_CHANGED_EVENT,
  TESTED_KINDA_MIRROR_SCRIPT,
  isTestedKindaPinned,
} from "@/lib/tested-kinda-pin";

export function TestedKindaChip({ listingId }: { listingId: string }) {
  const [on, setOn] = useState(() => isTestedKindaPinned(listingId));

  useEffect(() => {
    function apply() {
      setOn(isTestedKindaPinned(listingId));
    }

    apply();
    window.addEventListener(TESTED_KINDA_CHANGED_EVENT, apply);
    window.addEventListener("storage", apply);
    return () => {
      window.removeEventListener(TESTED_KINDA_CHANGED_EVENT, apply);
      window.removeEventListener("storage", apply);
    };
  }, [listingId]);

  if (!on) {
    return null;
  }

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: TESTED_KINDA_MIRROR_SCRIPT }} />
      <Badge variant="outline">Tested, kinda</Badge>
    </>
  );
}
