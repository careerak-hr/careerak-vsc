/**
 * Encryption Utilities
 * 
 * OPTIMIZATION: Lazy loads CryptoJS only when encryption is needed
 * This removes 66 KB from the main bundle and improves TTI
 * 
 * Usage:
 * import { encrypt, decrypt } from './utils/encryption';
 * const encrypted = await encrypt(data, key);
 * const decrypted = await decrypt(encrypted, key);
 */

const SECRET_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'careerak_secure_key_2024';

// Cache for CryptoJS module to avoid multiple imports
let cryptoModule = null;

/**
 * Lazy load CryptoJS module
 * @returns {Promise<Object>} CryptoJS module
 */
async function getCryptoJS() {
  if (!cryptoModule) {
    cryptoModule = await import('crypto-js');
  }
  return cryptoModule.default;
}

/**
 * Encrypt data using AES encryption
 * @param {string} data - Data to encrypt
 * @param {string} key - Encryption key (optional, uses default if not provided)
 * @returns {Promise<string>} Encrypted string
 */
export async function encrypt(data, key = SECRET_KEY) {
  const CryptoJS = await getCryptoJS();
  return CryptoJS.AES.encrypt(data, key).toString();
}

/**
 * Decrypt data using AES decryption
 * @param {string} encryptedData - Encrypted data
 * @param {string} key - Decryption key (optional, uses default if not provided)
 * @returns {Promise<string>} Decrypted string
 */
export async function decrypt(encryptedData, key = SECRET_KEY) {
  const CryptoJS = await getCryptoJS();
  const bytes = CryptoJS.AES.decrypt(encryptedData, key);
  return bytes.toString(CryptoJS.enc.Utf8);
}

/**
 * Hash data using SHA256
 * @param {string} data - Data to hash
 * @returns {Promise<string>} Hashed string
 */
export async function hash(data) {
  const CryptoJS = await getCryptoJS();
  return CryptoJS.SHA256(data).toString();
}

/**
 * Generate a random key
 * @param {number} length - Key length in bytes (default: 32)
 * @returns {Promise<string>} Random key
 */
export async function generateKey(length = 32) {
  const CryptoJS = await getCryptoJS();
  return CryptoJS.lib.WordArray.random(length).toString();
}
