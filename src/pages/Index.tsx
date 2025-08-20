import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { FoundationCard } from '@/components/cards/FoundationCard';
import { WishlistItemCard } from '@/components/cards/WishlistItemCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Heart, Users, Package, ArrowRight, Star } from 'lucide-react';
import { publicService, Foundation, WishlistItem } from '@/services/public.service';
import { donorService } from '@/services/donor.service';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const [featuredFoundations, setFeaturedFoundations] = useState<any[]>([]);
  const [latestWishlistItems, setLatestWishlistItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [foundationsRes, wishlistRes] = await Promise.all([
          publicService.getFoundations({ page: 1, limit: 3, sort_by: 'created_at', order: 'desc' }),
          publicService.getWishlistItems({ page: 1, limit: 3, sort_by: 'created_at', order: 'desc', status: 'open_for_donation' })
        ]);
        // Map Foundation
        const mappedFoundations = (foundationsRes.data?.foundations || []).map(f => ({
          id: String(f.foundation_id),
          name: f.foundation_name,
          description: f.history_mission,
          logo_url: f.logo_url,
          province: f.province,
          foundation_type: f.foundation_type?.name || '',
          is_verified: f.verified_at ? true : false,
          wishlist_count: undefined // ถ้ามี field นี้ใน API ให้ใส่ f.wishlist_count
        }));
        setFeaturedFoundations(mappedFoundations);
        // Map WishlistItem
        console.log('Wishlist response:', wishlistRes.data);
        const wishlistData = wishlistRes.data?.wishlistItems || [];
        const mappedWishlist = wishlistData.map((w: any) => ({
          id: String(w.wishlist_item_id),
          title: w.item_name,
          description: w.description_detail,
          quantity_needed: w.quantity_needed,
          quantity_received: w.quantity_received,
          priority_level: w.urgency_level,
          expiry_date: w.posted_date,
          foundation_name: w.foundation?.foundation_name || '',
          foundation_id: w.foundation_id ? String(w.foundation_id) : undefined,
          images: w.example_image_url ? [w.example_image_url] : [],
          category: w.category?.name || ''
        }));
        console.log('Mapped wishlist:', mappedWishlist);
        setLatestWishlistItems(mappedWishlist);
      } catch (e) {
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/foundations?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/foundations');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 py-24 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
              แบ่งปันจากใจ
              <span className="block text-secondary">สร้างรอยยิ้มให้สังคม</span>
            </h1>
            <p className="text-xl mb-8 text-white/90 animate-fade-in">
              แพลตฟอร์มบริจาคสิ่งของออนไลน์ที่เชื่อมต่อใจดีของคุณ<br />
              ไปยังมูลนิธิที่ต้องการความช่วยเหลือทั่วประเทศไทย
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8 animate-fade-in">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input 
                  placeholder="ค้นหามูลนิธิที่คุณสนใจ..." 
                  className="pl-12 h-14 text-lg bg-white border-0 shadow-large text-gray-900"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <Button size="lg" className="absolute right-2 top-2 h-10" onClick={handleSearch}>
                  ค้นหา
                </Button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
              <Button size="xl" variant="secondary" asChild>
                <Link to="/foundations">
                  เริ่มบริจาคเลย
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>

            </div>
          </div>
        </div>
      </section>



      {/* Featured Foundations */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">มูลนิธิแนะนำ</h2>
            <p className="text-muted-foreground text-lg">มูลนิธิที่ได้รับการยืนยันและต้องการความช่วยเหลือ</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {loading ? (
              <p>กำลังโหลดข้อมูลมูลนิธิ...</p>
            ) : error ? (
              <p>{error}</p>
            ) : featuredFoundations.length === 0 ? (
              <p>ไม่พบมูลนิธิที่ตรงตามเงื่อนไข</p>
            ) : (
              featuredFoundations.map((foundation) => (
                <FoundationCard 
                  key={foundation.id} 
                  foundation={foundation}
                  onFavorite={(id) => console.log('Favorited:', id)}
                />
              ))
            )}
          </div>

          <div className="text-center">
            <Button size="lg" variant="outline" asChild>
              <Link to="/foundations">
                ดูมูลนิธิทั้งหมด
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Latest Wishlist Items */}
      <section className="py-16 bg-secondary-light">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">สิ่งของที่ต้องการล่าสุด</h2>
            <p className="text-muted-foreground text-lg">รายการล่าสุดที่มูลนิธิต่างๆ ประกาศความต้องการ</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {loading ? (
              <p>กำลังโหลดข้อมูลรายการความต้องการ...</p>
            ) : error ? (
              <p>{error}</p>
            ) : latestWishlistItems.length === 0 ? (
              <p>ไม่พบรายการความต้องการที่ตรงตามเงื่อนไข</p>
            ) : (
              latestWishlistItems.map((item) => (
                <WishlistItemCard 
                  key={item.id} 
                  item={item}
                  showFoundation={true}
                />
              ))
            )}
          </div>

          <div className="text-center">
            <Button size="lg" variant="outline" asChild>
              <Link to="/wishlist">
                ดูรายการทั้งหมด
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">วิธีการใช้งาน</h2>
            <p className="text-muted-foreground text-lg">ง่ายๆ เพียง 2 ขั้นตอน</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-light rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Search className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">1. ค้นหาและเลือก</h3>
              <p className="text-muted-foreground">ค้นหามูลนิธิและสิ่งของที่คุณต้องการบริจาค</p>
            </div>
            <div className="text-center">
              <div className="bg-secondary-light rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Heart className="h-10 w-10 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">2. ทำการบริจาค</h3>
              <p className="text-muted-foreground">กรอกข้อมูลการบริจาคและเลือกวิธีการส่งมอบ</p>
            </div>

          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
