import { test } from "node:test";
import assert from "node:assert/strict";
import { handleContact } from "../src/lib/contact.ts";
const valid = {
  name: "Test Visitor",
  email: "visitor@example.com",
  phone: "",
  message: "This is a local integration test.",
  website: "",
};
let client = 0;
function request(data = valid, overrides = {}) {
  return new Request("http://localhost:3000/api/contact", {
    method: "POST",
    headers: {
      origin: "http://localhost:3000",
      "content-type": "application/json",
      "x-real-ip": String(++client),
      ...overrides,
    },
    body: typeof data === "string" ? data : JSON.stringify(data),
  });
}
test("valid submissions are passed to the transport; success follows acceptance", async () => {
  let delivered;
  const result = await handleContact(
    request(),
    async (data) => {
      delivered = data;
    },
    true,
  );
  assert.equal(result.status, 200);
  assert.deepEqual(delivered, {
    name: valid.name,
    email: valid.email,
    phone: "",
    message: valid.message,
  });
});
test("provider failure returns an error rather than false success", async () => {
  assert.equal(
    (
      await handleContact(
        request(),
        async () => {
          throw Error("offline");
        },
        true,
      )
    ).status,
    502,
  );
});
test("missing configuration returns an actionable fallback", async () => {
  let calls = 0;
  const result = await handleContact(
    request(),
    async () => {
      calls++;
    },
    false,
  );
  assert.equal(result.status, 503);
  assert.equal(calls, 0);
});
test("rejects invalid fields, forged origins, malformed JSON and oversized payloads", async () => {
  const noSend = async () => assert.fail("Transport must not be called");
  assert.equal(
    (await handleContact(request({ ...valid, email: "invalid" }), noSend, true))
      .status,
    400,
  );
  assert.equal(
    (
      await handleContact(
        request({ ...valid, name: "Name\r\nBcc:other@example.com" }),
        noSend,
        true,
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await handleContact(
        request(valid, { origin: "https://other.example" }),
        noSend,
        true,
      )
    ).status,
    403,
  );
  assert.equal(
    (await handleContact(request("{broken"), noSend, true)).status,
    400,
  );
  assert.equal(
    (
      await handleContact(
        request({ ...valid, message: "x".repeat(17000) }),
        noSend,
        true,
      )
    ).status,
    413,
  );
});
test("honeypot quietly discards automated submissions", async () => {
  const result = await handleContact(
    request({ ...valid, website: "spam" }),
    async () => assert.fail("No mail should be sent"),
    true,
  );
  assert.equal(result.status, 200);
});
test("throttles repeated submissions from the same client", async () => {
  for (let index = 0; index < 5; index++)
    assert.equal(
      (
        await handleContact(
          request(valid, { "x-real-ip": "rate-test" }),
          async () => {},
          true,
        )
      ).status,
      200,
    );
  const result = await handleContact(
    request(valid, { "x-real-ip": "rate-test" }),
    async () => assert.fail("Limit exceeded"),
    true,
  );
  assert.equal(result.status, 429);
  assert.ok(result.headers.has("Retry-After"));
});
test("onResult receives 'unconfigured' when SMTP is missing", async () => {
  const results = [];
  const response = await handleContact(
    request(),
    async () => assert.fail("Transport must not be called"),
    false,
    async (message, outcome) => {
      results.push({ message, outcome });
    },
  );
  assert.equal(response.status, 503);
  assert.equal(results.length, 1);
  assert.equal(results[0].outcome, "unconfigured");
  assert.equal(results[0].message.email, valid.email);
});
test("onResult receives 'failed' when the transport throws", async () => {
  const outcomes = [];
  const response = await handleContact(
    request(),
    async () => {
      throw Error("offline");
    },
    true,
    async (_message, outcome) => {
      outcomes.push(outcome);
    },
  );
  assert.equal(response.status, 502);
  assert.deepEqual(outcomes, ["failed"]);
});
test("onResult receives 'sent' after delivery, and its errors never reach the visitor", async () => {
  const outcomes = [];
  const ok = await handleContact(request(), async () => {}, true, async (_m, outcome) => {
    outcomes.push(outcome);
  });
  assert.equal(ok.status, 200);
  assert.deepEqual(outcomes, ["sent"]);
  const failingStore = await handleContact(request(), async () => {}, true, async () => {
    throw Error("database down");
  });
  assert.equal(failingStore.status, 200);
});
test("invalid submissions never reach onResult", async () => {
  const response = await handleContact(
    request({ ...valid, email: "invalid" }),
    async () => assert.fail("Transport must not be called"),
    true,
    async () => assert.fail("Nothing should be saved"),
  );
  assert.equal(response.status, 400);
});
