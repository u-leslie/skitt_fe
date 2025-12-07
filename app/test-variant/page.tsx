"use client";

import { useEffect, useState } from "react";
import {
  featureFlagsApi,
  usersApi,
  experimentsApi,
  FeatureFlag,
  User,
} from "@/lib/api";
import { BeakerIcon } from "@heroicons/react/24/outline";

export default function TestVariantPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedFlag, setSelectedFlag] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [flagsRes, usersRes] = await Promise.all([
        featureFlagsApi.getAll(),
        usersApi.getAll(),
      ]);
      setFlags(flagsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error("Failed to load data:", err);
    }
  };

  const handleTest = async () => {
    if (!selectedFlag || !selectedUser) {
      alert("Please select both a flag and a user");
      return;
    }

    try {
      setLoading(true);
      const response = await experimentsApi.evaluateFlag(
        selectedFlag,
        selectedUser
      );
      setResult(response.data);
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to evaluate flag");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-black">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Test Variant Assignment
        </h1>
        <p className="mt-2 text-gray-600">
          See which variant a user would see for a specific feature flag
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="space-y-4">
          <div>
            <label
              htmlFor="flag"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Select Feature Flag
            </label>
            <select
              id="flag"
              value={selectedFlag}
              onChange={(e) => setSelectedFlag(e.target.value)}
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Choose a flag...</option>
              {flags.map((flag) => (
                <option key={flag.id} value={flag.id}>
                  {flag.name} ({flag.key}) -{" "}
                  {flag.enabled ? "Enabled" : "Disabled"}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="user"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Select User
            </label>
            <select
              id="user"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Choose a user...</option>
              {users.map((user) => (
                <option key={user.id} value={user.user_id}>
                  {user.name || "Unnamed"} ({user.email || user.user_id})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleTest}
            disabled={loading || !selectedFlag || !selectedUser}
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Testing..." : "Test Variant Assignment"}
          </button>
        </div>
      </div>

      {result && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Result</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">
                Flag Enabled:
              </span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  result.flagEnabled
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {result.flagEnabled ? "Yes" : "No"}
              </span>
            </div>

            {result.variant && (
              <>
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">
                    Variant:
                  </span>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    Variant {result.variant}
                  </span>
                </div>

                {result.experimentName && (
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-start">
                      <BeakerIcon className="h-5 w-5 text-purple-600 mr-2 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          Active Experiment:
                        </p>
                        <p className="text-sm text-gray-600">
                          {result.experimentName}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>What this means:</strong> This user will see{" "}
                    <strong>Variant {result.variant}</strong> of the feature.
                    {result.variant === "A" &&
                      " This is typically the control or original version."}
                    {result.variant === "B" &&
                      " This is typically the test or new version."}
                  </p>
                </div>
              </>
            )}

            {!result.variant && result.flagEnabled && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  No active experiment found for this flag. The flag is enabled,
                  but users will see the default version.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
