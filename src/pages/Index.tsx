import { useRef } from 'react';
import Map, { MapRef, POIMarker } from '@/components/Map';
import ChatBox from '@/components/ChatBox';
import Navigation from '@/components/Navigation';
import InfoBox from '@/components/InfoBox';
import WeatherBox from '@/components/WeatherBox';

const Index = () => {
  const mapRef = useRef<MapRef>(null);

  const handleZoomToLocation = async (location: string) => {
    if (mapRef.current) {
      await mapRef.current.flyToLocation(location);
    }
  };

  const handleDisplayMarkers = async (markers: POIMarker[]) => {
    if (mapRef.current) {
      await mapRef.current.displayMarkers(markers);
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-background">
      <Map ref={mapRef} />
      <Navigation />
      <div className="fixed right-6 top-6 z-50 flex flex-col gap-4">
        <InfoBox />
        <WeatherBox />
      </div>
      <ChatBox onZoomToLocation={handleZoomToLocation} onDisplayMarkers={handleDisplayMarkers} />
    </div>
  );
};

export default Index;
