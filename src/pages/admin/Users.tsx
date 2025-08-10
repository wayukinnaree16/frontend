import React, { useEffect, useState } from 'react';
import { adminService } from '@/services/admin.service';
import { Link } from 'react-router-dom';

const AdminUsers = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await adminService.getAllUsers({ page: 1, limit: 100 });
        setUsers(res.data?.users || []);
      } catch (e) {
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleStatusChange = async (userId: number, status: 'active' | 'suspended') => {
    try {
      await adminService.updateUserStatus(userId, { account_status: status });
      setUsers(users => users.map(u => (u.user_id === userId || u.id === userId) ? { ...u, account_status: status } : u));
    } catch {
      alert('เปลี่ยนสถานะไม่สำเร็จ');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">จัดการผู้ใช้</h1>
        {loading ? <div>กำลังโหลด...</div> : error ? <div className="text-red-500">{error}</div> : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-xl shadow-soft">
              <thead>
                <tr className="bg-muted">
                  <th className="py-3 px-4 text-left font-semibold">อีเมล</th>
                  <th className="py-3 px-4 text-left font-semibold">ชื่อ</th>
                  <th className="py-3 px-4 text-left font-semibold">สถานะ</th>
                  <th className="py-3 px-4 text-left font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => {
                  const userId = user.user_id || user.id;
                  return (
                    <tr key={userId} className="border-b last:border-0">
                      <td className="py-3 px-4">{user.email}</td>
                      <td className="py-3 px-4">{user.first_name} {user.last_name}</td>
                      <td className="py-3 px-4">{user.account_status}</td>
                      <td className="py-3 px-4 flex gap-2">
                        <Link to={`/admin/users/${userId}`} className="px-3 py-1 bg-primary text-white rounded hover:bg-primary-dark transition">ดูรายละเอียด</Link>
                        {user.account_status === 'active' ? (
                          <button onClick={() => handleStatusChange(userId, 'suspended')} className="px-3 py-1 bg-red-500 text-white rounded">ระงับ</button>
                        ) : (
                          <button onClick={() => handleStatusChange(userId, 'active')} className="px-3 py-1 bg-green-500 text-white rounded">เปิดใช้งาน</button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;