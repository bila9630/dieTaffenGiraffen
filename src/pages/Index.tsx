import Map from '@/components/Map';
import ChatBox from '@/components/ChatBox';
import Navigation from '@/components/Navigation';
import InfoBox from '@/components/InfoBox';
import WeatherBox from '@/components/WeatherBox';

const Index = () => {
  return (
    <div className="relative h-screen w-full overflow-hidden bg-background">
      <Map />
      <Navigation />
      <InfoBox />
      <WeatherBox />
      <ChatBox />
    </div>
  );
};

export default Index;
