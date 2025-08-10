import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { adminService } from '@/services/admin.service';

const UserDetail = () => {
  const { id } = useParams();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await adminService.getUserById(id!);
        setUser(res.data || null);
      } catch (e) {
        setError('ไม่พบข้อมูลผู้ใช้');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchUser();
  }, [id]);

  const handleStatusChange = async (status: 'active' | 'suspended') => {
    if (!user) return;
    try {
      await adminService.updateUserStatus(user.user_id, { account_status: status });
      setUser({ ...user, account_status: status });
    } catch {
      alert('เปลี่ยนสถานะไม่สำเร็จ');
    }
  };

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-6">รายละเอียดผู้ใช้</h1>
      {loading ? <div>กำลังโหลด...</div> : error ? <div className="text-red-500">{error}</div> : !user ? <div>ไม่พบข้อมูลผู้ใช้</div> : (
        <div className="bg-white rounded-lg shadow p-6 max-w-xl">
          <div><b>ID:</b> {user.user_id}</div>
          <div><b>อีเมล:</b> {user.email}</div>
          <div><b>ชื่อ:</b> {user.first_name} {user.last_name}</div>
          <div><b>เบอร์โทร:</b> {user.phone_number || '-'}</div>
          <div><b>ประเภทผู้ใช้:</b> {user.user_type}</div>
          <div><b>สถานะ:</b> {user.account_status}</div>
          <div><b>ยืนยันอีเมล:</b> {user.is_email_verified ? 'ใช่' : 'ไม่'}</div>
          <div><b>วันที่สร้าง:</b> {new Date(user.created_at).toLocaleString('th-TH')}</div>
          <div><b>เข้าสู่ระบบล่าสุด:</b> {user.last_login_at ? new Date(user.last_login_at).toLocaleString('th-TH') : 'ไม่เคย'}</div>
          <div className="flex gap-2 mt-4">
            {user.account_status === 'active' ? (
              <button onClick={() => handleStatusChange('suspended')} className="px-4 py-2 bg-red-500 text-white rounded">ระงับ</button>
            ) : (
              <button onClick={() => handleStatusChange('active')} className="px-4 py-2 bg-green-500 text-white rounded">เปิดใช้งาน</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDetail; 