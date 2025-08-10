import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { FoundationCard } from '@/components/cards/FoundationCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { publicService, FoundationType } from '@/services/public.service';

const FoundationsList = () => {
  // Normalize image URL to absolute (handles relative paths like '/uploads/logo.jpg' or 'logo.jpg')
  const toAbsoluteUrl = (u: string | undefined | null) => {
    if (!u) return '';
    if (u.startsWith('http://') || u.startsWith('https://') || u.startsWith('blob:')) return u;
    const path = u.startsWith('/') ? u : `/${u}`;
    return `http://localhost:3001${path}`;
  };
  const [foundations, setFoundations] = useState<any[]>([]);
  const [foundationTypes, setFoundationTypes] = useState<FoundationType[]>([]);
  const [provinces, setProvinces] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedProvince, setSelectedProvince] = useState('all');
  const [sortBy, setSortBy] = useState<'foundation_name' | 'foundation_name_desc' | 'created_at' | 'created_at_desc'>('foundation_name');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        // Backend returns envelope { success, data: FoundationType[] }
        const res = await publicService.getFoundationTypesResponse();
        const payload = res?.data as any;
        const list = Array.isArray(payload?.data) ? payload.data : [];
        setFoundationTypes(
          list.map((item: any) => ({
            type_id: Number(item.type_id),
            name: String(item.name ?? ''),
            description: String(item.description ?? ''),
          }))
        );
      } catch (e) {
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
        // กำหนด sort_by เฉพาะถ้าไม่ใช่ค่า default
        if (sortBy === 'foundation_name') {
          params.sort_by = 'foundation_name';
          params.order = 'asc';
        } else if (sortBy === 'created_at') {
          params.sort_by = 'created_at';
          params.order = 'asc';
        } else if (sortBy === 'foundation_name_desc') {
          params.sort_by = 'foundation_name';
          params.order = 'desc';
        } else if (sortBy === 'created_at_desc') {
          params.sort_by = 'created_at';
          params.order = 'desc';
        }
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
        const mapped = list.map((f: any) => ({
          id: String(f.foundation_id),
          name: f.foundation_name ?? '',
          description: f.history_mission ?? '',
          logo_url: toAbsoluteUrl(f.logo_url ?? ''),
          province: f.province ?? '',
          foundation_type: f.foundation_type?.name
            ? f.foundation_type.name
            : (f.foundation_type_id ? `ประเภท #${f.foundation_type_id}` : 'ไม่ระบุ'),
          is_verified: !!f.verified_at,
          wishlist_count: f.wishlist_count ?? undefined
        }));
        setFoundations(mapped);

        const totalPagesFromApi =
          payload?.pagination?.total_pages ??
          envelope?.data?.pagination?.total_pages ??
          1;
        setTotalPages(totalPagesFromApi);

        // สร้าง provinces list จากข้อมูล foundation จริง
        const provs = Array.from(new Set(list.map((f: any) => f?.province))).filter(Boolean);
        setProvinces(['all', ...provs]);
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

  if (loading && !foundations.length) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  if (!foundations.length) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold mb-4">ไม่พบมูลนิธิที่คุณต้องการ</h2>
        <p className="text-muted-foreground text-lg">
          ลองค้นหาด้วยคำคล้ายหรือเปลี่ยนตัวกรองดู
        </p>
      </div>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">ค้นหามูลนิธิ</h1>
          <p className="text-muted-foreground text-lg">
            ค้นหามูลนิธิที่ต้องการความช่วยเหลือจากทั่วประเทศไทย
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-soft p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="search">ค้นหาชื่อมูลนิธิ</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="search"
                  placeholder="ชื่อมูลนิธิ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>ประเภทมูลนิธิ</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกประเภท" />
                </SelectTrigger>
                <SelectContent>
                  {foundationTypes.map((type) => (
                    <SelectItem key={type.type_id} value={String(type.type_id)}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>จังหวัด</Label>
              <Select value={selectedProvince} onValueChange={setSelectedProvince}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกจังหวัด" />
                </SelectTrigger>
                <SelectContent>
                  {provinces.map((province) => (
                    <SelectItem key={province} value={province}>
                      {province}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>เรียงตาม</Label>
              <Select value={sortBy} onValueChange={v => setSortBy(v as typeof sortBy)}>
                <SelectTrigger>
                  <SelectValue placeholder="เรียงตาม" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="foundation_name">ชื่อ A-Z</SelectItem>
                  <SelectItem value="foundation_name_desc">ชื่อ Z-A</SelectItem>
                  <SelectItem value="created_at">วันที่สร้างล่าสุด</SelectItem>
                  <SelectItem value="created_at_desc">วันที่สร้างเก่าสุด</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              พบ {foundations.length} มูลนิธิ
            </p>
            <Button variant="outline" size="sm">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              ตัวกรองเพิ่มเติม
            </Button>
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {foundations.map((foundation) => (
            <FoundationCard 
              key={foundation.id} 
              foundation={foundation}
              onFavorite={(id) => console.log('Favorited:', id)}
            />
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center space-x-2">
          <Button variant="outline" disabled={page === 1} onClick={handlePrevPage}>ก่อนหน้า</Button>
          <Button variant="default">{page}</Button>
          <Button variant="outline" disabled={page === totalPages} onClick={handleNextPage}>ถัดไป</Button>
        </div>
      </div>
    </Layout>
  );
};

export default FoundationsList;
