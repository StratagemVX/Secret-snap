/**
 * Client-side AES-256-GCM encryption utilities using Web Crypto (PBKDF2-SHA256).
 */

const ENVELOPE_PREFIX = 'v1';
const PBKDF2_ITERATIONS = 100_000;
const SALT_BYTES = 16;
const IV_BYTES = 12;

function getWebCrypto(): Crypto {
  if (!globalThis.crypto || !globalThis.crypto.subtle) {
    throw new Error('Web Crypto API is unavailable in this environment');
  }
  return globalThis.crypto;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBytes(encoded: string): Uint8Array {
  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

async function deriveAesKey(secretKey: string, salt: Uint8Array, usage: KeyUsage): Promise<CryptoKey> {
  const webCrypto = getWebCrypto();
  const encoder = new TextEncoder();
  const keyMaterial = await webCrypto.subtle.importKey(
    'raw',
    toArrayBuffer(encoder.encode(secretKey)),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return webCrypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: toArrayBuffer(salt),
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    [usage]
  );
}

/**
 * Generate a cryptographically random secret passphrase.
 */
export function generateSecretKey(length: number = 16): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_-+=';
  const webCrypto = getWebCrypto();
  const values = new Uint8Array(length);
  webCrypto.getRandomValues(values);

  let result = '';
  for (let i = 0; i < length; i += 1) {
    result += charset[values[i] % charset.length];
  }
  return result;
}

/**
 * Generates a realistic decoy message when wrong credentials are presented.
 */
export function generateFakeDecryptedMessage(): string {
  const fakeMessages = [
    'Meeting moved to 3pm tomorrow. Please bring the marketing materials.',
    "Can you check the numbers on slide 15? I think they're off.",
    'Just sent you the updated contract via email.',
    "Don't forget to call the client before EOD.",
    'The new project timeline looks good. Approved.',
    'The server will be down for maintenance tonight from 11pm-2am.',
    'Please review the changes I made to the homepage design.',
    'Your account has been upgraded to premium status.',
    "We need to reschedule tomorrow's call to Friday.",
    'Did you get a chance to look at the proposal I sent?',
  ];

  const webCrypto = getWebCrypto();
  const rand = new Uint32Array(1);
  webCrypto.getRandomValues(rand);
  return fakeMessages[rand[0] % fakeMessages.length];
}

export function toBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  return bytesToBase64(bytes);
}

export function fromBase64(b64: string): string {
  try {
    return new TextDecoder().decode(base64ToBytes(b64));
  } catch (e) {
    console.error('Failed to decode base64 string', e);
    return '';
  }
}

/**
 * Encrypt plaintext using PBKDF2-SHA256 + AES-256-GCM authenticated encryption.
 */
export async function encryptMessage(message: string, secretKey: string): Promise<string> {
  if (!secretKey.trim()) {
    throw new Error('A non-empty secret key is required for encryption.');
  }

  const webCrypto = getWebCrypto();
  const salt = webCrypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const iv = webCrypto.getRandomValues(new Uint8Array(IV_BYTES));
  const key = await deriveAesKey(secretKey, salt, 'encrypt');
  const encodedMessage = new TextEncoder().encode(message);

  const cipherBuffer = await webCrypto.subtle.encrypt(
    { name: 'AES-GCM', iv: toArrayBuffer(iv) },
    key,
    toArrayBuffer(encodedMessage)
  );

  return [
    ENVELOPE_PREFIX,
    bytesToBase64(salt),
    bytesToBase64(iv),
    bytesToBase64(new Uint8Array(cipherBuffer)),
  ].join('.');
}

export interface DecryptionResult {
  decrypted: string;
  authentic: boolean;
}

/**
 * Attempt to decrypt and authenticate an AES-256-GCM payload with the supplied key.
 * Returns a decoy string and `authentic: false` on key mismatch or tampering without
 * ever storing or comparing against the original secret key.
 */
export async function decryptMessage(
  encryptedPayload: string,
  secretKey: string
): Promise<DecryptionResult> {
  if (!encryptedPayload || !secretKey.trim()) {
    return { decrypted: generateFakeDecryptedMessage(), authentic: false };
  }

  const parts = encryptedPayload.split('.');
  if (parts.length !== 4 || parts[0] !== ENVELOPE_PREFIX) {
    return { decrypted: generateFakeDecryptedMessage(), authentic: false };
  }

  try {
    const salt = base64ToBytes(parts[1]);
    const iv = base64ToBytes(parts[2]);
    const cipherBytes = base64ToBytes(parts[3]);
    if (salt.length !== SALT_BYTES || iv.length !== IV_BYTES || cipherBytes.length === 0) {
      return { decrypted: generateFakeDecryptedMessage(), authentic: false };
    }

    const webCrypto = getWebCrypto();
    const key = await deriveAesKey(secretKey, salt, 'decrypt');
    const plainBuffer = await webCrypto.subtle.decrypt(
      { name: 'AES-GCM', iv: toArrayBuffer(iv) },
      key,
      toArrayBuffer(cipherBytes)
    );

    return {
      decrypted: new TextDecoder().decode(new Uint8Array(plainBuffer)),
      authentic: true,
    };
  } catch {
    return { decrypted: generateFakeDecryptedMessage(), authentic: false };
  }
}
