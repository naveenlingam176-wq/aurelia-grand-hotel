/**
 * Authentication Service
 * Credentials validation, JWT signing and verification
 */

const crypto = require('crypto');
const UserRepository = require('../repositories/userRepository');
const PasswordService = require('./passwordService');
const { USER_STATUS } = require('../db/userEntity');

// Secret key for signing JWTs (in production this comes from process.env.JWT_SECRET)
const JWT_SECRET = process.env.JWT_SECRET || 'aurelia-grand-luxury-jwt-secret-key-2026-secure';
const TOKEN_EXPIRY_SECONDS = 24 * 60 * 60; // 24 hours

function base64UrlEncode(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str) {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf8');
}

class AuthService {
  constructor(userRepository = new UserRepository()) {
    this.userRepo = userRepository;
  }

  /**
   * Generates a signed HS256 JWT
   * @param {object} payload 
   * @param {number} expiresInSeconds 
   * @returns {string}
   */
  static generateToken(payload, expiresInSeconds = TOKEN_EXPIRY_SECONDS) {
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };

    const now = Math.floor(Date.now() / 1000);
    const fullPayload = {
      ...payload,
      iat: now,
      exp: now + expiresInSeconds
    };

    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
    const signatureInput = `${encodedHeader}.${encodedPayload}`;

    const signature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(signatureInput)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    return `${signatureInput}.${signature}`;
  }

  /**
   * Verifies and decodes a signed HS256 JWT
   * @param {string} token 
   * @returns {object|null}
   */
  static verifyToken(token) {
    if (!token || typeof token !== 'string') return null;

    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, receivedSignature] = parts;
    const signatureInput = `${encodedHeader}.${encodedPayload}`;

    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(signatureInput)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    try {
      const sig1 = Buffer.from(receivedSignature);
      const sig2 = Buffer.from(expectedSignature);
      if (sig1.length !== sig2.length || !crypto.timingSafeEqual(sig1, sig2)) {
        return null;
      }

      const payload = JSON.parse(base64UrlDecode(encodedPayload));
      const now = Math.floor(Date.now() / 1000);

      // Check token expiration
      if (payload.exp && payload.exp < now) {
        return null;
      }

      return payload;
    } catch (err) {
      return null;
    }
  }

  /**
   * Authenticates user credentials against the database
   * @param {string} email 
   * @param {string} password 
   * @returns {object} { success, message, token, user }
   */
  authenticate(email, password) {
    // 1. Input presence validation
    if (!email || !String(email).trim() || !password) {
      return {
        success: false,
        message: 'Invalid email or password'
      };
    }

    const trimmedEmail = String(email).trim().toLowerCase();

    // 2. Fetch user from DB
    const user = this.userRepo.findByEmail(trimmedEmail);
    if (!user) {
      return {
        success: false,
        message: 'Invalid email or password'
      };
    }

    // 3. Status validation
    if (user.status !== USER_STATUS.ACTIVE) {
      return {
        success: false,
        message: 'Your account is inactive. Please contact administration.'
      };
    }

    // 4. Verify password hash
    const isPasswordValid = PasswordService.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return {
        success: false,
        message: 'Invalid email or password'
      };
    }

    // 5. Generate JWT token
    const token = AuthService.generateToken({
      sub: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role
    });

    // 6. Return standard success payload
    return {
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    };
  }

  /**
   * Validate token and fetch current active user profile
   * @param {string} token 
   * @returns {object|null}
   */
  getCurrentUser(token) {
    const payload = AuthService.verifyToken(token);
    if (!payload || !payload.sub) return null;

    const user = this.userRepo.findById(payload.sub);
    if (!user || user.status !== USER_STATUS.ACTIVE) return null;

    return user;
  }
}

module.exports = AuthService;
