'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { experimentsApi, Experiment } from '@/lib/api';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface Assignment {
  id: string;
  experiment_id: string;
  user_id: string;
  variant: 'A' | 'B';
  created_at: string;
  user: {
    id: string;
    user_id: string;
    name: string | null;
    email: string | null;
  } | null;
}

export default function ExperimentAssignmentsPage() {
  const params = useParams();
  const router = useRouter();
  const experimentId = params.id as string;
  
  const [experiment, setExperiment] = useState<Experiment | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ variantA: 0, variantB: 0, total: 0 });

  useEffect(() => {
    fetchData();
  }, [experimentId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [experimentRes, assignmentsRes] = await Promise.all([
        experimentsApi.getById(experimentId),
        experimentsApi.getAssignments(experimentId),
      ]);
      setExperiment(experimentRes.data);
      setAssignments(assignmentsRes.data);
      
      // Calculate stats
      const variantA = assignmentsRes.data.filter((a: Assignment) => a.variant === 'A').length;
      const variantB = assignmentsRes.data.filter((a: Assignment) => a.variant === 'B').length;
      setStats({
        variantA,
        variantB,
        total: assignmentsRes.data.length,
      });
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load data');
    } finally {
      setLoading(false);
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
      <button
        onClick={() => router.back()}
        className="mb-4 inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeftIcon className="h-4 w-4 mr-1" />
        Back to Experiments
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {experiment?.name} - User Assignments
        </h1>
        <p className="mt-2 text-gray-600">
          View which users are assigned to which variant
        </p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <span className="text-white font-bold">A</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Variant A
                  </dt>
                  <dd className="text-3xl font-semibold text-gray-900">
                    {stats.variantA}
                  </dd>
                  <dd className="text-sm text-gray-500">
                    {stats.total > 0 ? Math.round((stats.variantA / stats.total) * 100) : 0}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <span className="text-white font-bold">B</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Variant B
                  </dt>
                  <dd className="text-3xl font-semibold text-gray-900">
                    {stats.variantB}
                  </dd>
                  <dd className="text-sm text-gray-500">
                    {stats.total > 0 ? Math.round((stats.variantB / stats.total) * 100) : 0}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                <span className="text-white font-bold">T</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Users
                  </dt>
                  <dd className="text-3xl font-semibold text-gray-900">
                    {stats.total}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assignments Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">User Assignments</h2>
        </div>
        {assignments.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">
            No users assigned yet. Users will be automatically assigned when they interact with the flag.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Variant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned At
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {assignments.map((assignment) => (
                  <tr key={assignment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {assignment.user?.name || 'Unnamed User'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {assignment.user?.email || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          assignment.variant === 'A'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        Variant {assignment.variant}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(assignment.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

