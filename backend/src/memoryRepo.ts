import type { Mock, Repo, User } from "./repo.js";

export class MemoryRepo implements Repo {
  mocks = new Map<string, Mock>();
  users: User[] = [];
  private locks = new Set<string>();

  async createMock(mock: Mock) {
    this.mocks.set(mock.id, { ...mock });
  }
  async findMock(id: string) {
    return this.mocks.get(id) ?? null;
  }
  async countLiveAnonymousByIp(ipHash: string, now: Date) {
    return [...this.mocks.values()].filter(
      (m) => m.ownerId === null && m.creatorIpHash === ipHash && m.expiresAt !== null && m.expiresAt > now,
    ).length;
  }
  async deleteExpiredAnonymous(now: Date) {
    let n = 0;
    for (const [id, m] of this.mocks) {
      if (m.ownerId === null && m.expiresAt !== null && m.expiresAt <= now) {
        this.mocks.delete(id);
        n++;
      }
    }
    return n;
  }
  async claimMock(id: string, userId: number, now: Date) {
    const m = this.mocks.get(id);
    if (!m || m.ownerId !== null || !m.expiresAt || m.expiresAt <= now) return false;
    m.ownerId = userId;
    m.expiresAt = null;
    return true;
  }
  async listMocksByOwner(userId: number) {
    return [...this.mocks.values()]
      .filter((m) => m.ownerId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  async createUser(email: string, passwordHash: string) {
    if (this.users.some((u) => u.email === email)) return null;
    const u = { id: this.users.length + 1, email, passwordHash };
    this.users.push(u);
    return u;
  }
  async findUserByEmail(email: string) {
    return this.users.find((u) => u.email === email) ?? null;
  }
  async findUserById(id: number) {
    return this.users.find((u) => u.id === id) ?? null;
  }
  async withLock(name: string, fn: () => Promise<void>) {
    if (this.locks.has(name)) return false;
    this.locks.add(name);
    try {
      await fn();
    } finally {
      this.locks.delete(name);
    }
    return true;
  }
}
