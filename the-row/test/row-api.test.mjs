import test from "node:test";
import assert from "node:assert/strict";
import { blobEtag, commandOptions, faultText, putOptions } from "../api/row.mjs";

test("the read-write token is sent on blob commands", () => {
  const env = { BLOB_READ_WRITE_TOKEN: " vercel_blob_rw_example_secret " };
  assert.deepEqual(commandOptions({ access: "private" }, env), {
    access: "private",
    token: "vercel_blob_rw_example_secret",
  });
  assert.deepEqual(commandOptions({ access: "private" }, {}), { access: "private" });
});

test("a missing etag overwrites and a present etag compares", () => {
  const env = { BLOB_READ_WRITE_TOKEN: "vercel_blob_rw_example_secret" };
  const created = putOptions("", env);
  assert.equal(created.allowOverwrite, true);
  assert.equal(created.ifMatch, undefined);
  assert.equal(created.token, "vercel_blob_rw_example_secret");
  const matched = putOptions('"abc"', env);
  assert.equal(matched.ifMatch, '"abc"');
  assert.equal(matched.allowOverwrite, undefined);
});

test("a store fault keeps the message and drops a token", () => {
  const error = new Error('Vercel Blob: Failed to fetch blob with vercel_blob_rw_example_secretvalue');
  error.name = "BlobError";
  assert.equal(faultText(error), "BlobError: Vercel Blob: Failed to fetch blob with [token]");
  const secret = new Error("authorization: Bearer vercel_blob_rw_example_secret");
  assert.equal(faultText(secret), "Error");
  const nested = new Error("The room changed.");
  nested.cause = error;
  assert.equal(
    faultText(nested),
    "Error: The room changed. | BlobError: Vercel Blob: Failed to fetch blob with [token]",
  );
});

test("a weak download validator becomes the strong etag", () => {
  assert.equal(blobEtag('W/"abc"'), '"abc"');
  assert.equal(blobEtag('"abc"'), '"abc"');
});
