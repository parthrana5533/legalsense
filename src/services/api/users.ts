import type { User } from '@/types';

export async function getUserProfile(userId: string): Promise<User | null> {
  await new Promise((r) => setTimeout(r, 300));
  return {
    id: userId,
    email: 'user@example.com',
    displayName: 'LegalSense User',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
  };
}

export async function updateUserProfile(
  userId: string,
  data: Partial<Pick<User, 'displayName' | 'photoURL'>>
): Promise<User> {
  await new Promise((r) => setTimeout(r, 400));
  const profile = await getUserProfile(userId);
  return { ...profile!, ...data, updatedAt: new Date().toISOString() };
}

export async function deleteUserData(_userId: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 500));
  // Future: delete user data from MongoDB
}
