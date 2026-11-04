import { useRef, useState, type ReactNode } from "react";
import { DonateDialog } from "./DonateDialog";
import { Icons } from "./ui";

export type View = "chat" | "signup" | "login" | "mocks";

interface Props {
  view: View;
  user: { email: string } | null;
  onNavigate: (v: View) => void;
  onLogout: () => void;
  children: ReactNode;
}

const TITLES: Record<View, string> = { chat: "Chat", mocks: "My mocks", login: "Log in", signup: "Sign up" };

export function Shell({ view, user, onNavigate, onLogout, children }: Props) {
  const [open, setOpen] = useState(false);
  const donateRef = useRef<HTMLDialogElement>(null);
  const go = (v: View) => {
    onNavigate(v);
    setOpen(false);
  };

  return (
    <div className="shell">
      <aside className={`sidebar${open ? " open" : ""}`}>
        <div className="brand"><Icons.logo /> API Mockly</div>
        <p className="tagline">Mock your APIs faster</p>
        <nav className="side-nav" aria-label="Main">
          <button className={`nav-item${view === "chat" ? " active" : ""}`} onClick={() => go("chat")}>
            <Icons.chat /> Chat
          </button>
          {user && (
            <button className={`nav-item${view === "mocks" ? " active" : ""}`} onClick={() => go("mocks")}>
              <Icons.list /> My mocks
            </button>
          )}
        </nav>
        <div className="side-foot">
          <button className="btn-ghost donate-btn" onClick={() => donateRef.current?.showModal()}>
            <Icons.paypal /> Donate
          </button>
          {user ? (
            <>
              <span className="email" title={user.email}>{user.email}</span>
              <button className="btn-ghost" onClick={() => { setOpen(false); onLogout(); }}>Log out</button>
            </>
          ) : (
            <div className="row">
              <button className="btn-ghost" onClick={() => go("login")}>Log in</button>
              <button onClick={() => go("signup")}>Sign up</button>
            </div>
          )}
        </div>
      </aside>
      <DonateDialog ref={donateRef} onClose={() => setOpen(false)} />
      <div className={`scrim${open ? " show" : ""}`} onClick={() => setOpen(false)} />
      <div className="main-col">
        <header className="topbar">
          <button className="btn-ghost icon-btn menu" aria-label="Open menu" onClick={() => setOpen(true)}>
            <Icons.menu />
          </button>
          <h1>{TITLES[view]}</h1>
        </header>
        <div className="content">{children}</div>
      </div>
    </div>
  );
}
