import { Menu, Home, BarChart3, Map } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/mytrip', label: 'My trips', icon: Map },
  ];

  return (
    <div className="fixed left-6 top-6 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="lg"
            className="h-12 gap-2 rounded-xl border border-glass-border bg-[#d4c4b0]/80 text-foreground backdrop-blur-xl hover:bg-[#d4c4b0]/95"
          >
            <Menu className="h-5 w-5" />
            <span className="text-sm font-medium">Navigation</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="start" 
          className="w-48 bg-[#d4c4b0]/95 backdrop-blur-xl border-glass-border"
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
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default Navigation;
