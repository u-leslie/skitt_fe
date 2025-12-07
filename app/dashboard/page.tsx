'use client';

import { useEffect, useState } from 'react';
import { metricsApi, DashboardSummary } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Flag,
  Users,
  FlaskConical,
  Zap,
  Activity,
  TrendingUp,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await metricsApi.getDashboard();
      setDashboardData(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  const { summary, topFlags } = dashboardData;

  const stats = [
    {
      name: 'Total Flags',
      value: summary.totalFlags,
      icon: Flag,
      description: `${summary.enabledFlags} enabled`,
      trend: '+12%',
    },
    {
      name: 'Active Users',
      value: summary.totalUsers,
      icon: Users,
      description: `${summary.totalAssignments} assignments`,
      trend: '+8%',
    },
    {
      name: 'Experiments',
      value: summary.totalExperiments,
      icon: FlaskConical,
      description: 'Running experiments',
      trend: '+5%',
    },
    {
      name: 'Events (7d)',
      value: summary.eventsLast7Days,
      icon: Activity,
      description: 'Recent activity',
      trend: '+23%',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">Dashboard</h1>
        <p className="text-muted-foreground text-base">
          Overview of your feature flags, experiments, and user activity
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8 sm:mb-12">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name} className="border-foreground/10 hover:border-foreground/20 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    {stat.name}
                  </CardTitle>
                  <div className="h-10 w-10 rounded-lg border border-foreground/10 flex items-center justify-center bg-muted/50">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between">
                  <div className="text-3xl font-bold">{stat.value}</div>
                  <Badge variant="secondary" className="text-xs">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {stat.trend}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Chart Section */}
      {topFlags.length > 0 && (
        <Card className="mb-8 sm:mb-12 border-foreground/10">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold mb-1">Feature Flag Usage</CardTitle>
                <CardDescription>Most active flags in the last period</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={topFlags} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis 
                  dataKey="name" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="event_count" 
                  fill="hsl(var(--primary))" 
                  name="Events"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="unique_users" 
                  fill="hsl(var(--muted))" 
                  name="Unique Users"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Top Flags Table */}
      <Card className="border-foreground/10">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold mb-1">Top Feature Flags</CardTitle>
              <CardDescription>Flags sorted by usage and engagement</CardDescription>
            </div>
            <Badge variant="outline" className="text-xs">
              {topFlags.length} flags
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {topFlags.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-foreground/10">
                    <TableHead className="font-semibold">Flag Name</TableHead>
                    <TableHead className="font-semibold">Key</TableHead>
                    <TableHead className="text-right font-semibold">Events</TableHead>
                    <TableHead className="text-right font-semibold">Unique Users</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topFlags.map((flag, index) => (
                    <TableRow 
                      key={flag.id} 
                      className="border-foreground/5 hover:bg-muted/50 transition-colors"
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <div className="h-2 w-2 rounded-full bg-primary"></div>
                          <span>{flag.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono text-sm">
                        {flag.key}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {flag.event_count.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {flag.unique_users.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <Flag className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-medium">No flag usage data available</p>
              <p className="text-sm text-muted-foreground mt-1">Start using feature flags to see analytics here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
