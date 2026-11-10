# SecretSnap — Ephemeral Secure In-Memory Message Vault

> Zero-knowledge client-side message encryption, one-time viewing links, particle animations, and ephemeral memory decay built with React 18, Vite, and Tailwind CSS.

---

## 1. Project Title
**SecretSnap** (`Secret-snap`) — Ephemeral Secure In-Memory Message Vault.

## 2. Project Overview
SecretSnap is a privacy-first web application designed to transfer confidential information (credentials, sensitive notes, recovery keys) securely. It guarantees that secrets cannot be intercepted or read more than once by executing client-side encryption and burn-on-read destruction protocols.

## 3. Key Features
- **Client-Side Encryption:** Payloads are encrypted in browser memory prior to transmission.
- **Burn After Reading:** Messages automatically self-destruct once viewed by the recipient.
- **Custom Visual Experience:** Built with dynamic particle backgrounds, step indicators, and high-contrast security themes.
- **Zero-Storage Retention:** No unencrypted data is ever retained on persistent disks.

## 4. Technology Stack
- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Canvas Particles
- **Cryptography:** Client-side AES-256-GCM / WebCrypto

## 5. Installation Instructions
```bash
git clone https://github.com/StratagemVX/Secret-snap.git
cd Secret-snap
npm install
npm run dev
```

## 6. Author & Project Information
- **Developer:** Chethan Kumar B S (`StratagemVX`)
- **Domain:** Cybersecurity & Ephemeral Privacy Engineering
