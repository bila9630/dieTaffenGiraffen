import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useBoxVisibility } from "@/hooks/useBoxVisibility";

const InfoBox = () => {
  const { expansionSettings, updateExpansion } = useBoxVisibility();
  const isExpanded = expansionSettings.infoBoxExpanded;

  // Mock data for visitor capacity during the day (hourly percentages)
  const dailyData = [
    { time: "6am", capacity: 15 },
    { time: "9am", capacity: 42 },
    { time: "12pm", capacity: 95 },
    { time: "3pm", capacity: 68 },
    { time: "6pm", capacity: 35 },
    { time: "9pm", capacity: 18 },
  ];

  const currentCapacity = dailyData[2].capacity; // Using 12pm as current time
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
              onClick={() => updateExpansion('infoBoxExpanded', !isExpanded)}
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
                <p className="text-xs text-muted-foreground">Current Capacity</p>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-yellow-500">{currentCapacity}%</span>
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
                  <Line type="monotone" dataKey="capacity" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
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
