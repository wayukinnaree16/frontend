import React, { useEffect, useState } from 'react';
import { adminService } from '@/services/admin.service';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [userCount, setUserCount] = useState<number>(0);
  const [pendingFoundations, setPendingFoundations] = useState<number>(0);
  const [totalPledges, setTotalPledges] = useState<number>(0);
  const [totalAmountDonated, setTotalAmountDonated] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [donationStatsError, setDonationStatsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setDonationStatsError(null);
      try {
        // Users
        const usersRes = await adminService.getAllUsers({ page: 1 });
        setUserCount(usersRes.data?.pagination?.total || usersRes.data?.users?.length || 0);
        // Pending Foundations
        const foundationsRes = await adminService.getAllFoundations({ page: 1 });
        setPendingFoundations(foundationsRes.data?.pagination?.total || foundationsRes.data?.foundations?.length || 0);
        // Donation Statistics (Attempt to fetch, but handle errors gracefully)
        try {
          const donationStatsRes = await adminService.getDonationStatistics();
          // If successful, update states. Otherwise, they remain 0.
          setTotalPledges(donationStatsRes.data?.totalPledges || 0);
          setTotalAmountDonated(donationStatsRes.data?.totalAmountDonated || 0);
        } catch (e: any) {
          console.error("Error fetching donation statistics:", e);
          setDonationStatsError(e.response?.data?.message || 'ไม่สามารถโหลดข้อมูลสถิติการบริจาคได้ (โปรดตรวจสอบฐานข้อมูล)');
        }
      } catch (e: any) {
        console.error("Error fetching admin dashboard data:", e);
        setError(e.response?.data?.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <>
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
            <div className="text-lg font-medium mb-2">มูลนิธิทั้งหมด</div>
            <Link to="/admin/foundations" className="mt-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition">จัดการมูลนิธิ</Link>
          </div>
          {/* Donation Statistics Section - Display error if present */}
          <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center col-span-full">
            {donationStatsError ? (
              <div className="text-red-500 text-center">{donationStatsError}</div>
            ) : (
              <>
                <div className="text-2xl font-bold text-primary mb-2">{totalPledges}</div>
                <div className="text-lg font-medium mb-2">จำนวนการบริจาคทั้งหมด</div>
                <Link to="/admin/donated-items" className="mt-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition">ดูรายละเอียด</Link>
                <div className="text-2xl font-bold text-primary mb-2 mt-4">{totalAmountDonated}</div>
                <div className="text-lg font-medium mb-2">ยอดบริจาคทั้งหมด</div>
                <Link to="/admin/donated-items" className="mt-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition">ดูรายละเอียด</Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AdminDashboard;
