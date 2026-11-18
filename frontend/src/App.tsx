import { useEffect, useRef, useState } from "react";
import { api, type MockInfo } from "./api";
import { trackPageView } from "./analytics";
import { AuthForm } from "./AuthForm";
import { MyMocks } from "./MyMocks";
import { Shell, type View } from "./Shell";
import { Icons, JsonPreview, MethodBadge, StatusPill, CopyButton, parseBody } from "./ui";

interface Message {
  from: "user" | "bot";
  text: string;
  mock?: MockInfo;
  body?: unknown;
  error?: boolean;
}

const WELCOME: Message = {
  from: "bot",
  text:
    "Hi! Describe the API you want and I'll host it. Format: setup a mock api METHOD /path which returns <json> [with status <code>]. Try one of the examples below.",
};

export function App() {
  const viewFromPath = (): View => {
    if (window.location.pathname === "/login") return "login";
    if (window.location.pathname === "/signup") return "signup";
    if (window.location.pathname === "/mocks") return "mocks";
    return "chat";
  };
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [samples, setSamples] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [lastMock, setLastMock] = useState<MockInfo | null>(null); // kept in memory only
  const [view, setView] = useState<View>(viewFromPath);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.samples().then((r) => setSamples(r.data.prompts ?? []));
    api.me().then((r) => setUser(r.data.user));
  }, []);
  useEffect(() => {
    const onPopState = () => setView(viewFromPath());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);
  useEffect(() => trackPageView(view), [view]);
  useEffect(() => {
    endRef.current?.scrollIntoView?.({ behavior: "smooth" });
  }, [messages, busy]);

  function navigate(next: View) {
    setView(next);
    const path = next === "chat" ? "/" : `/${next}`;
    if (window.location.pathname !== path) window.history.pushState({}, "", path);
  }

  async function send(text: string) {
    const message = text.trim();
    if (!message || busy) return;
    setInput("");
    setBusy(true);
    setMessages((m) => [...m, { from: "user", text: message }]);
    const { data, status } = await api.chat(message);
    setBusy(false);
    if (data.ok) {
      setLastMock(data.mock);
      setMessages((m) => [...m, { from: "bot", text: data.reply, mock: data.mock, body: parseBody(message) }]);
    } else {
      setMessages((m) => [...m, { from: "bot", text: data.reply ?? `Request failed (${status}).`, error: true }]);
    }
  }

  const onAuthed = (u: { email: string }, note?: string) => {
    setUser(u);
    navigate("chat");
    if (note) setMessages((m) => [...m, { from: "bot", text: note }]);
  };

  async function logout() {
    await api.logout();
    setUser(null);
    navigate("chat");
  }

  return (
    <Shell view={view} user={user} onNavigate={navigate} onLogout={logout}>
      {view === "mocks" && <MyMocks onOpenChat={() => navigate("chat")} />}
      {(view === "signup" || view === "login") && (
        <AuthForm
          mode={view}
          claimMock={lastMock}
          onDone={onAuthed}
          onSwitch={() => navigate(view === "signup" ? "login" : "signup")}
          onCancel={() => navigate("chat")}
        />
      )}

      {view === "chat" && (
        <>
          <main className="chat">
            {messages.map((m, i) => (
              <div key={i} className={`row-msg ${m.from}`}>
                <div className="avatar">{m.from === "user" ? <Icons.user /> : <Icons.bot />}</div>
                <div className={`msg${m.error ? " error" : ""}`}>
                  <p>{m.text}</p>
                  {m.mock && (
                    <div className="card">
                      <div className="card-head">
                        <MethodBadge method={m.mock.method} />
                        <code>{m.mock.path}</code>
                        <StatusPill status={m.mock.status} />
                      </div>
                      <div className="card-url">
                        <code>{m.mock.url}</code>
                        <CopyButton text={m.mock.url} label="Copy URL" />
                      </div>
                      {m.body !== undefined && <JsonPreview value={m.body} />}
                      {m.mock.expiresAt && (
                        <p className="notice">
                          Expires {new Date(m.mock.expiresAt).toLocaleString()} and will be removed automatically.{" "}
                          <button className="link" onClick={() => navigate("signup")}>Sign up</button> to keep it
                          (do it before refreshing this page).
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {busy && (
              <div className="row-msg bot" aria-live="polite">
                <div className="avatar"><Icons.bot /></div>
                <div className="msg">
                  <div className="typing" aria-label="Creating your mock"><span /><span /><span /></div>
                  <div className="skeleton card-sk" />
                </div>
              </div>
            )}
            <div ref={endRef} />
          </main>

          <div className="samples">
            {samples.map((s) => (
              <button key={s} className="chip" onClick={() => setInput(s)}>{s}</button>
            ))}
          </div>
          <form
            className="composer"
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='setup a mock api GET /integer/30 which returns {"value": 30}'
              rows={2}
              aria-label="Describe your mock API"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send(input);
                }
              }}
            />
            <button disabled={busy}><Icons.send /><span>Send</span></button>
          </form>
        </>
      )}
    </Shell>
  );
}
