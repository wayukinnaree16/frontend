import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Heart, Mail, Lock, User, Phone } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Layout } from '@/components/layout/Layout';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    user_type: 'donor' as 'donor' | 'foundation_admin'
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!acceptTerms) {
      toast({
        title: 'กรุณายอมรับข้อตกลงและเงื่อนไข',
        variant: 'destructive'
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'รหัสผ่านไม่ตรงกัน',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      await register({
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone_number: formData.phone_number,
        user_type: formData.user_type
      });
      
      toast({
        title: 'สมัครสมาชิกสำเร็จ',
        description: 'ยินดีต้อนรับสู่ Giving Heart Thailand!'
      });
      navigate('/');
    } catch (error) {
      toast({
        title: 'สมัครสมาชิกไม่สำเร็จ',
        description: 'กรุณาลองใหม่อีกครั้ง',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-primary-light via-background to-secondary-light flex items-center justify-center p-4">
        <div className="w-full max-w-lg">

        <Card className="shadow-large border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">สมัครสมาชิก</CardTitle>
            <CardDescription>
              ร่วมเป็นส่วนหนึ่งในการสร้างสังคมแห่งการแบ่งปัน
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">ชื่อ</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="first_name"
                      placeholder="ชื่อ"
                      value={formData.first_name}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">นามสกุล</Label>
                  <Input
                    id="last_name"
                    placeholder="นามสกุล"
                    value={formData.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">อีเมล</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone_number">เบอร์โทรศัพท์</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="phone_number"
                    placeholder="08x-xxx-xxxx"
                    value={formData.phone_number}
                    onChange={(e) => handleInputChange('phone_number', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>ประเภทผู้ใช้</Label>
                <Select 
                  value={formData.user_type} 
                  onValueChange={(value) => handleInputChange('user_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกประเภทผู้ใช้" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="donor">ผู้บริจาค</SelectItem>
                    <SelectItem value="foundation_admin">ผู้ดูแลมูลนิธิ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">รหัสผ่าน</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">ยืนยันรหัสผ่าน</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="terms" 
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                />
                <Label htmlFor="terms" className="text-sm">
                  ฉันยอมรับ{' '}
                  <Link to="/terms" className="text-primary hover:text-primary-hover transition-colors">
                    ข้อตกลงและเงื่อนไข
                  </Link>
                </Label>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                size="lg" 
                disabled={isLoading}
                variant="hero"
              >
                {isLoading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-muted-foreground">
                มีบัญชีอยู่แล้ว?{' '}
                <Link 
                  to="/login" 
                  className="text-primary hover:text-primary-hover transition-colors font-semibold"
                >
                  เข้าสู่ระบบที่นี่
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

export default Register;