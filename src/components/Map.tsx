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
  const [mapboxToken, setMapboxToken] = useState('');
  const [savedToken, setSavedToken] = useState<string>(() => {
    return import.meta.env.VITE_MAPBOX_KEY || localStorage.getItem('mapbox_token') || '';
  });
  const [isLoading, setIsLoading] = useState(false);

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

      // Add new markers
      poiMarkers.forEach(poi => {
        // Generate star rating HTML
        const renderStars = (rating: number) => {
          const fullStars = Math.floor(rating);
          const hasHalfStar = rating % 1 >= 0.5;
          let starsHTML = '';

          for (let i = 0; i < fullStars; i++) {
            starsHTML += '<span style="color: #fbbf24; font-size: 16px;">★</span>';
          }
          if (hasHalfStar) {
            starsHTML += '<span style="color: #fbbf24; font-size: 16px;">⯨</span>';
          }
          const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
          for (let i = 0; i < emptyStars; i++) {
            starsHTML += '<span style="color: #9ca3af; font-size: 16px;">★</span>';
          }
          return starsHTML;
        };

        const marker = new mapboxgl.Marker({ color: '#ef4444' })
          .setLngLat([poi.lon, poi.lat])
          .setPopup(
            new mapboxgl.Popup({
              offset: 25,
              maxWidth: '300px',
              className: 'custom-popup'
            })
              .setHTML(`
                <div style="
                  min-width: 250px;
                  border-radius: 12px;
                  overflow: hidden;
                  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
                  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                ">
                  ${poi.image_url ? `
                    <div style="
                      width: 100%;
                      height: 160px;
                      overflow: hidden;
                      background: linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.4));
                    ">
                      <img
                        src="${poi.image_url}"
                        alt="${poi.name}"
                        style="
                          width: 100%;
                          height: 100%;
                          object-fit: cover;
                          display: block;
                        "
                        onerror="this.parentElement.style.display='none'"
                      />
                    </div>
                  ` : ''}
                  <div style="padding: 16px;">
                    <h3 style="
                      font-size: 18px;
                      font-weight: 700;
                      margin: 0 0 8px 0;
                      color: #f1f5f9;
                      line-height: 1.3;
                      text-shadow: 0 2px 4px rgba(0,0,0,0.2);
                    ">${poi.name}</h3>
                    ${poi.rating ? `
                      <div style="
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        margin-top: 8px;
                      ">
                        <div style="display: flex; gap: 2px;">
                          ${renderStars(poi.rating)}
                        </div>
                        <span style="
                          font-size: 14px;
                          font-weight: 600;
                          color: #fbbf24;
                          text-shadow: 0 1px 2px rgba(0,0,0,0.3);
                        ">${poi.rating.toFixed(1)}</span>
                      </div>
                    ` : ''}
                    <div style="
                      margin-top: 12px;
                      padding-top: 12px;
                      border-top: 1px solid rgba(148, 163, 184, 0.2);
                    ">
                      <p style="
                        font-size: 12px;
                        color: #94a3b8;
                        margin: 0;
                        font-weight: 500;
                      ">📍 Top Attraction in Linz</p>
                    </div>
                  </div>
                </div>
              `)
          )
          .addTo(map.current!);

        markers.current.push(marker);
      });

      // Zoom to show all markers
      if (poiMarkers.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        poiMarkers.forEach(poi => bounds.extend([poi.lon, poi.lat]));
        map.current.fitBounds(bounds, { padding: 100, maxZoom: 12, duration: 2000 });
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
    </div>
  );
});

Map.displayName = 'Map';

export default Map;
