# Supabase Setup Guide for LegalSense

This guide will walk you through setting up Supabase for the LegalSense backend.

## Prerequisites

- A Supabase account (free tier is sufficient)
- Node.js installed on your machine

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in the project details:
   - **Name**: `legalsense` (or your preferred name)
   - **Database Password**: Generate a strong password and save it securely
   - **Region**: Choose the region closest to your users
   - **Pricing Plan**: Free tier is fine for development
5. Click "Create new project"
6. Wait for the project to be provisioned (2-3 minutes)

## Step 2: Get Your Supabase Credentials

Once your project is ready:

1. Go to **Project Settings** → **API**
2. Copy the following values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (Keep this secret!)

3. Add these to your backend `.env` file:
   ```env
   SUPABASE_URL=your_project_url
   SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

## Step 3: Run the Database Schema

1. Go to **SQL Editor** in your Supabase dashboard
2. Click "New Query"
3. Copy the entire contents of `backend/database/schema.sql`
4. Paste it into the SQL Editor
5. Click "Run" or press `Ctrl+Enter`
6. Verify that all tables were created successfully

The schema will create:
- `users` table
- `cases` table
- `case_files` table
- `ai_conversations` table
- `legal_documents` table (for future RAG)
- `notifications` table (future)
- Row Level Security (RLS) policies
- Triggers for user management

## Step 4: Configure Email Authentication

1. Go to **Authentication** → **Providers**
2. Ensure **Email** provider is enabled
3. Configure email settings:
   - **Confirm email**: Enable for production (optional for development)
   - **Secure email change**: Enable
   - **Double opt-in**: Optional

For development, you can disable email confirmation to speed up testing.

## Step 5: Setup Supabase Storage

1. Go to **Storage** in your Supabase dashboard
2. Create the following buckets:

### Bucket: `case-images`
- Click "New bucket"
- Name: `case-images`
- Make it **Public** (for displaying images in the frontend)
- File size limit: 10MB
- Allowed MIME types: `image/*`

### Bucket: `case-documents`
- Click "New bucket"
- Name: `case-documents`
- Make it **Private** (documents should be accessed via signed URLs)
- File size limit: 50MB
- Allowed MIME types: `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

### Bucket: `avatars`
- Click "New bucket"
- Name: `avatars`
- Make it **Public**
- File size limit: 5MB
- Allowed MIME types: `image/*`

## Step 6: Configure Storage Policies (Optional)

For better security, you can add storage policies. For development, the default settings are fine.

If you want to add policies later:

1. Go to **Storage** → Select a bucket → **Policies**
2. Add policies to restrict access based on user authentication

## Step 7: Enable pgvector Extension (for future RAG)

The schema SQL already includes this, but verify it's enabled:

1. Go to **Database** → **Extensions**
2. Search for `vector`
3. Ensure `pgvector` is enabled

## Step 8: Test the Connection

1. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Create `.env` file with your credentials:
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

3. Start the backend server:
   ```bash
   npm run dev
   ```

4. Test the health endpoint:
   ```bash
   curl http://localhost:3001/health
   ```

You should see:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development"
}
```

## Step 9: Configure Frontend URL

In your backend `.env` file, set:
```env
FRONTEND_URL=http://localhost:5173
```

This ensures CORS is configured correctly for your frontend.

## Step 10: Verify Row Level Security (RLS)

1. Go to **Authentication** → **Users**
2. Create a test user via the Supabase dashboard
3. Go to **Table Editor** → `users` table
4. Verify the user profile was automatically created (trigger is working)

## Troubleshooting

### Connection Issues
- Verify your Supabase URL and keys are correct
- Check that your backend can reach Supabase (no firewall issues)

### RLS Policy Errors
- Ensure the SQL schema was run completely
- Check that triggers were created successfully

### Storage Upload Errors
- Verify bucket names match exactly (case-sensitive)
- Check bucket permissions (public vs private)

### Email Not Sending
- For development, disable email confirmation in Auth settings
- For production, configure SMTP settings in Supabase

## Next Steps

After completing this setup:

1. ✅ Backend is ready to run
2. ✅ Database schema is configured
3. ✅ Storage buckets are created
4. ✅ Authentication is configured

The backend is now ready for frontend integration. The next phase will involve:
- Migrating the frontend from Firebase to Supabase
- Updating API calls to use the new backend
- Testing the complete authentication flow

## Security Notes

- **Never commit** `.env` files to version control
- **Never share** your service role key
- Use environment variables for all sensitive data
- Enable RLS policies in production
- Review storage policies before going live
