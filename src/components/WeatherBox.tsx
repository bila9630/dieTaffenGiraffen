import { useState } from "react";
import { Cloud, Sun, CloudRain } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const WeatherBox = () => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Mock weather data for the week
  const weeklyWeather = [
    { day: "Mon", temp: 72, condition: "sunny" },
    { day: "Tue", temp: 68, condition: "cloudy" },
    { day: "Wed", temp: 65, condition: "rainy" },
    { day: "Thu", temp: 70, condition: "sunny" },
    { day: "Fri", temp: 73, condition: "sunny" },
    { day: "Sat", temp: 69, condition: "cloudy" },
    { day: "Sun", temp: 71, condition: "sunny" },
  ];

  const todayWeather = weeklyWeather[0];

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case "sunny":
        return <Sun className="h-5 w-5 text-yellow-500" />;
      case "rainy":
        return <CloudRain className="h-5 w-5 text-blue-400" />;
      case "cloudy":
        return <Cloud className="h-5 w-5 text-muted-foreground" />;
      default:
        return <Sun className="h-5 w-5 text-yellow-500" />;
    }
  };

  return (
    <div className="fixed right-6 top-52 z-50">
      <Card className="w-72 border-glass-border bg-card/70 backdrop-blur-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Cloud className="h-4 w-4 text-primary" />
              Weather
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
                <p className="text-xs text-muted-foreground">Today's Temperature</p>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-foreground">{todayWeather.temp}°F</span>
                {getWeatherIcon(todayWeather.condition)}
              </div>
            </div>

            {/* Weekly Weather */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">This Week</p>
              <div className="grid grid-cols-7 gap-1">
                {weeklyWeather.map((day, index) => (
                  <div key={index} className="flex flex-col items-center gap-1">
                    <p className="text-[10px] text-muted-foreground">{day.day}</p>
                    {getWeatherIcon(day.condition)}
                    <p className="text-xs font-semibold text-foreground">{day.temp}°</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default WeatherBox;
