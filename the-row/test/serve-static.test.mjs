import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));

test("F-10: the local server only serves the site's public files", async () => {
  const dir = await mkdtemp(join(tmpdir(), "row-static-"));
  const port = 4700 + (process.pid % 200);
  const child = spawn(process.execPath, ["script/serve.mjs"], {
    cwd: root,
    env: { ...process.env, PORT: String(port), ROW_HOST: "127.0.0.1", ROW_CROWD: "", ROW_ACCOUNTS: join(dir, "a.json"), ROW_LIVE: join(dir, "l.json") },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let log = "";
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(log || "no start")), 8000);
    child.stdout.on("data", (c) => { log += c; if (log.includes("row ready")) { clearTimeout(timer); resolve(); } });
    child.on("exit", (code) => { clearTimeout(timer); reject(new Error(`exit ${code}`)); });
  });
  try {
    const base = `http://127.0.0.1:${port}`;
    const code = async (path) => (await fetch(base + path)).status;
    for (const path of ["/", "/pile.html", "/js/room.mjs", "/favicon.svg", "/media/lot.jpg", "/audio/bold.wav"]) {
      assert.equal(await code(path), 200, path);
    }
    for (const path of ["/.env.example", "/.env", "/node_modules/@vercel/blob/package.json", "/script/serve.mjs", "/api/row.mjs", "/package.json", "/test/serve.test.mjs", "/vercel.json"]) {
      assert.equal(await code(path), 404, path);
    }
    assert.equal(await code("/%E0"), 400, "a bad escape is a client error, not a 500");
  } finally {
    child.kill();
  }
});
