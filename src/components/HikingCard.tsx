import { Card, CardContent } from '@/components/ui/card';
import { Mountain, Clock, TrendingUp, TrendingDown, Star } from 'lucide-react';

interface HikingCardProps {
  route: {
    name: string;
    rating: number;
    distance: string;
    duration: string;
    elevationUp: string;
    elevationDown: string;
    description: string;
    imageUrl: string;
  };
}

const HikingCard = ({ route }: HikingCardProps) => {
  return (
    <div className="fixed bottom-6 left-6 z-50 w-96 max-w-[calc(100vw-3rem)]">
      <Card className="overflow-hidden border-glass-border bg-card/80 shadow-2xl backdrop-blur-xl">
        {/* Image */}
        <div className="relative h-48 w-full overflow-hidden">
          <img
            src={route.imageUrl}
            alt={route.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="text-lg font-bold text-white drop-shadow-lg line-clamp-2">
              {route.name}
            </h3>
          </div>
        </div>

        <CardContent className="space-y-3 p-4">
          {/* Rating */}
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < route.rating
                    ? 'fill-yellow-500 text-yellow-500'
                    : 'fill-muted text-muted'
                }`}
              />
            ))}
            <span className="ml-2 text-sm text-muted-foreground">
              {route.rating}.0
            </span>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Distance */}
            <div className="flex items-center gap-2 rounded-lg bg-secondary/50 p-2">
              <Mountain className="h-4 w-4 text-primary" />
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Distance</span>
                <span className="text-sm font-semibold text-foreground">
                  {route.distance}
                </span>
              </div>
            </div>

            {/* Duration */}
            <div className="flex items-center gap-2 rounded-lg bg-secondary/50 p-2">
              <Clock className="h-4 w-4 text-primary" />
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Duration</span>
                <span className="text-sm font-semibold text-foreground">
                  {route.duration}
                </span>
              </div>
            </div>

            {/* Elevation Up */}
            <div className="flex items-center gap-2 rounded-lg bg-secondary/50 p-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Ascent</span>
                <span className="text-sm font-semibold text-foreground">
                  {route.elevationUp}
                </span>
              </div>
            </div>

            {/* Elevation Down */}
            <div className="flex items-center gap-2 rounded-lg bg-secondary/50 p-2">
              <TrendingDown className="h-4 w-4 text-red-500" />
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Descent</span>
                <span className="text-sm font-semibold text-foreground">
                  {route.elevationDown}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="rounded-lg bg-secondary/30 p-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {route.description}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HikingCard;
