/**
 * Authentication & Authorization Middleware
 * Hotel Management System
 */

const AuthService = require('../services/authService');
const UserRepository = require('../repositories/userRepository');

const userRepo = new UserRepository();

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.'
    });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token format. Expected "Bearer <token>".'
    });
  }

  const token = parts[1];
  const payload = AuthService.verifyToken(token);

  if (!payload) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session. Please log in again.'
    });
  }

  // Verify that the user still exists and is active in the database
  const user = userRepo.findById(payload.sub);
  if (!user || user.status !== 'ACTIVE') {
    return res.status(401).json({
      success: false,
      message: 'User account is no longer active.'
    });
  }

  req.user = user;
  req.tokenPayload = payload;
  next();
}

/**
 * Role-Based Access Control Middleware Generator
 * @param  {...string} allowedRoles 
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have sufficient permissions for this action.'
      });
    }
    next();
  };
}

module.exports = {
  authenticateToken,
  requireRole
};
