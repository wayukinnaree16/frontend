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
    return `http://localhost:3001${path}`;
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
          priority_level: w.urgency_level,
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
      <div className="container mx-auto px-4 py-8">
        {/* Foundation Header */}
        <div className="bg-white rounded-xl shadow-soft p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <img 
                src={foundation.logo_url} 
                alt={foundation.name}
                className="w-32 h-32 rounded-xl object-cover shadow-medium"
              />
            </div>
            
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold">{foundation.name}</h1>
                    {foundation.is_verified && (
                      <Badge variant="secondary" className="bg-accent text-accent-foreground">
                        ✓ ยืนยันแล้ว
                      </Badge>
                    )}
                  </div>
                  <Badge variant="outline" className="mb-3">
                    ประเภทมูลนิธิ: {foundation.foundation_type || 'ไม่ระบุ'}
                  </Badge>
                </div>
                
                <Button variant="soft" size="lg" onClick={handleFavorite}>
                  <Heart
                    className={`h-5 w-5 mr-2 transition-colors ${
                      isFavorited ? 'text-red-500 fill-red-500' : ''
                    }`}
                  />
                  {isFavorited ? 'นำออกจากรายการโปรด' : 'เพิ่มเป็นรายการโปรด'}
                </Button>
              </div>

              <p className="text-muted-foreground mb-4 leading-relaxed">
                {foundation.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{foundation.province}</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>{foundation.phone}</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>{foundation.email}</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Globe className="h-4 w-4 mr-2" />
                  <a href={foundation.website} target="_blank" rel="noopener noreferrer" 
                     className="text-primary hover:text-primary-hover transition-colors">
                    เว็บไซต์มูลนิธิ
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="wishlist" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="wishlist">รายการที่ต้องการ</TabsTrigger>
            <TabsTrigger value="about">เกี่ยวกับมูลนิธิ</TabsTrigger>
            <TabsTrigger value="reviews">รีวิว</TabsTrigger>
          </TabsList>
          
          <TabsContent value="wishlist" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlistItems.map((item) => (
                <WishlistItemCard 
                  key={item.id} 
                  item={item}
                  showFoundation={false}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="about" className="mt-6">
            <div className="bg-white rounded-xl shadow-soft p-8">
              <h3 className="text-2xl font-semibold mb-6">เกี่ยวกับมูลนิธิ</h3>
              <div className="prose max-w-none">
                <div className="whitespace-pre-line text-muted-foreground leading-relaxed">
                  {foundation.full_description}
                </div>
              </div>
              
              <div className="mt-8 p-6 bg-primary-light rounded-lg">
                <h4 className="font-semibold mb-2">ที่อยู่</h4>
                <p className="text-muted-foreground">{foundation.address}</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="reviews" className="mt-6">
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white rounded-xl shadow-soft p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                        <span className="ml-2 text-sm text-muted-foreground">
                          โดย {review.reviewer}
                        </span>
                      </div>
                      <p className="text-muted-foreground">{review.comment}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(review.date).toLocaleDateString('th-TH')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default FoundationDetail;
