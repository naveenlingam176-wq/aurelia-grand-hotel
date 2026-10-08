/**
 * Authentication Controller
 * Handles /api/auth/* endpoints
 */

const AuthService = require('../services/authService');
const UserRepository = require('../repositories/userRepository');

const authService = new AuthService(new UserRepository());

class AuthController {
  /**
   * POST /api/auth/login
   */
  static handleLogin(req, res) {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const result = authService.authenticate(email, password);

    if (!result.success) {
      return res.status(401).json(result);
    }

    return res.status(200).json(result);
  }

  /**
   * GET /api/auth/me
   */
  static handleGetCurrentUser(req, res) {
    // req.user is populated by authenticateToken middleware
    return res.status(200).json({
      success: true,
      user: req.user
    });
  }

  /**
   * POST /api/auth/logout
   */
  static handleLogout(req, res) {
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  }
}

module.exports = AuthController;
