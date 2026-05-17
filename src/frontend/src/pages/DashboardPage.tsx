import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { cabinsApi } from '@/services/cabins';
import { CabinCard } from '@/components/CabinCard';
import { CreateCabinModal } from '@/components/CreateCabinModal';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/auth';
import { PlusIcon, LogOutIcon } from 'lucide-react';

export function DashboardPage() {
  const { signOut } = useAuth();
  const [createOpen, setCreateOpen] = useState(false);

  const { data: cabins, isLoading, isError, refetch } = useQuery({
    queryKey: ['cabins'],
    queryFn: cabinsApi.list,
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">CabinConnect</h1>
        <div className="flex items-center gap-2">
          <Button onClick={() => setCreateOpen(true)} size="sm">
            <PlusIcon className="mr-1" />
            Add Cabin
          </Button>
          <Button variant="ghost" size="icon" onClick={signOut} title="Sign out">
            <LogOutIcon />
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <h2 className="text-2xl font-semibold mb-6">Your Cabins</h2>

        {isLoading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-lg" />
            ))}
          </div>
        )}

        {isError && (
          <p className="text-destructive">Failed to load cabins. Please try again.</p>
        )}

        {!isLoading && !isError && cabins?.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p className="mb-4">You haven't added any cabins yet.</p>
            <Button onClick={() => setCreateOpen(true)}>Create your first cabin</Button>
          </div>
        )}

        {!isLoading && !isError && cabins && cabins.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cabins.map((cabin) => (
              <CabinCard key={cabin.id} cabin={cabin} />
            ))}
          </div>
        )}
      </main>

      <CreateCabinModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => {
          setCreateOpen(false);
          refetch();
        }}
      />
    </div>
  );
}
