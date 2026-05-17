import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { cabinsApi } from '@/services/cabins';
import { ApiError } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(512, 'Name must be 512 characters or fewer'),
  location: z.string().min(1, 'Location is required'),
  capacity: z.number({ error: 'Capacity must be a number' }).int().min(1, 'Capacity must be at least 1'),
  description: z.string().optional(),
  amenityTagIds: z.array(z.string()),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateCabinModal({ open, onClose, onCreated }: Props) {
  const { data: tags, isLoading: tagsLoading, isError: tagsError } = useQuery({
    queryKey: ['amenity-tags'],
    queryFn: cabinsApi.amenityTags,
    enabled: open,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { amenityTagIds: [] },
  });

  const selectedTagIds = watch('amenityTagIds');

  useEffect(() => {
    if (!open) reset({ amenityTagIds: [] });
  }, [open, reset]);

  const toggleTag = (id: string) => {
    const current = selectedTagIds ?? [];
    const next = current.includes(id) ? current.filter((t) => t !== id) : [...current, id];
    setValue('amenityTagIds', next);
  };

  const onSubmit = async (values: FormValues) => {
    try {
      await cabinsApi.create({
        name: values.name,
        location: values.location,
        capacity: values.capacity,
        description: values.description || undefined,
        amenityTagIds: values.amenityTagIds,
      });
      onCreated();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError('name', { message: 'A cabin with this name already exists.' });
      } else {
        setError('root', { message: 'Something went wrong. Please try again.' });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Cabin</DialogTitle>
        </DialogHeader>

        {tagsLoading && (
          <p className="text-sm text-muted-foreground">Loading amenity options…</p>
        )}

        {tagsError && (
          <div className="rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
            Could not load amenity tags. Please close and reopen the form.
          </div>
        )}

        {!tagsLoading && !tagsError && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-1">
              <Label htmlFor="cc-name">Name</Label>
              <Input id="cc-name" {...register('name')} disabled={isSubmitting} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="cc-location">Location</Label>
              <Input id="cc-location" {...register('location')} disabled={isSubmitting} />
              {errors.location && <p className="text-xs text-destructive">{errors.location.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="cc-capacity">Capacity</Label>
              <Input id="cc-capacity" type="number" min={1} {...register('capacity', { valueAsNumber: true })} disabled={isSubmitting} />
              {errors.capacity && <p className="text-xs text-destructive">{errors.capacity.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="cc-desc">Description (optional)</Label>
              <Textarea id="cc-desc" {...register('description')} disabled={isSubmitting} rows={3} />
            </div>

            {tags && tags.length > 0 && (
              <div className="space-y-1">
                <Label>Amenity Tags</Label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      disabled={isSubmitting}
                      className="focus:outline-none"
                    >
                      <Badge
                        variant={selectedTagIds?.includes(tag.id) ? 'default' : 'outline'}
                        className={cn('cursor-pointer', isSubmitting && 'pointer-events-none')}
                      >
                        {tag.name}
                      </Badge>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {errors.root && (
              <p className="text-sm text-destructive">{errors.root.message}</p>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating…' : 'Create Cabin'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
