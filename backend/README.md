# LegalSense Backend

## Setup Instructions

1. Install dependencies:
```bash
cd backend
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Edit `.env` with your Supabase credentials:
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

4. Start the server:
```bash
npm run dev
```

The API will be available at `http://localhost:3001`

## API Endpoints

### Authentication
- POST `/api/auth/signup` - Register new user
- POST `/api/auth/signin` - Sign in user
- POST `/api/auth/signout` - Sign out user
- POST `/api/auth/forgot-password` - Send password reset email
- POST `/api/auth/reset-password` - Reset password
- GET `/api/auth/me` - Get current user
- DELETE `/api/auth/account` - Delete account

### Users
- GET `/api/users/me` - Get user profile
- PATCH `/api/users/me` - Update user profile

### Cases
- GET `/api/cases` - Get all user cases
- GET `/api/cases/:id` - Get specific case
- POST `/api/cases` - Create new case
- PATCH `/api/cases/:id` - Update case
- DELETE `/api/cases/:id` - Delete case
- POST `/api/cases/:id/submit` - Submit case for analysis

### Files
- POST `/api/files/upload` - Upload file for a case
- GET `/api/files/case/:caseId` - Get all files for a case
- DELETE `/api/files/:id` - Delete file

## Database Schema

See `database/schema.sql` for the complete database schema.

## AI Architecture

The backend includes placeholder services for:
- Groq AI (src/services/ai/groq.ts)
- Gemini AI (src/services/ai/gemini.ts)
- OpenAI (src/services/ai/openai.ts)
- OCR (src/services/ocr/ocrService.ts)
- Embeddings (src/services/rag/embeddingService.ts)
- Vector Search (src/services/rag/vectorSearchService.ts)
- RAG (src/services/rag/ragService.ts)

These are ready for future implementation.
