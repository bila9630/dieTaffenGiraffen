import Map from '@/components/Map';
import ChatBox from '@/components/ChatBox';
import Navigation from '@/components/Navigation';

const Index = () => {
  return (
    <div className="relative h-screen w-full overflow-hidden bg-background">
      <Map />
      <Navigation />
      <ChatBox />
    </div>
  );
};

export default Index;
