export interface Mock {
  id: string;
  method: string;
  path: string;
  status: number;
  body: string;
  ownerId: number | null;
  expiresAt: Date | null;
  creatorIpHash: string;
  createdAt: Date;
}

export interface User {
  id: number;
  email: string;
  passwordHash: string;
}

export interface Repo {
  createMock(mock: Mock): Promise<void>;
  findMock(id: string): Promise<Mock | null>;
  countLiveAnonymousByIp(ipHash: string, now: Date): Promise<number>;
  deleteExpiredAnonymous(now: Date): Promise<number>;
  claimMock(id: string, userId: number, now: Date): Promise<boolean>;
  listMocksByOwner(userId: number): Promise<Mock[]>;
  createUser(email: string, passwordHash: string): Promise<User | null>;
  findUserByEmail(email: string): Promise<User | null>;
  findUserById(id: number): Promise<User | null>;
  /** Runs fn only if the named lock is free; returns false when another instance holds it. */
  withLock(name: string, fn: () => Promise<void>): Promise<boolean>;
}
