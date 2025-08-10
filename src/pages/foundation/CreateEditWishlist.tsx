import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { foundationService } from '@/services/foundation.service';
import { publicService } from '@/services/public.service';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Header } from '@/components/layout/Header';
import { FoundationSideMenu } from './FoundationSideMenu';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from '@radix-ui/react-icons';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

const CreateEditWishlist = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState({
    item_name: '',
    description_detail: '',
    quantity_required: 1,
    quantity_unit: '',
    importance_level: 'medium',
    category_id: '',
    expiry_date: null as Date | null,
    image_url: '',
    custom_unit: ''
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await publicService.getItemCategories();
        setCategories(res.data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'number') {
      setForm(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Validate required fields
      if (!form.item_name.trim()) {
        toast({ title: 'กรุณากรอกชื่อรายการ', variant: 'destructive' });
        return;
      }
      if (!form.description_detail.trim()) {
        toast({ title: 'กรุณากรอกรายละเอียด', variant: 'destructive' });
        return;
      }
      if (!form.quantity_unit.trim()) {
        toast({ title: 'กรุณาเลือกหน่วย', variant: 'destructive' });
        return;
      }
      if (form.quantity_unit === 'other' && !form.custom_unit.trim()) {
        toast({ title: 'กรุณาระบุหน่วยเอง', variant: 'destructive' });
        return;
      }

      const submitData = {
        title: form.item_name.trim(),
        description: form.description_detail.trim(),
        quantity_needed: form.quantity_required,
        priority_level: form.importance_level as 'low' | 'medium' | 'high' | 'urgent',
        category_id: form.category_id ? parseInt(form.category_id) : 1, // Default to first category if not selected
        expiry_date: form.expiry_date ? form.expiry_date.toISOString().split('T')[0] : undefined,
        images: form.image_url.trim() ? [form.image_url.trim()] : undefined
      };

      console.log('Form data:', form);
      console.log('Submitting data:', submitData);
      console.log('Category ID type:', typeof submitData.category_id, submitData.category_id);

      if (id) {
        await foundationService.updateWishlistItem(id, submitData);
        toast({ title: 'อัปเดตรายการสำเร็จ' });
      } else {
        await foundationService.createWishlistItem(submitData);
        toast({ title: 'สร้างรายการสำเร็จ' });
      }

      navigate('/foundation/wishlist');
    } catch (error: any) {
      console.error('Error submitting form:', error);
      console.error('Error response:', error.response?.data);
      if (error.response?.data?.message) {
        toast({ title: error.response.data.message, variant: 'destructive' });
      } else {
        toast({ title: 'เกิดข้อผิดพลาด', variant: 'destructive' });
      }
    } finally {
      setSaving(false);
    }
  };

  const units = [
    { value: 'ชิ้น', label: 'ชิ้น' },
    { value: 'กล่อง', label: 'กล่อง' },
    { value: 'ถุง', label: 'ถุง' },
    { value: 'ขวด', label: 'ขวด' },
    { value: 'ชุด', label: 'ชุด' },
    { value: 'คู่', label: 'คู่' },
    { value: 'เล่ม', label: 'เล่ม' },
    { value: 'other', label: 'อื่นๆ' }
  ];

  const importanceLevels = [
    { value: 'low', label: 'สำคัญน้อย' },
    { value: 'medium', label: 'สำคัญปานกลาง' },
    { value: 'high', label: 'สำคัญมาก' },
    { value: 'urgent', label: 'เร่งด่วน' }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex flex-1">
        <FoundationSideMenu />
        <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
          <h1 className="text-3xl font-bold mb-4">
            {id ? 'แก้ไขรายการที่ต้องการ' : 'สร้างรายการที่ต้องการ'}
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-xl shadow-soft p-8">
            <div>
              <label className="block mb-1 font-medium">ชื่อรายการ *</label>
              <Input 
                name="item_name" 
                value={form.item_name} 
                onChange={handleChange} 
                placeholder="เช่น หนังสือเรียน, อุปกรณ์การแพทย์"
                required 
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">รายละเอียด *</label>
              <Textarea 
                name="description_detail" 
                value={form.description_detail} 
                onChange={handleChange} 
                placeholder="อธิบายรายละเอียดของรายการที่ต้องการ"
                rows={4}
                required 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-medium">จำนวนที่ต้องการ</label>
                <Input 
                  name="quantity_required" 
                  type="number" 
                  value={form.quantity_required} 
                  onChange={handleChange} 
                  min="1"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">หน่วย *</label>
                <Select value={form.quantity_unit} onValueChange={(value) => handleSelectChange('quantity_unit', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกหน่วย" />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map((unit) => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {form.quantity_unit === 'other' && (
              <div>
                <label className="block mb-1 font-medium">ระบุหน่วยเอง *</label>
                <Input 
                  name="custom_unit" 
                  value={form.custom_unit} 
                  onChange={handleChange} 
                  placeholder="เช่น กิโลกรัม, เมตร"
                  required
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-medium">ระดับความสำคัญ</label>
                <Select value={form.importance_level} onValueChange={(value) => handleSelectChange('importance_level', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {importanceLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block mb-1 font-medium">หมวดหมู่</label>
                <Select value={form.category_id} onValueChange={(value) => handleSelectChange('category_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกหมวดหมู่" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={String(category.id)}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block mb-1 font-medium">วันหมดอายุ (ถ้ามี)</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.expiry_date ? (
                      format(form.expiry_date, 'PPP', { locale: th })
                    ) : (
                      <span>เลือกวันที่</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={form.expiry_date}
                    onSelect={(date) => setForm(prev => ({ ...prev, expiry_date: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="block mb-1 font-medium">รูปภาพ (URL)</label>
              <Input 
                name="image_url" 
                value={form.image_url} 
                onChange={handleChange} 
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/foundation/wishlist')}
                className="flex-1"
              >
                ยกเลิก
              </Button>
              <Button type="submit" className="flex-1" disabled={saving}>
                {saving ? 'กำลังบันทึก...' : (id ? 'อัปเดต' : 'สร้างรายการ')}
              </Button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default CreateEditWishlist; 