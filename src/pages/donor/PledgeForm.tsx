import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { publicService } from '@/services/public.service';
import { donorService } from '@/services/donor.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Gift, Heart, Package, Truck, MapPin, Clock, Send } from 'lucide-react';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await donorService.createPledge({
        wishlist_item_id: Number(wishlist_item_id),
        quantity_pledged: Number(form.quantity_pledged),
        donor_item_description: form.donor_item_description,
        delivery_method: form.delivery_method as any,
        courier_company_name: form.delivery_method === 'courier_service' ? form.courier_company_name : undefined,
        tracking_number: form.delivery_method === 'courier_service' ? form.tracking_number : undefined,
        pickup_address_details: form.delivery_method === 'foundation_pickup' ? form.pickup_address_details : undefined,
        pickup_preferred_datetime: form.delivery_method === 'foundation_pickup' ? form.pickup_preferred_datetime : undefined,
      });
      toast({ title: 'ส่งคำขอบริจาคสำเร็จ!' });
      navigate('/my-pledges');
    } catch (e) {
      toast({ title: 'เกิดข้อผิดพลาด', variant: 'destructive' });
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
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg text-gray-800">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Heart className="w-4 h-4 text-red-500" />
                    <span>ต้องการ: {item.quantity_needed - item.quantity_received} {item.unit}</span>
                  </div>
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