// Encrypted credential vault.
//
// Every program login (username/password) you save is encrypted at rest
// with a key derived from your master password. The master password itself
// is never stored anywhere; only a "verifier" blob (used to check you typed
// it correctly on unlock) and a random salt live on disk. The derived key
// only ever lives in this process's memory, and only while the vault is
// unlocked.

const crypto = require('crypto');
const fs = require('fs');
const config = require('./config');

const SCRYPT_KEYLEN = 32;
const VERIFIER_PLAINTEXT = 'frequent-flyer-tracker-vault-ok';

let currentKey = null; // Buffer, only in memory, cleared on lock()

function exists() {
  return fs.existsSync(config.vaultFile);
}

function readVaultFile() {
  const raw = fs.readFileSync(config.vaultFile, 'utf8');
  return JSON.parse(raw);
}

function writeVaultFile(vault) {
  fs.mkdirSync(config.dataDir, { recursive: true });
  const tmp = config.vaultFile + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(vault, null, 2), { mode: 0o600 });
  fs.renameSync(tmp, config.vaultFile);
}

function deriveKey(masterPassword, saltHex) {
  const salt = Buffer.from(saltHex, 'hex');
  return crypto.scryptSync(masterPassword, salt, SCRYPT_KEYLEN);
}

function encrypt(key, plaintext) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ct = Buffer.concat([cipher.update(Buffer.from(plaintext, 'utf8')), cipher.final()]);
  const tag = cipher.getAuthTag();
  return { iv: iv.toString('hex'), tag: tag.toString('hex'), ct: ct.toString('hex') };
}

function decrypt(key, blob) {
  const iv = Buffer.from(blob.iv, 'hex');
  const tag = Buffer.from(blob.tag, 'hex');
  const ct = Buffer.from(blob.ct, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([decipher.update(ct), decipher.final()]);
  return plaintext.toString('utf8');
}

// Creates a brand new vault with the given master password. Throws if a
// vault already exists (use unlock() instead).
function setup(masterPassword) {
  if (exists()) throw new Error('Vault already exists; use unlock() instead.');
  if (!masterPassword || masterPassword.length < 8) {
    throw new Error('Master password must be at least 8 characters.');
  }
  const salt = crypto.randomBytes(16).toString('hex');
  const key = deriveKey(masterPassword, salt);
  const verifier = encrypt(key, VERIFIER_PLAINTEXT);
  writeVaultFile({ salt, verifier, accounts: {} });
  currentKey = key;
  return true;
}

// Unlocks an existing vault. Throws if the password is wrong.
function unlock(masterPassword) {
  const vault = readVaultFile();
  const key = deriveKey(masterPassword, vault.salt);
  let ok;
  try {
    ok = decrypt(key, vault.verifier) === VERIFIER_PLAINTEXT;
  } catch {
    ok = false;
  }
  if (!ok) throw new Error('Incorrect master password.');
  currentKey = key;
  return true;
}

function lock() {
  if (currentKey) currentKey.fill(0);
  currentKey = null;
}

function isUnlocked() {
  return currentKey !== null;
}

function requireUnlocked() {
  if (!currentKey) throw new Error('Vault is locked.');
}

// Stores/overwrites the username+password for one account id.
function saveCredential(accountId, { username, password }) {
  requireUnlocked();
  const vault = readVaultFile();
  vault.accounts[accountId] = encrypt(currentKey, JSON.stringify({ username, password }));
  writeVaultFile(vault);
}

// Returns { username, password } for an account id, or null if none saved.
function getCredential(accountId) {
  requireUnlocked();
  const vault = readVaultFile();
  const blob = vault.accounts[accountId];
  if (!blob) return null;
  return JSON.parse(decrypt(currentKey, blob));
}

function deleteCredential(accountId) {
  requireUnlocked();
  const vault = readVaultFile();
  delete vault.accounts[accountId];
  writeVaultFile(vault);
}

module.exports = {
  exists,
  setup,
  unlock,
  lock,
  isUnlocked,
  saveCredential,
  getCredential,
  deleteCredential,
};
