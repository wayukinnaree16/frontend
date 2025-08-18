import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import AdminSidebar from './AdminSidebar';
import FoundationSidebar from './FoundationSidebar';

const AuthenticatedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <>{children}</>;
  }

  const renderSidebar = () => {
    switch (user.user_type) {
      case 'system_admin':
        return <AdminSidebar />;
      case 'foundation_admin':
        return <FoundationSidebar />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen">
      {renderSidebar()}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default AuthenticatedLayout;
