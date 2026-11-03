export const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;
export type Method = (typeof METHODS)[number];

export interface ParsedMock {
  method: Method;
  path: string;
  status: number;
  body: string;
}

export type ParseResult = { ok: true; mock: ParsedMock } | { ok: false; error: string };

export const SAMPLE_PROMPTS = [
  'setup a mock api GET /integer/30 which returns {"value": 30}',
  'setup a mock api POST /orders which returns {"error": "invalid"} with status 422',
  'GET /users/1 which returns {"id": 1, "name": "Ada"}',
];

const PHRASE =
  /^\s*(?:set\s?up\s+(?:a\s+)?mock\s+api\s+)?([A-Za-z]+)\s+(\S+)\s+(?:which\s+)?returns\s+([\s\S]+?)\s*$/i;
const STATUS_SUFFIX = /^([\s\S]*?)\s+with\s+status\s+(\d{3})\s*$/i;
const PATH_CHARS = /^\/[A-Za-z0-9\-._~/%]*$/;

const FORMAT_HELP =
  "Use: setup a mock api METHOD /path which returns <json> [with status <code>]";

export function parseMockPhrase(input: string, maxBodyBytes: number): ParseResult {
  const m = PHRASE.exec(input);
  if (!m) return { ok: false, error: `I couldn't understand that. ${FORMAT_HELP}` };

  const method = m[1].toUpperCase();
  if (!(METHODS as readonly string[]).includes(method)) {
    return { ok: false, error: `Unsupported method "${m[1]}". Use one of ${METHODS.join(", ")}.` };
  }

  const path = m[2];
  if (!PATH_CHARS.test(path) || path.length > 200) {
    return {
      ok: false,
      error: "The path must start with / and contain only letters, digits and - . _ ~ / % (max 200 chars).",
    };
  }

  let rest = m[3];
  let status = 200;
  const s = STATUS_SUFFIX.exec(rest);
  if (s) {
    rest = s[1];
    status = Number(s[2]);
    if (status < 200 || status > 599) {
      return { ok: false, error: "The status code must be between 200 and 599." };
    }
  }

  try {
    JSON.parse(rest);
  } catch {
    return { ok: false, error: `The response body is not valid JSON. ${FORMAT_HELP}` };
  }

  if (Buffer.byteLength(rest, "utf8") > maxBodyBytes) {
    return { ok: false, error: `The response body is too large (max ${maxBodyBytes} bytes).` };
  }

  return { ok: true, mock: { method: method as Method, path, status, body: rest } };
}
