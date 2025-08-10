import React, { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { userService } from '@/services/user.service';
import { publicService } from '@/services/public.service';
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
  const [foundations, setFoundations] = useState<any[]>([]);
  const [foundationsLoading, setFoundationsLoading] = useState(false);
  const [foundationsError, setFoundationsError] = useState<string | null>(null);

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

    // ดึงมูลนิธิที่ได้รับการอนุมัติ
    const fetchFoundations = async () => {
      setFoundationsLoading(true);
      setFoundationsError(null);
      console.log('fetchFoundations called');
      try {
        const res = await publicService.getFoundations({ page: 1, limit: 10 });
        console.log('Foundations API response:', res);
        // รองรับหลายโครงสร้าง
        let foundationList = [];
        if (Array.isArray(res.data?.foundations)) {
          foundationList = res.data.foundations;
        } else if (Array.isArray(res.data?.data)) {
          foundationList = res.data.data;
        } else if (Array.isArray(res.data)) {
          foundationList = res.data;
        }
        setFoundations(foundationList);
        console.log('foundations state after set:', foundationList);
      } catch (e) {
        setFoundationsError('เกิดข้อผิดพลาดในการโหลดรายชื่อมูลนิธิ');
      } finally {
        setFoundationsLoading(false);
      }
    };
    fetchFoundations();
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
    setPwLoading(true);
    try {
      await userService.changePassword(pwForm);
      toast({ title: 'เปลี่ยนรหัสผ่านสำเร็จ' });
      setPwForm({ current_password: '', new_password: '' });
    } catch {
      toast({ title: 'เกิดข้อผิดพลาด', variant: 'destructive' });
    } finally {
      setPwLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error || !user) return <div className="text-center py-8 text-red-500">{error || 'ไม่พบข้อมูล'}</div>;

  console.log('Before main return: user:', user, 'foundations:', foundations);
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
        <div className="border-t pt-6 mt-8">
          <h2 className="text-xl font-semibold mb-4">มูลนิธิที่ได้รับการอนุมัติ</h2>
          {foundationsLoading ? (
            <div>กำลังโหลด...</div>
          ) : foundationsError ? (
            <div className="text-red-500">{foundationsError}</div>
          ) : (
            <div className="grid gap-4">
              {foundations.length === 0 ? (
                <div>
                  ไม่พบมูลนิธิที่ได้รับการอนุมัติ<br/>
                  <pre style={{fontSize:12, color:'#888', background:'#f5f5f5', padding:8, borderRadius:4}}>
                    {JSON.stringify(foundations, null, 2)}
                  </pre>
                </div>
              ) : (
                foundations.map((f) => (
                  <div key={f.foundation_id} className="flex items-center gap-3 p-2 border rounded">
                    {f.logo_url && <img src={f.logo_url} alt={f.foundation_name} className="w-10 h-10 object-cover rounded-full" />}
                    <span className="font-medium">{f.foundation_name}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold mb-4">เปลี่ยนรหัสผ่าน</h2>
          <form onSubmit={handlePwSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">รหัสผ่านปัจจุบัน</label>
              <Input name="current_password" type="password" value={pwForm.current_password} onChange={handlePwChange} required />
            </div>
            <div>
              <label className="block mb-1 font-medium">รหัสผ่านใหม่</label>
              <Input name="new_password" type="password" value={pwForm.new_password} onChange={handlePwChange} required />
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