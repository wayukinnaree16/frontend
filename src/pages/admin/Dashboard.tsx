import React, { useEffect, useState } from 'react';
import { adminService } from '@/services/admin.service';
import { Link } from 'react-router-dom';
import { SidebarProvider, Sidebar } from '@/components/ui/sidebar';

const adminMenu = [
  { label: 'Dashboard', to: '/admin/dashboard' },
  { label: 'ผู้ใช้', to: '/admin/users' },
  { label: 'มูลนิธิ', to: '/admin/foundations' },
  { label: 'รีวิว', to: '/admin/reviews' },
  { label: 'เนื้อหา', to: '/admin/content' },
];

const AdminDashboard = () => {
  const [userCount, setUserCount] = useState<number>(0);
  const [pendingFoundations, setPendingFoundations] = useState<number>(0);
  const [pendingReviews, setPendingReviews] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Users
        const usersRes = await adminService.getAllUsers({ page: 1, limit: 1 });
        setUserCount(usersRes.data?.pagination?.total || usersRes.data?.users?.length || 0);
        // Pending Foundations
        const foundationsRes = await adminService.getPendingFoundations();
        setPendingFoundations(foundationsRes.data?.foundations?.length || 0);
        // Pending Reviews
        const reviewsRes = await adminService.getPendingReviews();
        setPendingReviews(reviewsRes.data?.reviews?.length || 0);
      } catch (e) {
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background flex">
        <Sidebar className="border-r bg-white">
          <nav className="flex flex-col gap-2 p-4">
            {adminMenu.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="px-4 py-2 rounded hover:bg-primary/10 text-base font-medium"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </Sidebar>
        <div className="flex-1">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
            {loading ? (
              <div>กำลังโหลดข้อมูล...</div>
            ) : error ? (
              <div className="text-red-500">{error}</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center">
                  <div className="text-2xl font-bold text-primary mb-2">{userCount}</div>
                  <div className="text-lg font-medium mb-2">ผู้ใช้ทั้งหมด</div>
                  <Link to="/admin/users" className="mt-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition">จัดการผู้ใช้</Link>
                </div>
                <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center">
                  <div className="text-2xl font-bold text-primary mb-2">{pendingFoundations}</div>
                  <div className="text-lg font-medium mb-2">มูลนิธิที่รอการยืนยัน</div>
                  <Link to="/admin/foundations" className="mt-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition">จัดการมูลนิธิ</Link>
                </div>
                <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center">
                  <div className="text-2xl font-bold text-primary mb-2">{pendingReviews}</div>
                  <div className="text-lg font-medium mb-2">รีวิวที่รออนุมัติ</div>
                  <Link to="/admin/reviews" className="mt-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition">จัดการรีวิว</Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;