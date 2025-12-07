'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { experimentsApi, featureFlagsApi, Experiment, FeatureFlag, CreateExperimentInput } from '@/lib/api';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import ExperimentModal from '@/components/ExperimentModal';

export default function ExperimentsPage() {
  const router = useRouter();
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExperiment, setEditingExperiment] = useState<Experiment | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [experimentsRes, flagsRes] = await Promise.all([
        experimentsApi.getAll(),
        featureFlagsApi.getAll(),
      ]);
      setExperiments(experimentsRes.data);
      setFlags(flagsRes.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingExperiment(null);
    setIsModalOpen(true);
  };

  const handleEdit = (experiment: Experiment) => {
    setEditingExperiment(experiment);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this experiment?')) {
      return;
    }

    try {
      await experimentsApi.delete(id);
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete experiment');
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingExperiment(null);
    fetchData();
  };

  const getFlagName = (flagId: string) => {
    const flag = flags.find((f) => f.id === flagId);
    return flag ? flag.name : flagId;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Experiments</h1>
          <p className="mt-2 text-gray-600">Manage your A/B experiments</p>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create Experiment
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {experiments.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">
            No experiments found. Create your first experiment to get started.
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {experiments.map((experiment) => (
              <li key={experiment.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="text-lg font-medium text-gray-900">{experiment.name}</h3>
                      <span
                        className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          experiment.status
                        )}`}
                      >
                        {experiment.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      Flag: {getFlagName(experiment.flag_id)}
                    </p>
                    {experiment.description && (
                      <p className="mt-1 text-sm text-gray-600">{experiment.description}</p>
                    )}
                    <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                      <span>Variant A: {experiment.variant_a_percentage}%</span>
                      <span>Variant B: {experiment.variant_b_percentage}%</span>
                    </div>
                    <p className="mt-1 text-xs text-gray-400">
                      Created: {new Date(experiment.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => router.push(`/experiments/${experiment.id}/assignments`)}
                      className="inline-flex items-center px-3 py-1.5 border border-blue-300 rounded-md text-sm font-medium text-blue-700 bg-white hover:bg-blue-50"
                    >
                      View Assignments
                    </button>
                    <button
                      onClick={() => handleEdit(experiment)}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <PencilIcon className="h-4 w-4 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(experiment.id)}
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
        <ExperimentModal
          experiment={editingExperiment}
          flags={flags}
          isOpen={isModalOpen}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}

