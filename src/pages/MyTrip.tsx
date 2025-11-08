import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users } from 'lucide-react';

const MyTrip = () => {
  const trips = [
    {
      id: 1,
      destination: 'Paris, France',
      date: 'June 15-22, 2024',
      status: 'Completed',
      travelers: 2,
      highlights: ['Eiffel Tower', 'Louvre Museum', 'Notre-Dame'],
    },
    {
      id: 2,
      destination: 'Tokyo, Japan',
      date: 'September 1-10, 2024',
      status: 'Upcoming',
      travelers: 1,
      highlights: ['Shibuya Crossing', 'Mt. Fuji', 'Senso-ji Temple'],
    },
    {
      id: 3,
      destination: 'Barcelona, Spain',
      date: 'April 5-12, 2024',
      status: 'Completed',
      travelers: 4,
      highlights: ['Sagrada Familia', 'Park Güell', 'La Rambla'],
    },
  ];

  return (
    <div className="relative min-h-screen w-full bg-background p-6">
      <Navigation />
      
      <div className="mx-auto max-w-7xl pt-20">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">My Trips</h1>
          <p className="text-muted-foreground">Your travel history and upcoming adventures</p>
        </div>

        <div className="space-y-6">
          {trips.map((trip) => (
            <Card key={trip.id} className="bg-card/70 backdrop-blur-xl border-glass-border hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      {trip.destination}
                      <Badge 
                        variant={trip.status === 'Completed' ? 'secondary' : 'default'}
                        className={trip.status === 'Completed' ? '' : 'bg-primary/20 text-primary'}
                      >
                        {trip.status}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {trip.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {trip.travelers} {trip.travelers === 1 ? 'traveler' : 'travelers'}
                      </span>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Highlights
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {trip.highlights.map((highlight) => (
                      <Badge key={highlight} variant="outline" className="bg-secondary/50">
                        {highlight}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {trips.length === 0 && (
          <Card className="bg-card/70 backdrop-blur-xl border-glass-border">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                No trips yet. Start planning your next adventure!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MyTrip;
