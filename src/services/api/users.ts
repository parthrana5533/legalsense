import type { User } from '@/types';

export async function getUserProfile(userId: string): Promise<User | null> {
  await new Promise((r) => setTimeout(r, 300));
  return {
    id: userId,
    email: 'user@example.com',
    full_name: 'LegalSense User',
    avatar_url: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: new Date().toISOString(),
  };
}

export async function updateUserProfile(
  userId: string,
  data: Partial<Pick<User, 'full_name' | 'avatar_url'>>
): Promise<User> {
  await new Promise((r) => setTimeout(r, 400));
  const profile = await getUserProfile(userId);
  return { ...profile!, ...data, updated_at: new Date().toISOString() };
}

export async function deleteUserData(_userId: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 500));
  // Future: delete user data from MongoDB
}
