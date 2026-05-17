import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cabinsApi } from '@/services/cabins';
import { ApiError } from '@/services/api';
import { KeyInfoPanel } from '@/components/KeyInfoPanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeftIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(512, 'Name must be 512 characters or fewer'),
  location: z.string().min(1, 'Location is required'),
  capacity: z.number({ error: 'Capacity must be a number' }).int().min(1, 'Capacity must be at least 1'),
  description: z.string().optional(),
  amenityTagIds: z.array(z.string()).min(1, 'At least one amenity tag is required'),
  version: z.number(),
});

type FormValues = z.infer<typeof schema>;

export function CabinDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: cabin, isLoading, isError, error } = useQuery({
    queryKey: ['cabin', id],
    queryFn: () => cabinsApi.get(id!),
    retry: false,
  });

  const { data: tags } = useQuery({
    queryKey: ['amenity-tags'],
    queryFn: cabinsApi.amenityTags,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (cabin) {
      reset({
        name: cabin.name,
        location: cabin.location,
        capacity: cabin.capacity,
        description: cabin.description ?? '',
        amenityTagIds: cabin.amenityTags.map((t) => t.id),
        version: cabin.version,
      });
    }
  }, [cabin, reset]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) e.preventDefault();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const selectedTagIds = watch('amenityTagIds') ?? [];

  const toggleTag = (tagId: string) => {
    const next = selectedTagIds.includes(tagId)
      ? selectedTagIds.filter((t) => t !== tagId)
      : [...selectedTagIds, tagId];
    setValue('amenityTagIds', next, { shouldDirty: true });
  };

  const saveMutation = useMutation({
    mutationFn: (values: FormValues) =>
      cabinsApi.update(id!, {
        name: values.name,
        location: values.location,
        capacity: values.capacity,
        description: values.description || undefined,
        amenityTagIds: values.amenityTagIds,
        version: values.version,
      }),
    onSuccess: (updated) => {
      queryClient.setQueryData(['cabin', id], (old: typeof cabin) =>
        old ? { ...old, ...updated } : old
      );
      reset({
        name: updated.name,
        location: updated.location,
        capacity: updated.capacity,
        description: updated.description ?? '',
        amenityTagIds: updated.amenityTags.map((t) => t.id),
        version: updated.version,
      });
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        if (err.status === 409 && err.message.toLowerCase().includes('name')) {
          setError('name', { message: 'A cabin with this name already exists.' });
        } else if (err.status === 409) {
          setError('root', {
            message: 'This cabin was modified by someone else. Reload to get the latest version.',
            type: 'conflict',
          });
        } else {
          setError('root', { message: err.message });
        }
      }
    },
  });

  const onSubmit = (values: FormValues) => saveMutation.mutate(values);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-8 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-32" />
      </div>
    );
  }

  if (isError) {
    const status = error instanceof ApiError ? error.status : 0;
    return (
      <div className="mx-auto max-w-2xl px-6 py-8">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="mb-4">
          <ArrowLeftIcon className="mr-1" /> Back
        </Button>
        <p className="text-destructive">
          {status === 404 ? 'Cabin not found.' : status === 403 ? 'Access denied.' : 'Failed to load cabin.'}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="mb-4">
        <ArrowLeftIcon className="mr-1" /> Back
      </Button>

      <h1 className="text-2xl font-semibold mb-6">{cabin?.name}</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <div className="space-y-1">
          <Label htmlFor="cd-name">Name</Label>
          <Input id="cd-name" {...register('name')} disabled={isSubmitting} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="cd-location">Location</Label>
          <Input id="cd-location" {...register('location')} disabled={isSubmitting} />
          {errors.location && <p className="text-xs text-destructive">{errors.location.message}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="cd-capacity">Capacity</Label>
          <Input id="cd-capacity" type="number" min={1} {...register('capacity', { valueAsNumber: true })} disabled={isSubmitting} />
          {errors.capacity && <p className="text-xs text-destructive">{errors.capacity.message}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="cd-desc">Description</Label>
          <Textarea id="cd-desc" rows={3} {...register('description')} disabled={isSubmitting} />
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
                    variant={selectedTagIds.includes(tag.id) ? 'default' : 'outline'}
                    className={cn('cursor-pointer', isSubmitting && 'pointer-events-none')}
                  >
                    {tag.name}
                  </Badge>
                </button>
              ))}
            </div>
            {errors.amenityTagIds && (
              <p className="text-xs text-destructive">{errors.amenityTagIds.message}</p>
            )}
          </div>
        )}

        {errors.root?.type === 'conflict' ? (
          <div className="rounded-md border border-yellow-400 bg-yellow-50 p-3 text-sm">
            <p className="text-yellow-800 mb-2">{errors.root.message}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
            >
              Reload latest version
            </Button>
          </div>
        ) : errors.root ? (
          <p className="text-sm text-destructive">{errors.root.message}</p>
        ) : null}

        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting || !isDirty}>
            {isSubmitting ? 'Saving…' : 'Save Changes'}
          </Button>
        </div>
      </form>

      <div className="mt-10 border-t pt-8">
        {cabin && <KeyInfoPanel cabinId={id!} keyInfo={cabin.keyInfo} />}
      </div>
    </div>
  );
}
