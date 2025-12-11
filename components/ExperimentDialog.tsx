'use client';

import { useState, useEffect } from 'react';
import { Experiment, FeatureFlag, experimentsApi } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface ExperimentDialogProps {
  experiment: Experiment | null;
  flags: FeatureFlag[];
  isOpen: boolean;
  onClose: () => void;
}

export default function ExperimentDialog({
  experiment,
  flags,
  isOpen,
  onClose,
}: ExperimentDialogProps) {
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
  }, [experiment, flags, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.variant_a_percentage + formData.variant_b_percentage !== 100) {
      toast.error('Variant percentages must total 100%');
      return;
    }

    setLoading(true);

    try {
      if (experiment) {
        await experimentsApi.update(experiment.id, {
          name: formData.name,
          description: formData.description || undefined,
          variant_a_percentage: formData.variant_a_percentage,
          variant_b_percentage: formData.variant_b_percentage,
          status: formData.status,
          start_date: formData.start_date || undefined,
          end_date: formData.end_date || undefined,
        });
        toast.success('Experiment updated successfully');
      } else {
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
        toast.success('Experiment created successfully');
      }
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save experiment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{experiment ? 'Edit Experiment' : 'Create Experiment'}</DialogTitle>
          <DialogDescription>
            {experiment
              ? 'Update the experiment configuration below.'
              : 'Create a new A/B experiment to test feature variations.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {!experiment && (
              <div className="grid gap-2">
                <Label htmlFor="flag_id">Feature Flag *</Label>
                <Select
                  value={formData.flag_id}
                  onValueChange={(value) => setFormData({ ...formData, flag_id: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a flag" />
                  </SelectTrigger>
                  <SelectContent>
                    {flags.map((flag) => (
                      <SelectItem key={flag.id} value={flag.id}>
                        {flag.name} ({flag.key})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Experiment Name"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description of the experiment"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="variant_a_percentage">Variant A %</Label>
                <Input
                  id="variant_a_percentage"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.variant_a_percentage}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      variant_a_percentage: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="variant_b_percentage">Variant B %</Label>
                <Input
                  id="variant_b_percentage"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.variant_b_percentage}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      variant_b_percentage: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) =>
                  setFormData({
                    ...formData,
                    status: value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="running">Running</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : experiment ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


