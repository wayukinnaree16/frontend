import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { publicService } from '@/services/public.service';
import { Button } from '@/components/ui/button';

const ProgressBar = ({ received, needed }: { received: number, needed: number }) => {
  const percent = needed > 0 ? Math.min(100, Math.round((received / needed) * 100)) : 0;
  return (
    <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
      <div
        className="bg-primary h-4 rounded-full text-xs text-white flex items-center justify-center"
        style={{ width: `${percent}%` }}
      >
        {percent}%
      </div>
    </div>
  );
};

const WishlistDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState<boolean>(false);

  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await publicService.getWishlistItemById(id!);
        // res.data = { statusCode, data: {...} } (from ApiResponse)
        const ww = res.data as any; // ใช้ as any เพื่อข้าม type error
        if (!ww) {
          setNotFound(true);
          setError(null);
          setItem(null);
          return;
        }
        setItem({
          id: String(ww.wishlist_item_id),
          title: ww.item_name,
          description: ww.description_detail,
          quantity_needed: ww.quantity_needed,
          quantity_received: ww.quantity_received,
          priority_level: ww.urgency_level,
          expiry_date: ww.posted_date, // หรือเปลี่ยนเป็น field วันหมดเขตจริงถ้ามี
          images: ww.example_image_url ? [ww.example_image_url] : [],
          foundation_name: ww.foundation?.foundation_name || ww.foundation?.city || '',
          foundation_id: ww.foundation_id ? String(ww.foundation_id) : undefined,
          category: ww.category_id || '',
        });
        setNotFound(false);
      } catch (e: any) {
        if (e?.response?.status === 404) {
          console.warn('Wishlist item not found or not available for public viewing.', e?.response?.data);
          setNotFound(true);
          setError(null);
          setItem(null);
        } else {
          console.error('Error loading wishlist item', e);
          setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
          setNotFound(false);
        }
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchItem();
  }, [id]);

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (notFound) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 max-w-2xl">
          <div className="border rounded-lg p-8 text-center">
            <h2 className="text-2xl font-semibold mb-2">ไม่พบรายการที่ต้องการ</h2>
            <p className="text-muted-foreground mb-6">
              รายการนี้อาจถูกปิดรับบริจาค ถูกลบ หรือยังไม่พร้อมสำหรับการแสดงผลสาธารณะ
            </p>
            <div className="flex justify-center gap-3">
              <Button variant="secondary" onClick={() => window.history.back()}>ย้อนกลับ</Button>
              <Button onClick={() => navigate('/wishlist')}>กลับไปหน้ารายการ</Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  if (error || !item) return <div className="text-center py-8 text-red-500">{error || 'ไม่พบข้อมูล'}</div>;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-4">{item.title}</h1>
        <div className="mb-2 text-muted-foreground">หมวดหมู่: {item.category}</div>
        {item.images && item.images.length > 0 && (
          <div className="mb-4 flex gap-2">
            {item.images.map((img: string, idx: number) => (
              <img key={idx} src={img} alt="wishlist" className="w-32 h-32 object-cover rounded" />
            ))}
          </div>
        )}
        <div className="mb-4">{item.description}</div>
        <div className="mb-2">จำนวนที่ต้องการ: <b>{item.quantity_needed}</b> | ได้รับแล้ว: <b>{item.quantity_received}</b></div>
        <ProgressBar received={item.quantity_received} needed={item.quantity_needed} />
        <div className="mb-2">ระดับความสำคัญ: <b>{item.priority_level}</b></div>
        {item.expiry_date && <div className="mb-2">วันหมดเขต: <b>{new Date(item.expiry_date).toLocaleDateString('th-TH')}</b></div>}
        <div className="mb-4">มูลนิธิ: <b>{item.foundation_name}</b></div>
        <Button onClick={() => navigate(`/donor/pledge-form?wishlist_item_id=${item.id}`)}>
          บริจาคสิ่งนี้
        </Button>
      </div>
    </Layout>
  );
};

export default WishlistDetail;
