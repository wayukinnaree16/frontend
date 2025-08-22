import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { WishlistItemCard } from '@/components/cards/WishlistItemCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, MapPin, Phone, Mail, Globe, Star } from 'lucide-react';
import { publicService } from '@/services/public.service';
import { donorService } from '@/services/donor.service';
import { toast } from '@/hooks/use-toast';

const FoundationDetail = () => {
  const { id } = useParams();
  // Normalize image URL to absolute (handles relative paths like '/uploads/logo.jpg' or 'logo.jpg')
  const toAbsoluteUrl = (u: string | undefined | null) => {
    if (!u) return '';
    if (u.startsWith('http://') || u.startsWith('https://') || u.startsWith('blob:')) return u;
    const path = u.startsWith('/') ? u : `/${u}`;
    return `http://localhost:3000${path}`;
  };
  const [foundation, setFoundation] = useState<any>(null);
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  // TODO: ดึงรีวิวจริงถ้ามี API
  const [reviews] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!id || isNaN(Number(id))) {
          setError('ไม่พบข้อมูลมูลนิธิ');
          return;
        }
        const foundationId = Number(id);
        const [foundationRes, wishlistRes] = await Promise.all([
          publicService.getFoundationById(id),
          publicService.getWishlistItems({ foundation_id: foundationId, status: 'open_for_donation' })
        ]);
        const f = foundationRes.data;
        setFoundation({
          id: String(f.foundation_id),
          name: f.foundation_name,
          description: f.history_mission || '',
          logo_url: toAbsoluteUrl(f.logo_url),
          province: f.province || '',
          foundation_type: f.foundation_type?.name || (f.foundation_type_id ? `ประเภท #${f.foundation_type_id}` : 'ไม่ระบุ'),
          is_verified: !!f.verified_at,
          phone: f.contact_phone || '',
          email: f.contact_email || '',
          website: f.website_url || '',
          address: `${f.address_line1 || ''}${f.address_line2 ? ' ' + f.address_line2 : ''} ${f.city ? f.city + ' ' : ''}${f.province || ''} ${f.postal_code || ''}`.trim(),
          full_description: f.history_mission || '',
          gmaps_embed_url: f.gmaps_embed_url,
        });
        const mappedWishlist = (wishlistRes.data?.wishlistItems || []).map((w: any) => ({
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
          images: w.example_image_url ? [w.example_image_url] : [],
          category: w.category?.name || ''
        }));
        setWishlistItems(mappedWishlist);
        
        // Check if foundation is favorited
        try {
          const favoritesRes = await donorService.getFavorites();
          const favoritesList = favoritesRes.data || [];
          const isCurrentlyFavorited = favoritesList.some(
            (fav: any) => String(fav.foundation?.foundation_id) === String(foundationId)
          );
          setIsFavorited(isCurrentlyFavorited);
        } catch (favError) {
          console.error('Error fetching favorites:', favError);
          // Continue even if favorites fetch fails, just assume not favorited
          setIsFavorited(false);
        }

      } catch (e) {
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
      } finally {
        setLoading(false);
      }
    };
    if (id && !isNaN(Number(id))) fetchData();
  }, [id]);

  const handleFavorite = async () => {
    if (!foundation) return;
    try {
      if (!isFavorited) {
        await donorService.addFavorite({ foundation_id: foundation.id });
        setIsFavorited(true);
        toast({ title: 'เพิ่มเป็นรายการโปรดแล้ว' });
      } else {
        await donorService.removeFavorite(foundation.id);
        setIsFavorited(false);
        toast({ title: 'นำออกจากรายการโปรดแล้ว' });
      }
    } catch {
      toast({ title: 'เกิดข้อผิดพลาด', variant: 'destructive' });
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error || !foundation) return <div className="text-center py-8 text-red-500">{error || 'ไม่พบข้อมูล'}</div>;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-orange-400/20 to-pink-400/20 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="container mx-auto px-4 py-8 relative z-10">
          {/* Enhanced Foundation Header */}
          <div className="glass rounded-3xl p-10 mb-12 border border-white/20 shadow-2xl backdrop-blur-xl">
            <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                <img 
                  src={foundation.logo_url} 
                  alt={foundation.name}
                  className="relative w-40 h-40 rounded-2xl object-cover shadow-2xl transform group-hover:scale-105 transition-all duration-300"
                />
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient-shift">
                      {foundation.name}
                    </h1>
                    {foundation.is_verified && (
                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 text-xs font-medium animate-glow">
                        <Star className="w-3 h-3 mr-1" />
                        ยืนยันแล้ว
                      </Badge>
                    )}
                  </div>
                  <Badge className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border border-blue-200 px-4 py-2 text-sm font-medium rounded-full">
                    {foundation.foundation_type || 'ไม่ระบุประเภท'}
                  </Badge>
                </div>
                
                <Button 
                  className={`h-14 px-8 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 ${
                    isFavorited 
                      ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl' 
                      : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl'
                  }`}
                  onClick={handleFavorite}
                >
                  <Heart
                    className={`h-6 w-6 mr-3 transition-all duration-300 ${
                      isFavorited ? 'text-white fill-white animate-pulse' : 'text-white'
                    }`}
                  />
                  {isFavorited ? 'นำออกจากรายการโปรด' : 'เพิ่มเป็นรายการโปรด'}
                </Button>
              </div>

              <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 mb-6 border border-gray-100">
                <p className="text-gray-700 text-lg leading-relaxed font-medium">
                  {foundation.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:shadow-md transition-all duration-200">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg mr-4">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">จังหวัด</p>
                    <p className="text-gray-800 font-semibold">{foundation.province}</p>
                  </div>
                </div>
                <div className="flex items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100 hover:shadow-md transition-all duration-200">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg mr-4">
                    <Phone className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">เบอร์โทรศัพท์</p>
                    <p className="text-gray-800 font-semibold">{foundation.phone}</p>
                  </div>
                </div>
                <div className="flex items-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100 hover:shadow-md transition-all duration-200">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg mr-4">
                    <Mail className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">อีเมล</p>
                    <p className="text-gray-800 font-semibold">{foundation.email}</p>
                  </div>
                </div>
                <div className="flex items-center p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-100 hover:shadow-md transition-all duration-200">
                  <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg mr-4">
                    <Globe className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">เว็บไซต์</p>
                    <a href={foundation.website} target="_blank" rel="noopener noreferrer" 
                       className="text-orange-600 hover:text-orange-700 font-semibold transition-colors duration-200 hover:underline">
                      เว็บไซต์มูลนิธิ
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>

        {/* Enhanced Tabs */}
        <div className="glass rounded-2xl p-8 border border-white/20">
          <Tabs defaultValue="wishlist" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-blue-100 to-indigo-100 p-1 rounded-xl border border-blue-200">
              <TabsTrigger value="wishlist" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white font-semibold rounded-lg transition-all duration-200">
                รายการที่ต้องการ
              </TabsTrigger>
              <TabsTrigger value="about" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white font-semibold rounded-lg transition-all duration-200">
                เกี่ยวกับมูลนิธิ
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="wishlist" className="space-y-6 mt-8">
              {wishlistItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wishlistItems.map((item) => (
                    <div key={item.id} className="transform hover:scale-105 transition-all duration-200">
                      <WishlistItemCard 
                        item={item}
                        showFoundation={false}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="bg-gradient-to-r from-gray-100 to-blue-100 rounded-2xl p-8 border border-gray-200">
                    <p className="text-gray-600 text-lg font-medium">
                      ยังไม่มีรายการที่ต้องการ
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="about" className="space-y-6 mt-8">
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                  <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                    เกี่ยวกับมูลนิธิ
                  </h3>
                  <div className="whitespace-pre-line text-gray-700 leading-relaxed text-lg">
                    {foundation.full_description}
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                  <h4 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">ที่อยู่</h4>
                  <p className="text-gray-700 leading-relaxed text-lg">{foundation.address}</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default FoundationDetail;
