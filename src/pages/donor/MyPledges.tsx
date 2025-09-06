import React, { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { donorService } from '@/services/donor.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Package, Truck, CheckCircle, XCircle, Clock, Edit3, Star, Eye, X } from 'lucide-react';

const MyPledges = () => {
  const [pledges, setPledges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trackingEdit, setTrackingEdit] = useState<{ id: number; courier_company_name: string; tracking_number: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPledge, setSelectedPledge] = useState<any>(null);
  const [pledgeDetailLoading, setPledgeDetailLoading] = useState(false);
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
      setPledges(pledges => pledges.map(p => p.pledge_id === id ? { ...p, status: 'cancelled' } : p));
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

  const handleViewDetails = async (pledgeId: number) => {
    setPledgeDetailLoading(true);
    try {
      const response = await donorService.getPledgeById(pledgeId);
      setSelectedPledge(response.data);
    } catch {
      toast({ title: 'เกิดข้อผิดพลาดในการโหลดรายละเอียด', variant: 'destructive' });
    } finally {
      setPledgeDetailLoading(false);
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
                    <tr key={p.pledge_id ? `pledge-${p.pledge_id}` : `pledge-row-${idx}`} className="hover:bg-gray-50 transition-colors">
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
                          <Button size="sm" variant="outline" onClick={() => handleViewDetails(p.pledge_id)} className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            ดูรายละเอียด
                          </Button>
                          {p.status === 'pending_foundation_approval' && (
                            <Button size="sm" variant="destructive" disabled={submitting} onClick={() => handleCancel(p.pledge_id)} className="flex items-center gap-1">
                              <XCircle className="w-3 h-3" />
                              ยกเลิก
                            </Button>
                          )}
                          {p.status === 'approved_by_foundation' && p.delivery_method === 'courier_service' && (
                            trackingEdit && trackingEdit.id === p.pledge_id ? (
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
                                <Button size="sm" onClick={() => handleTrackingUpdate(p.pledge_id)} disabled={submitting} className="flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" />
                                  บันทึก
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => setTrackingEdit(null)} className="flex items-center gap-1">
                                  <XCircle className="w-3 h-3" />
                                  ยกเลิก
                                </Button>
                              </div>
                            ) : (
                              <Button size="sm" variant="outline" onClick={() => setTrackingEdit({ id: p.pledge_id, courier_company_name: p.courier_company_name || '', tracking_number: p.tracking_number || '' })} className="flex items-center gap-1">
                                <Edit3 className="w-3 h-3" />
                                อัปเดตเลขพัสดุ
                              </Button>
                            )
                          )}
                          {p.status === 'received' && (
                            <Button size="sm" variant="secondary" onClick={() => navigate(`/write-review?pledge_id=${p.pledge_id}`)} className="flex items-center gap-1">
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
      
      {/* Pledge Detail Modal */}
      {selectedPledge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Package className="w-6 h-6 text-blue-600" />
                  รายละเอียดการบริจาค
                </h2>
                <Button variant="ghost" size="sm" onClick={() => setSelectedPledge(null)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              {pledgeDetailLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">กำลังโหลดรายละเอียด...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Item Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 mb-3">ข้อมูลสิ่งของ</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">ชื่อสิ่งของ</p>
                        <p className="font-medium">{selectedPledge.wishlist_item?.item_name || 'ไม่ระบุ'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">หมวดหมู่</p>
                        <p className="font-medium">
                          {selectedPledge.wishlist_item?.category?.name || selectedPledge.wishlist_item?.category || 'ไม่ระบุ'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">จำนวนที่บริจาค</p>
                        <p className="font-medium">{selectedPledge.quantity_pledged} ชิ้น</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">สถานะ</p>
                        {getStatusBadge(selectedPledge.status)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Foundation Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 mb-3">ข้อมูลมูลนิธิ</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">ชื่อมูลนิธิ</p>
                        <p className="font-medium">{selectedPledge.foundation?.foundation_name || 'ไม่ระบุ'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">อีเมล</p>
                        <p className="font-medium">{selectedPledge.foundation?.contact_email || 'ไม่ระบุ'}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Delivery Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 mb-3">ข้อมูลการจัดส่ง</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">วิธีการจัดส่ง</p>
                        <p className="font-medium">
                          {selectedPledge.delivery_method === 'courier_service' && 'บริการขนส่ง'}
                          {selectedPledge.delivery_method === 'self_delivery' && 'จัดส่งเอง'}
                          {selectedPledge.delivery_method === 'foundation_pickup' && 'มูลนิธิมารับ'}
                        </p>
                      </div>
                      {selectedPledge.delivery_method === 'courier_service' && (
                        <>
                          <div>
                            <p className="text-sm text-gray-600">บริษัทขนส่ง</p>
                            <p className="font-medium">{selectedPledge.courier_company_name || 'ไม่ระบุ'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">เลขพัสดุ</p>
                            <p className="font-medium">{selectedPledge.tracking_number || 'ไม่ระบุ'}</p>
                          </div>
                        </>
                      )}
                      {selectedPledge.delivery_method === 'foundation_pickup' && (
                        <>
                          <div>
                            <p className="text-sm text-gray-600">ที่อยู่สำหรับรับ</p>
                            <p className="font-medium">{selectedPledge.pickup_address_details || 'ไม่ระบุ'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">เวลาที่ต้องการ</p>
                            <p className="font-medium">
                              {selectedPledge.pickup_preferred_datetime 
                                ? new Date(selectedPledge.pickup_preferred_datetime).toLocaleString('th-TH')
                                : 'ไม่ระบุ'
                              }
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Description */}
                  {selectedPledge.donor_item_description && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-800 mb-3">รายละเอียดสิ่งของ</h3>
                      <p className="text-gray-700">{selectedPledge.donor_item_description}</p>
                    </div>
                  )}
                  
                  {/* Pledge Item Images */}
                  {selectedPledge.images && selectedPledge.images.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-800 mb-3">รูปภาพสิ่งของที่บริจาค</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {selectedPledge.images.map((image: any, index: number) => (
                          <div key={image.pledge_image_id || index} className="relative group">
                            <img
                              src={image.image_url}
                              alt={`รูปภาพสิ่งของที่บริจาค ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                              onClick={() => window.open(image.image_url, '_blank')}
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                              <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Timestamps */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 mb-3">ประวัติการดำเนินการ</h3>
                    <div className="space-y-2">
                      {selectedPledge.pledged_at && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">วันที่บริจาค:</span>
                          <span className="font-medium">{new Date(selectedPledge.pledged_at).toLocaleString('th-TH')}</span>
                        </div>
                      )}
                      {selectedPledge.approved_at && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">วันที่อนุมัติ:</span>
                          <span className="font-medium">{new Date(selectedPledge.approved_at).toLocaleString('th-TH')}</span>
                        </div>
                      )}
                      {selectedPledge.received_at && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">วันที่ได้รับ:</span>
                          <span className="font-medium">{new Date(selectedPledge.received_at).toLocaleString('th-TH')}</span>
                        </div>
                      )}
                      {selectedPledge.cancelled_at && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">วันที่ยกเลิก:</span>
                          <span className="font-medium">{new Date(selectedPledge.cancelled_at).toLocaleString('th-TH')}</span>
                        </div>
                      )}
                      {selectedPledge.rejected_at && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">วันที่ปฏิเสธ:</span>
                          <span className="font-medium">{new Date(selectedPledge.rejected_at).toLocaleString('th-TH')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default MyPledges;