import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Heart, User, Menu, Bell } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown';

export const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Foundation Admin Navbar (no menu)
  if (user && user.user_type === 'foundation_admin') {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/foundation/dashboard" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <img src="/favicon.ico" alt="Logo" className="h-8 w-8" />
            <span className="text-xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              Giving Heart Thailand
            </span>
          </Link>

          {/* User Actions */}
          <div className="flex items-center space-x-3">
            <NotificationDropdown />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span className="hidden md:inline">{user.first_name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link to="/foundation/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    โปรไฟล์มูลนิธิ
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/foundation/dashboard" className="flex items-center">
                    <Heart className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/notifications" className="flex items-center">
                    <Bell className="mr-2 h-4 w-4" />
                    การแจ้งเตือน
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  ออกจากระบบ
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {/* Mobile Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link to="/foundations" className="flex items-center">
                    <Heart className="mr-2 h-4 w-4" />
                    มูลนิธิ
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/wishlist" className="flex items-center">
                    <Heart className="mr-2 h-4 w-4" />
                    สิ่งของที่ต้องการ
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
    );
  }

  // Donor/Public Navbar (no menu)
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
          <img src="/favicon.ico" alt="Logo" className="h-8 w-8" />
          <span className="text-xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            Giving Heart Thailand
          </span>
        </Link>

        {/* Navigation Menu */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link 
            to="/foundations" 
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            มูลนิธิ
          </Link>
          <Link 
            to="/wishlist" 
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            สิ่งของที่ต้องการ
          </Link>
        </nav>

        {/* User Actions */}
        <div className="flex items-center space-x-3">
          {user && <NotificationDropdown />}
          {user ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span className="hidden md:inline">{user.first_name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      โปรไฟล์ของฉัน
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/my-pledges" className="flex items-center">
                      <Heart className="mr-2 h-4 w-4" />
                      การบริจาคของฉัน
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/favorites" className="flex items-center">
                      <Heart className="mr-2 h-4 w-4 fill-current" />
                      มูลนิธิที่ชื่นชอบ
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/notifications" className="flex items-center">
                      <Bell className="mr-2 h-4 w-4" />
                      การแจ้งเตือน
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    ออกจากระบบ
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link to="/login">เข้าสู่ระบบ</Link>
              </Button>
              <Button variant="hero" asChild>
                <Link to="/register">สมัครสมาชิก</Link>
              </Button>
            </div>
          )}
          {/* Mobile Menu */}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};