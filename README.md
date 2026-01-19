# SecretSnap - Secure Ephemeral Messaging

A premium cybersecurity messaging platform for privacy-focused communication. Send encrypted, self-destructing messages with military-grade security.

## Features

- 🔐 **AES-256 Encryption** - Military-grade encryption for your messages
- ⏱ **Auto-Delete Timer** - Messages self-destruct after viewing or timer expiration
- 🚫 **No Server Storage** - Complete privacy with client-side encryption
- 💎 **Premium UI** - Dark mode with glass-morphism design and neon accents
- 📱 **Mobile Responsive** - Swipe-based navigation for mobile devices

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd secret-snap-away-main

# Step 3: Install dependencies
npm install

# Step 4: Start the development server
npm run dev
```

The application will be available at `http://localhost:5173`

## Technologies

This project is built with:

- **Vite** - Fast build tool and dev server
- **TypeScript** - Type-safe JavaScript
- **React** - UI library
- **shadcn-ui** - High-quality component library
- **Tailwind CSS** - Utility-first CSS framework

## Project Structure

```
src/
├── components/      # React components
│   ├── ui/         # shadcn-ui components
│   ├── BrandHeader.tsx
│   ├── EncryptedPanel.tsx
│   ├── ParticlesBackground.tsx
│   ├── ReceiverPanel.tsx
│   ├── SecretSnap.tsx
│   ├── SenderPanel.tsx
│   └── StepIndicator.tsx
├── pages/          # Page components
├── utils/          # Utility functions
└── hooks/          # Custom React hooks
```

## Build for Production

```sh
npm run build
```

The production build will be in the `dist` directory.

## License

Private - All rights reserved
