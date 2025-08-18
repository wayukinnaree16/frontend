import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Home, List, FileText, LogOut, Heart } from 'lucide-react';

const foundationMenu = [
  { to: '/foundation/dashboard', icon: Home },
  { to: '/foundation/wishlist', icon: List },
  { to: '/foundation/pledges', icon: Heart },
  { to: '/foundation/documents', icon: FileText },
];

const FoundationSidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 flex-shrink-0 bg-card text-card-foreground border-r">
      <div className="flex flex-col h-full">
        <div className="p-4 border-b">
          <Link to="/foundation/dashboard" className="flex items-center gap-2">
            <Heart className="text-primary" />
            <h1 className="text-xl font-bold">Giving Heart</h1>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {foundationMenu.map((item) => {
            const isActive = location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <item.icon className="w-5 h-5" />
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span>ออกจากระบบ</span>
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default FoundationSidebar;
