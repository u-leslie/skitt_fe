'use client';

import { useState, useEffect } from 'react';
import { FeatureFlag, featureFlagsApi } from '@/lib/api';
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
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

interface FlagDialogProps {
  flag: FeatureFlag | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function FlagDialog({ flag, isOpen, onClose }: FlagDialogProps) {
  const [formData, setFormData] = useState({
    key: '',
    name: '',
    description: '',
    enabled: false,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (flag) {
      setFormData({
        key: flag.key,
        name: flag.name,
        description: flag.description || '',
        enabled: flag.enabled,
      });
    } else {
      setFormData({
        key: '',
        name: '',
        description: '',
        enabled: false,
      });
    }
  }, [flag, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (flag) {
        await featureFlagsApi.update(flag.id, {
          name: formData.name,
          description: formData.description || undefined,
          enabled: formData.enabled,
        });
        toast.success('Feature flag updated successfully');
      } else {
        await featureFlagsApi.create({
          key: formData.key,
          name: formData.name,
          description: formData.description || undefined,
          enabled: formData.enabled,
        });
        toast.success('Feature flag created successfully');
      }
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save feature flag');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{flag ? 'Edit Feature Flag' : 'Create Feature Flag'}</DialogTitle>
          <DialogDescription>
            {flag
              ? 'Update the feature flag details below.'
              : 'Create a new feature flag to control feature rollouts.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {!flag && (
              <div className="grid gap-2">
                <Label htmlFor="key">Key *</Label>
                <Input
                  id="key"
                  required
                  value={formData.key}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                  placeholder="new-feature-flag"
                />
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="New Feature Flag"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description of the feature flag"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="enabled"
                checked={formData.enabled}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, enabled: checked as boolean })
                }
              />
              <Label htmlFor="enabled" className="cursor-pointer">
                Enabled
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : flag ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}



