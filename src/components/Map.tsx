import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export interface POIMarker {
  id: number;
  name: string;
  lat: number;
  lon: number;
  rating?: number;
  image_url?: string;
}

export interface MapRef {
  flyToLocation: (location: string) => Promise<void>;
  displayMarkers: (markers: POIMarker[]) => Promise<void>;
}

const Map = forwardRef<MapRef>((props, ref) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const overlayContainer = useRef<HTMLDivElement | null>(null);
  const svgContainer = useRef<SVGSVGElement | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [savedToken, setSavedToken] = useState<string>(() => {
    return import.meta.env.VITE_MAPBOX_KEY || localStorage.getItem('mapbox_token') || '';
  });
  const [isLoading, setIsLoading] = useState(false);
  const [activePOIs, setActivePOIs] = useState<POIMarker[]>([]);

  const initializeMap = (token: string) => {
    if (!mapContainer.current) return;

    try {
      setIsLoading(true);
      mapboxgl.accessToken = token;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        projection: { name: 'globe' },
        zoom: 2,
        center: [0, 20],
        pitch: 0,
      });

      // Rotation settings
      const secondsPerRevolution = 120;
      const maxSpinZoom = 5;
      const slowSpinZoom = 3;
      let userInteracting = false;
      let spinEnabled = true;

      // Spin globe function
      function spinGlobe() {
        if (!map.current) return;

        const zoom = map.current.getZoom();
        if (spinEnabled && !userInteracting && zoom < maxSpinZoom) {
          let distancePerSecond = 360 / secondsPerRevolution;
          if (zoom > slowSpinZoom) {
            const zoomDif = (maxSpinZoom - zoom) / (maxSpinZoom - slowSpinZoom);
            distancePerSecond *= zoomDif;
          }
          const center = map.current.getCenter();
          center.lng -= distancePerSecond;
          map.current.easeTo({ center, duration: 1000, easing: (n) => n });
        }
      }

      map.current.on('load', () => {
        setIsLoading(false);
        console.log('Map loaded successfully');
        spinGlobe();
      });

      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
        toast.error('Failed to load map. Please check your token.');
        setIsLoading(false);
      });

      // Interaction handlers
      map.current.on('mousedown', () => {
        userInteracting = true;
      });

      map.current.on('dragstart', () => {
        userInteracting = true;
      });

      map.current.on('mouseup', () => {
        userInteracting = false;
        spinGlobe();
      });

      map.current.on('dragend', () => {
        userInteracting = false;
        spinGlobe();
      });

      map.current.on('touchend', () => {
        userInteracting = false;
        spinGlobe();
      });

      map.current.on('moveend', () => {
        spinGlobe();
      });

      map.current.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: true,
        }),
        'top-right'
      );

      map.current.on('style.load', () => {
        map.current?.setFog({
          color: 'rgb(10, 20, 30)',
          'high-color': 'rgb(20, 30, 50)',
          'horizon-blend': 0.1,
        });
      });
    } catch (error) {
      console.error('Map initialization error:', error);
      toast.error('Failed to initialize map. Please check your token.');
      setIsLoading(false);
      setSavedToken('');
      localStorage.removeItem('mapbox_token');
    }
  };

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mapboxToken.trim()) {
      const token = mapboxToken.trim();
      localStorage.setItem('mapbox_token', token);
      setSavedToken(token);
      toast.success('Token saved successfully');
    } else {
      toast.error('Please enter a valid Mapbox token');
    }
  };

  // Expose flyToLocation and displayMarkers methods via ref
  useImperativeHandle(ref, () => ({
    flyToLocation: async (location: string) => {
      if (!map.current || !savedToken) {
        console.error('Map not initialized');
        return;
      }

      try {
        // Use Mapbox Geocoding API to convert location name to coordinates
        const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json?access_token=${savedToken}&limit=1`;
        const response = await fetch(geocodeUrl);
        const data = await response.json();

        if (data.features && data.features.length > 0) {
          const [lng, lat] = data.features[0].center;

          // Fly to the location
          map.current.flyTo({
            center: [lng, lat],
            zoom: 10,
            duration: 2500,
            essential: true,
          });
        } else {
          toast.error(`Location "${location}" not found`);
        }
      } catch (error) {
        console.error('Error geocoding location:', error);
        toast.error('Failed to find location');
      }
    },
    displayMarkers: async (poiMarkers: POIMarker[]) => {
      if (!map.current) {
        console.error('Map not initialized');
        return;
      }

      // Remove existing markers
      markers.current.forEach(marker => marker.remove());
      markers.current = [];

      // Clear existing cards immediately
      setActivePOIs([]);

      // Add simple pin markers
      poiMarkers.forEach(poi => {
        const marker = new mapboxgl.Marker({ color: '#ef4444' })
          .setLngLat([poi.lon, poi.lat])
          .addTo(map.current!);

        markers.current.push(marker);
      });

      // Zoom to show all markers
      if (poiMarkers.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        poiMarkers.forEach(poi => bounds.extend([poi.lon, poi.lat]));
        map.current.fitBounds(bounds, { padding: 200, maxZoom: 13, duration: 2000 });

        // Wait for zoom animation to complete before showing cards
        const onMoveEnd = () => {
          setActivePOIs(poiMarkers);
          map.current?.off('moveend', onMoveEnd);
        };
        map.current.once('moveend', onMoveEnd);
      }
    },
  }));

  useEffect(() => {
    if (savedToken) {
      setTimeout(() => {
        initializeMap(savedToken);
      }, 100);
    }

    return () => {
      map.current?.remove();
    };
  }, [savedToken]);

  // Render POI cards component
  const POICards = () => {
    const [cardPositions, setCardPositions] = useState<Array<{ x: number; y: number; poi: POIMarker }>>([]);

    useEffect(() => {
      if (!map.current || activePOIs.length === 0) return;

      const updatePositions = () => {
        if (!map.current) return;

        const positions: Array<{ x: number; y: number; poi: POIMarker }> = [];

        // Hard-coded positions for Linz top 5 attractions (optimized for presentation)
        const linzCardConfigs = [
          { angle: 40, distance: 200 },  // Card 0: Top-left (mariendom)
          { angle: -45, distance: 220 },   // Card 1: Top-right (ars electronica)
          { angle: 0, distance: 180 },     // Card 2: Right (schloss museum)
          { angle: 90, distance: 120 },    // Card 3: Bottom (botanic garden)
          { angle: 180, distance: 250 },   // Card 4: Left (Pöstlingbergbahn)
        ];

        activePOIs.forEach((poi, index) => {
          // Get screen position of marker
          const point = map.current!.project([poi.lon, poi.lat]);

          // Use hard-coded config for this card
          const config = linzCardConfigs[index % linzCardConfigs.length];
          const angleRad = (config.angle * Math.PI) / 180;

          // Position card away from marker
          const x = point.x + Math.cos(angleRad) * config.distance;
          const y = point.y + Math.sin(angleRad) * config.distance;

          positions.push({ x, y, poi });
        });

        setCardPositions(positions);
      };

      // Update on map move
      map.current.on('move', updatePositions);
      map.current.on('zoom', updatePositions);

      // Initial update
      setTimeout(updatePositions, 100);

      return () => {
        map.current?.off('move', updatePositions);
        map.current?.off('zoom', updatePositions);
      };
    }, [activePOIs]);

    const renderStars = (rating: number) => {
      const fullStars = Math.floor(rating);
      const hasHalfStar = rating % 1 >= 0.5;
      const stars = [];

      for (let i = 0; i < fullStars; i++) {
        stars.push(<span key={`full-${i}`} className="text-yellow-400 text-xs">★</span>);
      }
      if (hasHalfStar) {
        stars.push(
          <span key="half" className="relative inline-block text-xs" style={{ width: '0.75em' }}>
            <span className="absolute text-gray-400">★</span>
            <span className="absolute text-yellow-400" style={{ clipPath: 'inset(0 50% 0 0)' }}>★</span>
          </span>
        );
      }
      const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
      for (let i = 0; i < emptyStars; i++) {
        stars.push(<span key={`empty-${i}`} className="text-gray-400 text-xs">★</span>);
      }
      return stars;
    };

    if (cardPositions.length === 0) return null;

    return (
      <>
        {/* SVG Layer for connecting lines */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 1000 }}
        >
          {cardPositions.map((pos, index) => {
            const markerPoint = map.current!.project([pos.poi.lon, pos.poi.lat]);
            return (
              <line
                key={`line-${pos.poi.id}`}
                x1={markerPoint.x}
                y1={markerPoint.y}
                x2={pos.x}
                y2={pos.y}
                stroke="#ef4444"
                strokeWidth="2"
                strokeDasharray="4,4"
                opacity="0.7"
              />
            );
          })}
        </svg>

        {/* Cards Layer */}
        {cardPositions.map((pos) => (
          <div
            key={`card-${pos.poi.id}`}
            className="absolute pointer-events-auto"
            style={{
              left: `${pos.x}px`,
              top: `${pos.y}px`,
              transform: 'translate(-50%, -50%)',
              zIndex: 1001,
              width: '200px',
            }}
          >
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg overflow-hidden shadow-xl border border-slate-700/50 hover:scale-105 transition-transform duration-200">
              {pos.poi.image_url && (
                <div className="w-full h-24 overflow-hidden bg-gradient-to-b from-black/10 to-black/40">
                  <img
                    src={pos.poi.image_url}
                    alt={pos.poi.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).parentElement!.style.display = 'none';
                    }}
                  />
                </div>
              )}
              <div className="p-2.5">
                <h3 className="text-sm font-bold text-slate-100 mb-1.5 leading-tight drop-shadow-lg">
                  {pos.poi.name}
                </h3>
                {pos.poi.rating && (
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="flex gap-0.5">
                      {renderStars(pos.poi.rating)}
                    </div>
                    <span className="text-xs font-semibold text-yellow-400 drop-shadow">
                      {pos.poi.rating.toFixed(1)}
                    </span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-600/30">
                  <p className="text-[10px] text-slate-400 font-medium">
                    📍 Top Attraction in Linz
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </>
    );
  };

  if (!savedToken) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-background">
        <div className="w-full max-w-md space-y-4 p-6">
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-bold text-foreground">Welcome to Travel Planner</h2>
            <p className="text-sm text-muted-foreground">
              Enter your Mapbox public token to get started. Get one at{' '}
              <a
                href="https://mapbox.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                mapbox.com
              </a>
            </p>
          </div>
          <form onSubmit={handleTokenSubmit} className="space-y-4">
            <Input
              type="text"
              placeholder="pk.eyJ1..."
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
              className="bg-card border-border"
            />
            <button
              type="submit"
              className="w-full rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Initialize Map
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
            <p className="text-foreground">Loading map...</p>
          </div>
        </div>
      )}
      <div ref={mapContainer} className="w-full h-full" />
      {activePOIs.length > 0 && <POICards />}
    </div>
  );
});

Map.displayName = 'Map';

export default Map;
