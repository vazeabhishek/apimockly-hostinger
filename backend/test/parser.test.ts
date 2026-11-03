import { describe, expect, it } from "vitest";
import { parseMockPhrase } from "../src/parser.js";

const parse = (s: string) => parseMockPhrase(s, 10 * 1024);

describe("parseMockPhrase", () => {
  it("parses the full phrase with default status", () => {
    const r = parse('setup a mock api GET /integer/30 which returns {"value":30}');
    expect(r).toEqual({ ok: true, mock: { method: "GET", path: "/integer/30", status: 200, body: '{"value":30}' } });
  });

  it("parses short form, lower-case method and custom status", () => {
    const r = parse('post /orders returns {"error":"x"} with status 422');
    expect(r).toEqual({ ok: true, mock: { method: "POST", path: "/orders", status: 422, body: '{"error":"x"}' } });
  });

  it("accepts multi-line JSON", () => {
    const r = parse('GET /a which returns {\n  "a": 1\n}');
    expect(r.ok).toBe(true);
  });

  it("rejects invalid JSON", () => {
    const r = parse("GET /a which returns {nope}");
    expect(r).toMatchObject({ ok: false });
  });

  it("rejects unsupported method, bad path, bad status, oversize", () => {
    expect(parse("FETCH /a returns {}")).toMatchObject({ ok: false });
    expect(parse("GET a returns {}")).toMatchObject({ ok: false });
    expect(parse("GET /a?x=1 returns {}")).toMatchObject({ ok: false });
    expect(parse("GET /a returns {} with status 700")).toMatchObject({ ok: false });
    expect(parseMockPhrase('GET /a returns {"a":"' + "x".repeat(50) + '"}', 20)).toMatchObject({ ok: false });
  });

  it("rejects gibberish", () => {
    expect(parse("hello there")).toMatchObject({ ok: false });
  });
});
