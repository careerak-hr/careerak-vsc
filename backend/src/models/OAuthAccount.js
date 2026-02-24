const mongoose = require('mongoose');
const crypto = require('crypto');

const oauthAccountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  provider: {
    type: String,
    enum: ['google', 'facebook', 'linkedin'],
    required: true
  },
  providerId: {
    type: String,
    required: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true
  },
  displayName: String,
  profilePicture: String,
  accessToken: String,  // encrypted
  refreshToken: String, // encrypted
  tokenExpires: Date,
  connectedAt: {
    type: Date,
    default: Date.now
  },
  lastUsed: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for uniqueness
oauthAccountSchema.index({ userId: 1, provider: 1 }, { unique: true });
oauthAccountSchema.index({ provider: 1, providerId: 1 }, { unique: true });

// Encryption helpers
const ENCRYPTION_KEY = process.env.OAUTH_ENCRYPTION_KEY || 'careerak_oauth_key_2024_32chars!';
const ALGORITHM = 'aes-256-cbc';

// Security warning for weak encryption key
if (!process.env.OAUTH_ENCRYPTION_KEY || ENCRYPTION_KEY === 'careerak_oauth_key_2024_32chars!') {
  console.warn('⚠️  SECURITY WARNING: Using default OAUTH_ENCRYPTION_KEY!');
  console.warn('⚠️  Generate a strong key with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
  console.warn('⚠️  Add it to .env as OAUTH_ENCRYPTION_KEY=<generated_key>');
  if (process.env.NODE_ENV === 'production') {
    throw new Error('CRITICAL: OAUTH_ENCRYPTION_KEY must be set in production!');
  }
}

function encrypt(text) {
  if (!text) return null;
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.slice(0, 32)), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
  if (!text) return null;
  const parts = text.split(':');
  const iv = Buffer.from(parts.shift(), 'hex');
  const encryptedText = Buffer.from(parts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.slice(0, 32)), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

// Encrypt tokens before saving
oauthAccountSchema.pre('save', function(next) {
  if (this.isModified('accessToken') && this.accessToken) {
    this.accessToken = encrypt(this.accessToken);
  }
  if (this.isModified('refreshToken') && this.refreshToken) {
    this.refreshToken = encrypt(this.refreshToken);
  }
  next();
});

// Method to get decrypted tokens
oauthAccountSchema.methods.getDecryptedTokens = function() {
  return {
    accessToken: this.accessToken ? decrypt(this.accessToken) : null,
    refreshToken: this.refreshToken ? decrypt(this.refreshToken) : null
  };
};

const OAuthAccount = mongoose.model('OAuthAccount', oauthAccountSchema);

module.exports = OAuthAccount;
