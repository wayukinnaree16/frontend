import React, { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { FoundationSideMenu } from './FoundationSideMenu';
import { foundationService } from '@/services/foundation.service';
import { publicService } from '@/services/public.service';
import { sharedService } from '@/services/shared.service'; // Import sharedService
import { WishlistItemCard } from '@/components/cards/WishlistItemCard';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogAction, AlertDialogCancel, AlertDialogDescription } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, XCircle } from 'lucide-react'; // Added XCircle for removing images

const defaultForm = {
  title: '',
  description: '',
  quantity_needed: 1,
  priority_level: 'medium',
  expiry_date: '',
  category_id: '',
  imageFiles: [] as File[], // To store actual File objects for new uploads
  imageUrls: [] as string[], // To store existing image URLs or new uploaded URLs
  quantity_unit: '',
};

const FoundationWishlist = () => {
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [itemsRes, catRes] = await Promise.all([
        foundationService.getMyWishlistItems(),
        publicService.getItemCategories(),
      ]);
      // Map real API response to UI model
      let apiItems: any[] = [];
      if (itemsRes.data && 'wishlistItems' in itemsRes.data && Array.isArray((itemsRes.data as any).wishlistItems)) {
        apiItems = (itemsRes.data as any).wishlistItems;
      } else if (itemsRes.data && 'wishlist_items' in itemsRes.data && Array.isArray((itemsRes.data as any).wishlist_items)) {
        apiItems = (itemsRes.data as any).wishlist_items;
      }
      const mappedItems = apiItems.map((item: any) => ({
        id: item.wishlist_item_id,
        title: item.title || item.item_name,
        description: item.description || item.description_detail,
        quantity_needed: item.quantity_needed,
        quantity_received: item.quantity_received,
        priority_level: item.priority_level || item.urgency_level === 'urgent' ? 'urgent' : (item.urgency_level === 'high' ? 'high' : (item.urgency_level === 'medium' ? 'medium' : 'low')),
        status: item.status,
        expiry_date: item.expiry_date ? item.expiry_date.slice(0, 10) : (item.posted_date ? item.posted_date.slice(0, 10) : ''),
        images: item.images && item.images.length > 0 ? item.images : (item.example_image_url ? [item.example_image_url] : []),
        foundation_name: item.foundation?.foundation_name,
        foundation_id: item.foundation_id,
        category: item.category,
        category_id: item.category_id,
        quantity_unit: item.quantity_unit,
        updated_at: item.updated_at,
      }));
      setItems(mappedItems);
      // Map categories
      let catData = [];
      if (Array.isArray(catRes.data)) {
        catData = catRes.data;
      } else if (Array.isArray((catRes.data as any)?.item_categories)) {
        catData = (catRes.data as any).item_categories;
      }
      const mappedCategories = catData.map((cat: any) => ({
        id: cat.category_id || cat.id,
        name: cat.name,
      }));
      setCategories(mappedCategories);
    } catch (e) {
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(defaultForm);
    setDialogOpen(true);
  };

  const openEdit = (item: any) => {
    setEditing(item);
    setForm({
      title: item.title || item.item_name || '',
      description: item.description || item.description_detail || '',
      quantity_needed: item.quantity_needed || 1,
      priority_level: item.priority_level || item.urgency_level || 'medium',
      expiry_date: item.expiry_date ? item.expiry_date.slice(0, 10) : (item.posted_date ? item.posted_date.slice(0, 10) : ''),
      category_id: item.category_id ? String(item.category_id) : '',
      imageFiles: [], // No files initially when editing
      imageUrls: item.images && item.images.length > 0 ? item.images : (item.example_image_url ? [item.example_image_url] : []),
      quantity_unit: item.quantity_unit || '',
    });
    setDialogOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value: string) => {
    setForm((prev: any) => ({ ...prev, category_id: value }));
  };

  const handlePriorityChange = (value: string) => {
    setForm((prev: any) => ({ ...prev, priority_level: value }));
  };

  const handleUnitChange = (value: string) => {
    setForm((prev: any) => ({ ...prev, quantity_unit: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setForm((prev: any) => ({
        ...prev,
        imageFiles: [...prev.imageFiles, ...Array.from(e.target.files)],
      }));
    }
  };

  const removeImageFile = (index: number) => {
    setForm((prev: any) => {
      const newImageFiles = [...prev.imageFiles];
      newImageFiles.splice(index, 1);
      return { ...prev, imageFiles: newImageFiles };
    });
  };

  const removeImageUrl = (index: number) => {
    setForm((prev: any) => {
      const newImageUrls = [...prev.imageUrls];
      newImageUrls.splice(index, 1);
      return { ...prev, imageUrls: newImageUrls };
    });
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditing(null);
    setForm(defaultForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Upload new image files
      const uploadedImageUrls: string[] = [];
      for (const file of form.imageFiles) {
        const uploadRes = await sharedService.uploadImage(file);
        if (uploadRes.data?.imageUrl) {
          uploadedImageUrls.push(uploadRes.data.imageUrl);
        }
      }

      // Combine existing image URLs with newly uploaded ones
      const finalImages = [...form.imageUrls, ...uploadedImageUrls].filter(url => url.trim() !== '');

      // Map frontend priority_level to backend urgency_level
      const mapPriorityToUrgency = (priority: string) => {
        if (priority === 'low') return 'normal';
        if (priority === 'medium') return 'urgent';
        if (priority === 'high' || priority === 'urgent') return 'very_urgent';
        return 'normal';
      };

      if (editing) {
        // Map frontend fields to backend schema fields
        const updateBody = {
          item_name: form.title,
          description_detail: form.description,
          quantity_needed: Number(form.quantity_needed),
          quantity_unit: form.quantity_unit,
          urgency_level: mapPriorityToUrgency(form.priority_level),
          // Backend uses example_image_url (single). Use the first image if available.
          example_image_url: finalImages.length > 0 ? finalImages[0] : undefined,
        };
        console.log('UPDATE BODY', updateBody);
        const res = await foundationService.updateWishlistItem(editing.id || editing.wishlist_item_id, updateBody);
        // Update local state immediately
        if (res.data && res.data.wishlist_item) {
          const updated = res.data.wishlist_item;
          setItems(prev => prev.map(item =>
            item.id === updated.id
              ? {
                  ...item,
                  ...updated,
                  title: updated.title || item.title,
                  description: updated.description || item.description,
                  priority_level: updated.priority_level || item.priority_level,
                  expiry_date: updated.expiry_date ? updated.expiry_date.slice(0, 10) : '',
                  images: Array.isArray(updated.images) && updated.images.length > 0 ? updated.images : [],
                }
              : item
          ));
        }
        toast({ title: 'แก้ไขรายการสำเร็จ' });
      } else {
        // Map frontend fields to backend schema for CREATE
        const mapPriorityToUrgency = (priority: string) => {
          if (priority === 'low') return 'normal';
          if (priority === 'medium') return 'urgent';
          if (priority === 'high' || priority === 'urgent') return 'very_urgent';
          return 'normal';
        };
        const createBody = {
          item_name: form.title,
          description_detail: form.description,
          quantity_needed: Number(form.quantity_needed),
          quantity_unit: form.quantity_unit,
          category_id: Number(form.category_id),
          urgency_level: mapPriorityToUrgency(form.priority_level),
          // Backend accepts single example_image_url; use the first if present
          example_image_url: finalImages.length > 0 ? finalImages[0] : undefined,
        };
        console.log('CREATE BODY', createBody);
        await foundationService.createWishlistItem(createBody as any);
        toast({ title: 'สร้างรายการสำเร็จ' });
      }
      handleDialogClose();
      fetchData();
    } catch (e: any) {
      console.error('Error saving wishlist item:', e);
      toast({ title: 'เกิดข้อผิดพลาด', description: e.response?.data?.message || e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await foundationService.deleteWishlistItem(deleteId);
      toast({ title: 'ลบรายการสำเร็จ' });
      setDeleteId(null);
      fetchData();
    } catch {
      toast({ title: 'เกิดข้อผิดพลาด', variant: 'destructive' });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex flex-1">
        <FoundationSideMenu />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">จัดการรายการที่ต้องการ</h1>
            <Button onClick={openCreate}>
              <Plus className="mr-2" /> สร้างรายการใหม่
            </Button>
          </div>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : Array.isArray(items) && items.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <div key={item.id} className="relative group">
                  <WishlistItemCard item={{
                    ...item,
                    category: item.category?.name || item.category || '',
                    foundation_name: undefined,
                  }} showFoundation={false} />
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="secondary" onClick={() => openEdit(item)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="icon" variant="destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
                          <AlertDialogDescription>คุณต้องการลบรายการนี้หรือไม่?</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                          <AlertDialogAction onClick={() => { setDeleteId(item.id); setTimeout(handleDelete, 100); }} disabled={deleting}>
                            {deleting ? 'กำลังลบ...' : 'ลบ'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">ยังไม่มีรายการที่ต้องการ</div>
          )}

          {/* Create/Edit Dialog */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? 'แก้ไขรายการที่ต้องการ' : 'สร้างรายการที่ต้องการ'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block mb-1 font-medium">ชื่อรายการ</label>
                  <Input name="title" value={form.title} onChange={handleFormChange} required />
                </div>
                <div>
                  <label className="block mb-1 font-medium">รายละเอียด</label>
                  <Textarea name="description" value={form.description} onChange={handleFormChange} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-medium">จำนวนที่ต้องการ</label>
                    <Input type="number" name="quantity_needed" value={form.quantity_needed} onChange={handleFormChange} min={1} required />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">หน่วย</label>
                    <Select value={form.quantity_unit} onValueChange={handleUnitChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกหน่วย" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ชิ้น">ชิ้น</SelectItem>
                        <SelectItem value="กล่อง">กล่อง</SelectItem>
                        <SelectItem value="ชุด">ชุด</SelectItem>
                        <SelectItem value="กิโลกรัม">กิโลกรัม</SelectItem>
                        <SelectItem value="ลิตร">ลิตร</SelectItem>
                        <SelectItem value="อื่นๆ">อื่นๆ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="block mb-1 font-medium">ระดับความสำคัญ</label>
                  <Select value={form.priority_level} onValueChange={handlePriorityChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกความสำคัญ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">ปกติ</SelectItem>
                      <SelectItem value="medium">สำคัญ</SelectItem>
                      <SelectItem value="high">สำคัญมาก</SelectItem>
                      <SelectItem value="urgent">เร่งด่วน</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block mb-1 font-medium">หมวดหมู่</label>
                  <Select value={form.category_id} onValueChange={handleCategoryChange} disabled={!!editing}>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกหมวดหมู่" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.filter((cat: any) => cat.id !== undefined && cat.name).map((cat: any) => (
                        <SelectItem key={String(cat.id)} value={String(cat.id)}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {editing && (
                    <div className="text-xs text-muted-foreground mt-1">
                      ไม่สามารถเปลี่ยนหมวดหมู่ได้หลังจากสร้างรายการแล้ว
                    </div>
                  )}
                </div>
                <div>
                  <label className="block mb-1 font-medium">วันหมดอายุ (ถ้ามี)</label>
                  <Input type="date" name="expiry_date" value={form.expiry_date} onChange={handleFormChange} />
                </div>
                <div>
                  <label className="block mb-1 font-medium">รูปภาพ</label>
                  {/* Display existing image URLs */}
                  {form.imageUrls.map((url: string, idx: number) => (
                    <div key={`url-${idx}`} className="flex items-center gap-2 mb-2">
                      <img src={url} alt={`Existing ${idx}`} className="w-16 h-16 object-cover rounded" />
                      <span className="text-sm truncate">{url}</span>
                      <Button type="button" size="icon" variant="ghost" onClick={() => removeImageUrl(idx)}>
                        <XCircle className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                  {/* Display newly selected image files */}
                  {form.imageFiles.map((file: File, idx: number) => (
                    <div key={`file-${idx}`} className="flex items-center gap-2 mb-2">
                      <span className="text-sm">{file.name}</span>
                      <Button type="button" size="icon" variant="ghost" onClick={() => removeImageFile(idx)}>
                        <XCircle className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                  <Input type="file" multiple onChange={handleFileChange} className="mb-2" />
                </div>
                <DialogFooter>
                  <Button type="submit" className="w-full" disabled={saving}>
                    {saving ? 'กำลังบันทึก...' : (editing ? 'บันทึกการเปลี่ยนแปลง' : 'สร้างรายการ')}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
};

export default FoundationWishlist;
