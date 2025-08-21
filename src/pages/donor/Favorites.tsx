import React, { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { FoundationCard } from '@/components/cards/FoundationCard';
import { donorService } from '@/services/donor.service';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

const Favorites = () => {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFavorites = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await donorService.getFavorites();
      setFavorites(res.data || []);
    } catch (e) {
      setError('เกิดข้อผิดพลาดในการโหลดรายการโปรด');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleRemoveFavorite = async (foundationId: string) => {
    try {
      await donorService.removeFavorite(foundationId);
      toast({ title: 'นำออกจากรายการโปรดแล้ว' });
      // Remove from local state immediately without page refresh
      setFavorites((prev) => prev.filter((fav) => String(fav.foundation?.foundation_id) !== String(foundationId)));
    } catch {
      toast({ title: 'เกิดข้อผิดพลาด', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">มูลนิธิที่ชื่นชอบ</h1>
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>คุณยังไม่มีมูลนิธิที่ชื่นชอบ</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((fav) => {
              const f = fav.foundation;
              if (!f) return null;
              return (
                <div key={f.foundation_id} className="relative group">
                  <FoundationCard 
                    foundation={{
                      id: String(f.foundation_id),
                      name: f.foundation_name,
                      description: f.history_mission || '',
                      logo_url: f.logo_url,
                      province: f.province,
                      foundation_type: f.foundation_type?.name || '',
                      is_verified: f.verified_at ? true : false,
                      wishlist_count: undefined
                    }}
                    isFavorited={true}
                    onFavorite={() => handleRemoveFavorite(String(f.foundation_id))}
                  />
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoveFavorite(String(f.foundation_id))}
                  >
                    ลบออก
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Favorites;