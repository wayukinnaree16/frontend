import React, { useEffect, useState } from 'react';
import { foundationService } from '@/services/foundation.service';
import { publicService } from '@/services/public.service';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Header } from '@/components/layout/Header';
import { FoundationSideMenu } from './FoundationSideMenu';

// Define proper types - renamed to avoid conflict with built-in FormData
interface FoundationFormData {
  foundation_name: string;
  logo_url: string;
  history_mission: string;
  foundation_type_id: string;
  address_line1: string;
  address_line2: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;
  gmaps_embed_url: string;
  contact_phone: string;
  contact_email: string;
  website_url: string;
  license_number: string;
  accepts_pickup_service: boolean;
  pickup_service_area: string;
  pickup_contact_info: string;
}

interface FoundationType {
  type_id: number;
  name: string;
  description: string;
}

const FoundationProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [types, setTypes] = useState<FoundationType[]>([]);
  const [typesLoading, setTypesLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  const [form, setForm] = useState<FoundationFormData>({
    foundation_name: '',
    logo_url: '',
    history_mission: '',
    foundation_type_id: '',
    address_line1: '',
    address_line2: '',
    city: '',
    province: '',
    postal_code: '',
    country: 'Thailand',
    gmaps_embed_url: '',
    contact_phone: '',
    contact_email: '',
    website_url: '',
    license_number: '',
    accepts_pickup_service: false,
    pickup_service_area: '',
    pickup_contact_info: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [profileRes, typesRes] = await Promise.all([
          foundationService.getMyProfile(),
          publicService.getFoundationTypesResponse()
        ]);

        const tArray = Array.isArray((typesRes as any)?.data) ? (typesRes as any).data : [];
        const normalizedTypes = tArray.map((item: any) => ({
          type_id: Number(item?.type_id),
          name: String(item?.name ?? ''),
          description: String(item?.description ?? ''),
        }));
        setTypes(normalizedTypes);
        setTypesLoading(false);

        const foundationObj = profileRes?.data;
        setProfile(foundationObj || null);

        if (foundationObj) {
          setForm({
            foundation_name: foundationObj.foundation_name || '',
            logo_url: foundationObj.logo_url || '',
            history_mission: foundationObj.history_mission || '',
            // Fix: Convert to string to match interface
            foundation_type_id: foundationObj.foundation_type_id ? String(foundationObj.foundation_type_id) : '',
            address_line1: foundationObj.address_line1 || '',
            address_line2: foundationObj.address_line2 || '',
            city: foundationObj.city || '',
            province: foundationObj.province || '',
            postal_code: foundationObj.postal_code || '',
            country: foundationObj.country || 'Thailand',
            gmaps_embed_url: foundationObj.gmaps_embed_url || '',
            contact_phone: foundationObj.contact_phone || '',
            contact_email: foundationObj.contact_email || '',
            website_url: foundationObj.website_url || '',
            license_number: foundationObj.license_number || '',
            accepts_pickup_service: foundationObj.accepts_pickup_service ?? false,
            pickup_service_area: foundationObj.pickup_service_area || '',
            pickup_contact_info: foundationObj.pickup_contact_info || '',
          });
        } else {
          setError('ยังไม่ได้สร้างโปรไฟล์มูลนิธิ กรุณากรอกและบันทึกข้อมูลให้ครบถ้วน');
        }
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError('ไม่สามารถโหลดข้อมูลได้');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    clearFieldError(name);
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      clearFieldError('logo_url');
    }
  };

  // Keep only one handleSelectChange function
  const handleSelectChange = (value: string) => {
    clearFieldError('foundation_type_id');
    setForm(prev => ({ ...prev, foundation_type_id: value }));
  };

  const validateForm = (): boolean => {
    setFormErrors({});
    const newErrors: Record<string, string> = {};
    let hasErrors = false;

    // Required fields with proper typing
    const requiredFields: Array<{ key: keyof FoundationFormData; label: string }> = [
      { key: 'foundation_name', label: 'ชื่อมูลนิธิ' },
      { key: 'history_mission', label: 'ประวัติ/ภารกิจ' },
      { key: 'foundation_type_id', label: 'ประเภทมูลนิธิ' },
      { key: 'address_line1', label: 'ที่อยู่ (บรรทัดที่ 1)' },
      { key: 'city', label: 'อำเภอ/เขต' },
      { key: 'province', label: 'จังหวัด' },
      { key: 'contact_phone', label: 'เบอร์โทรศัพท์' },
      { key: 'contact_email', label: 'อีเมล' }
    ];

    requiredFields.forEach(field => {
      const value = form[field.key];
      if (!value || String(value).trim() === '') {
        newErrors[field.key] = `กรุณากรอก${field.label}`;
        hasErrors = true;
      }
    });

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (form.contact_email && !emailRegex.test(form.contact_email)) {
      newErrors.contact_email = 'รูปแบบอีเมลไม่ถูกต้อง';
      hasErrors = true;
    }

    // URL validation
    const urlRegex = /^https?:\/\/.+/;
    if (form.website_url && form.website_url.trim() && !urlRegex.test(form.website_url)) {
      newErrors.website_url = 'URL ควรเริ่มต้นด้วย http:// หรือ https://';
      hasErrors = true;
    }

    if (form.gmaps_embed_url && form.gmaps_embed_url.trim() && !urlRegex.test(form.gmaps_embed_url)) {
      newErrors.gmaps_embed_url = 'Google Maps URL ควรเริ่มต้นด้วย http:// หรือ https://';
      hasErrors = true;
    }

    // Pickup service validation
    if (form.accepts_pickup_service) {
      if (!form.pickup_service_area || form.pickup_service_area.trim() === '') {
        newErrors.pickup_service_area = 'กรุณากรอกพื้นที่ให้บริการรับของ';
        hasErrors = true;
      }
      if (!form.pickup_contact_info || form.pickup_contact_info.trim() === '') {
        newErrors.pickup_contact_info = 'กรุณากรอกข้อมูลติดต่อสำหรับบริการรับของ';
        hasErrors = true;
      }
    }

    if (hasErrors) {
      setFormErrors(newErrors);
      toast({ 
        title: 'กรุณาตรวจสอบข้อมูลให้ถูกต้อง', 
        variant: 'destructive' 
      });
      return false;
    }

    return true;
  };

  const clearFieldError = (fieldName: string) => {
    if (formErrors[fieldName]) {
      setFormErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSaving(true);
    try {
      const formData = new FormData();
      
      // Clean and prepare data before sending
      const payload = {
        ...form,
        // Ensure foundation_type_id is a number or null
        foundation_type_id: form.foundation_type_id ? Number(form.foundation_type_id) : null,
        
        // Clean URL fields - ensure they're valid URIs or empty
        website_url: form.website_url && form.website_url.trim() ? form.website_url.trim() : null,
        gmaps_embed_url: form.gmaps_embed_url && form.gmaps_embed_url.trim() ? form.gmaps_embed_url.trim() : null,
        
        // Handle pickup service conditional fields
        pickup_service_area: form.accepts_pickup_service ? (form.pickup_service_area || '') : null,
        pickup_contact_info: form.accepts_pickup_service ? (form.pickup_contact_info || '') : null,
        
        // Ensure boolean values are properly set
        accepts_pickup_service: Boolean(form.accepts_pickup_service),
        
        // Clean string fields
        foundation_name: form.foundation_name?.trim() || '',
        history_mission: form.history_mission?.trim() || '',
        address_line1: form.address_line1?.trim() || '',
        address_line2: form.address_line2?.trim() || null,
        city: form.city?.trim() || '',
        province: form.province?.trim() || '',
        postal_code: form.postal_code?.trim() || null,
        country: form.country?.trim() || 'Thailand',
        contact_phone: form.contact_phone?.trim() || '',
        contact_email: form.contact_email?.trim() || '',
        license_number: form.license_number?.trim() || null,
      };
      
      // Add fields to FormData, excluding logo_url if file is being uploaded
      for (const key in payload) {
        if (key === 'logo_url' && selectedFile) continue;
        const value = payload[key as keyof typeof payload];
        if (value !== null && value !== undefined && value !== '') {
          formData.append(key, String(value));
        }
      }
      
      if (selectedFile) formData.append('logo_file', selectedFile);

      const res = await foundationService.updateProfile(formData);
      toast({ title: 'บันทึกโปรไฟล์สำเร็จ' });

      // Refresh profile data
      try {
        setError(null);
        const refreshed = await foundationService.getMyProfile();
        const foundationObj = refreshed?.data || null;

        if (foundationObj) {
          setProfile(foundationObj);
          setForm({
            foundation_name: foundationObj.foundation_name || '',
            logo_url: foundationObj.logo_url || '',
            history_mission: foundationObj.history_mission || '',
            // Fix: Convert to string to match interface
            foundation_type_id: foundationObj.foundation_type_id ? String(foundationObj.foundation_type_id) : '',
            address_line1: foundationObj.address_line1 || '',
            address_line2: foundationObj.address_line2 || '',
            city: foundationObj.city || '',
            province: foundationObj.province || '',
            postal_code: foundationObj.postal_code || '',
            country: foundationObj.country || 'Thailand',
            gmaps_embed_url: foundationObj.gmaps_embed_url || '',
            contact_phone: foundationObj.contact_phone || '',
            contact_email: foundationObj.contact_email || '',
            website_url: foundationObj.website_url || '',
            license_number: foundationObj.license_number || '',
            accepts_pickup_service: foundationObj.accepts_pickup_service ?? false,
            pickup_service_area: foundationObj.pickup_service_area || '',
            pickup_contact_info: foundationObj.pickup_contact_info || '',
          });
        }
      } catch (refreshErr) {
        console.warn('Failed to refresh profile after save:', refreshErr);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'เกิดข้อผิดพลาด';
      toast({ title: errorMessage, variant: 'destructive' });
      console.error('Profile update error:', error);
      
      // Log detailed error for debugging
      if (error.response?.data?.details) {
        console.error('Validation details:', error.response.data.details);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex flex-1">
        <FoundationSideMenu />
        <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
          <h1 className="text-3xl font-bold mb-4">จัดการโปรไฟล์มูลนิธิ</h1>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">ชื่อมูลนิธิ *</label>
                <Input
                  name="foundation_name"
                  value={form.foundation_name}
                  onChange={handleChange}
                  className={formErrors.foundation_name ? 'border-red-500' : ''}
                />
                {formErrors.foundation_name && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.foundation_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">โลโก้มูลนิธิ</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                {form.logo_url && (
                  <div className="mt-2">
                    <img src={form.logo_url} alt="Current logo" className="w-20 h-20 object-cover rounded" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">ประวัติ/ภารกิจ *</label>
                <Textarea
                  name="history_mission"
                  value={form.history_mission}
                  onChange={handleChange}
                  rows={4}
                  className={formErrors.history_mission ? 'border-red-500' : ''}
                />
                {formErrors.history_mission && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.history_mission}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">ประเภทมูลนิธิ *</label>
                <Select value={form.foundation_type_id} onValueChange={handleSelectChange}>
                  <SelectTrigger className={formErrors.foundation_type_id ? 'border-red-500' : ''}>
                    <SelectValue placeholder="เลือกประเภทมูลนิธิ" />
                  </SelectTrigger>
                  <SelectContent>
                    {types.map((type) => (
                      <SelectItem key={type.type_id} value={String(type.type_id)}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.foundation_type_id && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.foundation_type_id}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">ที่อยู่ (บรรทัดที่ 1) *</label>
                  <Input
                    name="address_line1"
                    value={form.address_line1}
                    onChange={handleChange}
                    className={formErrors.address_line1 ? 'border-red-500' : ''}
                  />
                  {formErrors.address_line1 && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.address_line1}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">ที่อยู่ (บรรทัดที่ 2)</label>
                  <Input
                    name="address_line2"
                    value={form.address_line2}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">อำเภอ/เขต *</label>
                  <Input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    className={formErrors.city ? 'border-red-500' : ''}
                  />
                  {formErrors.city && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.city}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">จังหวัด *</label>
                  <Input
                    name="province"
                    value={form.province}
                    onChange={handleChange}
                    className={formErrors.province ? 'border-red-500' : ''}
                  />
                  {formErrors.province && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.province}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">รหัสไปรษณีย์</label>
                  <Input
                    name="postal_code"
                    value={form.postal_code}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">ประเทศ</label>
                <Input
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">เบอร์โทรศัพท์ *</label>
                  <Input
                    name="contact_phone"
                    value={form.contact_phone}
                    onChange={handleChange}
                    className={formErrors.contact_phone ? 'border-red-500' : ''}
                  />
                  {formErrors.contact_phone && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.contact_phone}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">อีเมล *</label>
                  <Input
                    name="contact_email"
                    type="email"
                    value={form.contact_email}
                    onChange={handleChange}
                    className={formErrors.contact_email ? 'border-red-500' : ''}
                  />
                  {formErrors.contact_email && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.contact_email}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">เว็บไซต์</label>
                <Input
                  name="website_url"
                  value={form.website_url}
                  onChange={handleChange}
                  placeholder="https://example.com"
                  className={formErrors.website_url ? 'border-red-500' : ''}
                />
                {formErrors.website_url && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.website_url}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Google Maps Embed URL</label>
                <Input
                  name="gmaps_embed_url"
                  value={form.gmaps_embed_url}
                  onChange={handleChange}
                  placeholder="https://www.google.com/maps/embed?pb=..."
                  className={formErrors.gmaps_embed_url ? 'border-red-500' : ''}
                />
                {formErrors.gmaps_embed_url && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.gmaps_embed_url}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">เลขที่ใบอนุญาต</label>
                <Input
                  name="license_number"
                  value={form.license_number}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="accepts_pickup_service"
                    name="accepts_pickup_service"
                    checked={form.accepts_pickup_service}
                    onChange={handleChange}
                    className="rounded"
                  />
                  <label htmlFor="accepts_pickup_service" className="text-sm font-medium">
                    ให้บริการรับของบริจาค
                  </label>
                </div>

                {form.accepts_pickup_service && (
                  <div className="space-y-4 pl-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">พื้นที่ให้บริการรับของ *</label>
                      <Input
                        name="pickup_service_area"
                        value={form.pickup_service_area}
                        onChange={handleChange}
                        className={formErrors.pickup_service_area ? 'border-red-500' : ''}
                      />
                      {formErrors.pickup_service_area && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.pickup_service_area}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">ข้อมูลติดต่อสำหรับบริการรับของ *</label>
                      <Textarea
                        name="pickup_contact_info"
                        value={form.pickup_contact_info}
                        onChange={handleChange}
                        rows={3}
                        className={formErrors.pickup_contact_info ? 'border-red-500' : ''}
                      />
                      {formErrors.pickup_contact_info && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.pickup_contact_info}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? 'กำลังบันทึก...' : 'บันทึกโปรไฟล์'}
              </Button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default FoundationProfile;
