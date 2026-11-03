CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS mocks (
  id VARCHAR(32) NOT NULL PRIMARY KEY,
  method VARCHAR(8) NOT NULL,
  path VARCHAR(255) NOT NULL,
  status SMALLINT UNSIGNED NOT NULL,
  body MEDIUMTEXT NOT NULL,
  owner_id BIGINT UNSIGNED NULL,
  expires_at DATETIME(3) NULL,
  creator_ip_hash CHAR(64) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  KEY idx_mocks_expires_at (expires_at),
  KEY idx_mocks_owner_id (owner_id),
  KEY idx_mocks_creator_ip_hash (creator_ip_hash),
  CONSTRAINT fk_mocks_owner FOREIGN KEY (owner_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
