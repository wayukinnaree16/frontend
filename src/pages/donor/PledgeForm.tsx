import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { publicService } from '@/services/public.service';
import { donorService } from '@/services/donor.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Gift, Heart, Package, Truck, MapPin, Clock, Send, Camera, X } from 'lucide-react';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const PledgeForm = () => {
  const query = useQuery();
  const navigate = useNavigate();
  const wishlist_item_id = query.get('wishlist_item_id');
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    quantity_pledged: '',
    donor_item_description: '',
    delivery_method: 'self_delivery',
    courier_company_name: '',
    tracking_number: '',
    pickup_address_details: '',
    pickup_preferred_datetime: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!wishlist_item_id) throw new Error('ไม่พบข้อมูลสิ่งของ');
        const res = await publicService.getWishlistItemById(wishlist_item_id);
        setItem(res.data);
      } catch (e) {
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูลสิ่งของ');
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [wishlist_item_id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // จำกัดจำนวนรูปภาพสูงสุด 5 รูป
    const totalImages = selectedImages.length + files.length;
    if (totalImages > 5) {
      toast({ 
        title: 'จำนวนรูปภาพเกินกำหนด', 
        description: 'สามารถอัปโหลดได้สูงสุด 5 รูป',
        variant: 'destructive' 
      });
      return;
    }

    // ตรวจสอบขนาดไฟล์ (สูงสุด 5MB ต่อไฟล์)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const oversizedFiles = files.filter(file => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      toast({ 
        title: 'ขนาดไฟล์ใหญ่เกินไป', 
        description: 'ขนาดไฟล์ต้องไม่เกิน 5MB',
        variant: 'destructive' 
      });
      return;
    }

    // สร้าง preview URLs
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    
    setSelectedImages(prev => [...prev, ...files]);
    setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  const removeImage = (index: number) => {
    // ลบ preview URL เพื่อป้องกัน memory leak
    URL.revokeObjectURL(imagePreviewUrls[index]);
    
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  // Cleanup preview URLs เมื่อ component unmount
  useEffect(() => {
    return () => {
      imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // ตรวจสอบว่าต้องมีรูปภาพอย่างน้อย 1 รูป
    if (selectedImages.length === 0) {
      toast({ 
        title: 'กรุณาเพิ่มรูปภาพสิ่งของที่บริจาค', 
        description: 'ต้องมีรูปภาพอย่างน้อย 1 รูป',
        variant: 'destructive' 
      });
      return;
    }
    
    setSubmitting(true);
    try {
      // สร้าง FormData เพื่อส่งไฟล์รูปภาพ
      const formData = new FormData();
      formData.append('wishlist_item_id', wishlist_item_id!);
      formData.append('quantity_pledged', form.quantity_pledged);
      formData.append('donor_item_description', form.donor_item_description);
      formData.append('delivery_method', form.delivery_method);
      
      if (form.delivery_method === 'courier_service' && form.courier_company_name) {
        formData.append('courier_company_name', form.courier_company_name);
      }
      if (form.delivery_method === 'courier_service' && form.tracking_number) {
        formData.append('tracking_number', form.tracking_number);
      }
      if (form.delivery_method === 'foundation_pickup' && form.pickup_address_details) {
        formData.append('pickup_address_details', form.pickup_address_details);
      }
      if (form.delivery_method === 'foundation_pickup' && form.pickup_preferred_datetime) {
        formData.append('pickup_preferred_datetime', form.pickup_preferred_datetime);
      }

      // เพิ่มรูปภาพลงใน FormData (ใช้ field name 'pledgeImages' ตาม backend middleware)
      selectedImages.forEach((file, index) => {
        formData.append('pledgeImages', file);
      });

      // ส่งข้อมูลผ่าน FormData โดยใช้ apiClient
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/api/donor/pledges`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'เกิดข้อผิดพลาด');
      }

      toast({ title: 'ส่งคำขอบริจาคสำเร็จ!' });
      navigate('/my-pledges');
    } catch (e: any) {
      toast({ title: e.message || 'เกิดข้อผิดพลาด', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

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

  if (error || !item) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-pink-50">
          <div className="container mx-auto px-4 py-20">
            <div className="text-center max-w-2xl mx-auto">
              <div className="inline-block p-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-3xl mb-8 animate-bounce">
                <div className="bg-white rounded-2xl px-8 py-4">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-pink-600 font-semibold text-lg">เกิดข้อผิดพลาด</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">{error || 'ไม่พบข้อมูล'}</h3>
              <Button 
                onClick={() => navigate(-1)}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold px-8 py-3 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                กลับ
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-12 h-12 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-10 h-10 bg-gradient-to-br from-orange-400/20 to-pink-400/20 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-gradient-to-br from-purple-400/15 to-pink-400/15 rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}}></div>
        </div>
        
        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="max-w-2xl mx-auto">
            {/* Enhanced Header */}
            <div className="text-center mb-12">
              <div className="inline-block p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-6 animate-glow">
                <Gift className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient-shift">
                ฟอร์มบริจาคสิ่งของ
              </h1>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
                กรอกข้อมูลเพื่อบริจาคสิ่งของให้กับมูลนิธิ
              </p>
            </div>

            {/* Enhanced Item Display */}
            <Card className="glass rounded-2xl border border-white/20 shadow-2xl backdrop-blur-xl mb-8">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <CardTitle className="text-xl bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                    รายละเอียดสิ่งของ
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-semibold text-lg text-gray-800">{item.title}</h3>
                    {item.priority_level && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.priority_level === 'urgent' ? 'bg-red-100 text-red-800' :
                        item.priority_level === 'high' ? 'bg-orange-100 text-orange-800' :
                        item.priority_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {item.priority_level === 'urgent' ? 'เร่งด่วนมาก' :
                         item.priority_level === 'high' ? 'เร่งด่วน' :
                         item.priority_level === 'medium' ? 'ปานกลาง' : 'ปกติ'}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                  
                  <div className="space-y-2">
                    {item.category && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Package className="w-4 h-4 text-blue-500" />
                        <span className="font-medium">หมวดหมู่:</span>
                        <span>{typeof item.category === 'object' ? item.category.name : item.category}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span className="font-medium">ต้องการ:</span>
                      <span>{item.quantity_needed - item.quantity_received} {item.unit}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Gift className="w-4 h-4 text-green-500" />
                      <span className="font-medium">ได้รับแล้ว:</span>
                      <span>{item.quantity_received} {item.unit}</span>
                    </div>
                    
                    {item.foundation_name && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-purple-500" />
                        <span className="font-medium">มูลนิธิ:</span>
                        <span>{item.foundation_name}</span>
                      </div>
                    )}
                  </div>
                  
                  {item.images && item.images.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-600 mb-2 block">รูปตัวอย่าง:</span>
                      <div className="flex gap-2 overflow-x-auto">
                        {item.images.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`ตัวอย่าง ${index + 1}`}
                            className="w-16 h-16 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            {/* Enhanced Form */}
            <Card className="glass rounded-2xl border border-white/20 shadow-2xl backdrop-blur-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                    <Heart className="w-5 h-5 text-white" />
                  </div>
                  <CardTitle className="text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    ข้อมูลการบริจาค
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">จำนวนที่บริจาค</label>
                    <Input
                      name="quantity_pledged"
                      type="number"
                      min={1}
                      max={item.quantity_needed - item.quantity_received}
                      value={form.quantity_pledged}
                      onChange={handleChange}
                      required
                      className="h-12 text-lg bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                      placeholder="กรอกจำนวน"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">คำอธิบายสิ่งของ</label>
                    <textarea
                      name="donor_item_description"
                      className="w-full h-24 text-lg bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 p-4 resize-none"
                      rows={3}
                      value={form.donor_item_description}
                      onChange={handleChange}
                      required
                      placeholder="อธิบายรายละเอียดสิ่งของที่จะบริจาค"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Camera className="inline w-4 h-4 mr-2" />
                      รูปภาพสิ่งของที่บริจาค <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-4">
                      {/* Upload Button */}
                      <div className="relative">
                        <input
                          type="file"
                          id="image-upload"
                          multiple
                          accept="image/*"
                          onChange={handleImageSelect}
                          className="hidden"
                        />
                        <label
                          htmlFor="image-upload"
                          className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
                        >
                          <div className="text-center">
                            <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">คลิกเพื่อเลือกรูปภาพ</p>
                            <p className="text-xs text-gray-400 mt-1">สูงสุด 5 รูป, ขนาดไม่เกิน 5MB ต่อรูป</p>
                          </div>
                        </label>
                      </div>

                      {/* Image Previews */}
                      {imagePreviewUrls.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {imagePreviewUrls.map((url, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={url}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">วิธีการจัดส่ง</label>
                    <div className="relative">
                      <Truck className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <select
                        name="delivery_method"
                        className="w-full h-12 pl-12 pr-4 text-lg bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 appearance-none cursor-pointer"
                        value={form.delivery_method}
                        onChange={handleChange}
                      >
                        <option value="self_delivery">นำส่งด้วยตนเอง</option>
                        <option value="courier_service">ส่งผ่านบริษัทขนส่ง</option>
                        <option value="foundation_pickup">ให้มูลนิธิเข้ารับ</option>
                      </select>
                    </div>
                  </div>
                  {form.delivery_method === 'courier_service' && (
                    <div className="space-y-6 p-4 bg-gradient-to-r from-orange-50 to-pink-50 rounded-xl border border-orange-200">
                      <div className="flex items-center gap-2 mb-4">
                        <Package className="w-5 h-5 text-orange-500" />
                        <span className="font-semibold text-orange-700">ข้อมูลการขนส่ง</span>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">ชื่อบริษัทขนส่ง</label>
                        <Input
                          name="courier_company_name"
                          value={form.courier_company_name}
                          onChange={handleChange}
                          required
                          className="h-12 text-lg bg-white border-2 border-orange-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200"
                          placeholder="เช่น Kerry, Flash Express"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">เลขพัสดุ</label>
                        <Input
                          name="tracking_number"
                          value={form.tracking_number}
                          onChange={handleChange}
                          required
                          className="h-12 text-lg bg-white border-2 border-orange-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200"
                          placeholder="กรอกเลขพัสดุ"
                        />
                      </div>
                    </div>
                  )}
                  {form.delivery_method === 'foundation_pickup' && (
                    <div className="space-y-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
                      <div className="flex items-center gap-2 mb-4">
                        <MapPin className="w-5 h-5 text-green-500" />
                        <span className="font-semibold text-green-700">ข้อมูลการรับสิ่งของ</span>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">ที่อยู่สำหรับเข้ารับ</label>
                        <Input
                          name="pickup_address_details"
                          value={form.pickup_address_details}
                          onChange={handleChange}
                          required
                          className="h-12 text-lg bg-white border-2 border-green-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200"
                          placeholder="กรอกที่อยู่ที่สะดวกให้เข้ารับ"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">วันเวลาที่สะดวก</label>
                        <div className="relative">
                          <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <Input
                            name="pickup_preferred_datetime"
                            type="datetime-local"
                            value={form.pickup_preferred_datetime}
                            onChange={handleChange}
                            required
                            className="h-12 pl-12 text-lg bg-white border-2 border-green-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="pt-6">
                    <Button 
                      type="submit" 
                      className="w-full h-14 text-lg font-bold bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" 
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                          กำลังส่ง...
                        </>
                      ) : (
                        <>
                          <Send className="mr-3 h-6 w-6" />
                          ยืนยันการบริจาค
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PledgeForm;