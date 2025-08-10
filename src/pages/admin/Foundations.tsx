import React, { useEffect, useState } from 'react';
import { adminService } from '@/services/admin.service';
import { publicService } from '@/services/public.service';
import { SidebarProvider, Sidebar } from '@/components/ui/sidebar';
import { Link } from 'react-router-dom';

const adminMenu = [
  { label: 'Dashboard', to: '/admin/dashboard' },
  { label: 'ผู้ใช้', to: '/admin/users' },
  { label: 'มูลนิธิ', to: '/admin/foundations' },
  { label: 'รีวิว', to: '/admin/reviews' },
  { label: 'เนื้อหา', to: '/admin/content' },
];

const TABS = [
  { key: 'pending', label: 'รอการอนุมัติ' },
  { key: 'all', label: 'มูลนิธิทั้งหมด' },
];

const AdminFoundations = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingFoundations, setPendingFoundations] = useState<any[]>([]);
  const [allFoundations, setAllFoundations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPending = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await adminService.getPendingFoundations();
        setPendingFoundations(res.data?.foundations || []);
      } catch (e) {
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูลมูลนิธิ');
      } finally {
        setLoading(false);
      }
    };
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        // เปลี่ยนจาก publicService.getFoundations เป็น adminService.getAllFoundations
        const res = await adminService.getAllFoundations();
        setAllFoundations(res.data?.foundations || []);
      } catch (e) {
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูลมูลนิธิ');
      } finally {
        setLoading(false);
      }
    };
    if (activeTab === 'pending') fetchPending();
    else fetchAll();
  }, [activeTab]);

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
            <h1 className="text-3xl font-bold mb-4">จัดการมูลนิธิ</h1>
            <div className="flex gap-2 mb-6">
              {TABS.map(tab => (
                <button
                  key={tab.key}
                  className={`px-4 py-2 rounded font-medium border ${activeTab === tab.key ? 'bg-primary text-white border-primary' : 'bg-white text-primary border-primary'} transition`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            {loading ? (
              <div>กำลังโหลดข้อมูล...</div>
            ) : error ? (
              <div className="text-red-500">{error}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-xl shadow-soft">
                  <thead>
                    <tr className="bg-muted">
                      <th className="py-3 px-4 text-left font-semibold">ชื่อมูลนิธิ</th>
                      <th className="py-3 px-4 text-left font-semibold">อีเมลผู้ดูแล</th>
                      <th className="py-3 px-4 text-left font-semibold">วันที่สมัคร</th>
                      <th className="py-3 px-4 text-left font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeTab === 'pending' ? (
                      pendingFoundations.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="text-center py-8 text-muted-foreground">ยังไม่มีมูลนิธิที่รอการยืนยัน</td>
                        </tr>
                      ) : (
                        pendingFoundations.map((foundation) => {
                          const id = foundation.foundation_id || foundation.id;
                          const email = foundation.user?.email || foundation.contact_email || '-';
                          const createdAt = foundation.created_at ? new Date(foundation.created_at).toLocaleDateString('th-TH') : '-';
                          return (
                            <tr key={id} className="border-b last:border-0">
                              <td className="py-3 px-4">{foundation.foundation_name}</td>
                              <td className="py-3 px-4">{email}</td>
                              <td className="py-3 px-4">{createdAt}</td>
                              <td className="py-3 px-4">
                                <Link to={`/admin/foundation-verification/${id}`} className="px-3 py-1 bg-primary text-white rounded hover:bg-primary-dark transition">ตรวจสอบ</Link>
                              </td>
                            </tr>
                          );
                        })
                      )
                    ) : (
                      allFoundations.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="text-center py-8 text-muted-foreground">ยังไม่มีมูลนิธิในระบบ</td>
                        </tr>
                      ) : (
                        allFoundations.map((foundation) => {
                          const id = foundation.foundation_id || foundation.id;
                          const email = foundation.contact_email || foundation.user?.email || '-';
                          const createdAt = foundation.created_at ? new Date(foundation.created_at).toLocaleDateString('th-TH') : '-';
                          return (
                            <tr key={id} className="border-b last:border-0">
                              <td className="py-3 px-4">{foundation.foundation_name}</td>
                              <td className="py-3 px-4">{email}</td>
                              <td className="py-3 px-4">{createdAt}</td>
                              <td className="py-3 px-4">
                                <Link to={`/admin/foundation-verification/${id}`} className="px-3 py-1 bg-primary text-white rounded hover:bg-primary-dark transition">ดูรายละเอียด</Link>
                              </td>
                            </tr>
                          );
                        })
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminFoundations;