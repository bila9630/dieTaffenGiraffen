import { useState } from 'react';
import Map from '@/components/Map';
import ChatBox from '@/components/ChatBox';
import Navigation from '@/components/Navigation';
import type { Destination } from '@/lib/austrianDestinations';

const Index = () => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [triggerFlyover, setTriggerFlyover] = useState(false);

  const handleDestinationsFound = (newDestinations: Destination[]) => {
    // Merge with existing destinations, avoiding duplicates
    setDestinations(prev => {
      const existingNames = new Set(prev.map(d => d.name));
      const uniqueNew = newDestinations.filter(d => !existingNames.has(d.name));
      
      if (uniqueNew.length > 0) {
        // Trigger flyover for new destinations
        setTriggerFlyover(false);
        setTimeout(() => setTriggerFlyover(true), 100);
        return [...prev, ...uniqueNew];
      }
      
      return prev;
    });
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-background">
      <Map destinations={destinations} triggerFlyover={triggerFlyover} />
      <Navigation />
      <ChatBox onDestinationsFound={handleDestinationsFound} />
    </div>
  );
};

export default Index;
