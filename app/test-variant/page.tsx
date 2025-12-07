"use client";

import { useEffect, useState } from "react";
import {
  featureFlagsApi,
  usersApi,
  experimentsApi,
  FeatureFlag,
  User,
} from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BeakerIcon } from "@heroicons/react/24/outline";
import { FlaskConical, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

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
      toast.error("Failed to load data");
    }
  };

  const handleTest = async () => {
    if (!selectedFlag || !selectedUser) {
      toast.error("Please select both a flag and a user");
      return;
    }

    try {
      setLoading(true);
      const response = await experimentsApi.evaluateFlag(
        selectedFlag,
        selectedUser
      );
      setResult(response.data);
      toast.success("Variant evaluated successfully");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to evaluate flag");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Test Variant Assignment
        </h1>
        <p className="text-muted-foreground mt-2">
          See which variant a user would see for a specific feature flag
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Flag and User</CardTitle>
          <CardDescription>
            Choose a feature flag and user to test variant assignment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="flag">Feature Flag</Label>
            <Select value={selectedFlag} onValueChange={setSelectedFlag}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a flag..." />
              </SelectTrigger>
              <SelectContent>
                {flags.map((flag) => (
                  <SelectItem key={flag.id} value={flag.id}>
                    {flag.name} ({flag.key}) -{" "}
                    {flag.enabled ? "Enabled" : "Disabled"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="user">User</Label>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a user..." />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.user_id}>
                    {user.name || "Unnamed"} ({user.email || user.user_id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleTest}
            disabled={loading || !selectedFlag || !selectedUser}
            className="w-full"
          >
            {loading ? "Testing..." : "Test Variant Assignment"}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Result</CardTitle>
            <CardDescription>
              Variant assignment for the selected user
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <span className="text-sm font-medium">Flag Enabled:</span>
              {result.flagEnabled ? (
                <Badge variant="default">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Yes
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <XCircle className="h-3 w-3 mr-1" />
                  No
                </Badge>
              )}
            </div>

            {result.variant && (
              <>
                <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg">
                  <span className="text-sm font-medium">Variant:</span>
                  <Badge variant="default" className="text-lg px-3 py-1">
                    Variant {result.variant}
                  </Badge>
                </div>

                {result.experimentName && (
                  <div className="p-4 bg-secondary rounded-lg">
                    <div className="flex items-start">
                      <FlaskConical className="h-5 w-5 text-primary mr-2 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">
                          Active Experiment:
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {result.experimentName}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-4 bg-muted border rounded-lg">
                  <p className="text-sm">
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
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  No active experiment found for this flag. The flag is enabled,
                  but users will see the default version.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
