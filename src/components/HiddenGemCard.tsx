import { POIMarker } from './Map';

interface HiddenGemCardProps {
  poi: POIMarker;
}

const HiddenGemCard = ({ poi }: HiddenGemCardProps) => {
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={`full-${i}`} className="text-yellow-400 text-xl">★</span>);
    }
    if (hasHalfStar) {
      stars.push(
        <span key="half" className="relative inline-block text-xl" style={{ width: '1.25em' }}>
          <span className="absolute text-gray-400">★</span>
          <span className="absolute text-yellow-400" style={{ clipPath: 'inset(0 50% 0 0)' }}>★</span>
        </span>
      );
    }
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="text-gray-400 text-xl">★</span>);
    }
    return stars;
  };

  return (
    <div className="fixed bottom-6 left-6 z-[1001] w-96 pointer-events-auto">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl overflow-hidden shadow-2xl border-2 border-yellow-500/40 hover:border-yellow-500/60 transition-all duration-300">
        {poi.image_url && (
          <div className="w-full h-48 overflow-hidden bg-gradient-to-b from-black/10 to-black/40 relative">
            <div className="absolute top-3 right-3 bg-yellow-500 text-slate-900 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg">
              Hidden Gem
            </div>
            <img
              src={poi.image_url}
              alt={poi.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).parentElement!.style.display = 'none';
              }}
            />
          </div>
        )}
        <div className="p-5">
          <h3 className="text-2xl font-bold text-slate-100 mb-3 leading-tight drop-shadow-lg">
            {poi.name}
          </h3>
          {poi.rating && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-1">
                {renderStars(poi.rating)}
              </div>
              <span className="text-lg font-bold text-yellow-400 drop-shadow">
                {poi.rating.toFixed(1)}
              </span>
            </div>
          )}
          {poi.description && (
            <div className="pt-3 border-t border-slate-600/40">
              <p className="text-sm text-slate-300 leading-relaxed">
                {poi.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HiddenGemCard;
