import { Heart, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TherapyBannerProps {
  isVisible: boolean;
  onClose: () => void;
}

const TherapyBanner = ({ isVisible, onClose }: TherapyBannerProps) => {
  if (!isVisible) return null;

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top duration-500">
      <div className="bg-gradient-to-r from-pink-500/90 to-purple-500/90 backdrop-blur-xl border border-pink-300/30 rounded-lg shadow-2xl px-6 py-4 max-w-md">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <Heart className="h-5 w-5 text-white fill-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-base">
                Couple enjoy this together
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 text-white/80 hover:text-white hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TherapyBanner;
