import { Users, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const InfoBox = () => {
  // Mock data for visitor volume
  const visitorStats = {
    current: 1247,
    trend: '+12%',
    label: 'Active Visitors',
  };

  return (
    <div className="fixed right-6 top-6 z-50">
      <Card className="w-64 border-glass-border bg-card/70 backdrop-blur-xl">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Users className="h-4 w-4 text-primary" />
            Visitor Volume
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-foreground">
              {visitorStats.current.toLocaleString()}
            </span>
            <div className="flex items-center gap-1 text-xs font-medium text-primary">
              <TrendingUp className="h-3 w-3" />
              <span>{visitorStats.trend}</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{visitorStats.label}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default InfoBox;
