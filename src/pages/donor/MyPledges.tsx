import React, { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { donorService } from '@/services/donor.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Package, Truck, CheckCircle, XCircle, Clock, Edit3, Star } from 'lucide-react';

const MyPledges = () => {
  const [pledges, setPledges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trackingEdit, setTrackingEdit] = useState<{ id: number; courier_company_name: string; tracking_number: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_foundation_approval':
        return (
          <Badge variant="outline" className="text-blue-600 border-blue-400 bg-blue-50 flex items-center gap-1">
            <Truck className="w-3 h-3" />
            กำลังจัดส่ง
          </Badge>
        );
      case 'approved_by_foundation':
      case 'shipping_in_progress':
        return (
          <Badge variant="outline" className="text-blue-600 border-blue-400 bg-blue-50 flex items-center gap-1">
            <Truck className="w-3 h-3" />
            กำลังจัดส่ง
          </Badge>
        );
      case 'received_by_foundation':
        return (
          <Badge variant="outline" className="text-green-600 border-green-400 bg-green-50 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            จัดส่งสำเร็จ
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="outline" className="text-red-600 border-red-400 bg-red-50 flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            ยกเลิกแล้ว
          </Badge>
        );
      case 'rejected_by_foundation':
        return (
          <Badge variant="outline" className="text-red-600 border-red-400 bg-red-50 flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            ถูกปฏิเสธ
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {status}
          </Badge>
        );
    }
  };

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

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
      <Footer />
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 text-lg">{error}</p>
        </div>
      </div>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <Package className="w-10 h-10 text-blue-600" />
            การบริจาคของฉัน
          </h1>
          <p className="text-gray-600">ติดตามสถานะการบริจาคและจัดการรายการของคุณ</p>
        </div>
        
        {pledges.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">ยังไม่มีรายการบริจาค</h3>
            <p className="text-gray-500">เริ่มต้นการบริจาคเพื่อช่วยเหลือผู้ที่ต้องการความช่วยเหลือ</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">สิ่งของ</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">มูลนิธิ</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">จำนวน</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">สถานะ</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">การดำเนินการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pledges.map((p, idx) => (
                    <tr key={p.id ? `pledge-${p.id}` : `pledge-row-${idx}`} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Package className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{p.wishlist_item?.title}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-900 font-medium">{p.foundation?.foundation_name}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {p.quantity_pledged} ชิ้น
                        </span>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(p.status)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {p.status === 'pending_foundation_approval' && (
                            <Button size="sm" variant="destructive" disabled={submitting} onClick={() => handleCancel(p.id)} className="flex items-center gap-1">
                              <XCircle className="w-3 h-3" />
                              ยกเลิก
                            </Button>
                          )}
                          {p.status === 'approved_by_foundation' && p.delivery_method === 'courier_service' && (
                            trackingEdit && trackingEdit.id === p.id ? (
                              <div className="flex gap-2 items-center flex-wrap">
                                <Input
                                  className="w-32"
                                  placeholder="บริษัทขนส่ง"
                                  value={trackingEdit.courier_company_name}
                                  onChange={e => setTrackingEdit(te => te ? { ...te, courier_company_name: e.target.value } : te)}
                                />
                                <Input
                                  className="w-32"
                                  placeholder="เลขพัสดุ"
                                  value={trackingEdit.tracking_number}
                                  onChange={e => setTrackingEdit(te => te ? { ...te, tracking_number: e.target.value } : te)}
                                />
                                <Button size="sm" onClick={() => handleTrackingUpdate(p.id)} disabled={submitting} className="flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" />
                                  บันทึก
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => setTrackingEdit(null)} className="flex items-center gap-1">
                                  <XCircle className="w-3 h-3" />
                                  ยกเลิก
                                </Button>
                              </div>
                            ) : (
                              <Button size="sm" variant="outline" onClick={() => setTrackingEdit({ id: p.id, courier_company_name: p.courier_company_name || '', tracking_number: p.tracking_number || '' })} className="flex items-center gap-1">
                                <Edit3 className="w-3 h-3" />
                                อัปเดตเลขพัสดุ
                              </Button>
                            )
                          )}
                          {p.status === 'received' && (
                            <Button size="sm" variant="secondary" onClick={() => navigate(`/write-review?pledge_id=${p.id}`)} className="flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              เขียนรีวิว
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default MyPledges;