'use client';

import { useState, useEffect } from 'react';
import { User, usersApi } from '@/lib/api';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface UserModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function UserModal({ user, isOpen, onClose }: UserModalProps) {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    attributes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        name: user.name || '',
        attributes: user.attributes ? JSON.stringify(user.attributes, null, 2) : '',
      });
    } else {
      setFormData({
        email: '',
        name: '',
        attributes: '',
      });
    }
    setError(null);
  }, [user, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let attributes = null;
      if (formData.attributes.trim()) {
        try {
          attributes = JSON.parse(formData.attributes);
        } catch {
          throw new Error('Invalid JSON format for attributes');
        }
      }

      if (user) {
        // Update existing user
        await usersApi.update(user.id, {
          email: formData.email || undefined,
          name: formData.name || undefined,
          attributes: attributes || undefined,
        });
      } else {
        // Create new user
        await usersApi.create({
          email: formData.email || undefined,
          name: formData.name || undefined,
          attributes: attributes || undefined,
        });
      }
      onClose();
    } catch (err: any) {
      setError(err.message || err.response?.data?.error || 'Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {user ? 'Edit User' : 'Create User'}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="User Name"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="user@example.com"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="attributes" className="block text-sm font-medium text-gray-700">
                  Attributes (JSON)
                </label>
                <textarea
                  id="attributes"
                  rows={4}
                  value={formData.attributes}
                  onChange={(e) => setFormData({ ...formData, attributes: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
                  placeholder='{"plan": "premium", "region": "us"}'
                />
                <p className="mt-1 text-xs text-gray-500">Optional JSON object for custom attributes</p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : user ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

