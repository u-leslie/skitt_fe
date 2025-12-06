'use client';

import { useState, useEffect } from 'react';
import { Experiment, FeatureFlag, experimentsApi } from '@/lib/api';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ExperimentModalProps {
  experiment: Experiment | null;
  flags: FeatureFlag[];
  isOpen: boolean;
  onClose: () => void;
}

export default function ExperimentModal({
  experiment,
  flags,
  isOpen,
  onClose,
}: ExperimentModalProps) {
  const [formData, setFormData] = useState({
    flag_id: '',
    name: '',
    description: '',
    variant_a_percentage: 50,
    variant_b_percentage: 50,
    status: 'draft' as 'draft' | 'running' | 'paused' | 'completed',
    start_date: '',
    end_date: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (experiment) {
      setFormData({
        flag_id: experiment.flag_id,
        name: experiment.name,
        description: experiment.description || '',
        variant_a_percentage: experiment.variant_a_percentage,
        variant_b_percentage: experiment.variant_b_percentage,
        status: experiment.status,
        start_date: experiment.start_date
          ? new Date(experiment.start_date).toISOString().slice(0, 16)
          : '',
        end_date: experiment.end_date
          ? new Date(experiment.end_date).toISOString().slice(0, 16)
          : '',
      });
    } else {
      setFormData({
        flag_id: flags.length > 0 ? flags[0].id : '',
        name: '',
        description: '',
        variant_a_percentage: 50,
        variant_b_percentage: 50,
        status: 'draft',
        start_date: '',
        end_date: '',
      });
    }
    setError(null);
  }, [experiment, flags, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (experiment) {
        // Update existing experiment
        await experimentsApi.update(experiment.id, {
          name: formData.name,
          description: formData.description || undefined,
          variant_a_percentage: formData.variant_a_percentage,
          variant_b_percentage: formData.variant_b_percentage,
          status: formData.status,
          start_date: formData.start_date || undefined,
          end_date: formData.end_date || undefined,
        });
      } else {
        // Create new experiment
        await experimentsApi.create({
          flag_id: formData.flag_id,
          name: formData.name,
          description: formData.description || undefined,
          variant_a_percentage: formData.variant_a_percentage,
          variant_b_percentage: formData.variant_b_percentage,
          status: formData.status,
          start_date: formData.start_date || undefined,
          end_date: formData.end_date || undefined,
        });
      }
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save experiment');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto text-black">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {experiment ? 'Edit Experiment' : 'Create Experiment'}
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
              {!experiment && (
                <div className="mb-4">
                  <label htmlFor="flag_id" className="block text-sm font-medium text-gray-700">
                    Feature Flag *
                  </label>
                  <select
                    id="flag_id"
                    required
                    value={formData.flag_id}
                    onChange={(e) => setFormData({ ...formData, flag_id: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select a flag</option>
                    {flags.map((flag) => (
                      <option key={flag.id} value={flag.id}>
                        {flag.name} ({flag.key})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Experiment Name"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Description of the experiment"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="variant_a_percentage" className="block text-sm font-medium text-gray-700">
                    Variant A %
                  </label>
                  <input
                    type="number"
                    id="variant_a_percentage"
                    min="0"
                    max="100"
                    value={formData.variant_a_percentage}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        variant_a_percentage: parseInt(e.target.value) || 0,
                      })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label htmlFor="variant_b_percentage" className="block text-sm font-medium text-gray-700">
                    Variant B %
                  </label>
                  <input
                    type="number"
                    id="variant_b_percentage"
                    min="0"
                    max="100"
                    value={formData.variant_b_percentage}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        variant_b_percentage: parseInt(e.target.value) || 0,
                      })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as 'draft' | 'running' | 'paused' | 'completed',
                    })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="draft">Draft</option>
                  <option value="running">Running</option>
                  <option value="paused">Paused</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
                    Start Date
                  </label>
                  <input
                    type="datetime-local"
                    id="start_date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
                    End Date
                  </label>
                  <input
                    type="datetime-local"
                    id="end_date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
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
                  {loading ? 'Saving...' : experiment ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

