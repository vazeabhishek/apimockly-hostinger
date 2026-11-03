import mysql from "mysql2/promise";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import type { Mock, Repo, User } from "./repo.js";

export function createPool(databaseUrl: string) {
  return mysql.createPool({ uri: databaseUrl, timezone: "Z", connectionLimit: 10, multipleStatements: true });
}

const toMock = (r: RowDataPacket): Mock => ({
  id: r.id,
  method: r.method,
  path: r.path,
  status: r.status,
  body: r.body,
  ownerId: r.owner_id === null ? null : Number(r.owner_id),
  expiresAt: r.expires_at,
  creatorIpHash: r.creator_ip_hash,
  createdAt: r.created_at,
});

const toUser = (r: RowDataPacket): User => ({
  id: Number(r.id),
  email: r.email,
  passwordHash: r.password_hash,
});

export class MysqlRepo implements Repo {
  constructor(private pool: mysql.Pool) {}

  async createMock(m: Mock) {
    await this.pool.execute(
      `INSERT INTO mocks (id, method, path, status, body, owner_id, expires_at, creator_ip_hash, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [m.id, m.method, m.path, m.status, m.body, m.ownerId, m.expiresAt, m.creatorIpHash, m.createdAt],
    );
  }

  async findMock(id: string) {
    const [rows] = await this.pool.execute<RowDataPacket[]>("SELECT * FROM mocks WHERE id = ?", [id]);
    return rows[0] ? toMock(rows[0]) : null;
  }

  async countLiveAnonymousByIp(ipHash: string, now: Date) {
    const [rows] = await this.pool.execute<RowDataPacket[]>(
      "SELECT COUNT(*) AS n FROM mocks WHERE owner_id IS NULL AND creator_ip_hash = ? AND expires_at > ?",
      [ipHash, now],
    );
    return Number(rows[0].n);
  }

  async deleteExpiredAnonymous(now: Date) {
    const [res] = await this.pool.execute<ResultSetHeader>(
      "DELETE FROM mocks WHERE owner_id IS NULL AND expires_at IS NOT NULL AND expires_at <= ?",
      [now],
    );
    return res.affectedRows;
  }

  async claimMock(id: string, userId: number, now: Date) {
    const [res] = await this.pool.execute<ResultSetHeader>(
      "UPDATE mocks SET owner_id = ?, expires_at = NULL WHERE id = ? AND owner_id IS NULL AND expires_at > ?",
      [userId, id, now],
    );
    return res.affectedRows === 1;
  }

  async listMocksByOwner(userId: number) {
    const [rows] = await this.pool.execute<RowDataPacket[]>(
      "SELECT * FROM mocks WHERE owner_id = ? ORDER BY created_at DESC",
      [userId],
    );
    return rows.map(toMock);
  }

  async createUser(email: string, passwordHash: string) {
    try {
      const [res] = await this.pool.execute<ResultSetHeader>(
        "INSERT INTO users (email, password_hash) VALUES (?, ?)",
        [email, passwordHash],
      );
      return { id: res.insertId, email, passwordHash };
    } catch (e) {
      if ((e as { code?: string }).code === "ER_DUP_ENTRY") return null;
      throw e;
    }
  }

  async findUserByEmail(email: string) {
    const [rows] = await this.pool.execute<RowDataPacket[]>("SELECT * FROM users WHERE email = ?", [email]);
    return rows[0] ? toUser(rows[0]) : null;
  }

  async findUserById(id: number) {
    const [rows] = await this.pool.execute<RowDataPacket[]>("SELECT * FROM users WHERE id = ?", [id]);
    return rows[0] ? toUser(rows[0]) : null;
  }

  async withLock(name: string, fn: () => Promise<void>) {
    const conn = await this.pool.getConnection();
    try {
      const [rows] = await conn.query<RowDataPacket[]>("SELECT GET_LOCK(?, 0) AS got", [name]);
      if (Number(rows[0].got) !== 1) return false;
      try {
        await fn();
      } finally {
        await conn.query("SELECT RELEASE_LOCK(?)", [name]);
      }
      return true;
    } finally {
      conn.release();
    }
  }
}
