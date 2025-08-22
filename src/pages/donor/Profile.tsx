import React, { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { userService } from '@/services/user.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const Profile = () => {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ first_name: '', last_name: '', phone_number: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '' });
  const [pwLoading, setPwLoading] = useState(false);


  console.log('--- Profile component rendered ---');
  // ถ้า user login แล้วแต่ไม่ใช่ donor
  if (authUser) {
    console.log('authUser:', authUser);
    console.log('authUser.user_type:', authUser.user_type);
  }
  if (authUser && authUser.user_type !== 'donor') {
    console.log('Not donor, returning early');
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-xl">
          <div className="text-center py-8 text-red-500">
            เฉพาะผู้บริจาคเท่านั้นที่เข้าถึงหน้านี้
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  useEffect(() => {
    console.log('useEffect for fetchUser and fetchFoundations called');
    const fetchUser = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await userService.getMyProfile();
        setUser(res.data);
        setEditForm({
          first_name: res.data.first_name || '',
          last_name: res.data.last_name || '',
          phone_number: res.data.phone_number || '',
        });
        console.log('userService.getMyProfile() result:', res.data);
      } catch (e) {
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();


  }, []);

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      await userService.updateProfile(editForm);
      toast({ title: 'บันทึกโปรไฟล์สำเร็จ' });
    } catch {
      toast({ title: 'เกิดข้อผิดพลาด', variant: 'destructive' });
    } finally {
      setEditLoading(false);
    }
  };

  const handlePwChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPwForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handlePwSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // ตรวจสอบความถูกต้องของรหัสผ่านใหม่
    if (pwForm.new_password.length < 8) {
      toast({ 
        title: 'รหัสผ่านไม่ถูกต้อง', 
        description: 'รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร',
        variant: 'destructive' 
      });
      return;
    }
    
    if (pwForm.current_password === pwForm.new_password) {
      toast({ 
        title: 'รหัสผ่านไม่ถูกต้อง', 
        description: 'รหัสผ่านใหม่ต้องแตกต่างจากรหัสผ่านปัจจุบัน',
        variant: 'destructive' 
      });
      return;
    }
    
    setPwLoading(true);
    try {
      await userService.changePassword(pwForm);
      toast({ title: 'เปลี่ยนรหัสผ่านสำเร็จ' });
      setPwForm({ current_password: '', new_password: '' });
    } catch (error: any) {
      console.error('Password change error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน';
      toast({ 
        title: 'เกิดข้อผิดพลาด', 
        description: errorMessage,
        variant: 'destructive' 
      });
    } finally {
      setPwLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error || !user) return <div className="text-center py-8 text-red-500">{error || 'ไม่พบข้อมูล'}</div>;

  console.log('Before main return: user:', user);
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-xl">
        <h1 className="text-3xl font-bold mb-4">โปรไฟล์ของฉัน</h1>
        <form onSubmit={handleEditSubmit} className="space-y-4 mb-8">
          <div>
            <label className="block mb-1 font-medium">ชื่อ</label>
            <Input name="first_name" value={editForm.first_name} onChange={handleEditChange} required />
          </div>
          <div>
            <label className="block mb-1 font-medium">นามสกุล</label>
            <Input name="last_name" value={editForm.last_name} onChange={handleEditChange} required />
          </div>
          <div>
            <label className="block mb-1 font-medium">เบอร์โทรศัพท์</label>
            <Input name="phone_number" value={editForm.phone_number} onChange={handleEditChange} />
          </div>
          <Button type="submit" className="w-full" disabled={editLoading}>
            {editLoading ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
          </Button>
        </form>
        
        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold mb-4">เปลี่ยนรหัสผ่าน</h2>
          <form onSubmit={handlePwSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">รหัสผ่านปัจจุบัน</label>
              <Input 
                name="current_password" 
                type="password" 
                value={pwForm.current_password} 
                onChange={handlePwChange} 
                placeholder="กรอกรหัสผ่านปัจจุบัน"
                required 
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">รหัสผ่านใหม่</label>
              <Input 
                name="new_password" 
                type="password" 
                value={pwForm.new_password} 
                onChange={handlePwChange} 
                placeholder="รหัสผ่านใหม่ (อย่างน้อย 8 ตัวอักษร)"
                required 
              />
              <p className="text-sm text-gray-500 mt-1">รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร</p>
            </div>
            <Button type="submit" className="w-full" disabled={pwLoading}>
              {pwLoading ? 'กำลังเปลี่ยน...' : 'เปลี่ยนรหัสผ่าน'}
            </Button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;