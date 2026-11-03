# Reference: database schema

MySQL 8, InnoDB, utf8mb4. Defined in `backend/src/migrations/001_init.sql`.

## `users`

| Column | Type | Notes |
|---|---|---|
| `id` | BIGINT UNSIGNED, PK, auto-increment | |
| `email` | VARCHAR(255) | Unique, stored lower-case |
| `password_hash` | VARCHAR(255) | `scrypt$<salt hex>$<hash hex>` |
| `created_at` | DATETIME(3) | |

## `mocks`

| Column | Type | Notes |
|---|---|---|
| `id` | VARCHAR(32), PK | Random ID used in the URL |
| `method` | VARCHAR(8) | |
| `path` | VARCHAR(255) | |
| `status` | SMALLINT UNSIGNED | |
| `body` | MEDIUMTEXT | Validated JSON text |
| `owner_id` | BIGINT UNSIGNED, NULL | FK to `users.id`; `NULL` = anonymous |
| `expires_at` | DATETIME(3), NULL | `NULL` = never expires |
| `creator_ip_hash` | CHAR(64) | SHA-256 of secret + IP; used for the anonymous cap |
| `created_at` | DATETIME(3) | |

Indexes: `idx_mocks_expires_at`, `idx_mocks_owner_id`, `idx_mocks_creator_ip_hash`.

Invariant: an anonymous mock (`owner_id IS NULL`) has a non-null `expires_at`; an owned mock has `expires_at = NULL`.
