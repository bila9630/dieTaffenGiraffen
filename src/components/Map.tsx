import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import type { Destination } from '@/lib/austrianDestinations';

interface MapProps {
  destinations?: Destination[];
  newDestinations?: Destination[];
  triggerFlyover?: boolean;
}

const Map = ({ destinations = [], newDestinations = [], triggerFlyover = false }: MapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
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
        style: 'mapbox://styles/mapbox/outdoors-v12',
        projection: { name: 'globe' },
        zoom: 6.5,
        center: [13.5, 47.5],
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
          color: 'rgb(186, 210, 235)',
          'high-color': 'rgb(135, 206, 250)',
          'horizon-blend': 0.2,
        });

        // Make country borders more visible
        map.current?.setPaintProperty('admin-0-boundary', 'line-color', '#2d3748');
        map.current?.setPaintProperty('admin-0-boundary', 'line-width', 2.5);
        map.current?.setPaintProperty('admin-0-boundary-disputed', 'line-color', '#2d3748');
        map.current?.setPaintProperty('admin-0-boundary-disputed', 'line-width', 2.5);

        // Make canton/state borders more visible
        map.current?.setPaintProperty('admin-1-boundary', 'line-color', '#4a5568');
        map.current?.setPaintProperty('admin-1-boundary', 'line-width', 1.5);

        // Find the first symbol layer to insert mask before labels
        const styleLayers = map.current?.getStyle().layers;
        let firstSymbolId: string | undefined;
        if (styleLayers) {
          for (const layer of styleLayers) {
            if (layer.type === 'symbol') {
              firstSymbolId = layer.id;
              break;
            }
          }
        }

        // Add a layer to mask everything except Austria (before labels)
        map.current?.addLayer({
          id: 'country-mask',
          type: 'fill',
          source: {
            type: 'vector',
            url: 'mapbox://mapbox.country-boundaries-v1'
          },
          'source-layer': 'country_boundaries',
          filter: ['!=', ['get', 'iso_3166_1'], 'AT'],
          paint: {
            'fill-color': '#bdbdbd',
            'fill-opacity': 0.85
          }
        }, firstSymbolId);

        // Hide street/road layers and enhance labels
        styleLayers?.forEach((layer) => {
          if (layer.id.includes('road') || layer.id.includes('street') || layer.id.includes('bridge') || layer.id.includes('tunnel')) {
            map.current?.setLayoutProperty(layer.id, 'visibility', 'none');
          }
          // Make city labels and symbols bigger
          if (layer.id.includes('settlement') || layer.id.includes('place-label')) {
            if (layer.type === 'symbol') {
              map.current?.setLayoutProperty(layer.id, 'text-size', ['interpolate', ['linear'], ['zoom'], 0, 14, 10, 20]);
              map.current?.setLayoutProperty(layer.id, 'icon-size', 1.5);
            }
          }
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

  useEffect(() => {
    if (savedToken) {
      setTimeout(() => {
        initializeMap(savedToken);
      }, 100);
    }

    return () => {
      if (map.current) {
        try {
          map.current.remove();
        } catch (e) {
          console.error('Error removing map:', e);
        }
      }
    };
  }, [savedToken]);

  // Handle destination highlighting
  useEffect(() => {
    if (!map.current) return;

    const mapInstance = map.current;
    
    // Remove layers only if they exist and map is loaded
    const removeExistingLayers = () => {
      if (!mapInstance.isStyleLoaded()) return;
      
      if (mapInstance.getLayer('destination-highlights')) {
        mapInstance.removeLayer('destination-highlights');
      }
      if (mapInstance.getLayer('destination-glow')) {
        mapInstance.removeLayer('destination-glow');
      }
      if (mapInstance.getSource('destinations')) {
        mapInstance.removeSource('destinations');
      }
    };

    if (!destinations.length) {
      removeExistingLayers();
      return;
    }

    // Wait for map to be loaded before adding layers
    if (!mapInstance.isStyleLoaded()) {
      const styleLoadHandler = () => {
        addDestinationLayers();
      };
      mapInstance.once('styledata', styleLoadHandler);
      return () => {
        mapInstance.off('styledata', styleLoadHandler);
      };
    } else {
      addDestinationLayers();
    }

    function addDestinationLayers() {
      if (!mapInstance || !mapInstance.isStyleLoaded()) return;

      // Remove existing layers and source
      if (mapInstance.getLayer('destination-highlights')) {
        mapInstance.removeLayer('destination-highlights');
      }
      if (mapInstance.getLayer('destination-glow')) {
        mapInstance.removeLayer('destination-glow');
      }
      if (mapInstance.getSource('destinations')) {
        mapInstance.removeSource('destinations');
      }

      // Create GeoJSON data for destinations
      const geojsonData = {
        type: 'FeatureCollection' as const,
        features: destinations.map(dest => ({
          type: 'Feature' as const,
          properties: {
            name: dest.name,
          },
          geometry: {
            type: 'Point' as const,
            coordinates: dest.coordinates,
          },
        })),
      };

      // Add source
      mapInstance.addSource('destinations', {
        type: 'geojson',
        data: geojsonData,
      });

      // Add outer glow layer (larger, more transparent)
      mapInstance.addLayer({
        id: 'destination-glow',
        type: 'circle',
        source: 'destinations',
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            5, 25,
            10, 50,
            15, 100
          ],
          'circle-color': '#38bdf8', // Bright sky blue
          'circle-opacity': 0.3,
          'circle-blur': 1,
        },
      });

      // Add main highlight layer (smaller, more intense)
      mapInstance.addLayer({
        id: 'destination-highlights',
        type: 'circle',
        source: 'destinations',
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            5, 15,
            10, 30,
            15, 60
          ],
          'circle-color': '#0ea5e9', // Vibrant bright blue
          'circle-opacity': 0.6,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#7dd3fc', // Light blue stroke
          'circle-stroke-opacity': 0.8,
        },
      });

      // Add click handler to show destination name
      mapInstance.on('click', 'destination-highlights', (e) => {
        if (!e.features?.[0]) return;
        
        const coordinates = (e.features[0].geometry as any).coordinates.slice();
        const name = e.features[0].properties?.name;

        new mapboxgl.Popup({ className: 'destination-popup' })
          .setLngLat(coordinates)
          .setHTML(`<div style="padding: 6px 10px; font-weight: 600; color: #0ea5e9; font-size: 16px; background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(8px); border-radius: 6px;">${name}</div>`)
          .addTo(mapInstance);
      });

      // Change cursor on hover
      mapInstance.on('mouseenter', 'destination-highlights', () => {
        mapInstance.getCanvas().style.cursor = 'pointer';
      });

      mapInstance.on('mouseleave', 'destination-highlights', () => {
        mapInstance.getCanvas().style.cursor = '';
      });
    }

    // Fit map to show all highlights if there are any
    if (destinations.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      destinations.forEach(dest => bounds.extend(dest.coordinates));
      
      mapInstance.fitBounds(bounds, {
        padding: { top: 100, bottom: 100, left: 100, right: 100 },
        maxZoom: 10,
        duration: 1000
      });
    }
  }, [destinations]);

  // Cinematic flyover animation for NEW destinations only
  useEffect(() => {
    if (!map.current || !triggerFlyover || newDestinations.length === 0) return;

    let currentIndex = 0;
    const flyoverInterval = setInterval(() => {
      if (currentIndex >= newDestinations.length) {
        clearInterval(flyoverInterval);
        // After flyover, show all destinations (including old and new)
        if (map.current && destinations.length > 1) {
          const bounds = new mapboxgl.LngLatBounds();
          destinations.forEach(dest => bounds.extend(dest.coordinates));
          
          map.current.fitBounds(bounds, {
            padding: { top: 120, bottom: 120, left: 120, right: 120 },
            maxZoom: 9,
            duration: 2500,
            pitch: 45
          });
        }
        return;
      }

      const destination = newDestinations[currentIndex];
      
      // Cinematic drone-like movement
      map.current?.flyTo({
        center: destination.coordinates,
        zoom: 12 + Math.random() * 1.5,
        pitch: 50 + Math.random() * 15,
        bearing: Math.random() * 60 - 30,
        duration: 3500,
        essential: true,
        curve: 1.2,
      });

      // Show popup during flyover
      setTimeout(() => {
        if (map.current) {
          new mapboxgl.Popup({ closeButton: false, className: 'destination-popup' })
            .setLngLat(destination.coordinates)
            .setHTML(`<div style="padding: 6px 10px; font-weight: 600; color: #0ea5e9; font-size: 16px; background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(8px); border-radius: 6px;">${destination.name}</div>`)
            .addTo(map.current)
            .on('close', () => {});
        }
      }, 1500);
      
      currentIndex++;
    }, 4000);

    return () => clearInterval(flyoverInterval);
  }, [triggerFlyover, newDestinations, destinations]);

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
};

export default Map;
