import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { publicService } from '@/services/public.service';
import { donorService } from '@/services/donor.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const PledgeForm = () => {
  const query = useQuery();
  const navigate = useNavigate();
  const wishlist_item_id = query.get('wishlist_item_id');
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    quantity_pledged: '',
    donor_item_description: '',
    delivery_method: 'self_delivery',
    courier_company_name: '',
    tracking_number: '',
    pickup_address_details: '',
    pickup_preferred_datetime: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!wishlist_item_id) throw new Error('ไม่พบข้อมูลสิ่งของ');
        const res = await publicService.getWishlistItemById(wishlist_item_id);
        setItem(res.data);
      } catch (e) {
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูลสิ่งของ');
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [wishlist_item_id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await donorService.createPledge({
        wishlist_item_id: Number(wishlist_item_id),
        quantity_pledged: Number(form.quantity_pledged),
        donor_item_description: form.donor_item_description,
        delivery_method: form.delivery_method as any,
        courier_company_name: form.delivery_method === 'courier_service' ? form.courier_company_name : undefined,
        tracking_number: form.delivery_method === 'courier_service' ? form.tracking_number : undefined,
        pickup_address_details: form.delivery_method === 'foundation_pickup' ? form.pickup_address_details : undefined,
        pickup_preferred_datetime: form.delivery_method === 'foundation_pickup' ? form.pickup_preferred_datetime : undefined,
      });
      toast({ title: 'ส่งคำขอบริจาคสำเร็จ!' });
      navigate('/my-pledges');
    } catch (e) {
      toast({ title: 'เกิดข้อผิดพลาด', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error || !item) return <div className="text-center py-8 text-red-500">{error || 'ไม่พบข้อมูล'}</div>;

  return (
    <div className="container mx-auto py-12 max-w-xl">
      <h1 className="text-3xl font-bold mb-6">ฟอร์มบริจาคสิ่งของ</h1>
      <div className="mb-4 p-4 bg-secondary-light rounded">
        <div className="font-semibold">{item.title}</div>
        <div className="text-muted-foreground text-sm">{item.description}</div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">จำนวนที่บริจาค</label>
          <Input
            name="quantity_pledged"
            type="number"
            min={1}
            max={item.quantity_needed - item.quantity_received}
            value={form.quantity_pledged}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">คำอธิบายสิ่งของ</label>
          <textarea
            name="donor_item_description"
            className="w-full border rounded p-2"
            rows={3}
            value={form.donor_item_description}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">วิธีการจัดส่ง</label>
          <select
            name="delivery_method"
            className="w-full border rounded p-2"
            value={form.delivery_method}
            onChange={handleChange}
          >
            <option value="self_delivery">นำส่งด้วยตนเอง</option>
            <option value="courier_service">ส่งผ่านบริษัทขนส่ง</option>
            <option value="foundation_pickup">ให้มูลนิธิเข้ารับ</option>
          </select>
        </div>
        {form.delivery_method === 'courier_service' && (
          <>
            <div>
              <label className="block mb-1 font-medium">ชื่อบริษัทขนส่ง</label>
              <Input
                name="courier_company_name"
                value={form.courier_company_name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">เลขพัสดุ</label>
              <Input
                name="tracking_number"
                value={form.tracking_number}
                onChange={handleChange}
                required
              />
            </div>
          </>
        )}
        {form.delivery_method === 'foundation_pickup' && (
          <>
            <div>
              <label className="block mb-1 font-medium">ที่อยู่สำหรับเข้ารับ</label>
              <Input
                name="pickup_address_details"
                value={form.pickup_address_details}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">วันเวลาที่สะดวก</label>
              <Input
                name="pickup_preferred_datetime"
                type="datetime-local"
                value={form.pickup_preferred_datetime}
                onChange={handleChange}
                required
              />
            </div>
          </>
        )}
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? 'กำลังส่ง...' : 'ยืนยันการบริจาค'}
        </Button>
      </form>
    </div>
  );
};

export default PledgeForm; 