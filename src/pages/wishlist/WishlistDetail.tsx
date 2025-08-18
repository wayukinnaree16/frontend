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
  const { id } = useParams();
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

  useEffect(() => {
    if (item) {
      setEditItem({
        ...item,
        imageUrls: item.images || [], // Initialize imageUrls with existing images
      });
      setImageFiles([]); // Clear new image files on item change
    }
  }, [item]);

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
          priority_level: ww.urgency_level,
          images: ww.example_image_url ? [ww.example_image_url] : [],
          foundation_name: ww.foundation?.foundation_name || ww.foundation?.city || '',
          foundation_id: ww.foundation_id ? String(ww.foundation_id) : undefined,
          category: ww.category_id || '',
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

  // Helper function to map backend urgency_level to frontend priority_level
  const mapUrgencyToPriority = (urgency: string) => {
    if (urgency === 'normal') return 'ปกติ';
    if (urgency === 'urgent') return 'สำคัญ';
    if (urgency === 'very_urgent') return 'สำคัญมาก';
    return 'ปกติ'; // Default
  };

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

      // Map frontend priority_level to backend urgency_level
      const mapPriorityToUrgency = (priority: string) => {
        if (priority === 'ปกติ') return 'normal';
        if (priority === 'สำคัญ') return 'urgent';
        if (priority === 'สำคัญมาก') return 'very_urgent';
        if (priority === 'เร่งด่วน') return 'very_urgent'; // Assuming "เร่งด่วน" also maps to very_urgent
        return 'normal';
      };

      const updatedData = {
        item_name: editItem.title,
        description_detail: editItem.description,
        quantity_needed: Number(editItem.quantity_needed),
        urgency_level: mapPriorityToUrgency(editItem.priority_level),
        quantity_unit: editItem.quantity_unit,
        example_image_url: finalImages.length > 0 ? finalImages[0] : undefined, // Send only the first image
      };
      await foundationService.updateWishlistItem(item.id, updatedData);
      toast({
        title: "บันทึกสำเร็จ",
        description: "ข้อมูลรายการที่ต้องการได้รับการอัปเดตแล้ว",
      });
      setIsEditing(false);
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
          category: ww.category_id || '',
          quantity_unit: ww.quantity_unit || '',
        });
    } catch (e: any) {
      console.error('Error saving wishlist item', e);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกข้อมูลได้: " + (e?.response?.data?.message || e.message),
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
                  value={isEditing ? (editItem?.priority_level || '') : item.priority_level}
                  onValueChange={(value) => setEditItem({ ...editItem, priority_level: value })}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue>{isEditing ? (editItem?.priority_level ? mapUrgencyToPriority(editItem.priority_level) : "เลือกระดับความสำคัญ") : mapUrgencyToPriority(item.priority_level)}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">ปกติ</SelectItem>
                    <SelectItem value="urgent">สำคัญ</SelectItem>
                    <SelectItem value="very_urgent">สำคัญมาก</SelectItem>
                    <SelectItem value="very_urgent">เร่งด่วน</SelectItem>
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
