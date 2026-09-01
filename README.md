# LegalSense – AI Powered Legal Guidance Platform

A professional SaaS-style web application for understanding legal rights through AI-powered guidance. Built with React, TypeScript, Tailwind CSS, and Firebase Authentication.

## Features

- **Landing Page** – Modern legal platform design with hero, features, and how-it-works sections
- **Firebase Authentication** – Email login/signup, Google sign-in, forgot password, protected routes
- **Dashboard** – ChatGPT-style layout with sidebar, case history, and quick actions
- **Case Management** – Create cases, upload evidence, view case details with AI placeholders
- **Settings** – Profile management, password change, theme toggle, account deletion
- **Scalable Architecture** – Prepared for Gemini AI, OCR, RAG, and MongoDB integration

## Tech Stack

- React 19 + TypeScript
- Vite 6
- Tailwind CSS 4
- Firebase Authentication
- Framer Motion
- React Router 7
- Lucide React Icons

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Firebase

Copy the environment template and add your Firebase credentials:

```bash
cp .env.example .env
```

Fill in your Firebase project values in `.env`:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

In the Firebase Console, enable:
- Email/Password authentication
- Google sign-in provider

### 3. Run development server

```bash
npm run dev
```

### 4. Build for production

```bash
npm run build
```

## Project Structure

```
src/
├── ai/              # Future Gemini AI integration
├── ocr/             # Future OCR processing
├── rag/             # Future RAG pipeline
├── assets/          # Static assets
├── components/
│   ├── auth/        # Protected routes
│   ├── dashboard/   # Sidebar, case cards
│   ├── landing/     # Navbar, hero, features
│   └── ui/          # Button, Input, Card, etc.
├── context/         # Auth context & provider
├── hooks/           # useCases and custom hooks
├── layouts/         # Dashboard & auth layouts
├── pages/           # Route pages
├── services/
│   ├── api/         # auth, cases, users, future-ai
│   └── firebase.ts  # Firebase initialization
├── types/           # TypeScript interfaces
└── utils/           # Helpers and formatters
```

## Future Integrations

| Module | Status | Location |
|--------|--------|----------|
| Google Gemini AI | Placeholder | `src/ai/`, `src/services/api/future-ai.ts` |
| OCR | Placeholder | `src/ocr/` |
| RAG + Vector DB | Placeholder | `src/rag/` |
| MongoDB | Interfaces ready | `src/types/index.ts` |

## Color Palette

| Token | Value |
|-------|-------|
| Primary | `#1E3A5F` |
| Accent | `#C9A227` |
| Background | `#F8FAFC` |
| Text | `#1F2937` |
| Success | `#16A34A` |
| Danger | `#DC2626` |

## License

Private – All rights reserved.
