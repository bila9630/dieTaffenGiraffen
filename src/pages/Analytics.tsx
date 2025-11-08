import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, MapPin, Clock } from 'lucide-react';

const Analytics = () => {
  const stats = [
    { label: 'Total Trips Planned', value: '12', icon: MapPin, trend: '+3 this month' },
    { label: 'Destinations Explored', value: '8', icon: TrendingUp, trend: '+2 this month' },
    { label: 'Hours Saved', value: '24', icon: Clock, trend: 'vs manual planning' },
    { label: 'Places Discovered', value: '156', icon: BarChart3, trend: '+42 this month' },
  ];

  return (
    <div className="relative min-h-screen w-full bg-background p-6">
      <Navigation />
      
      <div className="mx-auto max-w-7xl pt-20">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Analytics</h1>
          <p className="text-muted-foreground">Track your travel planning insights</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="bg-card/70 backdrop-blur-xl border-glass-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{stat.trend}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-card/70 backdrop-blur-xl border-glass-border">
            <CardHeader>
              <CardTitle>Popular Destinations</CardTitle>
              <CardDescription>Your most visited locations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {['Paris, France', 'Tokyo, Japan', 'New York, USA', 'Barcelona, Spain'].map((city, i) => (
                <div key={city} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium">
                      {i + 1}
                    </div>
                    <span className="text-foreground">{city}</span>
                  </div>
                  <div className="h-2 w-24 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${100 - i * 20}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-card/70 backdrop-blur-xl border-glass-border">
            <CardHeader>
              <CardTitle>Travel Patterns</CardTitle>
              <CardDescription>When you prefer to travel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { season: 'Summer', percentage: 45 },
                { season: 'Spring', percentage: 30 },
                { season: 'Fall', percentage: 20 },
                { season: 'Winter', percentage: 5 },
              ].map((item) => (
                <div key={item.season} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{item.season}</span>
                    <span className="text-muted-foreground">{item.percentage}%</span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
