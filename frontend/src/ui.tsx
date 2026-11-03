import { useState, type ReactNode } from "react";

const svg = (children: ReactNode, size = 18) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
);

export const Icons = {
  logo: () => (
    <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#818cf8" /><stop offset="1" stopColor="#6366f1" />
        </linearGradient>
      </defs>
      <rect width="28" height="28" rx="8" fill="url(#lg)" />
      <path d="M9 9l-3 5 3 5M19 9l3 5-3 5M15 8l-2 12" stroke="#fff" strokeWidth="2" fill="none"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  paypal: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M7.1 21H3.9L6.5 3h6.2c3.3 0 5.1 1.700 4.600 4.600-.600 3.600-3 5.200-6.400 5.200H8.500zm2.100-10.300h1.700c1.800 0 3-.800 3.300-2.600.2-1.300-.6-2-2.200-2H9.300z" />
      <path d="M10.500 21H7.900l.9-6h2.300c3.200 0 5.500-1.600 6.100-5 1.100.8 1.500 2 1.200 3.700-.6 3.600-3 5.300-6.400 5.300z" opacity=".55" />
    </svg>
  ),
  chat: () => svg(<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />),
  list: () => svg(<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />),
  menu: () => svg(<path d="M3 6h18M3 12h18M3 18h18" />),
  copy: () => svg(<><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>, 15),
  check: () => svg(<path d="M20 6L9 17l-5-5" />, 15),
  send: () => svg(<path d="M22 2L11 13M22 2l-7 20-4-9-9-4z" />),
  user: () => svg(<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>),
  bot: () => svg(<><rect x="3" y="8" width="18" height="12" rx="3" /><path d="M12 8V4M8 14h.01M16 14h.01" /></>),
};

export function MethodBadge({ method }: { method: string }) {
  return <span className={`badge m-${method.toLowerCase()}`}>{method.toUpperCase()}</span>;
}

export function StatusPill({ status }: { status: number }) {
  const kind = status >= 500 ? "err" : status >= 400 ? "warn" : "ok";
  return <span className={`pill ${kind}`}>{status}</span>;
}

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="btn-ghost copy"
      aria-label={`${label} to clipboard`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        } catch {
          /* clipboard unavailable */
        }
      }}
    >
      {done ? <Icons.check /> : <Icons.copy />}
      <span>{done ? "Copied" : label}</span>
    </button>
  );
}

/** Extracts the JSON body from a prompt like "... returns {json} [with status 200]". */
export function parseBody(prompt: string): unknown | undefined {
  const m = /\breturns?\b\s*([\s\S]*?)(?:\s+with\s+status\s+\d+\s*)?$/i.exec(prompt);
  if (!m) return undefined;
  try {
    return JSON.parse(m[1].trim());
  } catch {
    return undefined;
  }
}

const TOKEN = /("(?:\\.|[^"\\])*")(\s*:)?|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|\b(true|false)\b|\b(null)\b/g;

export function JsonPreview({ value }: { value: unknown }) {
  const text = JSON.stringify(value, null, 2);
  const nodes: ReactNode[] = [];
  let last = 0;
  let i = 0;
  for (const m of text.matchAll(TOKEN)) {
    const idx = m.index!;
    if (idx > last) nodes.push(text.slice(last, idx));
    if (m[1] !== undefined) {
      nodes.push(<span key={i++} className={m[2] ? "j-key" : "j-str"}>{m[1]}</span>);
      if (m[2]) nodes.push(m[2]);
    } else if (m[3] !== undefined) nodes.push(<span key={i++} className="j-num">{m[3]}</span>);
    else if (m[4] !== undefined) nodes.push(<span key={i++} className="j-bool">{m[4]}</span>);
    else nodes.push(<span key={i++} className="j-null">{m[5]}</span>);
    last = idx + m[0].length;
  }
  nodes.push(text.slice(last));
  return (
    <div className="json">
      <div className="json-head"><span>Response body</span><CopyButton text={text} label="Copy JSON" /></div>
      <pre><code>{nodes}</code></pre>
    </div>
  );
}
