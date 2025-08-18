import React, { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { FoundationSideMenu } from './FoundationSideMenu';
import { foundationService } from '@/services/foundation.service';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Truck } from 'lucide-react';

const STATUS_TABS = [
  { key: 'shipping_in_progress', label: 'กำลังจัดส่ง' },
  { key: 'received_by_foundation', label: 'จัดส่งเสร็จแล้ว' },
];

const FoundationPledges = () => {
  const [pledges, setPledges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('shipping_in_progress');
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean, pledge: any | null }>({ open: false, pledge: null });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      let statusFilter: string | string[] = activeTab;
      if (activeTab === 'shipping_in_progress') {
        statusFilter = ['pending_foundation_approval', 'approved_by_foundation', 'shipping_in_progress'];
      }
      const res = await foundationService.getReceivedPledges(statusFilter);
      // Map real API response to UI model
      const apiPledges = res.data?.pledges || [];
      const mapped = apiPledges.map((p: any) => ({
        id: p.pledge_id ?? p.id,
        donor: {
          email: p.donor?.email,
          first_name: p.donor?.first_name,
          last_name: p.donor?.last_name,
          profile_image_url: p.donor?.profile_image_url,
        },
        wishlist_item: {
          item_name: p.wishlist_item?.item_name || '-',
          example_image_url: p.wishlist_item?.example_image_url || '',
        },
        quantity_pledged: p.quantity_pledged,
        donor_item_description: p.donor_item_description,
        delivery_method: p.delivery_method,
        courier_company_name: p.courier_company_name,
        tracking_number: p.tracking_number,
        pickup_address_details: p.pickup_address_details,
        pickup_preferred_datetime: p.pickup_preferred_datetime,
        status: p.status, // Keep original backend status for logic
        donor_notes_on_receipt: p.donor_notes_on_receipt,
        pledged_at: p.pledged_at,
        foundation_received_at: p.foundation_received_at,
        images: p.images || [],
      }));
      setPledges(mapped);
    } catch (e) {
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);


  const handleConfirm = async () => {
    if (!confirmDialog.pledge) return;
    setSaving(true);
    try {
      await foundationService.confirmReceipt(confirmDialog.pledge.id);
      toast({ title: 'ยืนยันรับของสำเร็จ' });
      // Immediately remove the confirmed pledge from the current list for immediate UI update
      setPledges(prevPledges => prevPledges.filter(p => p.id !== confirmDialog.pledge.id));
      setConfirmDialog({ open: false, pledge: null });
      // Removed: setActiveTab('received_by_foundation'); // Do not automatically switch to 'จัดส่งเสร็จแล้ว' tab
      fetchData(); // Re-fetch data for the current tab to ensure consistency
    } catch {
      toast({ title: 'เกิดข้อผิดพลาด', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };


  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_foundation_approval':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-400">รอการอนุมัติ</Badge>;
      case 'approved_by_foundation':
      case 'shipping_in_progress':
        return <Badge variant="outline" className="text-blue-600 border-blue-400">กำลังจัดส่ง</Badge>;
      case 'received_by_foundation':
        return <Badge variant="outline" className="text-green-600 border-green-400">จัดส่งสำเร็จ</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredPledges = pledges.filter(pledge => {
    if (activeTab === 'shipping_in_progress') {
      return ['pending_foundation_approval', 'approved_by_foundation', 'shipping_in_progress'].includes(pledge.status);
    }
    return pledge.status === activeTab;
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex flex-1">
        <FoundationSideMenu />
        <main className="flex-1 container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-4">จัดการการบริจาค</h1>
          {/* Tabs/Filters */}
          <div className="flex gap-2 mb-6">
            {STATUS_TABS.map(tab => (
              <Button
                key={tab.key}
                variant={activeTab === tab.key ? 'accent' : 'outline'}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </Button>
            ))}
          </div>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : filteredPledges.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">ยังไม่มีการบริจาคในสถานะนี้</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-xl shadow-soft">
                <thead>
                  <tr className="bg-muted">
                    <th className="py-3 px-4 text-left font-semibold">ชื่อสิ่งของ</th>
                    <th className="py-3 px-4 text-left font-semibold">ชื่อผู้บริจาค</th>
                    <th className="py-3 px-4 text-left font-semibold">จำนวน</th>
                    <th className="py-3 px-4 text-left font-semibold">วิธีจัดส่ง</th>
                    <th className="py-3 px-4 text-left font-semibold">วันที่</th>
                    <th className="py-3 px-4 text-left font-semibold">สถานะ</th>
                    <th className="py-3 px-4 text-left font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPledges.map((pledge) => (
                    <tr key={pledge.id ?? (pledge.donor?.email || Math.random())} className="border-b last:border-0">
                      <td className="py-3 px-4">
                        {pledge.wishlist_item?.item_name || '-'}
                      </td>
                      <td className="py-3 px-4 flex items-center gap-2">
                        <Avatar className="w-7 h-7">
                          <AvatarImage src={pledge.donor?.profile_image_url} alt={pledge.donor?.first_name} />
                          <AvatarFallback>{pledge.donor?.first_name?.[0] || '?'}</AvatarFallback>
                        </Avatar>
                        <span>{pledge.donor?.first_name} {pledge.donor?.last_name}</span>
                      </td>
                      <td className="py-3 px-4">
                        {pledge.quantity_pledged} {pledge.wishlist_item?.item_name?.includes('ชิ้น') ? 'ชิ้น' : ''}
                      </td>
                      <td className="py-3 px-4">
                        {pledge.delivery_method}
                        {pledge.delivery_method === 'courier' && (
                          <>
                            {pledge.courier_company_name && <span> ({pledge.courier_company_name})</span>}
                            {pledge.tracking_number && <span> - Tracking: {pledge.tracking_number}</span>}
                          </>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {pledge.pledged_at ? new Date(pledge.pledged_at).toLocaleString('th-TH') : '-'}
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(pledge.status)}
                  </td>
                  <td className="py-3 px-4">
                        {['pending_foundation_approval', 'approved_by_foundation', 'shipping_in_progress'].includes(pledge.status) && (
                          <Button size="sm" variant="accent" onClick={() => setConfirmDialog({ open: true, pledge })}>
                            <Truck className="w-4 h-4 mr-1" /> ยืนยันรับของ
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}


          {/* Confirm Receipt Dialog */}
          <Dialog open={confirmDialog.open} onOpenChange={open => setConfirmDialog({ open, pledge: open ? confirmDialog.pledge : null })}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>ยืนยันรับของ</DialogTitle>
              </DialogHeader>
              <div>คุณได้รับของจากการบริจาคนี้แล้วใช่หรือไม่?</div>
              <DialogFooter>
                <Button onClick={handleConfirm} disabled={saving}>
                  {saving ? 'กำลังยืนยัน...' : 'ยืนยันรับของ'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
};

export default FoundationPledges;
