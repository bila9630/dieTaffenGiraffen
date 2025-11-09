import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import POICards from './POICards';
import HiddenGemCard from './HiddenGemCard';
import HikingCard from './HikingCard';

export interface POIMarker {
  id: number;
  name: string;
  lat: number;
  lon: number;
  rating?: number;
  image_url?: string;
  description?: string;
}

export interface MapRef {
  flyToLocation: (location: string) => Promise<void>;
  displayMarkers: (markers: POIMarker[]) => Promise<void>;
  addMarkers: (markers: POIMarker[]) => Promise<void>;
  displayHiddenGem: (marker: POIMarker) => Promise<void>;
  displayHikingRoute: () => Promise<void>;
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
  const [activePOIs, setActivePOIs] = useState<POIMarker[]>([]);
  const [hiddenGem, setHiddenGem] = useState<POIMarker | null>(null);
  const [showHikingRoute, setShowHikingRoute] = useState(false);

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

        // Add 3D building layer
        const layers = map.current?.getStyle().layers;
        const labelLayerId = layers?.find(
          (layer) => layer.type === 'symbol' && layer.layout && 'text-field' in layer.layout
        )?.id;

        if (!map.current?.getLayer('3d-buildings')) {
          map.current?.addLayer(
            {
              id: '3d-buildings',
              source: 'composite',
              'source-layer': 'building',
              filter: ['==', 'extrude', 'true'],
              type: 'fill-extrusion',
              minzoom: 15,
              paint: {
                'fill-extrusion-color': '#aaa',
                'fill-extrusion-height': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  15,
                  0,
                  15.05,
                  ['get', 'height'],
                ],
                'fill-extrusion-base': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  15,
                  0,
                  15.05,
                  ['get', 'min_height'],
                ],
                'fill-extrusion-opacity': 0.6,
              },
            },
            labelLayerId
          );
        }
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

      // Clear hidden gem, hiking route, and highlight when flying to a new location
      setHiddenGem(null);
      setShowHikingRoute(false);
      if (map.current.getLayer('highlighted-building')) {
        map.current.removeLayer('highlighted-building');
      }
      if (map.current.getSource('highlighted-building')) {
        map.current.removeSource('highlighted-building');
      }

      // Remove hiking route layer if it exists
      if (map.current.getLayer('hiking-route')) {
        map.current.removeLayer('hiking-route');
      }
      if (map.current.getSource('hiking-route')) {
        map.current.removeSource('hiking-route');
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
    displayHiddenGem: async (poi: POIMarker) => {
      if (!map.current) {
        console.error('Map not initialized');
        return;
      }

      // Remove existing markers, POI cards, and hiking route
      markers.current.forEach(marker => marker.remove());
      markers.current = [];
      setActivePOIs([]);
      setShowHikingRoute(false);

      // Remove existing highlight layer if it exists
      if (map.current.getLayer('highlighted-building')) {
        map.current.removeLayer('highlighted-building');
      }
      if (map.current.getSource('highlighted-building')) {
        map.current.removeSource('highlighted-building');
      }

      // Remove hiking route layer if it exists
      if (map.current.getLayer('hiking-route')) {
        map.current.removeLayer('hiking-route');
      }
      if (map.current.getSource('hiking-route')) {
        map.current.removeSource('hiking-route');
      }

      // Zoom in closer to the building with a tilted pitch for better 3D view
      map.current.flyTo({
        center: [poi.lon, poi.lat],
        zoom: 17.5,
        pitch: 60,
        bearing: 0,
        duration: 3000,
        essential: true,
      });

      // Wait for zoom animation to complete before showing the card and highlighting
      const onMoveEnd = () => {
        setHiddenGem(poi);

        // Add highlighted building layer
        if (map.current && map.current.isStyleLoaded()) {
          // Create a small bounding box around the point to find the building
          const point = map.current.project([poi.lon, poi.lat]);
          const radius = 10; // pixels
          const features = map.current.queryRenderedFeatures(
            [[point.x - radius, point.y - radius], [point.x + radius, point.y + radius]],
            { layers: ['3d-buildings'] }
          );

          if (features && features.length > 0) {
            // Get the building feature
            const building = features[0];

            // Add a highlighted version of this building
            map.current.addLayer({
              id: 'highlighted-building',
              type: 'fill-extrusion',
              source: 'composite',
              'source-layer': 'building',
              filter: ['==', ['id'], building.id],
              paint: {
                'fill-extrusion-color': '#eab308', // Yellow/gold color
                'fill-extrusion-height': ['get', 'height'],
                'fill-extrusion-base': ['get', 'min_height'],
                'fill-extrusion-opacity': 0.9,
              },
            });
          }
        }

        map.current?.off('moveend', onMoveEnd);
      };
      map.current.once('moveend', onMoveEnd);
    },
    displayMarkers: async (poiMarkers: POIMarker[]) => {
      if (!map.current) {
        console.error('Map not initialized');
        return;
      }

      // Remove existing markers
      markers.current.forEach(marker => marker.remove());
      markers.current = [];

      // Clear existing cards, hidden gem, and hiking route immediately
      setActivePOIs([]);
      setHiddenGem(null);
      setShowHikingRoute(false);

      // Remove highlight layer if it exists
      if (map.current.getLayer('highlighted-building')) {
        map.current.removeLayer('highlighted-building');
      }
      if (map.current.getSource('highlighted-building')) {
        map.current.removeSource('highlighted-building');
      }

      // Remove hiking route layer if it exists
      if (map.current.getLayer('hiking-route')) {
        map.current.removeLayer('hiking-route');
      }
      if (map.current.getSource('hiking-route')) {
        map.current.removeSource('hiking-route');
      }

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
        map.current.fitBounds(bounds, { padding: 200, maxZoom: 13, duration: 2000, pitch: 0 });

        // Wait for zoom animation to complete before showing cards
        const onMoveEnd = () => {
          setActivePOIs(poiMarkers);
          map.current?.off('moveend', onMoveEnd);
        };
        map.current.once('moveend', onMoveEnd);
      }
    },
    addMarkers: async (poiMarkers: POIMarker[]) => {
      if (!map.current) {
        console.error('Map not initialized');
        return;
      }

      // Don't remove existing markers - just add new ones
      // Add simple pin markers
      poiMarkers.forEach(poi => {
        const marker = new mapboxgl.Marker({ color: '#ef4444' })
          .setLngLat([poi.lon, poi.lat])
          .addTo(map.current!);

        markers.current.push(marker);
      });

      // Update active POIs to include new markers
      setActivePOIs(prev => [...prev, ...poiMarkers]);

      // Zoom to show all markers (including existing ones)
      if (markers.current.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        // Get all POIs including new ones
        const allPOIs = [...activePOIs, ...poiMarkers];
        allPOIs.forEach(poi => bounds.extend([poi.lon, poi.lat]));
        map.current.fitBounds(bounds, { padding: 200, maxZoom: 13, duration: 2000 });
      }
    },
    displayHikingRoute: async () => {
      if (!map.current) {
        console.error('Map not initialized');
        return;
      }

      // Remove existing markers and POI cards
      markers.current.forEach(marker => marker.remove());
      markers.current = [];
      setActivePOIs([]);
      setHiddenGem(null);

      // Remove highlight layer if it exists
      if (map.current.getLayer('highlighted-building')) {
        map.current.removeLayer('highlighted-building');
      }
      if (map.current.getSource('highlighted-building')) {
        map.current.removeSource('highlighted-building');
      }

      // Hardcoded hiking route coordinates near Linz (Pöstlingberg area)
      // This creates an interesting point-to-point hiking route in the countryside
      const routeCoordinates: [number, number][] = [
        [14.2400, 48.3450], // Start point (northwest, outside city)
        [14.2420, 48.3465], // Head north into hills
        [14.2445, 48.3480], // Climb to ridge
        [14.2470, 48.3490], // Ridge viewpoint
        [14.2495, 48.3495], // Continue along ridge
        [14.2520, 48.3490], // Turn east
        [14.2540, 48.3480], // Descend gradually
        [14.2555, 48.3465], // Through forest
        [14.2565, 48.3450], // End point (northeast, outside city)
      ];

      // Remove existing route layer and source if they exist
      if (map.current.getLayer('hiking-route')) {
        map.current.removeLayer('hiking-route');
      }
      if (map.current.getSource('hiking-route')) {
        map.current.removeSource('hiking-route');
      }

      // Add the route as a line source and layer
      map.current.addSource('hiking-route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: routeCoordinates,
          },
        },
      });

      map.current.addLayer({
        id: 'hiking-route',
        type: 'line',
        source: 'hiking-route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#3b82f6', // Blue color for the hiking route
          'line-width': 4,
          'line-opacity': 0.8,
        },
      });

      // Create custom marker elements with backgrounds
      const createMarkerElement = (imageSrc: string, size: number, bgColor: string) => {
        const container = document.createElement('div');
        container.style.width = `${size + 12}px`;
        container.style.height = `${size + 12}px`;
        container.style.backgroundColor = bgColor;
        container.style.borderRadius = '50%';
        container.style.border = '3px solid white';
        container.style.boxShadow = '0 2px 8px rgba(0,0,0,0.5)';
        container.style.display = 'flex';
        container.style.alignItems = 'center';
        container.style.justifyContent = 'center';
        container.style.cursor = 'pointer';

        const img = document.createElement('img');
        img.src = imageSrc;
        img.style.width = `${size}px`;
        img.style.height = `${size}px`;
        img.style.display = 'block';

        container.appendChild(img);
        return container;
      };

      const startEl = createMarkerElement('/start.png', 40, '#22c55e');
      const endEl = createMarkerElement('/the-end.png', 40, '#ef4444');

      // Add markers with custom images
      const startMarker = new mapboxgl.Marker({ element: startEl })
        .setLngLat(routeCoordinates[0])
        .setPopup(new mapboxgl.Popup().setHTML('<strong>Start</strong>'))
        .addTo(map.current);
      markers.current.push(startMarker);

      // Add two waypoint markers along the route
      const waypoint1El = createMarkerElement('/hiking.png', 35, '#3b82f6');

      const waypoint1Marker = new mapboxgl.Marker({ element: waypoint1El })
        .setLngLat(routeCoordinates[3])
        .setPopup(new mapboxgl.Popup().setHTML('<strong>Scenic Viewpoint</strong>'))
        .addTo(map.current);
      markers.current.push(waypoint1Marker);

      const waypoint2El = createMarkerElement('/hiking.png', 35, '#3b82f6');

      const waypoint2Marker = new mapboxgl.Marker({ element: waypoint2El })
        .setLngLat(routeCoordinates[6])
        .setPopup(new mapboxgl.Popup().setHTML('<strong>Rest Stop</strong>'))
        .addTo(map.current);
      markers.current.push(waypoint2Marker);

      const endMarker = new mapboxgl.Marker({ element: endEl })
        .setLngLat(routeCoordinates[routeCoordinates.length - 1])
        .setPopup(new mapboxgl.Popup().setHTML('<strong>End</strong>'))
        .addTo(map.current);
      markers.current.push(endMarker);

      // Fit map to show the entire route
      const bounds = new mapboxgl.LngLatBounds();
      routeCoordinates.forEach(coord => bounds.extend(coord));
      map.current.fitBounds(bounds, { padding: 100, maxZoom: 14, duration: 2500, pitch: 0 });

      // Show the hiking card
      setShowHikingRoute(true);
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
      {activePOIs.length > 0 && <POICards activePOIs={activePOIs} map={map.current} />}
      {hiddenGem && <HiddenGemCard poi={hiddenGem} />}
      {showHikingRoute && (
        <HikingCard
          route={{
            name: 'Pöstlingberg Panorama Trail',
            rating: 4,
            distance: '10.7 km',
            duration: '3h 25min',
            elevationUp: '440 m',
            elevationDown: '440 m',
            description: 'Moderate hike. Good basic fitness required. Easily accessible trails. No special skills required.',
            imageUrl: '/hiking.webp',
          }}
        />
      )}
    </div>
  );
});

Map.displayName = 'Map';

export default Map;
