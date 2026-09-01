import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Lock,
  Palette,
  Trash2,
  LogOut,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { changeUserPassword, updateUserProfile, deleteUserAccount } from '@/services/api/auth';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { validatePassword } from '@/utils';

export function SettingsPage() {
  const { user, profile, logout, refreshProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const [displayName, setDisplayName] = useState(profile?.full_name ?? '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleUpdateProfile = async () => {
    if (!displayName.trim()) return;
    setProfileLoading(true);
    setMessage(null);
    try {
      await updateUserProfile({ full_name: displayName.trim() });
      await refreshProfile();
      setMessage({ type: 'success', text: 'Profile updated successfully.' });
    } catch (err) {
      setMessage({ type: 'error', text: (err as Error).message || 'Failed to update profile' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }
    const pwCheck = validatePassword(newPassword);
    if (!pwCheck.valid) {
      setMessage({ type: 'error', text: pwCheck.errors.join(', ') });
      return;
    }
    setPasswordLoading(true);
    setMessage(null);
    try {
      await changeUserPassword(newPassword);
      setMessage({ type: 'success', text: 'Password changed successfully.' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setMessage({ type: 'error', text: (err as Error).message || 'Failed to change password' });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      await deleteUserAccount();
    } catch (err) {
      setMessage({ type: 'error', text: (err as Error).message || 'Failed to delete account' });
      setShowDeleteConfirm(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-heading text-2xl font-bold text-primary mb-2">Settings</h1>
        <p className="text-sm text-text-muted mb-6">
          Manage your account preferences and security.
        </p>

        {message && (
          <div
            className={`mb-6 p-4 rounded-xl text-base ${
              message.type === 'success'
                ? 'bg-green-100 dark:bg-green-950/50 text-green-900 dark:text-green-300'
                : 'bg-red-100 dark:bg-red-950/50 text-red-900 dark:text-red-300'
            }`}
          >
            {message.text}
          </div>
        )}

        <Card className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center">
              <User size={24} className="text-primary" />
            </div>
            <h2 className="font-heading text-lg font-semibold text-primary">Profile</h2>
          </div>
          <div className="space-y-5">
            <Input
              label="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
            <Input
              label="Email"
              value={user?.email ?? ''}
              disabled
              className="opacity-60"
            />
            <Button onClick={handleUpdateProfile} loading={profileLoading} size="md">
              Save Changes
            </Button>
          </div>
        </Card>

        <Card className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center">
              <Lock size={24} className="text-primary" />
            </div>
            <h2 className="font-heading text-lg font-semibold text-primary">Change Password</h2>
          </div>
          <div className="space-y-5">
            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <Button onClick={handleChangePassword} loading={passwordLoading} size="md">
              Update Password
            </Button>
          </div>
        </Card>

        <Card className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center">
              <Palette size={24} className="text-primary" />
            </div>
            <h2 className="font-heading text-lg font-semibold text-primary">Theme</h2>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setTheme('light')}
              className={`flex-1 p-5 rounded-xl border-2 transition-all ${
                theme === 'light'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/30'
              }`}
            >
              <div className="w-full h-10 rounded bg-background border border-border mb-3" />
              <span className="text-base font-medium">Light</span>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`flex-1 p-5 rounded-xl border-2 transition-all ${
                theme === 'dark'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/30'
              }`}
            >
              <div className="w-full h-10 rounded bg-gray-800 mb-3" />
              <span className="text-base font-medium">Dark</span>
            </button>
          </div>
        </Card>

        <Card className="mb-8 border-danger/20">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
              <Trash2 size={24} className="text-danger" />
            </div>
            <h2 className="font-heading text-lg font-semibold text-danger">Delete Account</h2>
          </div>
          <p className="text-base text-text-muted mb-6">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          {!showDeleteConfirm ? (
            <Button variant="danger" size="md" onClick={() => setShowDeleteConfirm(true)}>
              Delete Account
            </Button>
          ) : (
            <div className="p-5 rounded-xl bg-red-50 border border-red-100">
              <div className="flex items-center gap-3 text-danger mb-4">
                <AlertTriangle size={20} />
                <span className="text-base font-medium">Are you sure?</span>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="danger"
                  size="md"
                  loading={deleteLoading}
                  onClick={handleDeleteAccount}
                >
                  Yes, Delete
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </Card>

        <Button
          variant="ghost"
          className="w-full text-danger hover:bg-red-50"
          icon={<LogOut size={20} />}
          onClick={() => logout()}
        >
          Logout
        </Button>
      </motion.div>
    </div>
  );
}
