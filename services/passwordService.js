/**
 * Password Security Service
 * Cryptographic salted hashing and timing-safe verification
 */

const crypto = require('crypto');

const SALT_BYTES = 16;
const KEY_LENGTH = 64;

class PasswordService {
  /**
   * Hashes a plaintext password using a cryptographically random salt and scrypt
   * @param {string} password 
   * @returns {string} Encoded hash string (e.g. scrypt:v1:salt:derivedKey)
   */
  static hashPassword(password) {
    if (!password || typeof password !== 'string' || password.trim().length === 0) {
      throw new Error('Password cannot be empty');
    }

    const salt = crypto.randomBytes(SALT_BYTES).toString('hex');
    const derivedKey = crypto.scryptSync(password, salt, KEY_LENGTH);
    return `scrypt:v1:${salt}:${derivedKey.toString('hex')}`;
  }

  /**
   * Verifies a plaintext password against a stored hashed password in constant time
   * @param {string} password 
   * @param {string} storedHash 
   * @returns {boolean}
   */
  static verifyPassword(password, storedHash) {
    if (!password || !storedHash || typeof storedHash !== 'string') {
      return false;
    }

    const parts = storedHash.split(':');
    if (parts.length !== 4 || parts[0] !== 'scrypt' || parts[1] !== 'v1') {
      return false;
    }

    const salt = parts[2];
    const key = parts[3];

    try {
      const derivedKey = crypto.scryptSync(password, salt, KEY_LENGTH);
      const keyBuffer = Buffer.from(key, 'hex');
      
      if (derivedKey.length !== keyBuffer.length) {
        return false;
      }
      
      return crypto.timingSafeEqual(derivedKey, keyBuffer);
    } catch (err) {
      return false;
    }
  }
}

module.exports = PasswordService;
