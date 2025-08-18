import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Home, Users, Building, List, Gift, LogOut, Heart } from 'lucide-react';

const adminMenu = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: Home },
  { label: 'ผู้ใช้', to: '/admin/users', icon: Users },
  { label: 'มูลนิธิ', to: '/admin/foundations', icon: Building },
  { label: 'ประเภทมูลนิธิ', to: '/admin/foundation-types', icon: List },
  { label: 'หมวดหมู่สิ่งของ', to: '/admin/item-categories', icon: List },
  { label: 'ตรวจสอบสิ่งของที่บริจาค', to: '/admin/donations', icon: Gift },
];

const AdminSidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 flex-shrink-0 bg-white text-black border-r">
      <div className="flex flex-col h-full">
        <div className="p-4 border-b">
          <Link to="/admin/dashboard" className="flex items-center gap-2">
            <Heart className="text-primary" />
            <h1 className="text-xl font-bold">Giving Heart</h1>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {adminMenu.map((item) => {
            const isActive = location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-black'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start text-gray-500 hover:text-black"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span>ออกจากระบบ</span>
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
