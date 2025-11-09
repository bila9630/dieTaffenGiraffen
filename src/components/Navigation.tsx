import { Menu, Home, BarChart3, Map, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import SettingsDialog from '@/components/SettingsDialog';
import { useBoxVisibility } from '@/hooks/useBoxVisibility';
import { IntentCategory } from '@/contexts/BoxVisibilityContext';

const Navigation = () => {
  const location = useLocation();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { activeIntents } = useBoxVisibility();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/mytrip', label: 'My trips', icon: Map },
  ];

  const getCategoryColors = (category: IntentCategory) => {
    switch (category) {
      case 'activity':
        return 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20';
      case 'planning':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'discovery':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      case 'safety':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20';
    }
  };

  return (
    <div className="fixed left-6 top-6 z-50">
      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="lg"
              className="h-12 gap-2 rounded-xl border border-glass-border bg-card/70 text-foreground backdrop-blur-xl hover:bg-card/90"
            >
              <Menu className="h-5 w-5" />
              <span className="text-sm font-medium">Navigation</span>
            </Button>
          </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="start" 
          className="w-48 bg-card/95 backdrop-blur-xl border-glass-border"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <DropdownMenuItem key={item.path} asChild>
                <Link
                  to={item.path}
                  className={`flex items-center gap-2 cursor-pointer ${
                    isActive ? 'text-primary font-medium' : 'text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </DropdownMenuItem>
            );
          })}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => setSettingsOpen(true)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Settings className="h-4 w-4" />
            Settings
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Intent Badges */}
      {activeIntents.length > 0 && (
        <div className="flex items-center gap-2 animate-in slide-in-from-left duration-500">
          {activeIntents.map((intent, index) => (
            <div
              key={index}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border backdrop-blur-xl ${getCategoryColors(intent.category)}`}
            >
              <span className="text-xs font-medium">{intent.text}</span>
              <span className="text-[10px] opacity-70">{intent.confidence}%</span>
            </div>
          ))}
        </div>
      )}
      </div>
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
};

export default Navigation;
