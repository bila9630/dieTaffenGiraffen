import { useState } from 'react';
import { Menu, X, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Navigation Button */}
      <div className="fixed left-6 top-6 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="lg"
          className="h-12 gap-2 rounded-xl border border-glass-border bg-card/70 text-foreground backdrop-blur-xl hover:bg-card/90"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          <span className="text-sm font-medium">Navigation</span>
        </Button>
      </div>

      {/* Sidebar */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed left-0 top-0 z-50 h-screen w-80 border-r border-border bg-card/95 p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-3 border-b border-border/50 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Travel Planner</h2>
                <p className="text-xs text-muted-foreground">Plan smarter, travel better</p>
              </div>
            </div>

            <nav className="mt-6 space-y-2">
              <button className="w-full rounded-lg bg-primary/10 px-4 py-3 text-left text-sm font-medium text-primary transition-colors hover:bg-primary/20">
                Dashboard
              </button>
              <button className="w-full rounded-lg px-4 py-3 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                My Trips
              </button>
              <button className="w-full rounded-lg px-4 py-3 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                Saved Places
              </button>
              <button className="w-full rounded-lg px-4 py-3 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                Settings
              </button>
            </nav>

            <div className="absolute bottom-6 left-6 right-6 rounded-lg border border-border/50 bg-secondary/50 p-4">
              <p className="text-xs text-muted-foreground">
                More features coming soon! Stay tuned for weather insights, visitor analytics, and smart recommendations.
              </p>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Navigation;
