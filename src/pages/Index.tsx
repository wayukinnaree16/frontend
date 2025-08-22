import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { FoundationCard } from '@/components/cards/FoundationCard';
import { WishlistItemCard } from '@/components/cards/WishlistItemCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Heart, Users, Gift, Search } from 'lucide-react';
import { publicService } from '@/services/public.service';
import { donorService } from '@/services/donor.service';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const [featuredFoundations, setFeaturedFoundations] = useState<any[]>([]);
  const [latestWishlistItems, setLatestWishlistItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const navigate = useNavigate();
  const { user } = useAuth();

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

        // Fetch user's favorites only if user is logged in
        if (user) {
          try {
            const favoritesRes = await donorService.getFavorites();
            const favoritesList = favoritesRes.data || [];
            const favoriteIds = new Set(favoritesList.map((fav: any) => String(fav.foundation?.foundation_id)));
            setFavorites(favoriteIds);
          } catch (favError) {
            // Handle favorites fetch error
            console.log('Could not fetch favorites:', favError);
          }
        }
        // Map WishlistItem
        console.log('Wishlist response:', wishlistRes.data);
        const wishlistData = wishlistRes.data?.wishlistItems || [];
        const mappedWishlist = wishlistData.map((w: any) => ({
          id: String(w.wishlist_item_id),
          title: w.item_name,
          description: w.description_detail,
          quantity_needed: w.quantity_needed,
          quantity_received: w.quantity_received,
          priority_level: (() => {
              if (w.urgency_level === 'normal') return 'low';
              if (w.urgency_level === 'urgent') return 'medium';
              if (w.urgency_level === 'very_urgent') return 'high';
              if (w.urgency_level === 'extremely_urgent') return 'urgent';
              return 'low';
            })(),
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

  const handleFavorite = async (foundationId: string) => {
    try {
      const isFavorited = favorites.has(foundationId);
      
      if (!isFavorited) {
        await donorService.addFavorite({ foundation_id: Number(foundationId) });
        setFavorites(prev => new Set([...prev, foundationId]));
        toast({ title: 'เพิ่มเป็นรายการโปรดแล้ว' });
      } else {
        await donorService.removeFavorite(foundationId);
        setFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(foundationId);
          return newSet;
        });
        toast({ title: 'นำออกจากรายการโปรดแล้ว' });
      }
    } catch (error) {
      toast({ 
        title: 'เกิดข้อผิดพลาด', 
        description: 'กรุณาเข้าสู่ระบบเพื่อใช้งานฟีเจอร์นี้',
        variant: 'destructive' 
      });
    }
  };

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
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-orange-500 text-white min-h-screen flex items-center">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-300/15 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-24 text-center z-10">
          <div className="max-w-5xl mx-auto">
            {/* Main Heading with Enhanced Animation */}
            <div className="mb-8">
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-4 bg-gradient-to-r from-white via-yellow-200 to-orange-200 bg-clip-text text-transparent animate-pulse">
                แบ่งปันจากใจ
              </h1>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-orange-200 animate-bounce">
                สร้างรอยยิ้มให้สังคม
              </h2>
            </div>
            
            <p className="text-xl md:text-2xl mb-12 text-white/90 leading-relaxed max-w-4xl mx-auto">
              แพลตฟอร์มบริจาคสิ่งของออนไลน์ที่เชื่อมต่อใจดีของคุณ<br />
              ไปยังมูลนิธิที่ต้องการความช่วยเหลือทั่วประเทศไทย
            </p>
            
            {/* Enhanced Search Bar */}
            <div className="max-w-3xl mx-auto mb-12">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-pink-400 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                <div className="relative bg-white rounded-2xl p-2 shadow-2xl">
                  <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6" />
                  <Input 
                    placeholder="ค้นหามูลนิธิที่คุณสนใจ..." 
                    className="pl-14 pr-32 h-16 text-xl bg-transparent border-0 text-gray-800 placeholder-gray-500 focus:ring-0"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <Button 
                    size="lg" 
                    className="absolute right-2 top-4 h-12 px-8 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200" 
                    onClick={handleSearch}
                  >
                    ค้นหา
                  </Button>
                </div>
              </div>
            </div>

            {/* Enhanced CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button size="xl" className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold py-4 px-8 rounded-2xl shadow-2xl transform hover:scale-110 transition-all duration-300 hover:shadow-orange-500/25" asChild>
                <Link to="/foundations">
                  <Gift className="mr-3 h-6 w-6" />
                  เริ่มบริจาคเลย
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Link>
              </Button>
              
              <Button size="xl" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-gray-800 font-bold py-4 px-8 rounded-2xl shadow-2xl transform hover:scale-110 transition-all duration-300 relative overflow-visible button-text-always-visible" asChild>
                <Link to="/about" className="relative z-10">
                  <Users className="mr-3 h-6 w-6 flex-shrink-0" />
                  <span className="text-lg font-bold tracking-wide whitespace-nowrap select-none btn-text-visible">เรียนรู้เพิ่มเติม</span>
                </Link>
              </Button>
            </div>
            

          </div>
        </div>
      </section>



      {/* Featured Foundations */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl mb-6">
              <div className="bg-white rounded-xl px-6 py-2">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 font-semibold">FEATURED</span>
              </div>
            </div>
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">มูลนิธิแนะนำ</h2>
            <p className="text-gray-600 text-xl max-w-2xl mx-auto leading-relaxed">มูลนิธิที่ได้รับการยืนยันและต้องการความช่วยเหลือเร่งด่วน</p>
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
                  onFavorite={handleFavorite}
                  isFavorited={favorites.has(foundation.id)}
                />
              ))
            )}
          </div>

          <div className="text-center">
            <Button size="xl" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300" asChild>
              <Link to="/foundations">
                ดูมูลนิธิทั้งหมด
                <ArrowRight className="ml-3 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Latest Wishlist Items */}
      <section className="py-20 bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block p-2 bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl mb-6">
              <div className="bg-white rounded-xl px-6 py-2">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-pink-600 font-semibold">URGENT NEEDS</span>
              </div>
            </div>
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">สิ่งของที่ต้องการล่าสุด</h2>
            <p className="text-gray-600 text-xl max-w-2xl mx-auto leading-relaxed">รายการล่าสุดที่มูลนิธิต่างๆ ประกาศความต้องการเร่งด่วน</p>
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
            <Button size="xl" className="bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300" asChild>
              <Link to="/wishlist">
                ดูรายการทั้งหมด
                <ArrowRight className="ml-3 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl mb-6">
              <div className="bg-white rounded-xl px-6 py-2">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600 font-semibold">HOW IT WORKS</span>
              </div>
            </div>
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">วิธีการใช้งาน</h2>
            <p className="text-gray-600 text-xl max-w-2xl mx-auto leading-relaxed">ง่ายๆ เพียง 3 ขั้นตอน เริ่มแบ่งปันความดีได้ทันที</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl w-24 h-24 flex items-center justify-center mx-auto shadow-2xl transform group-hover:scale-110 transition-all duration-300 group-hover:shadow-blue-500/25">
                  <Search className="h-12 w-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">1</div>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">ค้นหาและเลือก</h3>
              <p className="text-gray-600 text-lg leading-relaxed">ค้นหามูลนิธิและสิ่งของที่คุณต้องการบริจาคจากรายการที่หลากหลาย</p>
            </div>
            
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="bg-gradient-to-br from-orange-500 to-pink-600 rounded-3xl w-24 h-24 flex items-center justify-center mx-auto shadow-2xl transform group-hover:scale-110 transition-all duration-300 group-hover:shadow-orange-500/25">
                  <Heart className="h-12 w-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</div>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">ทำการบริจาค</h3>
              <p className="text-gray-600 text-lg leading-relaxed">กรอกข้อมูลการบริจาคและเลือกวิธีการส่งมอบที่สะดวกสำหรับคุณ</p>
            </div>
            
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-3xl w-24 h-24 flex items-center justify-center mx-auto shadow-2xl transform group-hover:scale-110 transition-all duration-300 group-hover:shadow-green-500/25">
                  <Gift className="h-12 w-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">3</div>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">สร้างความดี</h3>
              <p className="text-gray-600 text-lg leading-relaxed">ติดตามสถานะการบริจาคและรับความสุขจากการช่วยเหลือผู้อื่น</p>
            </div>
          </div>
          
          {/* Call to Action */}
          <div className="text-center mt-16">
            <Button size="xl" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-12 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300" asChild>
              <Link to="/foundations">
                เริ่มต้นการบริจาคเลย
                <ArrowRight className="ml-3 h-6 w-6" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
