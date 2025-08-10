import React, { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { FoundationSideMenu } from './FoundationSideMenu';
import foundationService from '@/services/foundation.service';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const FoundationDashboard = () => {
  const [pendingPledges, setPendingPledges] = useState(0);
  const [activeWishlist, setActiveWishlist] = useState(0);
  const [donorCount, setDonorCount] = useState(0);
  const [profile, setProfile] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Profile
        const profileRes = await foundationService.getMyProfile();
        setProfile(profileRes.data);
        // Documents
        const docRes = await foundationService.getMyDocuments();
        setDocuments(Array.isArray(docRes.data) ? docRes.data : []);
        // Wishlist
        const wishlistRes = await foundationService.getMyWishlistItems();
        const wishlist = (wishlistRes.data as any)?.wishlistItems || [];
        setActiveWishlist(wishlist.filter((w: any) => w.status === 'open_for_donation').length);
        // Pledges
        const pledgesRes = await foundationService.getReceivedPledges();
        const pledges = pledgesRes.data?.pledges || [];
        setPendingPledges(pledges.filter((p: any) => p.status === 'pending_approval').length);
        // Donor count (unique donor ids)
        const donorIds = new Set(pledges.map((p: any) => p.donor_id));
        setDonorCount(donorIds.size);
        // Alert logic
        const foundation = profileRes.data as any;
        if (!foundation?.foundation_name || !foundation?.contact_phone) {
          setAlert('โปรไฟล์ของคุณยังไม่สมบูรณ์ กรุณาอัปเดตข้อมูล');
        } else if (Array.isArray(docRes.data) && docRes.data.some((d: any) => d.verification_status_by_admin === 'pending_review')) {
          setAlert('เอกสารของคุณรอการตรวจสอบ');
        } else if (Array.isArray(docRes.data) && docRes.data.some((d: any) => d.expiry_date && new Date(d.expiry_date) < new Date())) {
          setAlert('เอกสารของคุณหมดอายุ กรุณาอัปโหลดใหม่');
        } else {
          setAlert(null);
        }
      } catch (e: any) {
        toast({ title: 'เกิดข้อผิดพลาด', description: e?.message || 'ไม่สามารถโหลดข้อมูล Dashboard ได้' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex flex-1">
        <FoundationSideMenu />
        <main className="flex-1 container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-4">Dashboard มูลนิธิ</h1>
          {alert && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded">
              {alert}
            </div>
          )}
          {loading ? (
            <div>กำลังโหลด...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center">
                <div className="text-2xl font-bold text-primary mb-2">{pendingPledges}</div>
                <div className="text-lg font-medium mb-2">คำขอบริจาคที่รออนุมัติ</div>
                <Button variant="secondary" onClick={() => navigate('/foundation/pledges')}>ไปจัดการการบริจาค</Button>
              </div>
              <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center">
                <div className="text-2xl font-bold text-primary mb-2">{activeWishlist}</div>
                <div className="text-lg font-medium mb-2">รายการที่ต้องการ (Active)</div>
                <Button variant="secondary" onClick={() => navigate('/foundation/wishlist')}>ไปจัดการ Wishlist</Button>
              </div>
              <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center">
                <div className="text-2xl font-bold text-primary mb-2">{donorCount}</div>
                <div className="text-lg font-medium mb-2">ผู้บริจาคทั้งหมด</div>
                <Button variant="secondary" onClick={() => navigate('/foundation/pledges')}>ดูผู้บริจาค</Button>
              </div>
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default FoundationDashboard;