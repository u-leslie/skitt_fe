'use client';

import { useState, useEffect } from 'react';
import { User, usersApi } from '@/lib/api';
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
import { toast } from 'sonner';

interface UserDialogProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function UserDialog({ user, isOpen, onClose }: UserDialogProps) {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    attributes: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        name: user.name || '',
        attributes: user.attributes ? JSON.stringify(user.attributes, null, 2) : '',
      });
    } else {
      setFormData({
        email: '',
        name: '',
        attributes: '',
      });
    }
  }, [user, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let attributes = null;
      if (formData.attributes.trim()) {
        try {
          attributes = JSON.parse(formData.attributes);
        } catch {
          throw new Error('Invalid JSON format for attributes');
        }
      }

      if (user) {
        await usersApi.update(user.id, {
          email: formData.email || undefined,
          name: formData.name || undefined,
          attributes: attributes || undefined,
        });
        toast.success('User updated successfully');
      } else {
        await usersApi.create({
          email: formData.email || undefined,
          name: formData.name || undefined,
          attributes: attributes || undefined,
        });
        toast.success('User created successfully');
      }
      onClose();
    } catch (err: any) {
      toast.error(err.message || err.response?.data?.error || 'Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{user ? 'Edit User' : 'Create User'}</DialogTitle>
          <DialogDescription>
            {user
              ? 'Update the user details below.'
              : 'Create a new user to assign to experiments and feature flags.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="User Name"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="user@example.com"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="attributes">Attributes (JSON)</Label>
              <Textarea
                id="attributes"
                rows={4}
                value={formData.attributes}
                onChange={(e) => setFormData({ ...formData, attributes: e.target.value })}
                placeholder='{"plan": "premium", "region": "us"}'
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Optional JSON object for custom attributes
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : user ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


