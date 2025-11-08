import { useState } from "react";
import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const InfoBox = () => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Mock data for visitor volume during the day (hourly)
  const dailyData = [
    { time: "6am", visitors: 120 },
    { time: "9am", visitors: 340 },
    { time: "12pm", visitors: 680 },
    { time: "3pm", visitors: 520 },
    { time: "6pm", visitors: 280 },
    { time: "9pm", visitors: 140 },
  ];

  const totalVisitors = dailyData.reduce((sum, item) => sum + item.visitors, 0);
  const recommendedTime = "6am - 9am";
  const peakTime = "12pm - 1pm";

  return (
    <Card className="w-72 border-glass-border bg-card/70 backdrop-blur-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-foreground">
              <TrendingUp className="h-4 w-4 text-primary" />
              Visitors
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            >
              {isExpanded ? '−' : '+'}
            </Button>
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="space-y-4">
            {/* Main Metric */}
            <div className="space-y-1">
              <div className="flex items-baseline justify-between">
                <p className="text-xs text-muted-foreground">Today's Total Visitors</p>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-yellow-500">{totalVisitors.toLocaleString()}</span>
              </div>
            </div>

            {/* Line Chart */}
            <div className="h-24">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyData}>
                  <XAxis
                    dataKey="time"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                      fontSize: "12px",
                    }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Line type="monotone" dataKey="visitors" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <p className="text-xs text-muted-foreground">Recommended</p>
                <p className="text-sm font-bold text-primary">{recommendedTime}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avoid Peak</p>
                <p className="text-sm font-bold text-destructive">{peakTime}</p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
  );
};

export default InfoBox;
