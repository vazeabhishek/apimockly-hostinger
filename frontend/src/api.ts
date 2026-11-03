export interface MockInfo {
  id: string;
  url: string;
  method: string;
  path: string;
  status: number;
  expiresAt: string | null;
}

async function request<T>(url: string, init?: RequestInit): Promise<{ status: number; data: T }> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
  });
  const data = (await res.json().catch(() => ({}))) as T;
  return { status: res.status, data };
}

const post = (url: string, body: unknown) => request<any>(url, { method: "POST", body: JSON.stringify(body) });

export const api = {
  samples: () => request<{ prompts: string[] }>("/api/samples"),
  chat: (message: string) => post("/api/chat", { message }),
  me: () => request<{ user: { email: string } | null }>("/api/auth/me"),
  signup: (email: string, password: string, claimMockId?: string) =>
    post("/api/auth/signup", { email, password, claimMockId }),
  login: (email: string, password: string) => post("/api/auth/login", { email, password }),
  logout: () => post("/api/auth/logout", {}),
  mocks: () => request<{ mocks: MockInfo[] }>("/api/mocks"),
};
