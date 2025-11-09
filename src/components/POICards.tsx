import { useState, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { POIMarker } from './Map';

interface POICardsProps {
  activePOIs: POIMarker[];
  map: mapboxgl.Map | null;
}

const POICards = ({ activePOIs, map }: POICardsProps) => {
  const [cardPositions, setCardPositions] = useState<Array<{ x: number; y: number; poi: POIMarker }>>([]);

  useEffect(() => {
    if (!map || activePOIs.length === 0) return;

    const updatePositions = () => {
      if (!map) return;

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
        const point = map.project([poi.lon, poi.lat]);

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
    map.on('move', updatePositions);
    map.on('zoom', updatePositions);

    // Initial update
    setTimeout(updatePositions, 100);

    return () => {
      map.off('move', updatePositions);
      map.off('zoom', updatePositions);
    };
  }, [activePOIs, map]);

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
        {cardPositions.map((pos) => {
          const markerPoint = map!.project([pos.poi.lon, pos.poi.lat]);
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
                  {pos.poi.description || '📍 Top Attraction in Linz'}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default POICards;
