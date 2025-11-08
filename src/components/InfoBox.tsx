import { useState } from 'react';
import { TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const InfoBox = () => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Mock data for visitor volume over the past week
  const weeklyData = [
    { day: 'Mon', visitors: 1120 },
    { day: 'Tue', visitors: 1340 },
    { day: 'Wed', visitors: 1180 },
    { day: 'Thu', visitors: 1420 },
    { day: 'Fri', visitors: 1580 },
    { day: 'Sat', visitors: 1680 },
    { day: 'Sun', visitors: 1247 },
  ];

  const currentVisitors = weeklyData[weeklyData.length - 1].visitors;
  const previousVisitors = weeklyData[weeklyData.length - 2].visitors;
  const trend = ((currentVisitors - previousVisitors) / previousVisitors * 100).toFixed(1);
  const trendDisplay = trend.startsWith('-') ? trend : `+${trend}`;

  return (
    <div className="fixed right-6 top-6 z-50">
      <Card className="w-80 border-glass-border bg-card/70 backdrop-blur-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-foreground">
              <TrendingUp className="h-4 w-4 text-primary" />
              Statistics
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="space-y-4">
            {/* Main Metric */}
            <div className="space-y-1">
              <div className="flex items-baseline justify-between">
                <p className="text-xs text-muted-foreground">Visitor Volume</p>
                <p className="text-xs text-muted-foreground">Last 7 Days</p>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-primary">
                  {trendDisplay}%
                </span>
              </div>
            </div>

            {/* Line Chart */}
            <div className="h-24">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData}>
                  <XAxis 
                    dataKey="day" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    hide 
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem',
                      fontSize: '12px',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="visitors" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <p className="text-xs text-muted-foreground">Today</p>
                <p className="text-xl font-bold text-foreground">{currentVisitors.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">vs. Yesterday</p>
                <p className={`text-xl font-bold ${trend.startsWith('-') ? 'text-destructive' : 'text-primary'}`}>
                  {trendDisplay}%
                </p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default InfoBox;
