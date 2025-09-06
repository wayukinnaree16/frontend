import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { FoundationCard } from '@/components/cards/FoundationCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { publicService, FoundationType } from '@/services/public.service';
import { donorService } from '@/services/donor.service';
import { toast } from '@/hooks/use-toast';

const FoundationsList = () => {
  const [searchParams] = useSearchParams();
  
  // Normalize image URL to absolute (handles relative paths like '/uploads/logo.jpg' or 'logo.jpg')
  const toAbsoluteUrl = (u: string | undefined | null) => {
    if (!u) return '';
    if (u.startsWith('http://') || u.startsWith('https://') || u.startsWith('blob:')) return u;
    const path = u.startsWith('/') ? u : `/${u}`;
    return `https://backend-lcjt.onrender.com${path}`;
  };
  const [foundations, setFoundations] = useState<any[]>([]);
  const [foundationTypes, setFoundationTypes] = useState<FoundationType[]>([]);
  const [provinces, setProvinces] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedProvince, setSelectedProvince] = useState('all');
  const [sortBy, setSortBy] = useState<'foundation_name' | 'foundation_name_desc' | 'created_at' | 'created_at_desc'>('foundation_name');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        // Backend returns envelope { statusCode, data: FoundationType[], message, success }
        const res = await publicService.getFoundationTypesResponse();
        
        // The API response structure is: { statusCode, data: [...], message, success }
        // The actual data array is directly in res.data (not res.data.data)
        const responseData = res?.data as any;
        const list = Array.isArray(responseData) ? responseData : [];
        
        setFoundationTypes(
          list.map((item: any) => ({
            type_id: Number(item.type_id),
            name: String(item.name ?? ''),
            description: String(item.description ?? ''),
          }))
        );
      } catch (e) {
        console.error('Error fetching foundation types:', e);
        setFoundationTypes([]);
      }
    };
    fetchTypes();
  }, []);

  useEffect(() => {
    const fetchFoundations = async () => {
      setLoading(true);
      setError(null);
      try {
        const params: any = {
          page,
          limit: 9,
        };
        // ไม่ส่ง sort parameters ไปยัง backend เพราะจะเรียงลำดับทั้งหมดใน frontend
        if (searchTerm) params.name = searchTerm;
        if (selectedType !== 'all') params.type_id = selectedType;
        if (selectedProvince !== 'all') params.province = selectedProvince;
        const res = await publicService.getFoundations(params);

        // รองรับทั้ง 2 รูปแบบผลลัพธ์จาก backend:
        // A) { data: { foundations: Foundation[], pagination: {...} } }
        // B) { data: { data: { foundations: Foundation[], pagination: {...} } } } (บางกรณีห่อซ้อน)
        const envelope: any = res as any;
        const payload: any = envelope?.data?.foundations ? envelope.data
                         : (envelope?.data?.data?.foundations ? envelope.data.data : (envelope?.data || {}));
        const list: any[] = Array.isArray(payload?.foundations) ? payload.foundations : [];

        // Map Foundation ชัดเจนตามฟิลด์ backend
        let mapped = list.map((f: any) => ({
          id: String(f.foundation_id),
          name: f.foundation_name ?? '',
          description: f.history_mission ?? '',
          logo_url: toAbsoluteUrl(f.logo_url ?? ''),
          province: f.province ?? '',
          foundation_type: f.foundation_type?.name
            ? f.foundation_type.name
            : (f.foundation_type_id ? `ประเภท #${f.foundation_type_id}` : 'ไม่ระบุ'),
          is_verified: !!f.verified_at,
          wishlist_count: f.wishlist_count ?? undefined,
          created_at: f.created_at // เพิ่มฟิลด์วันที่สำหรับการเรียงลำดับ
        }));

        // เรียงลำดับใน frontend เพื่อให้การเรียงลำดับถูกต้อง
        if (sortBy === 'foundation_name') {
          mapped = mapped.sort((a, b) => a.name.localeCompare(b.name, 'th'));
        } else if (sortBy === 'foundation_name_desc') {
          mapped = mapped.sort((a, b) => b.name.localeCompare(a.name, 'th'));
        } else if (sortBy === 'created_at') {
          // ล่าสุดก่อน (desc) - วันที่ใหม่กว่าก่อน
          mapped = mapped.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        } else if (sortBy === 'created_at_desc') {
          // เก่าสุดก่อน (asc) - วันที่เก่ากว่าก่อน
          mapped = mapped.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        }

        setFoundations(mapped);

        const totalPagesFromApi =
          payload?.pagination?.total_pages ??
          envelope?.data?.pagination?.total_pages ??
          1;
        setTotalPages(totalPagesFromApi);

        // สร้าง provinces list จากข้อมูล foundation จริง
        const provs = Array.from(new Set(list.map((f: any) => f?.province))).filter(Boolean);
        setProvinces(['all', ...provs]);

        // Fetch user's favorites
        try {
          const favoritesRes = await donorService.getFavorites();
          const favoritesList = favoritesRes.data || [];
          const favoriteIds = new Set(favoritesList.map((fav: any) => String(fav.foundation?.foundation_id)));
          setFavorites(favoriteIds);
        } catch (favError) {
          // User might not be logged in, continue without favorites
          console.log('Could not fetch favorites:', favError);
        }
      } catch (e) {
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
      } finally {
        setLoading(false);
      }
    };
    fetchFoundations();
  }, [searchTerm, selectedType, selectedProvince, sortBy, page]);

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

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

  if (loading && !foundations.length) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }



  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-orange-400/20 to-pink-400/20 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="container mx-auto px-4 py-8 relative z-10">
          {/* Enhanced Page Header */}
          <div className="text-center mb-12">
            <div className="inline-block p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-6 animate-glow">
              <Search className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient-shift">
              ค้นหามูลนิธิ
            </h1>
            <p className="text-muted-foreground text-xl max-w-2xl mx-auto leading-relaxed">
              ค้นหามูลนิธิที่ต้องการความช่วยเหลือจากทั่วประเทศไทย พร้อมสร้างการเปลี่ยนแปลงที่ดีให้กับสังคม
            </p>
          </div>

          {/* Enhanced Filters */}
          <div className="glass rounded-2xl p-8 mb-12 border border-white/20 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                <Filter className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ตัวกรองการค้นหา
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="space-y-3">
              <Label htmlFor="search" className="text-sm font-medium text-gray-700">ค้นหาชื่อมูลนิธิ</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="search"
                  type="text"
                  placeholder="กรอกชื่อมูลนิธิที่ต้องการค้นหา..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all duration-200 hover:border-gray-300"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">ประเภทมูลนิธิ</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all duration-200 hover:border-gray-300">
                  <SelectValue placeholder="เลือกประเภทมูลนิธิ" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-gray-200">
                  <SelectItem value="all" className="rounded-lg">ทุกประเภท</SelectItem>
                  {foundationTypes.map((type) => (
                    <SelectItem key={type.type_id} value={String(type.type_id)} className="rounded-lg">
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">จังหวัด</Label>
              <Select value={selectedProvince} onValueChange={setSelectedProvince}>
                <SelectTrigger className="w-full h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all duration-200 hover:border-gray-300">
                  <SelectValue placeholder="เลือกจังหวัด" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-gray-200">
                  {provinces.map((province) => (
                    <SelectItem key={province} value={province} className="rounded-lg">
                      {province === 'all' ? 'ทุกจังหวัด' : province}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">เรียงตาม</Label>
              <Select value={sortBy} onValueChange={v => setSortBy(v as typeof sortBy)}>
                <SelectTrigger className="w-full h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all duration-200 hover:border-gray-300">
                  <SelectValue placeholder="เลือกการเรียง" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-gray-200">
                  <SelectItem value="foundation_name" className="rounded-lg">ชื่อมูลนิธิ (A-Z)</SelectItem>
                  <SelectItem value="foundation_name_desc" className="rounded-lg">ชื่อมูลนิธิ (Z-A)</SelectItem>
                  <SelectItem value="created_at" className="rounded-lg">วันที่สร้าง (ใหม่-เก่า)</SelectItem>
                  <SelectItem value="created_at_desc" className="rounded-lg">วันที่สร้าง (เก่า-ใหม่)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              พบ {foundations.length} มูลนิธิ
            </p>
          </div>
        </div>

          {/* Enhanced Results Section */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
                  <Search className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                    ผลการค้นหา
                  </h2>
                  <p className="text-gray-600 mt-1">
                    พบ {foundations.length} มูลนิธิที่ตรงกับเงื่อนไขการค้นหา
                  </p>
                </div>
              </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {foundations.length > 0 ? (
                foundations.map((foundation) => (
                  <div key={foundation.id} className="transform hover:scale-105 transition-all duration-300">
                    <FoundationCard 
                      foundation={foundation}
                      onFavorite={handleFavorite}
                      isFavorited={favorites.has(foundation.id)}
                    />
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-16">
                  <div className="glass rounded-2xl p-12 border border-white/20 shadow-xl backdrop-blur-xl max-w-md mx-auto">
                    <div className="p-4 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                      <Search className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-gray-600 to-gray-800 bg-clip-text text-transparent">
                      ไม่พบมูลนิธิที่คุณต้องการ
                    </h2>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      ลองค้นหาด้วยคำคล้ายหรือเปลี่ยนตัวกรองดู
                    </p>
                  </div>
                </div>
              )}
        </div>
            </div>
          </div>

          {/* Enhanced Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-4 mb-8">
              <div className="glass rounded-2xl p-4 border border-white/20 shadow-xl backdrop-blur-xl">
                <div className="flex items-center space-x-3">
                  <Button 
                    variant="outline" 
                    disabled={page === 1} 
                    onClick={handlePrevPage}
                    className="h-12 px-6 rounded-xl border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    ก่อนหน้า
                  </Button>
                  
                  <div className="flex items-center space-x-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={page === pageNum ? "default" : "outline"}
                          onClick={() => setPage(pageNum)}
                          className={`h-12 w-12 rounded-xl transition-all duration-200 ${
                            page === pageNum 
                              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                              : 'border-gray-200 hover:border-blue-500 hover:bg-blue-50'
                          }`}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    disabled={page === totalPages} 
                    onClick={handleNextPage}
                    className="h-12 px-6 rounded-xl border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ถัดไป
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          )}
      </div>
    </Layout>
  );
};

export default FoundationsList;
