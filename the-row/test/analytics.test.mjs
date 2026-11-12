import test from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const TAG = '<script defer src="/_vercel/insights/script.js"></script>';

test("the row pages include the Vercel Web Analytics script and the project file does not enable it", async () => {
  const names = (await readdir(root)).filter((name) => name.endsWith(".html")).sort();
  assert.deepEqual(names, ["index.html", "keep.html", "lane.html", "line.html", "pile.html", "prize-look.html"]);
  for (const name of names) {
    const html = await readFile(new URL(`../${name}`, import.meta.url), "utf8");
    assert.equal(html.split(TAG).length - 1, 1, name);
    assert.ok(html.indexOf(TAG) < html.indexOf("</head>"), name);
  }
  const vercel = await readFile(new URL("../vercel.json", import.meta.url), "utf8");
  assert.equal(vercel.includes("analytics"), false);
  assert.equal(vercel.includes("insights"), false);
});
