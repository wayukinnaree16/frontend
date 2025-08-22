import React, { useEffect, useState } from 'react';
import { publicService } from '@/services/public.service';
import { Layout } from '@/components/layout/Layout';
import { WishlistItemCard } from '@/components/cards/WishlistItemCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';

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
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 text-white py-20">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-orange-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-purple-300/15 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
        
        <div className="relative container mx-auto px-4 text-center z-10">
          <div className="max-w-4xl mx-auto">
            <div className="inline-block p-2 bg-gradient-to-r from-orange-400 to-pink-400 rounded-2xl mb-6">
              <div className="bg-white rounded-xl px-6 py-2">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-pink-600 font-semibold">URGENT NEEDS</span>
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-yellow-200 to-orange-200 bg-clip-text text-transparent">สิ่งของที่ต้องการล่าสุด</h1>
            <p className="text-xl mb-12 text-white/90 leading-relaxed max-w-3xl mx-auto">
              รายการล่าสุดที่มูลนิธิต่างๆ ประกาศความต้องการ<br />
              ร่วมแบ่งปันความดีและสร้างรอยยิ้มให้ผู้ที่ต้องการความช่วยเหลือ
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-12 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
              <div className="flex flex-col lg:flex-row gap-6 items-center">
                {/* Search Input */}
                <div className="flex-1 relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-pink-400 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
                  <div className="relative bg-gray-50 rounded-2xl">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      placeholder="ค้นหาชื่อสิ่งของ..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="pl-12 h-14 text-lg bg-transparent border-0 focus:ring-2 focus:ring-orange-500/20 rounded-2xl"
                    />
                  </div>
                </div>
                
                {/* Category Filter */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
                  <div className="relative bg-gray-50 rounded-2xl">
                    <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10" />
                    <select
                      value={selectedCategory}
                      onChange={e => setSelectedCategory(e.target.value)}
                      className="pl-12 pr-8 h-14 text-lg bg-transparent border-0 rounded-2xl focus:ring-2 focus:ring-purple-500/20 appearance-none cursor-pointer min-w-[200px]"
                    >
                      <option value="all">ทุกหมวดหมู่</option>
                      {categories.map((cat: any) => (
                        <option key={cat.category_id} value={String(cat.category_id)}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12 bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 min-h-screen">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent"></div>
              <p className="mt-4 text-xl text-gray-600">กำลังโหลดข้อมูล...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="bg-red-50 border border-red-200 rounded-3xl p-8 max-w-md mx-auto">
                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                <p className="text-red-600 text-xl font-semibold">{error}</p>
              </div>
            </div>
          ) : Array.isArray(items) && items.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-white rounded-3xl shadow-xl p-12 max-w-md mx-auto border border-gray-100">
                <div className="text-gray-400 text-6xl mb-6">📦</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">ไม่พบรายการสิ่งของ</h3>
                <p className="text-gray-600 text-lg">ลองเปลี่ยนคำค้นหาหรือหมวดหมู่ดูนะ</p>
              </div>
            </div>
          ) : (
            <>
              {/* Items Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {items.map(item => (
                  <div key={item.id} className="transform hover:scale-105 transition-all duration-300">
                    <WishlistItemCard item={item} showFoundation={true} />
                  </div>
                ))}
              </div>
              
              {/* Enhanced Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-4">
                  <div className="bg-white rounded-3xl p-4 border border-gray-200 shadow-xl">
                    <div className="flex items-center space-x-3">
                      <Button 
                        variant="outline" 
                        disabled={page === 1} 
                        onClick={handlePrevPage}
                        className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white border-0 rounded-2xl px-6 py-3 font-semibold shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        ก่อนหน้า
                      </Button>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-600 font-medium">หน้า</span>
                        <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl px-4 py-2 font-bold text-lg shadow-lg">
                          {page}
                        </div>
                        <span className="text-gray-600 font-medium">จาก {totalPages}</span>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        disabled={page === totalPages} 
                        onClick={handleNextPage}
                        className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0 rounded-2xl px-6 py-3 font-semibold shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        ถัดไป
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default WishlistList;