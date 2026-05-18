import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { invitationsApi } from '@/services/invitations';
import { ApiError } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeftIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  role: z.enum(['cabin_owner', 'guest'], { error: 'Role is required' }),
});

type FormValues = z.infer<typeof schema>;

export function InvitePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const role = watch('role');

  const onSubmit = async (values: FormValues) => {
    setPendingEmail(null);
    try {
      await invitationsApi.create(values.email, values.role);
      toast({ title: 'Invitation sent', description: `Invitation sent to ${values.email}.` });
      reset();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409 && err.message.toLowerCase().includes('pending')) {
          setPendingEmail(values.email);
          setError('email', { message: err.message });
        } else if (err.status === 409) {
          setError('email', { message: err.message });
        } else if (err.status === 403) {
          setError('root', { message: 'You do not have permission to invite users.' });
        } else {
          setError('root', { message: 'Something went wrong. Please try again.' });
        }
      }
    }
  };

  const handleResend = async () => {
    if (!pendingEmail) return;
    try {
      await invitationsApi.resend(pendingEmail);
      toast({ title: 'Invitation resent', description: `Resent to ${pendingEmail}.` });
      setPendingEmail(null);
      reset();
    } catch {
      toast({ title: 'Error', description: 'Failed to resend invitation.', variant: 'destructive' });
    }
  };

  const handleCancel = async () => {
    if (!pendingEmail) return;
    try {
      await invitationsApi.cancel(pendingEmail);
      toast({ title: 'Invitation cancelled', description: `Invitation for ${pendingEmail} was cancelled.` });
      setPendingEmail(null);
      reset();
    } catch {
      toast({ title: 'Error', description: 'Failed to cancel invitation.', variant: 'destructive' });
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="mb-6">
        <ArrowLeftIcon className="mr-1" /> Back to Dashboard
      </Button>
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Invite User</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div className="space-y-1">
                <Label htmlFor="inv-email">Email Address</Label>
                <Input
                  id="inv-email"
                  type="email"
                  autoComplete="off"
                  {...register('email')}
                  disabled={isSubmitting}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>

              <div className="space-y-1">
                <Label>Role</Label>
                <Select
                  value={role}
                  onValueChange={(v) => setValue('role', v as FormValues['role'], { shouldValidate: true })}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cabin_owner">Cabin Owner</SelectItem>
                    <SelectItem value="guest">Guest</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && <p className="text-xs text-destructive">{errors.role.message}</p>}
              </div>

              {pendingEmail && (
                <div className="rounded-md border border-yellow-400 bg-yellow-50 p-3 space-y-2">
                  <p className="text-sm text-yellow-800">
                    A pending invitation already exists for <strong>{pendingEmail}</strong>.
                  </p>
                  <div className="flex gap-2">
                    <Button type="button" size="sm" variant="outline" onClick={handleResend}>
                      Resend
                    </Button>
                    <Button type="button" size="sm" variant="destructive" onClick={handleCancel}>
                      Cancel Invitation
                    </Button>
                  </div>
                </div>
              )}

              {errors.root && (
                <p className="text-sm text-destructive">{errors.root.message}</p>
              )}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Sending…' : 'Send Invitation'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
