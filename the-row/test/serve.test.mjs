import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));

function start(port, dir) {
  const child = spawn(process.execPath, ["script/serve.mjs"], {
    cwd: root,
    env: {
      ...process.env,
      PORT: String(port),
      ROW_HOST: "127.0.0.1",
      ROW_CROWD: "",
      ROW_ACCOUNTS: join(dir, "accounts.json"),
      ROW_LIVE: join(dir, "live.json"),
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let log = "";
  child.stdout.on("data", (chunk) => {
    log += chunk;
  });
  child.stderr.on("data", (chunk) => {
    log += chunk;
  });
  const ready = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(log || "server did not start")), 8000);
    child.stdout.on("data", () => {
      if (!log.includes("row ready")) return;
      clearTimeout(timer);
      resolve();
    });
    child.on("exit", (code) => {
      clearTimeout(timer);
      reject(new Error(log || `server exited ${code}`));
    });
  });
  return { child, ready };
}

test("the local server keeps a name, scores a round, and serves the pages", async () => {
  const dir = await mkdtemp(join(tmpdir(), "row-"));
  const port = 4490 + (process.pid % 200);
  const { child, ready } = start(port, dir);
  try {
    await ready;
    const base = `http://127.0.0.1:${port}`;
    const home = await fetch(`${base}/`);
    assert.equal(home.status, 200);
    assert.match(await home.text(), /The Row/);
    const icon = await fetch(`${base}/favicon.ico`);
    assert.equal(icon.status, 200);
    assert.match(icon.headers.get("content-type") || "", /svg/);

    const kept = await fetch(`${base}/keep`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ handle: "mint" }),
    });
    const keptBody = await kept.json();
    assert.equal(kept.status, 200);
    assert.equal(keptBody.user.handle, "mint");
    const cookie = (kept.headers.get("set-cookie") || "").split(";")[0];
    const me = await fetch(`${base}/me`, { headers: { cookie } });
    assert.equal((await me.json()).user.handle, "mint");

    let wrote = false;
    for (let i = 0; i < 5; i += 1) {
      const played = await fetch(`${base}/round`, {
        method: "POST",
        headers: { "content-type": "application/json", cookie },
        body: JSON.stringify({ kind: "pile", side: "left" }),
      });
      const body = await played.json();
      assert.equal(played.status, 200, body.error);
      wrote = body.wrote || wrote;
    }
    assert.equal(wrote, true);
    const after = await fetch(`${base}/me`, { headers: { cookie } });
    const user = (await after.json()).user;
    assert.equal(user.wins, 1);
    assert.deepEqual(user.prizes, ["bold"]);

    const disk = JSON.parse(await readFile(join(dir, "accounts.json"), "utf8"));
    const saved = disk.users.find((item) => item.handle === "mint");
    assert.equal(saved.key, undefined);
    assert.equal(typeof saved.keyHash, "string");

    const live = await fetch(`${base}/live.json`);
    const room = await live.json();
    assert.equal(room.beating, false);
    assert.equal(room.drop.name, "Bold Condensed");

    const queued = await fetch(`${base}/queue`, {
      method: "POST",
      headers: { "content-type": "application/json", cookie },
      body: JSON.stringify({ handle: "mint", link: "https://mint.room", game: "pile" }),
    });
    assert.equal((await queued.json()).place, 1);

    for (const path of ["/pile.html", "/line.html", "/lane.html", "/prize-look.html", "/keep.html"]) {
      const page = await fetch(`${base}${path}`);
      assert.equal(page.status, 200, path);
    }
  } finally {
    child.kill();
  }
});
