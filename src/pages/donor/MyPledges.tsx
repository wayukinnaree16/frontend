import React, { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { donorService } from '@/services/donor.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

const MyPledges = () => {
  const [pledges, setPledges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trackingEdit, setTrackingEdit] = useState<{ id: number; courier_company_name: string; tracking_number: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPledges = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await donorService.getMyPledges();
        setPledges(res.data?.pledges || []);
      } catch (e) {
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
      } finally {
        setLoading(false);
      }
    };
    fetchPledges();
  }, []);

  const handleCancel = async (id: number) => {
    setSubmitting(true);
    try {
      await donorService.cancelPledge(id);
      toast({ title: 'ยกเลิกการบริจาคแล้ว' });
      setPledges(pledges => pledges.map(p => p.id === id ? { ...p, status: 'cancelled' } : p));
    } catch {
      toast({ title: 'เกิดข้อผิดพลาด', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleTrackingUpdate = async (id: number) => {
    setSubmitting(true);
    try {
      await donorService.updateTracking(id, {
        courier_company_name: trackingEdit?.courier_company_name || '',
        tracking_number: trackingEdit?.tracking_number || '',
      });
      toast({ title: 'อัปเดตเลขพัสดุสำเร็จ' });
      setTrackingEdit(null);
    } catch {
      toast({ title: 'เกิดข้อผิดพลาด', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">การบริจาคของฉัน</h1>
        {pledges.length === 0 ? (
          <div className="text-center py-8">ยังไม่มีรายการบริจาค</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded shadow-soft">
              <thead>
                <tr>
                  <th className="p-2">สิ่งของ</th>
                  <th className="p-2">มูลนิธิ</th>
                  <th className="p-2">จำนวน</th>
                  <th className="p-2">สถานะ</th>
                  <th className="p-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {pledges.map((p, idx) => (
                  <tr key={p.id ? `pledge-${p.id}` : `pledge-row-${idx}`} className="border-t">
                    <td className="p-2">{p.wishlist_item?.title}</td>
                    <td className="p-2">{p.foundation?.foundation_name}</td>
                    <td className="p-2">{p.quantity_pledged}</td>
                    <td className="p-2">{p.status}</td>
                    <td className="p-2 space-x-2">
                      {p.status === 'pending_approval' && (
                        <Button size="sm" variant="destructive" disabled={submitting} onClick={() => handleCancel(p.id)}>
                          ยกเลิก
                        </Button>
                      )}
                      {p.status === 'approved' && p.delivery_method === 'courier_service' && (
                        trackingEdit && trackingEdit.id === p.id ? (
                          <span className="flex gap-2 items-center">
                            <Input
                              size={8}
                              placeholder="บริษัทขนส่ง"
                              value={trackingEdit.courier_company_name}
                              onChange={e => setTrackingEdit(te => te ? { ...te, courier_company_name: e.target.value } : te)}
                            />
                            <Input
                              size={8}
                              placeholder="เลขพัสดุ"
                              value={trackingEdit.tracking_number}
                              onChange={e => setTrackingEdit(te => te ? { ...te, tracking_number: e.target.value } : te)}
                            />
                            <Button size="sm" onClick={() => handleTrackingUpdate(p.id)} disabled={submitting}>
                              บันทึก
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setTrackingEdit(null)}>
                              ยกเลิก
                            </Button>
                          </span>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => setTrackingEdit({ id: p.id, courier_company_name: p.courier_company_name || '', tracking_number: p.tracking_number || '' })}>
                            อัปเดตเลขพัสดุ
                          </Button>
                        )
                      )}
                      {p.status === 'received' && (
                        <Button size="sm" variant="secondary" onClick={() => navigate(`/write-review?pledge_id=${p.id}`)}>
                          เขียนรีวิว
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default MyPledges;