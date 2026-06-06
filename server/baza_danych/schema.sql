CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(80) NOT NULL,
  login VARCHAR(80) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  password_required TINYINT(1) NOT NULL DEFAULT 1,
  role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
  avatar VARCHAR(255) DEFAULT 'guest',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_login (login),
  INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS auth_codes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code_hash VARCHAR(128) NOT NULL UNIQUE,
  user_id INT NOT NULL,
  redirect_uri VARCHAR(255),
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_auth_codes_hash (code_hash),
  INDEX idx_auth_codes_expires_at (expires_at),
  CONSTRAINT fk_auth_codes_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  event_type VARCHAR(80) NOT NULL,
  severity ENUM('info', 'warning', 'critical') NOT NULL DEFAULT 'info',
  user_id INT NULL,
  login_attempt VARCHAR(80) NULL,
  ip_address VARCHAR(45) NULL,
  user_agent VARCHAR(255) NULL,
  details JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_event_type (event_type),
  INDEX idx_audit_severity (severity),
  INDEX idx_audit_user_id (user_id),
  INDEX idx_audit_created_at (created_at),
  CONSTRAINT fk_audit_logs_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
