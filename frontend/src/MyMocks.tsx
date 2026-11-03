import { useEffect, useState } from "react";
import { api, type MockInfo } from "./api";
import { CopyButton, Icons, MethodBadge, StatusPill } from "./ui";

export function MyMocks({ onOpenChat }: { onOpenChat: () => void }) {
  const [mocks, setMocks] = useState<MockInfo[] | null>(null);

  useEffect(() => {
    api.mocks().then((r) => setMocks(r.data.mocks ?? []));
  }, []);

  return (
    <section>
      <h2 className="page-title">My mocks</h2>
      <p className="page-sub">Endpoints saved to your account.</p>
      {!mocks && (
        <div className="mock-list" aria-busy="true">
          {[0, 1, 2].map((i) => <div key={i} className="skeleton row-sk" />)}
        </div>
      )}
      {mocks && mocks.length === 0 && (
        <div className="empty">
          <div className="icon-wrap"><Icons.list /></div>
          <h3>No mocks yet</h3>
          <p>Describe an API in the chat and it will show up here once saved.</p>
          <button onClick={onOpenChat}>Open chat</button>
        </div>
      )}
      {mocks && mocks.length > 0 && (
        <div className="mock-list">
          {mocks.map((m) => (
            <div key={m.id} className="mock-item">
              <MethodBadge method={m.method} />
              <StatusPill status={m.status} />
              <span className="path">{m.path}</span>
              <span />
              <div className="url">
                <code>{m.url}</code>
                <CopyButton text={m.url} label="Copy URL" />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
