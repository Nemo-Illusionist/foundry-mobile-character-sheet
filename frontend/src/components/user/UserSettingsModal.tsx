// User Settings Modal Component
import { FormEvent, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Input, Button } from '../shared';
import { signOut, updateUserDisplayName } from '../../services/auth.service';
import { useAuth } from '../../hooks';
import './UserSettingsModal.css';

interface UserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserSettingsModal({ isOpen, onClose }: UserSettingsModalProps) {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen && user) {
      setDisplayName(user.displayName || '');
      setError('');
      setSuccess('');
    }
  }, [isOpen, user]);

  const handleSaveDisplayName = async (e: FormEvent) => {
    e.preventDefault();

    const trimmedName = displayName.trim();
    if (trimmedName.length < 2) {
      setError('Display name must be at least 2 characters');
      return;
    }

    if (trimmedName === user?.displayName) {
      setError('');
      setSuccess('');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await updateUserDisplayName(trimmedName);
      await refreshUser();
      setSuccess('Display name updated');
    } catch (err) {
      setError((err as Error).message || 'Failed to update display name');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      onClose();
      navigate('/auth');
    } catch (err) {
      setError((err as Error).message || 'Failed to sign out');
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Settings">
      <div className="user-settings">
        <section className="settings-section">
          <h3 className="settings-section-title">Profile</h3>

          <form onSubmit={handleSaveDisplayName} className="settings-form">
            {error && <div className="form-error">{error}</div>}
            {success && <div className="form-success">{success}</div>}

            <Input
              type="text"
              label="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your display name"
              disabled={loading}
            />

            <Button type="submit" disabled={loading || displayName.trim() === user?.displayName}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </form>

          <div className="user-email">
            <span className="user-email-label">Email</span>
            <span className="user-email-value">{user?.email}</span>
          </div>
        </section>

        <section className="settings-section settings-section-danger">
          <h3 className="settings-section-title">Account</h3>
          <Button variant="danger" onClick={handleLogout}>
            Logout
          </Button>
        </section>
      </div>
    </Modal>
  );
}
