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
import { XCircle } from 'lucide-react';
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
      'normal': 'ปกติ',
      'urgent': 'สำคัญ',
      'very_urgent': 'สำคัญมาก',
      'extremely_urgent': 'เร่งด่วน'
    };
    return urgencyMap[urgency] || 'ปกติ';
  };

  useEffect(() => {
    if (item) {
      setEditItem({
        ...item,
        // Convert Thai priority_level back to English for editing
        priority_level: (() => {
          if (item.priority_level === 'ปกติ') return 'normal';
          if (item.priority_level === 'สำคัญ') return 'urgent';
          if (item.priority_level === 'สำคัญมาก') return 'very_urgent';
          if (item.priority_level === 'เร่งด่วน') return 'extremely_urgent';
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

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (notFound) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 max-w-2xl">
          <div className="border rounded-lg p-8 text-center">
            <h2 className="text-2xl font-semibold mb-2">ไม่พบรายการที่ต้องการ</h2>
            <p className="text-muted-foreground mb-6">
              รายการนี้อาจถูกปิดรับบริจาค ถูกลบ หรือยังไม่พร้อมสำหรับการแสดงผลสาธารณะ
            </p>
            <div className="flex justify-center gap-3">
              <Button variant="secondary" onClick={() => window.history.back()}>ย้อนกลับ</Button>
              <Button onClick={() => navigate('/wishlist')}>กลับไปหน้ารายการ</Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  if (error || !item) return <div className="text-center py-8 text-red-500">{error || 'ไม่พบข้อมูล'}</div>;

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
      
      // Map Thai priority values to English backend values
      if (priorityValue === 'ปกติ') {
        updatedData.urgency_level = 'normal';
      } else if (priorityValue === 'สำคัญ') {
        updatedData.urgency_level = 'urgent';
      } else if (priorityValue === 'สำคัญมาก') {
        updatedData.urgency_level = 'very_urgent';
      } else if (priorityValue === 'เร่งด่วน') {
        updatedData.urgency_level = 'extremely_urgent';
      } else if (['normal', 'urgent', 'very_urgent', 'extremely_urgent'].includes(priorityValue)) {
        // If already in English format, use as is
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
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <Input
                value={isEditing ? (editItem?.title || '') : item.title}
                onChange={(e) => setEditItem({ ...editItem, title: e.target.value })}
                readOnly={!isEditing}
                className="text-3xl font-bold"
              />
              {isFoundation && (
                <Button onClick={() => setIsEditing(!isEditing)}>
                  {isEditing ? 'ยกเลิก' : 'แก้ไข'}
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">หมวดหมู่</Label>
                <Select
                  value={isEditing ? (editItem?.category_id || '') : item.category_id}
                  onValueChange={(value) => setEditItem({ ...editItem, category_id: value })}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue>
                      {isEditing 
                        ? categories.find(cat => String(cat.category_id) === editItem?.category_id)?.name || 'เลือกหมวดหมู่'
                        : item.category || 'ไม่ระบุหมวดหมู่'
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat: any) => (
                      <SelectItem key={cat.category_id} value={String(cat.category_id)}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="priority">ระดับความสำคัญ</Label>
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
                  <SelectTrigger>
                    <SelectValue>
                      {isEditing 
                        ? mapUrgencyToPriority(editItem?.priority_level || 'normal') 
                        : item.priority_level
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">ปกติ</SelectItem>
                    <SelectItem value="urgent">สำคัญ</SelectItem>
                    <SelectItem value="very_urgent">สำคัญมาก</SelectItem>
                    <SelectItem value="extremely_urgent">เร่งด่วน</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">รายละเอียด</Label>
                <Textarea
                  value={isEditing ? (editItem?.description || '') : item.description}
                  onChange={(e) => setEditItem({ ...editItem, description: e.target.value })}
                  readOnly={!isEditing}
                  className="min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="quantity_needed">จำนวนที่ต้องการ</Label>
                  <Input
                    type="number"
                    value={isEditing ? (editItem?.quantity_needed || '') : item.quantity_needed}
                    onChange={(e) => setEditItem({ ...editItem, quantity_needed: e.target.value })}
                    readOnly={!isEditing}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="quantity_unit">หน่วย</Label>
                  <Input
                    value={isEditing ? (editItem?.quantity_unit || '') : item.quantity_unit}
                    onChange={(e) => setEditItem({ ...editItem, quantity_unit: e.target.value })}
                    readOnly={!isEditing}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="images">รูปภาพ</Label>
                {/* Display existing image URLs */}
                {isEditing && editItem?.imageUrls && editItem.imageUrls.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    <div className="relative">
                      <img src={editItem.imageUrls[0]} alt="Existing" className="w-24 h-24 object-cover rounded" />
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="absolute top-0 right-0 h-6 w-6 text-red-500"
                        onClick={() => setEditItem({ ...editItem, imageUrls: [] })}
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
                {/* Display newly selected image files (if any) */}
                {isEditing && imageFiles.length > 0 && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm">{imageFiles[0].name}</span>
                    <Button type="button" size="icon" variant="ghost" onClick={() => setImageFiles([])}>
                      <XCircle className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                )}
                {isEditing && (
                  <Input type="file" onChange={(e) => {
                    if (e.target.files) {
                      setImageFiles(Array.from(e.target.files).slice(0, 1)); // Only allow one file
                    }
                  }} className="mb-2" />
                )}
                {!isEditing && item.images && item.images.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <img src={item.images[0]} alt="Item" className="w-24 h-24 object-cover rounded" />
                  </div>
                )}
                {!isEditing && (!item.images || item.images.length === 0) && (
                  <p className="text-muted-foreground">ไม่มีรูปภาพ</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="foundation_name">มูลนิธิ</Label>
                <Input id="foundation_name" value={item.foundation_name} readOnly className="bg-gray-100" />
              </div>

              {isEditing && (
                <Button onClick={handleSave} className="mt-4">
                  บันทึกการเปลี่ยนแปลง
                </Button>
              )}

              {!isFoundation && !isEditing && (
                <Button onClick={() => navigate(`/donor/pledge-form?wishlist_item_id=${item.id}`)} className="mt-4">
                  บริจาคสิ่งนี้
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default WishlistDetail;
