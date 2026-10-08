/**
 * User Entity & Schema Definitions
 * Hotel Management System - User Authentication
 */

const USER_ROLES = Object.freeze({
  ADMIN: 'ADMIN',
  STAFF: 'STAFF',
  USER: 'USER'
});

const USER_STATUS = Object.freeze({
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED'
});

const CREATE_USERS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fullName TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL COLLATE NOCASE,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'USER',
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  createdAt TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
`;

class UserEntity {
  constructor({ id = null, fullName, email, password, role = USER_ROLES.USER, status = USER_STATUS.ACTIVE, createdAt = new Date().toISOString() }) {
    this.id = id;
    this.fullName = fullName ? fullName.trim() : '';
    this.email = email ? email.trim().toLowerCase() : '';
    this.password = password;
    this.role = role;
    this.status = status;
    this.createdAt = createdAt;
  }

  /**
   * Returns public-safe user object without sensitive password hash
   */
  toSafeObject() {
    return {
      id: this.id,
      fullName: this.fullName,
      email: this.email,
      role: this.role,
      status: this.status,
      createdAt: this.createdAt
    };
  }

  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return Boolean(email && emailRegex.test(String(email).trim()));
  }

  static validateRole(role) {
    return Object.values(USER_ROLES).includes(role);
  }
}

module.exports = {
  USER_ROLES,
  USER_STATUS,
  CREATE_USERS_TABLE_SQL,
  UserEntity
};
