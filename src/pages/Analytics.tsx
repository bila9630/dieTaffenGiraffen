import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, MapPin, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface HeatmapData {
  day_of_week: number;
  hour_of_day: number;
  average_busyness: number;
}

const Analytics = () => {
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchHeatmapData = async () => {
      try {
        setIsLoading(true);
        
        // First get the POI id for Hallstatt Marktplatz
        const { data: poiData, error: poiError } = await supabase
          .from('pois')
          .select('id')
          .eq('name', 'Hallstatt Marktplatz')
          .single();

        if (poiError) throw poiError;
        
        if (!poiData) {
          console.error('POI not found');
          setIsLoading(false);
          return;
        }

        // Query frequencies data for this POI
        const { data: rawData, error: rawError } = await supabase
          .from('frequencies')
          .select('day_of_week, timestamp, freq')
          .eq('id', poiData.id);

        if (rawError) throw rawError;

        // Process data on client side
        const processed = processHeatmapData(rawData || []);
        setHeatmapData(processed);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHeatmapData();
  }, []);

  // Helper function to process raw data into heatmap format
  const processHeatmapData = (rawData: any[]): HeatmapData[] => {
    const grouped = new Map<string, number[]>();

    rawData.forEach(row => {
      const hour = new Date(row.timestamp).getHours();
      const key = `${row.day_of_week}-${hour}`;
      
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)?.push(row.freq);
    });

    const result: HeatmapData[] = [];
    grouped.forEach((freqs, key) => {
      const [day, hour] = key.split('-').map(Number);
      const average = freqs.reduce((a, b) => a + b, 0) / freqs.length;
      result.push({
        day_of_week: day,
        hour_of_day: hour,
        average_busyness: average
      });
    });

    return result;
  };

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Get color based on busyness level
  const getColor = (busyness: number, maxBusyness: number) => {
    const normalized = busyness / maxBusyness;
    if (normalized < 0.33) return 'hsl(120, 70%, 50%)'; // Green
    if (normalized < 0.67) return 'hsl(60, 70%, 50%)'; // Yellow
    return 'hsl(0, 70%, 50%)'; // Red
  };

  const maxBusyness = Math.max(...heatmapData.map(d => d.average_busyness), 1);

  const getBusynessForCell = (day: number, hour: number) => {
    const cell = heatmapData.find(d => d.day_of_week === day && d.hour_of_day === hour);
    return cell?.average_busyness || 0;
  };

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


        {/* Busyness DNA Heatmap */}
        <Card className="bg-card/70 backdrop-blur-xl border-glass-border mb-6 col-span-full">
          <CardHeader>
            <CardTitle>Typical Busyness: Hallstatt Marktplatz</CardTitle>
            <CardDescription>Average busyness by hour and day of the week</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-96 text-muted-foreground">
                Loading busyness data...
              </div>
            ) : heatmapData.length === 0 ? (
              <div className="flex items-center justify-center h-96 text-muted-foreground">
                No busyness data available for Hallstatt Marktplatz
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="inline-block min-w-full">
                  <div className="flex gap-2">
                    {/* Day labels column */}
                    <div className="flex flex-col justify-start pt-8">
                      {dayNames.map((day) => (
                        <div key={day} className="h-8 flex items-center text-sm font-medium text-foreground pr-4">
                          {day}
                        </div>
                      ))}
                    </div>
                    
                    {/* Heatmap grid */}
                    <div className="flex-1">
                      {/* Hour labels */}
                      <div className="flex gap-1 mb-2">
                        {hours.map(hour => (
                          <div key={hour} className="w-8 text-center text-xs text-muted-foreground">
                            {hour}
                          </div>
                        ))}
                      </div>
                      
                      {/* Heatmap cells */}
                      {dayNames.map((_, dayIndex) => (
                        <div key={dayIndex} className="flex gap-1 mb-1">
                          {hours.map(hour => {
                            const busyness = getBusynessForCell(dayIndex, hour);
                            const color = busyness > 0 ? getColor(busyness, maxBusyness) : 'hsl(var(--muted))';
                            
                            return (
                              <div
                                key={hour}
                                className="w-8 h-8 rounded border border-border transition-all hover:scale-110 hover:z-10 cursor-pointer"
                                style={{ backgroundColor: color }}
                                title={`${dayNames[dayIndex]} ${hour}:00 - Busyness: ${busyness.toFixed(2)}`}
                              />
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Legend */}
                  <div className="mt-6 flex items-center justify-center gap-6">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(120, 70%, 50%)' }} />
                      <span className="text-sm text-muted-foreground">Low</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(60, 70%, 50%)' }} />
                      <span className="text-sm text-muted-foreground">Medium</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(0, 70%, 50%)' }} />
                      <span className="text-sm text-muted-foreground">High</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

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
