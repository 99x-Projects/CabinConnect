import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Cabin } from '@/types/cabin';

interface CabinCardProps {
  cabin: Cabin;
}

export function CabinCard({ cabin }: CabinCardProps) {
  const navigate = useNavigate();

  return (
    <Card
      className={cn(
        'cursor-pointer transition-shadow hover:shadow-md',
        !cabin.isActive && 'opacity-50'
      )}
      onClick={() => navigate(`/cabins/${cabin.id}`)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg">{cabin.name}</CardTitle>
          <Badge variant={cabin.isActive ? 'default' : 'secondary'}>
            {cabin.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{cabin.location}</p>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-3">
          Capacity: {cabin.capacity}
        </p>
        {cabin.amenityTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {cabin.amenityTags.map((tag) => (
              <Badge key={tag.id} variant="outline" className="text-xs">
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
