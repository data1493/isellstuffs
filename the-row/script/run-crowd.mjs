import { rename, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { crowdBeat, fillRoom } from "../js/crowd.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dest = join(root, "live.json");
const tmp = join(root, "live.json.tmp");

let state = fillRoom();
let beat = 0;

async function publish(next) {
  await writeFile(tmp, JSON.stringify(next));
  await rename(tmp, dest);
}

await publish(state);
console.log(`crowd ready: ${state.people.length} in`);

async function loop() {
  try {
    const stepped = crowdBeat(state, beat);
    state = stepped.state;
    beat = stepped.beat;
    await publish(state);
  } catch (error) {
    console.error(error);
  }
  setTimeout(loop, 2400);
}

setTimeout(loop, 2400);
