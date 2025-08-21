import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, User, LoginRequest, RegisterRequest } from '@/services/auth.service';
import { toast } from '@/hooks/use-toast';
import { socketService } from '@/services/socket.service';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  user_type: 'donor' | 'foundation_admin';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = authService.getCurrentUser();
    const token = authService.getToken();
    
    if (savedUser && token) {
      setUser(savedUser);
      // Initialize Socket.IO connection for authenticated user
      if (savedUser.user_id) {
        socketService.connect(savedUser.user_id);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.login({ email, password });
      if (response.data?.user) {
        setUser(response.data.user);
        // Initialize Socket.IO connection
        if (response.data.user.user_id) {
          socketService.connect(response.data.user.user_id);
        }
        toast({
          title: 'เข้าสู่ระบบสำเร็จ',
          description: 'ยินดีต้อนรับกลับมา!'
        });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'เข้าสู่ระบบไม่สำเร็จ';
      toast({
        title: 'เข้าสู่ระบบไม่สำเร็จ',
        description: errorMessage,
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setIsLoading(true);
    try {
      const registerData: RegisterRequest = {
        ...userData,
        user_type: userData.user_type
      };
      
      const response = await authService.register(registerData);
      
      if (response.success) {
        // Auto login after successful registration
        await login(userData.email, userData.password);
        toast({
          title: 'สมัครสมาชิกสำเร็จ',
          description: 'ยินดีต้อนรับสู่ Giving Heart Thailand!'
        });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'สมัครสมาชิกไม่สำเร็จ';
      toast({
        title: 'สมัครสมาชิกไม่สำเร็จ',
        description: errorMessage,
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      // Disconnect Socket.IO
      socketService.disconnect();
      setUser(null);
      toast({
        title: 'ออกจากระบบสำเร็จ',
        description: 'ขอบคุณที่ใช้บริการ'
      });
    } catch (error) {
      // Even if API call fails, clear local state
      socketService.disconnect();
      setUser(null);
      console.error('Logout error:', error);
    }
  };

  const isAuthenticated = !!user && !!authService.getToken();

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      isLoading, 
      isAuthenticated 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};