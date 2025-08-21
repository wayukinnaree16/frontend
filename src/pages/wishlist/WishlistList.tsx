import React, { useEffect, useState } from 'react';
import { publicService } from '@/services/public.service';
import { Layout } from '@/components/layout/Layout';
import { WishlistItemCard } from '@/components/cards/WishlistItemCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

const WishlistList = () => {
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('created_at_desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await publicService.getItemCategories();
        // The API returns { data: ItemCategory[] }
        const cats = Array.isArray(res.data) ? res.data : [];
        setCategories(cats);
      } catch (e) {
        // Optionally handle error, e.g. setCategories([])
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      setError(null);
      try {
        const params: any = {
          page,
          limit: 9,
          sort_by: 'created_at',
          order: 'desc',
          status: 'open_for_donation',
        };
        if (searchTerm) params.title = searchTerm;
        if (selectedCategory !== 'all') params.category_id = selectedCategory;
        console.log('params:', params);
        const res = await publicService.getWishlistItems(params);
        const data = res.data as any;
        console.log('raw response:', res.data);
        console.log('data:', data);
        console.log('wishlistItems:', data?.wishlistItems);
        const itemsArr = Array.isArray(data?.wishlistItems) ? data.wishlistItems : [];
        // Map backend urgency_level to frontend priority_level
        const mapUrgencyToPriority = (urgency: string): 'low' | 'medium' | 'high' | 'urgent' => {
          switch (urgency) {
            case 'normal': return 'low';
            case 'urgent': return 'medium';
            case 'very_urgent': return 'high';
            case 'extremely_urgent': return 'urgent';
            default: return 'low';
          }
        };

        const mapped = itemsArr.map(w => ({
          id: String(w.wishlist_item_id),
          title: w.item_name,
          description: w.description_detail,
          quantity_needed: w.quantity_needed,
          quantity_received: w.quantity_received,
          priority_level: mapUrgencyToPriority(w.urgency_level),
          expiry_date: w.posted_date,
          images: w.example_image_url ? [w.example_image_url] : [],
          foundation_name: w.foundation?.foundation_name || '',
          foundation_id: w.foundation_id ? String(w.foundation_id) : undefined,
          category: w.category?.name || ''
        }));
        console.log('mapped:', mapped);
        setItems(mapped);
        setTotalPages(data?.pagination?.totalPages || 1);
      } catch (e) {
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [searchTerm, selectedCategory, sortBy, page]);

  const handleNextPage = () => { if (page < totalPages) setPage(page + 1); };
  const handlePrevPage = () => { if (page > 1) setPage(page - 1); };

  return (
    <Layout>
      <div className="container mx-auto py-12">
        <h1 className="text-3xl font-bold mb-6">สิ่งของที่ต้องการล่าสุด</h1>
        <div className="mb-6 flex flex-col md:flex-row gap-4 items-center">
          <Input
            placeholder="ค้นหาชื่อสิ่งของ..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="max-w-xs"
        />
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="w-48 border rounded px-2 py-1"
        >
          <option value="all">ทุกหมวดหมู่</option>
          {categories.map((cat: any) => (
            <option key={cat.category_id} value={String(cat.category_id)}>{cat.name}</option>
          ))}
        </select>
      </div>
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">{error}</div>
      ) : Array.isArray(items) && items.length === 0 ? (
        <div className="text-center py-8">ไม่พบรายการสิ่งของที่ต้องการ</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {items.map(item => (
            <WishlistItemCard key={item.id} item={item} showFoundation={true} />
          ))}
        </div>
      )}
      <div className="flex justify-center space-x-2 mt-8">
        <Button variant="outline" disabled={page === 1} onClick={handlePrevPage}>ก่อนหน้า</Button>
        <Button variant="default">{page}</Button>
        <Button variant="outline" disabled={page === totalPages} onClick={handleNextPage}>ถัดไป</Button>
      </div>
      </div>
    </Layout>
  );
};

export default WishlistList;