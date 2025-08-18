import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { adminService } from '@/services/admin.service';

const UserDetail: React.FC = () => {
  const { id } = useParams();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserDataAndDocuments = async () => {
      setLoading(true);
      setError(null);
      try {
        const userRes = await adminService.getUserById(id!);
        // Backend returns user data directly in data field, not data.user
        const fetchedUser = userRes.data || null;
        setUser(fetchedUser);


      } catch (e: any) {
        console.error('Error fetching data:', e);
        setError('ไม่พบข้อมูลผู้ใช้ หรือเกิดข้อผิดพลาดในการโหลดข้อมูล');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchUserDataAndDocuments();
  }, [id]);



  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-6">รายละเอียดผู้ใช้</h1>
      {loading ? (
        <div>กำลังโหลด...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : !user ? (
        <div>ไม่พบข้อมูลผู้ใช้</div>
      ) : (
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
        </div>
      )}
    </div>
  );
};

export default UserDetail;