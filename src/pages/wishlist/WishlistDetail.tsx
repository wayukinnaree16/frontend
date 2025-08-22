import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { publicService } from '@/services/public.service';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { XCircle, Heart, Users, Gift, ArrowLeft, Edit, Save, X } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { foundationService } from '@/services/foundation.service';
import { sharedService } from '@/services/shared.service';

const ProgressBar = ({ received, needed }: { received: number, needed: number }) => {
  const percent = needed > 0 ? Math.min(100, Math.round((received / needed) * 100)) : 0;
  return (
    <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
      <div
        className="bg-primary h-4 rounded-full text-xs text-white flex items-center justify-center"
        style={{ width: `${percent}%` }}
      >
        {percent}%
      </div>
    </div>
  );
};

const WishlistDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isFoundation = user?.user_type === 'foundation_admin';
  const [isEditing, setIsEditing] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]); // New state for new image files
  const [categories, setCategories] = useState<any[]>([]);

  // Helper function to map backend urgency_level to frontend priority_level
  const mapUrgencyToPriority = (urgency: string) => {
    const urgencyMap: { [key: string]: string } = {
      'normal': 'low',
      'urgent': 'medium',
      'very_urgent': 'high',
      'extremely_urgent': 'urgent'
    };
    return urgencyMap[urgency] || 'low';
  };

  useEffect(() => {
    if (item) {
      setEditItem({
        ...item,
        // Convert frontend priority_level back to backend urgency_level for editing
        priority_level: (() => {
          if (item.priority_level === 'low') return 'normal';
          if (item.priority_level === 'medium') return 'urgent';
          if (item.priority_level === 'high') return 'very_urgent';
          if (item.priority_level === 'urgent') return 'extremely_urgent';
          return 'normal';
        })(),
        imageUrls: item.images || [], // Initialize imageUrls with existing images
      });
      setImageFiles([]); // Clear new image files on item change
    }
  }, [item]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await publicService.getItemCategories();
        const cats = Array.isArray(res.data) ? res.data : [];
        setCategories(cats);
      } catch (e) {
        console.error('Error fetching categories:', e);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchItem = async () => {
      if (!id) {
        setLoading(false);
        setNotFound(true);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await publicService.getWishlistItemById(id);
        // res.data = { statusCode, data: {...} } (from ApiResponse)
        const ww = res.data as any; // ใช้ as any เพื่อข้าม type error
        if (!ww) {
          setNotFound(true);
          setError(null);
          setItem(null);
          return;
        }
        setItem({
          id: String(ww.wishlist_item_id),
          title: ww.item_name,
          description: ww.description_detail,
          quantity_needed: ww.quantity_needed,
          quantity_received: ww.quantity_received,
          priority_level: mapUrgencyToPriority(ww.urgency_level), // Use mapping function
          images: ww.example_image_url ? [ww.example_image_url] : [],
          foundation_name: ww.foundation?.foundation_name || ww.foundation?.city || '',
          foundation_id: ww.foundation_id ? String(ww.foundation_id) : undefined,
          category: ww.category?.name || '',
          category_id: ww.category_id || '',
          quantity_unit: ww.quantity_unit || '', // Add quantity_unit here
        });
        setNotFound(false);
      } catch (e: any) {
        if (e?.response?.status === 404) {
          console.warn('Wishlist item not found or not available for public viewing.', e?.response?.data);
          setNotFound(true);
          setError(null);
          setItem(null);
        } else {
          console.error('Error loading wishlist item', e);
          setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
          setNotFound(false);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
          <div className="container mx-auto px-4 py-20">
            <div className="text-center">
              <div className="inline-block p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl mb-8 animate-pulse">
                <div className="bg-white rounded-2xl px-8 py-4">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 font-semibold text-lg">กำลังโหลดข้อมูล...</span>
                </div>
              </div>
              <div className="space-y-4 max-w-md mx-auto">
                <div className="h-4 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full animate-pulse"></div>
                <div className="h-4 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full animate-pulse"></div>
                <div className="h-4 bg-gradient-to-r from-pink-200 to-blue-200 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  if (notFound) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-pink-50">
          <div className="container mx-auto px-4 py-20">
            <div className="text-center max-w-2xl mx-auto">
              <div className="inline-block p-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-3xl mb-8">
                <div className="bg-white rounded-2xl px-8 py-4">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600 font-semibold text-lg">ไม่พบรายการ</span>
                </div>
              </div>
              <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">ไม่พบรายการที่ต้องการ</h1>
              <p className="text-gray-600 text-xl mb-8 leading-relaxed">
                รายการนี้อาจถูกปิดรับบริจาค ถูกลบ หรือยังไม่พร้อมสำหรับการแสดงผลสาธารณะ
              </p>
              <div className="flex justify-center gap-4">
                <Button 
                  variant="secondary" 
                  onClick={() => window.history.back()}
                  size="lg"
                  className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  ย้อนกลับ
                </Button>
                <Button 
                  onClick={() => navigate('/wishlist')}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  กลับไปหน้ารายการ
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
          <div className="container mx-auto px-4 py-20">
            <div className="text-center max-w-2xl mx-auto">
              <div className="inline-block p-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-3xl mb-8">
                <div className="bg-white rounded-2xl px-8 py-4">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600 font-semibold text-lg">เกิดข้อผิดพลาด</span>
                </div>
              </div>
              <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">เกิดข้อผิดพลาด</h1>
              <p className="text-gray-600 text-xl mb-8 leading-relaxed">{error}</p>
              <Button 
                onClick={() => navigate('/wishlist')} 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                <ArrowLeft className="mr-3 h-5 w-5" />
                กลับไปหน้ารายการ
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  if (!item) return <div className="text-center py-8 text-red-500">ไม่พบข้อมูล</div>;

  const handleSave = async () => {
    try {
      setLoading(true);

      // Upload new image files
      const uploadedImageUrls: string[] = [];
      for (const file of imageFiles) {
        const uploadRes = await sharedService.uploadImage(file);
        if (uploadRes.data?.imageUrl) {
          uploadedImageUrls.push(uploadRes.data.imageUrl);
        }
      }

      // Combine existing image URLs with newly uploaded ones
      const finalImages = [...(editItem.imageUrls || []), ...uploadedImageUrls].filter(url => url.trim() !== '');

      // Prepare update data with proper validation
      const updatedData: any = {};
      
      // Always include essential fields to ensure backend validation passes
      // Use editItem values if available, otherwise fallback to item values
      const titleValue = editItem?.title || item?.title;
      if (titleValue && titleValue.trim()) {
        updatedData.item_name = titleValue.trim();
      }
      
      const descriptionValue = editItem?.description || item?.description;
      if (descriptionValue && descriptionValue.trim()) {
        updatedData.description_detail = descriptionValue.trim();
      }
      
      const quantityValue = editItem?.quantity_needed || item?.quantity_needed;
      if (quantityValue && Number(quantityValue) > 0) {
        updatedData.quantity_needed = Number(quantityValue);
      }
      
      // Handle urgency_level - this is the most important field for the current issue
      const priorityValue = editItem?.priority_level || item?.priority_level;
      
      // Map frontend priority values to backend urgency_level values
      if (priorityValue === 'low') {
        updatedData.urgency_level = 'normal';
      } else if (priorityValue === 'medium') {
        updatedData.urgency_level = 'urgent';
      } else if (priorityValue === 'high') {
        updatedData.urgency_level = 'very_urgent';
      } else if (priorityValue === 'urgent') {
        updatedData.urgency_level = 'extremely_urgent';
      } else if (['normal', 'urgent', 'very_urgent', 'extremely_urgent'].includes(priorityValue)) {
        // If already in backend format, use as is
        updatedData.urgency_level = priorityValue;
      } else {
        updatedData.urgency_level = 'normal';
      }
      
      const unitValue = editItem?.quantity_unit || item?.quantity_unit;
      if (unitValue && unitValue.trim()) {
        updatedData.quantity_unit = unitValue.trim();
      }
      
      const categoryId = Number(editItem?.category_id || item?.category_id);
      if (categoryId && categoryId > 0) {
        updatedData.category_id = categoryId;
      }
      
      if (finalImages.length > 0) {
        updatedData.example_image_url = finalImages[0];
      } else if (item?.images && item.images.length > 0) {
        updatedData.example_image_url = item.images[0];
      }
      
      // Ensure we have at least one field to update
      if (Object.keys(updatedData).length === 0) {
        toast({
          title: "ข้อผิดพลาด",
          description: "ไม่สามารถอัปเดตข้อมูลได้ กรุณาลองใหม่อีกครั้ง",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      
      // Client-side validation
      const validationErrors: string[] = [];
      
      if (!updatedData.item_name || !updatedData.item_name.trim()) {
        validationErrors.push('กรุณากรอกชื่อรายการ');
      } else if (updatedData.item_name.length > 255) {
        validationErrors.push('ชื่อรายการต้องไม่เกิน 255 ตัวอักษร');
      }
      
      if (!updatedData.quantity_needed || updatedData.quantity_needed <= 0 || !Number.isInteger(updatedData.quantity_needed)) {
        validationErrors.push('จำนวนที่ต้องการต้องเป็นจำนวนเต็มบวก');
      }
      
      if (!updatedData.quantity_unit || !updatedData.quantity_unit.trim()) {
        validationErrors.push('กรุณากรอกหน่วยนับ');
      } else if (updatedData.quantity_unit.length > 50) {
        validationErrors.push('หน่วยนับต้องไม่เกิน 50 ตัวอักษร');
      }
      
      if (!updatedData.category_id || updatedData.category_id <= 0 || !Number.isInteger(updatedData.category_id)) {
        validationErrors.push('กรุณาเลือกหมวดหมู่ที่ถูกต้อง');
      }
      
      if (!updatedData.urgency_level || !['normal', 'urgent', 'very_urgent', 'extremely_urgent'].includes(updatedData.urgency_level)) {
        validationErrors.push('กรุณาเลือกระดับความเร่งด่วน');
      }
      
      if (validationErrors.length > 0) {
        console.log('Validation errors:', validationErrors);
        toast({
          title: "กรุณาตรวจสอบข้อมูล",
          description: validationErrors.join('\n'),
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      
      console.log('All validation passed, proceeding with update...');
      console.log('=== DEBUG UPDATE WISHLIST ITEM ===');
      console.log('editItem:', editItem);
      console.log('item:', item);
      console.log('editItem?.priority_level:', editItem?.priority_level);
      console.log('item?.priority_level:', item?.priority_level);
      console.log('priorityValue used:', editItem?.priority_level);
      console.log('Sending update data:', updatedData);
      console.log('Update data keys:', Object.keys(updatedData));
      console.log('Update data values:', Object.values(updatedData));
      console.log('Is updatedData empty?', Object.keys(updatedData).length === 0);
      console.log('Item ID:', item.id);
      console.log('API endpoint:', `/api/foundation/wishlist-items/${item.id}`);
      console.log('Required fields check:');
      console.log('- item_name:', updatedData.item_name);
      console.log('- quantity_needed:', updatedData.quantity_needed);
      console.log('- quantity_unit:', updatedData.quantity_unit);
      console.log('- category_id:', updatedData.category_id);
      console.log('- urgency_level:', updatedData.urgency_level);
      console.log('- description_detail:', updatedData.description_detail);
      console.log('- example_image_url:', updatedData.example_image_url);
      
      console.log('=== SENDING REQUEST TO BACKEND ===');
      console.log('Request URL:', `/api/foundation/wishlist-items/${item.id}`);
      console.log('Request method: PUT');
      console.log('Request payload:', JSON.stringify(updatedData, null, 2));
      console.log('Request payload type:', typeof updatedData);
      console.log('Request payload keys:', Object.keys(updatedData));
      console.log('Request payload values:', Object.values(updatedData));
      
      const updateResult = await foundationService.updateWishlistItem(item.id, updatedData);
      console.log('Update result:', updateResult);
      toast({
        title: "บันทึกสำเร็จ",
        description: "ข้อมูลรายการที่ต้องการได้รับการอัปเดตแล้ว",
      });
      setIsEditing(false);
      // Navigate to foundation wishlist page
      navigate('/foundation/wishlist');
      // Re-fetch item to get the latest data after saving
      const res = await publicService.getWishlistItemById(id!);
      const ww = res.data as any;
        setItem({
          id: String(ww.wishlist_item_id),
          title: ww.item_name,
          description: ww.description_detail,
          quantity_needed: ww.quantity_needed,
          quantity_received: ww.quantity_received,
          priority_level: mapUrgencyToPriority(ww.urgency_level), // Use new mapping
          images: ww.example_image_url ? [ww.example_image_url] : [],
          foundation_name: ww.foundation?.foundation_name || ww.foundation?.city || '',
          foundation_id: ww.foundation_id ? String(ww.foundation_id) : undefined,
          category: ww.category?.name || '',
          category_id: ww.category_id || '',
          quantity_unit: ww.quantity_unit || '',
        });
    } catch (e: any) {
      console.error('=== ERROR SAVING WISHLIST ITEM ===');
      console.error('Full error object:', e);
      console.error('Error response:', e?.response);
      console.error('Error response data:', e?.response?.data);
      console.error('Error message:', e?.message);
      
      let errorMessage = 'ไม่สามารถบันทึกข้อมูลได้';
      
      // Handle specific validation errors
      if (e?.response?.status === 400) {
        if (e?.response?.data?.missing_fields && e?.response?.data?.missing_fields.length > 0) {
          const missingFields = e.response.data.missing_fields;
          const fieldNames = missingFields.map((field: string) => {
            switch (field) {
              case 'item_name': return 'ชื่อรายการ';
              case 'description_detail': return 'รายละเอียด';
              case 'quantity_needed': return 'จำนวนที่ต้องการ';
              case 'quantity_unit': return 'หน่วยนับ';
              case 'category_id': return 'หมวดหมู่';
              case 'urgency_level': return 'ระดับความเร่งด่วน';
              default: return field;
            }
          }).join(', ');
          errorMessage = `กรุณากรอกข้อมูลให้ครบถ้วน: ${fieldNames}`;
        } else if (e?.response?.data?.message) {
          errorMessage = e.response.data.message;
        } else if (e?.response?.data?.error) {
          errorMessage = e.response.data.error;
        }
      } else if (e?.response?.data?.message) {
        errorMessage += ': ' + e.response.data.message;
      } else if (e?.response?.data?.error) {
        errorMessage += ': ' + e.response.data.error;
      } else if (e?.message) {
        errorMessage += ': ' + e.message;
      }
      
      toast({
        title: "เกิดข้อผิดพลาด",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute inset-0">
              <div className="absolute top-10 left-10 w-12 h-12 bg-white/10 rounded-full animate-pulse"></div>
              <div className="absolute top-32 right-20 w-10 h-10 bg-white/10 rounded-full animate-pulse delay-1000"></div>
              <div className="absolute bottom-20 left-1/4 w-8 h-8 bg-white/10 rounded-full animate-pulse delay-2000"></div>
            </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-6">
                <Button
                  onClick={() => navigate('/wishlist')}
                  className="bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 transition-all duration-300 rounded-xl px-6 py-3 font-semibold shadow-lg"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  กลับ
                </Button>
                <div>
                  <h1 className="text-5xl font-bold text-white mb-2">รายละเอียดรายการ</h1>
                  <p className="text-white/80 text-xl">ข้อมูลรายการความต้องการจากมูลนิธิ</p>
                </div>
              </div>
              
              {isFoundation && (
                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`${isEditing 
                    ? 'bg-red-500/20 backdrop-blur-sm border border-red-300/30 text-red-100 hover:bg-red-500/30' 
                    : 'bg-green-500/20 backdrop-blur-sm border border-green-300/30 text-green-100 hover:bg-green-500/30'
                  } transition-all duration-300 rounded-xl px-6 py-3 font-semibold shadow-lg`}
                >
                  {isEditing ? (
                    <>
                      <X className="h-5 w-5 mr-2" />
                      ยกเลิก
                    </>
                  ) : (
                    <>
                      <Edit className="h-5 w-5 mr-2" />
                      แก้ไข
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b border-gray-200/50">
                <CardTitle className="flex justify-between items-center">
                  <Input
                    value={isEditing ? (editItem?.title || '') : item.title}
                    onChange={(e) => setEditItem({ ...editItem, title: e.target.value })}
                    readOnly={!isEditing}
                    className="text-3xl font-bold bg-transparent border-0 focus:ring-0 p-0 text-gray-800"
                  />
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid gap-8">
                  <div className="grid gap-4">
                    <Label htmlFor="category" className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                      <Gift className="h-5 w-5 text-blue-500" />
                      หมวดหมู่
                    </Label>
                    <Select
                      value={isEditing ? (editItem?.category_id || '') : item.category_id}
                      onValueChange={(value) => setEditItem({ ...editItem, category_id: value })}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className="h-12 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200/50 rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all duration-300">
                        <SelectValue>
                          {isEditing 
                            ? categories.find(cat => String(cat.category_id) === editItem?.category_id)?.name || 'เลือกหมวดหมู่'
                            : item.category || 'ไม่ระบุหมวดหมู่'
                          }
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-xl">
                        {categories.map((cat: any) => (
                          <SelectItem key={cat.category_id} value={String(cat.category_id)} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-lg">
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-4">
                    <Label htmlFor="priority" className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                      <Heart className="h-5 w-5 text-red-500" />
                      ระดับความสำคัญ
                    </Label>
                    <Select
                      value={isEditing ? (editItem?.priority_level || 'normal') : (() => {
                        if (item.priority_level === 'ปกติ') return 'normal';
                        if (item.priority_level === 'สำคัญ') return 'urgent';
                        if (item.priority_level === 'สำคัญมาก') return 'very_urgent';
                        if (item.priority_level === 'เร่งด่วน') return 'extremely_urgent';
                        return 'normal';
                      })()} 
                      onValueChange={(value) => setEditItem({ ...editItem, priority_level: value })}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className="h-12 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200/50 rounded-xl focus:ring-2 focus:ring-red-500/20 transition-all duration-300">
                        <SelectValue>
                          {isEditing 
                            ? mapUrgencyToPriority(editItem?.priority_level || 'normal') 
                            : item.priority_level
                          }
                        </SelectValue>
                      </SelectTrigger>
                       <SelectContent className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-xl">
                         <SelectItem value="normal" className="hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 rounded-lg">ปกติ</SelectItem>
                         <SelectItem value="urgent" className="hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 rounded-lg">สำคัญ</SelectItem>
                         <SelectItem value="very_urgent" className="hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 rounded-lg">สำคัญมาก</SelectItem>
                         <SelectItem value="extremely_urgent" className="hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 rounded-lg">เร่งด่วน</SelectItem>
                       </SelectContent>
                     </Select>
                   </div>

                   <div className="grid gap-4">
                     <Label htmlFor="description" className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                       <Users className="h-5 w-5 text-green-500" />
                       รายละเอียด
                     </Label>
                     <Textarea
                       value={isEditing ? (editItem?.description || '') : item.description}
                       onChange={(e) => setEditItem({ ...editItem, description: e.target.value })}
                       readOnly={!isEditing}
                       className="min-h-[120px] bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200/50 rounded-xl focus:ring-2 focus:ring-green-500/20 transition-all duration-300 resize-none"
                       placeholder="กรอกรายละเอียดของรายการที่ต้องการ..."
                     />
                   </div>

                   <div className="grid grid-cols-2 gap-6">
                     <div className="grid gap-4">
                       <Label htmlFor="quantity_needed" className="text-lg font-semibold text-gray-700">จำนวนที่ต้องการ</Label>
                       <Input
                         type="number"
                         value={isEditing ? (editItem?.quantity_needed || '') : item.quantity_needed}
                         onChange={(e) => setEditItem({ ...editItem, quantity_needed: e.target.value })}
                         readOnly={!isEditing}
                         className="h-12 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200/50 rounded-xl focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
                         placeholder="0"
                       />
                     </div>
                     <div className="grid gap-4">
                       <Label htmlFor="quantity_unit" className="text-lg font-semibold text-gray-700">หน่วย</Label>
                       <Input
                         value={isEditing ? (editItem?.quantity_unit || '') : item.quantity_unit}
                         onChange={(e) => setEditItem({ ...editItem, quantity_unit: e.target.value })}
                         readOnly={!isEditing}
                         className="h-12 bg-gradient-to-r from-pink-50 to-orange-50 border-2 border-pink-200/50 rounded-xl focus:ring-2 focus:ring-pink-500/20 transition-all duration-300"
                         placeholder="ชิ้น, กิโลกรัม, ลิตร..."
                       />
                     </div>
                   </div>

                   <div className="grid gap-4">
                     <Label htmlFor="images" className="text-lg font-semibold text-gray-700">รูปภาพ</Label>
                     {/* Display existing image URLs */}
                     {isEditing && editItem?.imageUrls && editItem.imageUrls.length > 0 && (
                       <div className="flex flex-wrap gap-4 mb-4">
                         <div className="relative group">
                           <img src={editItem.imageUrls[0]} alt="Existing" className="w-32 h-32 object-cover rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300" />
                           <Button
                             type="button"
                             size="icon"
                             variant="ghost"
                             className="absolute -top-2 -right-2 h-8 w-8 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg"
                             onClick={() => setEditItem({ ...editItem, imageUrls: [] })}
                           >
                             <XCircle className="w-4 h-4" />
                           </Button>
                         </div>
                       </div>
                     )}
                     {/* Display newly selected image files (if any) */}
                     {isEditing && imageFiles.length > 0 && (
                       <div className="flex items-center gap-3 mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200/50">
                         <span className="text-sm font-medium text-gray-700">{imageFiles[0].name}</span>
                         <Button type="button" size="icon" variant="ghost" onClick={() => setImageFiles([])} className="h-6 w-6 text-red-500 hover:text-red-700">
                           <XCircle className="w-4 h-4" />
                         </Button>
                       </div>
                     )}
                     {isEditing && (
                       <Input 
                         type="file" 
                         onChange={(e) => {
                           if (e.target.files) {
                             setImageFiles(Array.from(e.target.files).slice(0, 1)); // Only allow one file
                           }
                         }} 
                         className="h-12 bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200/50 rounded-xl focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gradient-to-r file:from-orange-500 file:to-yellow-500 file:text-white file:font-semibold hover:file:from-orange-600 hover:file:to-yellow-600" 
                         accept="image/*"
                       />
                     )}
                     {!isEditing && item.images && item.images.length > 0 && (
                       <div className="flex flex-wrap gap-4">
                         <img src={item.images[0]} alt="Item" className="w-32 h-32 object-cover rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300" />
                       </div>
                     )}
                     {!isEditing && (!item.images || item.images.length === 0) && (
                       <div className="p-8 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300 text-center">
                         <p className="text-gray-500 text-lg">ไม่มีรูปภาพ</p>
                       </div>
                     )}
                   </div>

                   <div className="grid gap-4">
                     <Label htmlFor="foundation_name" className="text-lg font-semibold text-gray-700">มูลนิธิ</Label>
                     <Input 
                       id="foundation_name" 
                       value={item.foundation_name} 
                       readOnly 
                       className="h-12 bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200/50 rounded-xl text-gray-700 font-medium" 
                     />
                   </div>

                   {/* Action Buttons */}
                   <div className="flex gap-4 pt-6">
                     {isEditing && (
                       <Button 
                         onClick={handleSave} 
                         size="lg"
                         className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300"
                       >
                         <Save className="mr-3 h-5 w-5" />
                         บันทึกการเปลี่ยนแปลง
                       </Button>
                     )}

                     {!isFoundation && !isEditing && (
                       <Button 
                         onClick={() => navigate(`/donor/pledge-form?wishlist_item_id=${item.id}`)} 
                         size="lg"
                         className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300"
                       >
                         <Heart className="mr-3 h-5 w-5" />
                         บริจาคสิ่งนี้
                       </Button>
                     )}
                   </div>
                 </div>
               </CardContent>
             </Card>
           </div>
         </section>
       </div>
    </Layout>
  );
};

export default WishlistDetail;
