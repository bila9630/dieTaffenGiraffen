import { Cloud, Sun, CloudRain, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useBoxVisibility } from "@/hooks/useBoxVisibility";

const WeatherBox = () => {
  const { expansionSettings, updateExpansion, hikingWeatherSuccess } = useBoxVisibility();
  const isExpanded = expansionSettings.weatherBoxExpanded;

  // Mock weather data for the week
  const weeklyWeather = [
    { day: "Mon", temp: 22, condition: "sunny" },
    { day: "Tue", temp: 20, condition: "cloudy" },
    { day: "Wed", temp: 18, condition: "rainy" },
    { day: "Thu", temp: 21, condition: "sunny" },
    { day: "Fri", temp: 23, condition: "sunny" },
    { day: "Sat", temp: 21, condition: "sunny" },
    { day: "Sun", temp: 22, condition: "sunny" },
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
    <Card className={`w-72 border-glass-border bg-card/70 backdrop-blur-xl transition-all duration-500 ${hikingWeatherSuccess ? 'ring-2 ring-green-500/50 shadow-lg shadow-green-500/20' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Cloud className="h-4 w-4 text-primary" />
              Weather
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => updateExpansion('weatherBoxExpanded', !isExpanded)}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            >
              {isExpanded ? '−' : '+'}
            </Button>
          </div>
          {hikingWeatherSuccess && (
            <div className="mt-2 flex items-center gap-1.5 rounded-md bg-green-500/10 px-2.5 py-1.5 text-green-600 dark:text-green-400 animate-in fade-in slide-in-from-top-2 duration-300">
              <Check className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">Ideal Hiking Weather</span>
            </div>
          )}
        </CardHeader>

        {isExpanded && (
          <CardContent className="space-y-4">
            {/* Main Metric */}
            <div className="space-y-1">
              <div className="flex items-baseline justify-between">
                <p className="text-xs text-muted-foreground">Saturday's Temperature</p>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-foreground ">{todayWeather.temp}°C</span>
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
  );
};

export default WeatherBox;
