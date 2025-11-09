import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';

interface TherapyBannerProps {
  onComplete: () => void;
}

const TherapyBanner = ({ onComplete }: TherapyBannerProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500); // Wait for fade-out animation
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-background/95 backdrop-blur-sm transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="text-center space-y-6 px-8">
        <div className="flex justify-center">
          <Heart className="w-24 h-24 text-primary animate-pulse" fill="currentColor" />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-foreground">
          Couples like you enjoyed together:
        </h1>
      </div>
    </div>
  );
};

export default TherapyBanner;
