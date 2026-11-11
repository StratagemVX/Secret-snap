import { describe, expect, it } from "vitest";
import { decryptMessage, encryptMessage, generateSecretKey } from "./encryption";

describe("SecretSnap WebCrypto AES-256-GCM utilities", () => {
  it("encrypts and authenticates only under the matching secret key", async () => {
    const key = generateSecretKey(20);
    const plaintext = "Launch coordinates: 12.9716 N, 77.5946 E";

    const ciphertext = await encryptMessage(plaintext, key);
    expect(ciphertext.startsWith("v1.")).toBe(true);
    expect(ciphertext).not.toContain(plaintext);

    const okResult = await decryptMessage(ciphertext, key);
    expect(okResult).toEqual({ decrypted: plaintext, authentic: true });

    const wrongResult = await decryptMessage(ciphertext, `${key}-wrong`);
    expect(wrongResult.authentic).toBe(false);
    expect(wrongResult.decrypted).not.toBe(plaintext);
  });

  it("rejects empty secret keys and tampered ciphertexts cleanly", async () => {
    await expect(encryptMessage("hello", "   ")).rejects.toThrow(/secret key/i);

    const ciphertext = await encryptMessage("confidential", "StrongKey#42");
    const tampered = `${ciphertext.slice(0, -4)}AAAA`;
    const result = await decryptMessage(tampered, "StrongKey#42");
    expect(result.authentic).toBe(false);
    expect(result.decrypted).not.toBe("confidential");
  });
});
