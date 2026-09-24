import { cookies } from "next/headers";

import {
  loadAgentRowFloor,
  parseLots,
  snapshotFromRequestCookies,
} from "@/lib/agent-row-io";

export async function loadRequestFloor() {
  const jar = await cookies();
  const snapshot = snapshotFromRequestCookies((name) => jar.get(name)?.value);
  const floor = await loadAgentRowFloor(snapshot);
  return { floor, snapshotLots: parseLots(snapshot.lots) };
}

export function oneParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}
