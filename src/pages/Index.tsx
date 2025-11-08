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
      <div className="fixed right-6 top-6 z-50 flex flex-col gap-4">
        <InfoBox />
        <WeatherBox />
      </div>
      <ChatBox />
    </div>
  );
};

export default Index;
