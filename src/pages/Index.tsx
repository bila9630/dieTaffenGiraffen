import { useState } from 'react';
import Map from '@/components/Map';
import ChatBox from '@/components/ChatBox';
import Navigation from '@/components/Navigation';
import type { Destination } from '@/lib/austrianDestinations';

const Index = () => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [newDestinations, setNewDestinations] = useState<Destination[]>([]);
  const [triggerFlyover, setTriggerFlyover] = useState(false);

  const handleDestinationsFound = (foundDestinations: Destination[]) => {
    // Merge with existing destinations, avoiding duplicates
    setDestinations(prev => {
      const existingNames = new Set(prev.map(d => d.name));
      const uniqueNew = foundDestinations.filter(d => !existingNames.has(d.name));
      
      if (uniqueNew.length > 0) {
        // Set the new destinations for flyover
        setNewDestinations(uniqueNew);
        // Trigger flyover for new destinations only
        setTriggerFlyover(false);
        setTimeout(() => setTriggerFlyover(true), 100);
        return [...prev, ...uniqueNew];
      }
      
      return prev;
    });
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-background">
      <Map destinations={destinations} newDestinations={newDestinations} triggerFlyover={triggerFlyover} />
      <Navigation />
      <ChatBox onDestinationsFound={handleDestinationsFound} />
    </div>
  );
};

export default Index;
