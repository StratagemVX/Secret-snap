/**
 * Frontend encryption utilities for SecretSnap 
 */

/**
 * Generate a random secret key
 * @param length Length of the secret key
 * @returns A random string to be used as secret key
 */
export function generateSecretKey(length: number = 16): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_-+=';
  let result = '';
  const values = new Uint8Array(length);
  window.crypto.getRandomValues(values);
  
  for (let i = 0; i < length; i++) {
    result += charset[values[i] % charset.length];
  }
  
  return result;
}

/**
 * Generates a fake decrypted message that looks realistic
 * @returns A random string that looks like a decrypted message
 */
export function generateFakeDecryptedMessage(): string {
  const fakeMessages = [
    "Meeting moved to 3pm tomorrow. Please bring the marketing materials.",
    "Can you check the numbers on slide 15? I think they're off.",
    "Just sent you the updated contract via email.",
    "Don't forget to call the client before EOD.",
    "The new project timeline looks good. Approved.",
    "The server will be down for maintenance tonight from 11pm-2am.",
    "Please review the changes I made to the homepage design.",
    "Your account has been upgraded to premium status.",
    "We need to reschedule tomorrow's call to Friday.",
    "Did you get a chance to look at the proposal I sent?",
  ];
  
  return fakeMessages[Math.floor(Math.random() * fakeMessages.length)];
}

/**
 * Converts string to base64
 */
export function toBase64(str: string): string {
  return btoa(encodeURIComponent(str));
}

/**
 * Converts base64 to string
 */
export function fromBase64(b64: string): string {
  try {
    return decodeURIComponent(atob(b64));
  } catch (e) {
    console.error("Failed to decode base64 string", e);
    return "";
  }
}

/**
 * This is a mock function for encrypting messages in the frontend for demo
 * In a real app, this would be done securely on the backend
 */
export function mockEncrypt(message: string, secretKey: string): string {
  // This is just a visual representation for the demo
  // In production, use proper encryption libraries
  const encoded = toBase64(message);
  return encoded;
}

/**
 * This is a mock function for decrypting messages in the frontend for demo
 * In a real app, this would be done securely on the backend
 */
export function mockDecrypt(encryptedMessage: string, secretKey: string, correctKey: string): string {
  // If the key is correct, return the actual message
  // Otherwise return a fake message
  if (secretKey === correctKey) {
    try {
      return fromBase64(encryptedMessage);
    } catch (e) {
      console.error("Failed to decrypt message", e);
      return generateFakeDecryptedMessage();
    }
  } else {
    return generateFakeDecryptedMessage();
  }
}
