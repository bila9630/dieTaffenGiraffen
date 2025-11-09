import { useRef } from 'react';
import Map, { MapRef, POIMarker } from '@/components/Map';
import ChatBox from '@/components/ChatBox';
import Navigation from '@/components/Navigation';
import InfoBox from '@/components/InfoBox';
import WeatherBox from '@/components/WeatherBox';
import TherapyBanner from '@/components/TherapyBanner';
import { useBoxVisibility } from '@/hooks/useBoxVisibility';

const Index = () => {
  const mapRef = useRef<MapRef>(null);
  const { settings, therapyBannerVisible, hideTherapyBanner } = useBoxVisibility();

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

  const handleDisplayHiddenGem = async (marker: POIMarker) => {
    if (mapRef.current) {
      await mapRef.current.displayHiddenGem(marker);
    }
  };

  const handleDisplayHikingRoute = async () => {
    if (mapRef.current) {
      await mapRef.current.displayHikingRoute();
    }
  };

  const handleCloseHiddenGem = () => {
    if (mapRef.current) {
      mapRef.current.closeHiddenGem();
    }
  };

  const handleDisplayTherapy = async (marker: POIMarker) => {
    if (mapRef.current) {
      await mapRef.current.displayTherapy(marker);
    }
  };

  const handleCloseTherapy = () => {
    if (mapRef.current) {
      mapRef.current.closeTherapy();
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-background">
      <Map ref={mapRef} />
      <Navigation />
      <TherapyBanner isVisible={therapyBannerVisible} onClose={hideTherapyBanner} />
      {(settings.infoBox || settings.weatherBox) && (
        <div className="fixed right-6 top-6 z-50 flex flex-col gap-4">
          {settings.infoBox && <InfoBox />}
          {settings.weatherBox && <WeatherBox />}
        </div>
      )}
      {settings.chatBox && (
        <ChatBox
          onZoomToLocation={handleZoomToLocation}
          onDisplayMarkers={handleDisplayMarkers}
          onDisplayHiddenGem={handleDisplayHiddenGem}
          onDisplayHikingRoute={handleDisplayHikingRoute}
          onCloseHiddenGem={handleCloseHiddenGem}
          onDisplayTherapy={handleDisplayTherapy}
          onCloseTherapy={handleCloseTherapy}
        />
      )}
    </div>
  );
};

export default Index;
