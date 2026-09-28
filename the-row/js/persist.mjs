import { revive, seedRoom } from "./room.mjs";

export const STORAGE_KEY = "the-row-v1";

export function readRoom(storage) {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return seedRoom();
    return revive(JSON.parse(raw));
  } catch {
    return seedRoom();
  }
}

export function writeRoom(storage, state) {
  storage.setItem(STORAGE_KEY, JSON.stringify(state));
  return state;
}
