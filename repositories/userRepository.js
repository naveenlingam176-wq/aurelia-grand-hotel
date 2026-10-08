/**
 * User Repository
 * Data Access Layer for User Operations
 */

const { getDatabase } = require('../db/database');
const { UserEntity, USER_ROLES, USER_STATUS } = require('../db/userEntity');
const PasswordService = require('../services/passwordService');

class UserRepository {
  constructor() {
    this.db = getDatabase();
  }

  /**
   * Find user by email (case-insensitive)
   * @param {string} email 
   * @returns {object|null}
   */
  findByEmail(email) {
    if (!email) return null;
    const normalized = String(email).trim().toLowerCase();
    const stmt = this.db.prepare('SELECT * FROM users WHERE LOWER(email) = ? LIMIT 1');
    const row = stmt.get(normalized);
    return row || null;
  }

  /**
   * Find user by ID
   * @param {number} id 
   * @returns {object|null}
   */
  findById(id) {
    if (!id) return null;
    const stmt = this.db.prepare('SELECT id, fullName, email, role, status, createdAt FROM users WHERE id = ? LIMIT 1');
    const row = stmt.get(id);
    return row || null;
  }

  /**
   * Create a new user with hashed password
   * @param {object} userData 
   * @returns {object} Safe user object
   */
  create({ fullName, email, password, role = USER_ROLES.USER, status = USER_STATUS.ACTIVE }) {
    if (!fullName || !fullName.trim()) {
      throw new Error('Full name is required');
    }
    if (!UserEntity.validateEmail(email)) {
      throw new Error('Valid email address is required');
    }
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }
    if (!UserEntity.validateRole(role)) {
      throw new Error(`Invalid role: ${role}`);
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = this.findByEmail(normalizedEmail);
    if (existing) {
      throw new Error('A user with this email address already exists');
    }

    const hashedPassword = PasswordService.hashPassword(password);
    const createdAt = new Date().toISOString();

    const insertStmt = this.db.prepare(`
      INSERT INTO users (fullName, email, password, role, status, createdAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = insertStmt.run(
      fullName.trim(),
      normalizedEmail,
      hashedPassword,
      role,
      status,
      createdAt
    );

    return {
      id: Number(result.lastInsertRowid),
      fullName: fullName.trim(),
      email: normalizedEmail,
      role,
      status,
      createdAt
    };
  }

  /**
   * List all users (safe view)
   */
  listAll() {
    const stmt = this.db.prepare('SELECT id, fullName, email, role, status, createdAt FROM users ORDER BY id ASC');
    return stmt.all();
  }

  /**
   * Seed default system users for ADMIN, STAFF, and USER roles if not already existing
   */
  seedDefaultUsers() {
    const defaultAccounts = [
      {
        fullName: 'Julian Vance',
        email: 'admin@aureliagrand.com',
        password: 'AdminPassword123!',
        role: USER_ROLES.ADMIN,
        status: USER_STATUS.ACTIVE
      },
      {
        fullName: 'Elena Rostova',
        email: 'staff@aureliagrand.com',
        password: 'StaffPassword123!',
        role: USER_ROLES.STAFF,
        status: USER_STATUS.ACTIVE
      },
      {
        fullName: 'Lord Montgomery',
        email: 'user@aureliagrand.com',
        password: 'UserPassword123!',
        role: USER_ROLES.USER,
        status: USER_STATUS.ACTIVE
      }
    ];

    for (const acc of defaultAccounts) {
      const existing = this.findByEmail(acc.email);
      if (!existing) {
        this.create(acc);
      }
    }
  }
}

module.exports = UserRepository;
