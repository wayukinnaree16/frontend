import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Mail, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Layout } from '@/components/layout/Layout';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: 'กรุณากรอกข้อมูลให้ครบถ้วน',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      toast({
        title: 'เข้าสู่ระบบสำเร็จ',
        description: 'ยินดีต้อนรับกลับมา!'
      });
      // Redirect ตาม user_type
      const storedUser = user || JSON.parse(localStorage.getItem('user') || '{}');
      if (storedUser.user_type === 'system_admin') {
        navigate('/admin/dashboard');
      } else if (storedUser.user_type === 'foundation_admin') {
        navigate('/foundation/dashboard');
      } else {
        navigate('/');
      }
    } catch (error) {
      toast({
        title: 'เข้าสู่ระบบไม่สำเร็จ',
        description: 'กรุณาตรวจสอบอีเมลและรหัสผ่าน',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-primary-light via-background to-secondary-light flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-large border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">เข้าสู่ระบบ</CardTitle>
            <CardDescription>
              เข้าสู่ระบบเพื่อเริ่มการบริจาคและสร้างความดีร่วมกัน
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">อีเมล</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">รหัสผ่าน</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-primary hover:text-primary-hover transition-colors"
                >
                  ลืมรหัสผ่าน?
                </Link>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                size="lg" 
                disabled={isLoading}
                variant="hero"
              >
                {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-muted-foreground">
                ยังไม่มีบัญชี?{' '}
                <Link 
                  to="/register" 
                  className="text-primary hover:text-primary-hover transition-colors font-semibold"
                >
                  สมัครสมาชิกเลย
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </Layout>
  );
};

export default Login;