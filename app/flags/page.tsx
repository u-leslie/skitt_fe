'use client';

import { useEffect, useState } from 'react';
import { featureFlagsApi, FeatureFlag, CreateFeatureFlagInput } from '@/lib/api';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import FlagModal from '@/components/FlagModal';

export default function FlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null);

  useEffect(() => {
    fetchFlags();
  }, []);

  const fetchFlags = async () => {
    try {
      setLoading(true);
      const response = await featureFlagsApi.getAll();
      setFlags(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load feature flags');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingFlag(null);
    setIsModalOpen(true);
  };

  const handleEdit = (flag: FeatureFlag) => {
    setEditingFlag(flag);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this feature flag?')) {
      return;
    }

    try {
      await featureFlagsApi.delete(id);
      await fetchFlags();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete feature flag');
    }
  };

  const handleToggle = async (flag: FeatureFlag) => {
    try {
      await featureFlagsApi.update(flag.id, { enabled: !flag.enabled });
      await fetchFlags();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update feature flag');
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingFlag(null);
    fetchFlags();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Feature Flags</h1>
          <p className="mt-2 text-gray-600">Manage your feature flags</p>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create Flag
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {flags.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">
            No feature flags found. Create your first flag to get started.
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {flags.map((flag) => (
              <li key={flag.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="text-lg font-medium text-gray-900">{flag.name}</h3>
                      <span
                        className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          flag.enabled
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {flag.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">Key: {flag.key}</p>
                    {flag.description && (
                      <p className="mt-1 text-sm text-gray-600">{flag.description}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-400">
                      Created: {new Date(flag.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggle(flag)}
                      className={`inline-flex items-center px-3 py-1.5 border rounded-md text-sm font-medium ${
                        flag.enabled
                          ? 'border-red-300 text-red-700 bg-red-50 hover:bg-red-100'
                          : 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100'
                      }`}
                    >
                      {flag.enabled ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => handleEdit(flag)}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <PencilIcon className="h-4 w-4 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(flag.id)}
                      className="inline-flex items-center px-3 py-1.5 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50"
                    >
                      <TrashIcon className="h-4 w-4 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {isModalOpen && (
        <FlagModal
          flag={editingFlag}
          isOpen={isModalOpen}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}

