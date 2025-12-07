'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { experimentsApi, Experiment } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  ColumnDef,
  flexRender,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

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
  const [globalFilter, setGlobalFilter] = useState('');

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
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const columns = useMemo<ColumnDef<Assignment>[]>(
    () => [
      {
        accessorKey: 'user.name',
        header: 'User',
        cell: ({ row }) => (
          <div className="font-medium">
            {row.original.user?.name || 'Unnamed User'}
          </div>
        ),
      },
      {
        accessorKey: 'user.email',
        header: 'Email',
        cell: ({ row }) => (
          <div className="text-sm">{row.original.user?.email || '-'}</div>
        ),
      },
      {
        accessorKey: 'variant',
        header: 'Variant',
        cell: ({ row }) => (
          <Badge variant={row.original.variant === 'A' ? 'default' : 'secondary'}>
            Variant {row.original.variant}
          </Badge>
        ),
      },
      {
        accessorKey: 'created_at',
        header: 'Assigned At',
        cell: ({ row }) => (
          <div className="text-sm text-muted-foreground">
            {new Date(row.original.created_at).toLocaleString()}
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: assignments,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: 'includesString',
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Experiments
      </Button>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {experiment?.name} - User Assignments
        </h1>
        <p className="text-muted-foreground mt-2">
          View which users are assigned to which variant
        </p>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Variant A</CardTitle>
            <Badge variant="default">A</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.variantA}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.variantA / stats.total) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Variant B</CardTitle>
            <Badge variant="secondary">B</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.variantB}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.variantB / stats.total) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total assignments</p>
          </CardContent>
        </Card>
      </div>

      {/* Assignments Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Assignments</CardTitle>
          <CardDescription>All users assigned to this experiment</CardDescription>
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No users assigned yet. Users will be automatically assigned when they interact with the flag.
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="h-24 text-center">
                        No assignments found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
