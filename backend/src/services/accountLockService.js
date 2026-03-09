const { detectSuspiciousActivity, logSecurityAction } = require('./securityLogger');

/**
 * Account Lock Service
 * Implements account locking mechanism for suspicious activity
 */

// In-memory store for lock tracking (in production, use Redis or database)
const accountLocks = new Map();

// Lock duration (30 minutes)
const LOCK_DURATION = 30 * 60 * 1000;

// Suspicious activity threshold
const SUSPICIOUS_SCORE_THRESHOLD = 15;

/**
 * Check if account is locked
 * @param {string} userId - User ID
 * @returns {Object} Lock status
 */
const isAccountLocked = (userId) => {
  const lock = accountLocks.get(userId);
  
  if (!lock) {
    return { locked: false };
  }
  
  // Check if lock expired
  if (Date.now() > lock.expiresAt) {
    accountLocks.delete(userId);
    return { locked: false };
  }
  
  return {
    locked: true,
    reason: lock.reason,
    expiresAt: lock.expiresAt,
    remainingMinutes: Math.ceil((lock.expiresAt - Date.now()) / 60000)
  };
};

/**
 * Lock an account
 * @param {string} userId - User ID
 * @param {string} reason - Reason for locking
 * @param {Object} req - Express request object
 * @param {number} duration - Lock duration in milliseconds (default: 30 minutes)
 * @returns {Object} Lock info
 */
const lockAccount = async (userId, reason, req, duration = LOCK_DURATION) => {
  const expiresAt = Date.now() + duration;
  
  accountLocks.set(userId, {
    reason,
    lockedAt: Date.now(),
    expiresAt
  });
  
  // Log security action
  await logSecurityAction({
    userId,
    action: 'account_locked',
    details: { reason, duration: duration / 60000 },
    req,
    success: true
  });
  
  console.log(`[SECURITY] Account ${userId} locked for ${duration / 60000} minutes. Reason: ${reason}`);
  
  return {
    locked: true,
    reason,
    expiresAt,
    remainingMinutes: Math.ceil(duration / 60000)
  };
};

/**
 * Unlock an account
 * @param {string} userId - User ID
 * @param {Object} req - Express request object
 * @param {boolean} isAdmin - Whether unlock is by admin
 * @returns {Object} Unlock result
 */
const unlockAccount = async (userId, req, isAdmin = false) => {
  const lock = accountLocks.get(userId);
  
  if (!lock) {
    return {
      success: false,
      message: 'Account is not locked'
    };
  }
  
  accountLocks.delete(userId);
  
  // Log security action
  await logSecurityAction({
    userId,
    action: 'account_unlocked',
    details: { 
      unlockedBy: isAdmin ? 'admin' : 'auto',
      originalReason: lock.reason
    },
    req,
    success: true
  });
  
  console.log(`[SECURITY] Account ${userId} unlocked by ${isAdmin ? 'admin' : 'auto'}`);
  
  return {
    success: true,
    message: 'Account unlocked successfully'
  };
};

/**
 * Check for suspicious activity and lock if necessary
 * @param {string} userId - User ID
 * @param {Object} req - Express request object
 * @returns {Promise<Object>} Check result
 */
const checkAndLockIfSuspicious = async (userId, req) => {
  // Check if already locked
  const lockStatus = isAccountLocked(userId);
  if (lockStatus.locked) {
    return {
      shouldBlock: true,
      reason: 'Account is locked',
      lockStatus
    };
  }
  
  // Detect suspicious activity
  const suspicious = await detectSuspiciousActivity(userId, 24);
  
  if (suspicious.isSuspicious && suspicious.score >= SUSPICIOUS_SCORE_THRESHOLD) {
    // Lock account
    const lockInfo = await lockAccount(
      userId,
      `Suspicious activity detected: ${suspicious.reasons.join(', ')}`,
      req
    );
    
    return {
      shouldBlock: true,
      reason: 'Suspicious activity detected',
      lockStatus: lockInfo,
      suspiciousActivity: suspicious
    };
  }
  
  return {
    shouldBlock: false,
    suspiciousActivity: suspicious
  };
};

/**
 * Middleware to check if account is locked
 */
const checkAccountLock = async (req, res, next) => {
  const userId = req.user?.id;
  
  if (!userId) {
    return next();
  }
  
  const lockStatus = isAccountLocked(userId);
  
  if (lockStatus.locked) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'ACCOUNT_LOCKED',
        message: 'حسابك مقفل مؤقتاً بسبب نشاط مشبوه',
        reason: lockStatus.reason,
        expiresAt: lockStatus.expiresAt,
        remainingMinutes: lockStatus.remainingMinutes
      }
    });
  }
  
  next();
};

/**
 * Get all locked accounts (admin only)
 * @returns {Array} Locked accounts
 */
const getLockedAccounts = () => {
  const locked = [];
  const now = Date.now();
  
  for (const [userId, lock] of accountLocks.entries()) {
    if (now <= lock.expiresAt) {
      locked.push({
        userId,
        reason: lock.reason,
        lockedAt: lock.lockedAt,
        expiresAt: lock.expiresAt,
        remainingMinutes: Math.ceil((lock.expiresAt - now) / 60000)
      });
    } else {
      // Clean up expired locks
      accountLocks.delete(userId);
    }
  }
  
  return locked;
};

/**
 * Clean up expired locks
 */
const cleanupExpiredLocks = () => {
  const now = Date.now();
  for (const [userId, lock] of accountLocks.entries()) {
    if (now > lock.expiresAt) {
      accountLocks.delete(userId);
      console.log(`[SECURITY] Auto-unlocked account ${userId} after lock expiration`);
    }
  }
};

// Run cleanup every 5 minutes
setInterval(cleanupExpiredLocks, 5 * 60 * 1000);

module.exports = {
  isAccountLocked,
  lockAccount,
  unlockAccount,
  checkAndLockIfSuspicious,
  checkAccountLock,
  getLockedAccounts,
  cleanupExpiredLocks
};
