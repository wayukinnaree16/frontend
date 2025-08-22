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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

    const fetchItem = async () => {
      if (id) {
        setLoading(true);
        try {
          const res = await foundationService.getWishlistItemById(id);
          const itemData = res.data.wishlist_item;
          setForm({
            item_name: itemData.item_name || '',
            description_detail: itemData.description_detail || '',
            quantity_required: itemData.quantity_needed || 1,
            quantity_unit: itemData.quantity_unit || '',
            importance_level: (() => {
              const urgency = itemData.urgency_level;
              if (urgency === 'normal') return 'low';
              if (urgency === 'urgent') return 'medium';
              if (urgency === 'very_urgent') return 'high';
              if (urgency === 'extremely_urgent') return 'urgent';
              return 'medium'; // default
            })(),
            category_id: String(itemData.category_id) || '',
            image_url: itemData.example_image_url || '',
            custom_unit: itemData.quantity_unit === 'other' ? itemData.quantity_unit : ''
          });
        } catch (error) {
          console.error('Error fetching wishlist item:', error);
          toast({ title: 'เกิดข้อผิดพลาดในการโหลดข้อมูลรายการ', variant: 'destructive' });
        } finally {
          setLoading(false);
        }
      }
    };

    fetchItem();
  }, [id]);

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

      // Map frontend priority_level to backend urgency_level
      const mapPriorityToUrgency = (priority: string): 'normal' | 'urgent' | 'very_urgent' | 'extremely_urgent' => {
        if (priority === 'low') return 'normal';
        if (priority === 'medium') return 'urgent';
        if (priority === 'high') return 'very_urgent';
        if (priority === 'urgent') return 'extremely_urgent';
        return 'normal'; // default
      };

      const submitData = {
        item_name: form.item_name.trim(),
        description_detail: form.description_detail.trim(),
        quantity_needed: form.quantity_required,
        quantity_unit: form.quantity_unit === 'other' ? form.custom_unit.trim() : form.quantity_unit,
        urgency_level: mapPriorityToUrgency(form.importance_level),
        category_id: form.category_id ? parseInt(form.category_id) : undefined,
        example_image_url: form.image_url.trim() ? form.image_url.trim() : undefined,
      };

      if (id) {
        const updateData: any = {
          item_name: form.item_name.trim(),
          description_detail: form.description_detail.trim(),
          quantity_needed: form.quantity_required,
          quantity_unit: form.quantity_unit === 'other' ? form.custom_unit.trim() : form.quantity_unit,
          urgency_level: mapPriorityToUrgency(form.importance_level),
          category_id: form.category_id ? parseInt(form.category_id) : undefined,
          example_image_url: form.image_url.trim() ? form.image_url.trim() : undefined,
        };
        await foundationService.updateWishlistItem(id, updateData);
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
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold">
                {id ? 'แก้ไขรายการที่ต้องการ' : 'สร้างรายการที่ต้องการ'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
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
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default CreateEditWishlist;
