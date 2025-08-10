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
import { sharedService } from '@/services/shared.service';

const FoundationProfile = () => {
  const [profile, setProfile] = useState<any>(null);
  const [types, setTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<any>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [typesLoading, setTypesLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [profileRes, typesRes] = await Promise.all([
          foundationService.getMyProfile(),
          publicService.getFoundationTypesResponse()
        ]);
        console.log('profileRes', profileRes);
        console.log('typesRes', typesRes);

        // Map backend envelope: { statusCode, data: [...], message, success }
        // apiClient.get returns response.data (the envelope), so typesRes.data is the array already
        const tArray = Array.isArray((typesRes as any)?.data) ? (typesRes as any).data : [];

        // Normalize foundation types
        const normalizedTypes = tArray.map((item: any) => ({
          type_id: Number(item?.type_id),
          name: String(item?.name ?? ''),
          description: String(item?.description ?? ''),
        }));
        setTypes(normalizedTypes);
        setTypesLoading(false);

        // Check foundation profile (allow form to render even if missing to let user choose type)
        // The backend returns the foundation object directly under 'data', not nested under 'data.foundation'
        const foundationObj = profileRes?.data; // Corrected this line
        setProfile(foundationObj || null);

        // map nested foundation object to flat form values with safe defaults
        const f = (foundationObj || {}) as Partial<{
          foundation_name: string;
          logo_url?: string;
          history_mission: string;
          foundation_type_id?: number | string;
          address_line1: string;
          address_line2?: string;
          city: string;
          province: string;
          postal_code?: string;
          country?: string;
          gmaps_embed_url?: string;
          contact_phone: string;
          contact_email: string;
          website_url?: string;
          license_number?: string;
          accepts_pickup_service?: boolean;
          pickup_service_area?: string;
          pickup_contact_info?: string;
        }>;
        setForm({
          foundation_name: f.foundation_name ?? '',
          logo_url: f.logo_url ?? '',
          history_mission: f.history_mission ?? '',
          foundation_type_id: f.foundation_type_id ?? '',
          address_line1: f.address_line1 ?? '',
          address_line2: f.address_line2 ?? '',
          city: f.city ?? '',
          province: f.province ?? '',
          postal_code: f.postal_code ?? '',
          country: f.country ?? '',
          gmaps_embed_url: f.gmaps_embed_url ?? '',
          contact_phone: f.contact_phone ?? '',
          contact_email: f.contact_email ?? '',
          website_url: f.website_url ?? '',
          license_number: f.license_number ?? '',
          accepts_pickup_service: f.accepts_pickup_service ?? false,
          pickup_service_area: f.pickup_service_area ?? '',
          pickup_contact_info: f.pickup_contact_info ?? '',
        });
        console.log('foundation types (normalized):', normalizedTypes);
      } catch (e) {
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
      } finally {
        setLoading(false);
        setTypesLoading(false);
      }
    };
    fetchData();
  }, []);

  // Format phone number as user types
  const formatPhoneNumber = (phoneNumber: string) => {
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Format based on length
    if (cleaned.length <= 3) {
      return cleaned;
    } else if (cleaned.length <= 6) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    } else if (cleaned.length <= 10) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Clear error for this field when user starts typing
    clearFieldError(name);
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((prev: any) => ({
        ...prev,
        [name]: checked
      }));
    } else if (name === 'contact_phone') {
      // Format phone number as user types
      setForm((prev: any) => ({
        ...prev,
        [name]: formatPhoneNumber(value)
      }));
    } else {
      setForm((prev: any) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);

      // Immediate preview (client-side)
      try {
        const objectUrl = URL.createObjectURL(file);
        setForm((prev: any) => ({ ...prev, logo_url: objectUrl }));
      } catch {}

      clearFieldError('logo_url'); // Clear any previous error for logo_url

      // Upload to backend to persist and get a permanent URL
      try {
        const uploadRes = await sharedService.uploadImage(file);
        const serverUrl = (uploadRes as any)?.data?.imageUrl || (uploadRes as any)?.imageUrl;
        if (serverUrl) {
          // Replace preview URL with persisted URL from backend so it survives refresh
          setForm((prev: any) => ({ ...prev, logo_url: serverUrl }));
        }
      } catch (uploadErr) {
        console.warn('Upload logo failed, fallback to local preview only:', uploadErr);
        // Keep local preview; user can still save profile which may also upload via PUT route if supported
      }
    }
  };

  const handleSelectChange = (value: string) => {
    // Clear error for foundation_type_id when user selects a value
    clearFieldError('foundation_type_id');
    setForm((prev: any) => ({ ...prev, foundation_type_id: value }));
  };

  // Validate form before submission
  const validateForm = () => {
    // Clear previous errors
    setFormErrors({});
    
    // Track new errors
    const newErrors: Record<string, string> = {};
    let hasErrors = false;
    
    // Required fields based on UpdateFoundationProfileRequest interface
    const requiredFields = [
      { key: 'foundation_name', label: 'ชื่อมูลนิธิ' },
      { key: 'history_mission', label: 'ประวัติ/ภารกิจ' },
      { key: 'foundation_type_id', label: 'ประเภทมูลนิธิ' },
      { key: 'address_line1', label: 'ที่อยู่ (บรรทัดที่ 1)' },
      { key: 'city', label: 'อำเภอ/เขต' },
      { key: 'province', label: 'จังหวัด' },
      { key: 'contact_phone', label: 'เบอร์โทรศัพท์' },
      { key: 'contact_email', label: 'อีเมล' }
    ];

    // Check for missing required fields
    requiredFields.forEach(field => {
      if (!form[field.key]) {
        newErrors[field.key] = `กรุณากรอก${field.label}`;
        hasErrors = true;
      }
    });
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (form.contact_email && !emailRegex.test(form.contact_email)) {
      newErrors.contact_email = 'รูปแบบอีเมลไม่ถูกต้อง';
      hasErrors = true;
    }
    
    // Validate website URL format if provided
    if (form.website_url && !form.website_url.startsWith('http')) {
      newErrors.website_url = 'URL ควรเริ่มต้นด้วย http:// หรือ https://';
      hasErrors = true;
    }
    
    // Set errors and show toast if there are any
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
  
  // Clear specific field error when user starts typing
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
      // Ensure foundation_type_id is numeric for backend
      const payload: any = { ...form, foundation_type_id: Number(form.foundation_type_id) || null };
      for (const key in payload) {
        if (key === 'logo_url' && selectedFile) continue;
        if (payload[key] !== null && payload[key] !== undefined) {
          formData.append(key, payload[key]);
        }
      }
      if (selectedFile) formData.append('logo_file', selectedFile);

      const res = await foundationService.updateProfile(formData);
      toast({ title: 'บันทึกโปรไฟล์สำเร็จ' });

      // Refresh profile immediately so UI shows the saved profile
      try {
        setError(null);
        const refreshed = await foundationService.getMyProfile();
        // The backend returns the foundation object directly under 'data', not nested under 'data.foundation'
        const foundationObj = refreshed?.data || null; // Corrected this line

        if (foundationObj) {
          setProfile(foundationObj);
          setForm({
            foundation_name: foundationObj.foundation_name || '',
            logo_url: foundationObj.logo_url || '',
            history_mission: foundationObj.history_mission || '',
            foundation_type_id: foundationObj.foundation_type_id || '',
            address_line1: foundationObj.address_line1 || '',
            address_line2: foundationObj.address_line2 || '',
            city: foundationObj.city || '',
            province: foundationObj.province || '',
            postal_code: foundationObj.postal_code || '',
            country: foundationObj.country || '',
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
          // Backend still returns null profile; keep form visible and show gentle note
          setError('ยังไม่ได้สร้างโปรไฟล์มูลนิธิ กรุณากรอกและบันทึกข้อมูลให้ครบถ้วน');
        }
      } catch (refreshErr) {
        console.warn('Failed to refresh profile after save:', refreshErr);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'เกิดข้อผิดพลาด';
      toast({ title: errorMessage, variant: 'destructive' });
      console.error('Profile update error:', error);
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
          
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
            {profile ? (
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-blue-900 mb-2">สถานะโปรไฟล์</h2>
                  <div className="space-y-1 text-sm">
                    <div><span className="font-medium">Foundation ID:</span> {profile.foundation_id}</div>
                    <div><span className="font-medium">สถานะการยืนยัน:</span> 
                      {profile.verified_at ? (
                        <span className="text-green-600">✓ ยืนยันแล้ว</span>
                      ) : (
                        <span className="text-yellow-600">⏳ รอการยืนยัน</span>
                      )}
                    </div>
                    <div><span className="font-medium">วันที่สร้าง:</span> {new Date(profile.created_at).toLocaleString('th-TH')}</div>
                    <div><span className="font-medium">อัปเดตล่าสุด:</span> {new Date(profile.updated_at).toLocaleString('th-TH')}</div>
                  </div>
                </div>
                {(selectedFile || form.logo_url || profile?.logo_url) && (
                  <img
                    src={
                      selectedFile
                        ? URL.createObjectURL(selectedFile)
                        : (form.logo_url || profile?.logo_url)
                    }
                    alt="Logo"
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                )}
              </div>
            ) : (
              <div className="text-center">
                <p className="text-gray-600 mb-6">คุณยังไม่ได้สร้างโปรไฟล์มูลนิธิ กรุณากรอกข้อมูลด้านล่างเพื่อสร้างโปรไฟล์</p>
              </div>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-xl shadow-soft p-8">
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">ช่องที่มีเครื่องหมาย <span className="text-red-500">*</span> เป็นข้อมูลที่จำเป็นต้องกรอก</p>
            </div>
            
            <div>
              <label className="block mb-1 font-medium">ชื่อมูลนิธิ <span className="text-red-500">*</span></label>
              <Input 
                name="foundation_name" 
                value={form.foundation_name} 
                onChange={handleChange} 
                required 
                className={formErrors.foundation_name ? 'border-red-500' : ''}
              />
              {formErrors.foundation_name && (
                <p className="text-red-500 text-sm mt-1">{formErrors.foundation_name}</p>
              )}
            </div>
            <div>
              <label className="block mb-1 font-medium">โลโก้</label>
              <Input type="file" name="logo_file" onChange={handleFileChange} accept="image/*" />
              {(form.logo_url || selectedFile) && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500 mb-1">รูปภาพปัจจุบัน:</p>
                  <img 
                    src={selectedFile ? URL.createObjectURL(selectedFile) : form.logo_url}
                    alt="Logo Preview"
                    className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                  />
                </div>
              )}
            </div>
            <div>
              <label className="block mb-1 font-medium">ประวัติ/ภารกิจ <span className="text-red-500">*</span></label>
              <Textarea 
                name="history_mission" 
                value={form.history_mission} 
                onChange={handleChange} 
                required 
                className={formErrors.history_mission ? 'border-red-500' : ''}
              />
              {formErrors.history_mission && (
                <p className="text-red-500 text-sm mt-1">{formErrors.history_mission}</p>
              )}
            </div>
            <div>
              <label className="block mb-1 font-medium">ประเภทมูลนิธิ <span className="text-red-500">*</span></label>
              <Select value={form.foundation_type_id ? String(form.foundation_type_id) : ''} onValueChange={handleSelectChange}>
                <SelectTrigger className={formErrors.foundation_type_id ? 'border-red-500' : ''}>
                  <SelectValue placeholder={typesLoading ? 'กำลังโหลดประเภทมูลนิธิ...' : 'เลือกประเภทมูลนิธิ'} />
                </SelectTrigger>
                <SelectContent>
                  {(types || [])
                    .filter((type: any) => Number.isFinite(Number(type?.type_id)) && !!type?.name)
                    .map((type: any) => (
                      <SelectItem key={String(type.type_id)} value={String(type.type_id)}>
                        {type.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {formErrors.foundation_type_id && (
                <p className="text-red-500 text-sm mt-1">{formErrors.foundation_type_id}</p>
              )}
            </div>
            <div>
              <label className="block mb-1 font-medium">ที่อยู่ (บรรทัดที่ 1) <span className="text-red-500">*</span></label>
              <Input 
                name="address_line1" 
                value={form.address_line1} 
                onChange={handleChange} 
                required 
                className={formErrors.address_line1 ? 'border-red-500' : ''}
              />
              {formErrors.address_line1 && (
                <p className="text-red-500 text-sm mt-1">{formErrors.address_line1}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-medium">อำเภอ/เขต <span className="text-red-500">*</span></label>
                <Input 
                  name="city" 
                  value={form.city} 
                  onChange={handleChange} 
                  required 
                  className={formErrors.city ? 'border-red-500' : ''}
                />
                {formErrors.city && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.city}</p>
                )}
              </div>
              <div>
                <label className="block mb-1 font-medium">จังหวัด <span className="text-red-500">*</span></label>
                <Input 
                  name="province" 
                  value={form.province} 
                  onChange={handleChange} 
                  required 
                  className={formErrors.province ? 'border-red-500' : ''}
                />
                {formErrors.province && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.province}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-medium">รหัสไปรษณีย์</label>
                <Input 
                  name="postal_code" 
                  value={form.postal_code} 
                  onChange={handleChange} 
                  className={formErrors.postal_code ? 'border-red-500' : ''}
                />
                {formErrors.postal_code && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.postal_code}</p>
                )}
              </div>
              <div>
                <label className="block mb-1 font-medium">ประเทศ</label>
                <Input name="country" value={form.country} onChange={handleChange} />
              </div>
            </div>
            <div>
              <label className="block mb-1 font-medium">Google Maps Embed URL</label>
              <Input name="gmaps_embed_url" value={form.gmaps_embed_url} onChange={handleChange} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-medium">เบอร์โทรศัพท์ <span className="text-red-500">*</span></label>
                <Input 
                  name="contact_phone" 
                  value={form.contact_phone} 
                  onChange={handleChange} 
                  required 
                  className={formErrors.contact_phone ? 'border-red-500' : ''}
                />
                {formErrors.contact_phone && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.contact_phone}</p>
                )}
              </div>
              <div>
                <label className="block mb-1 font-medium">อีเมล <span className="text-red-500">*</span></label>
                <Input 
                  name="contact_email" 
                  value={form.contact_email} 
                  onChange={handleChange} 
                  required 
                  className={formErrors.contact_email ? 'border-red-500' : ''}
                />
                {formErrors.contact_email && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.contact_email}</p>
                )}
              </div>
            </div>
            <div>
              <label className="block mb-1 font-medium">เว็บไซต์</label>
              <Input 
                name="website_url" 
                value={form.website_url} 
                onChange={handleChange} 
                className={formErrors.website_url ? 'border-red-500' : ''}
              />
              {formErrors.website_url && (
                <p className="text-red-500 text-sm mt-1">{formErrors.website_url}</p>
              )}
            </div>
            <div>
              <label className="block mb-1 font-medium">เลขทะเบียน</label>
              <Input name="license_number" value={form.license_number} onChange={handleChange} />
            </div>
            <div>
              <label className="block mb-1 font-medium">บริการรับของถึงที่</label>
              <input type="checkbox" name="accepts_pickup_service" checked={!!form.accepts_pickup_service} onChange={handleChange} />
              <span className="ml-2">มีบริการ</span>
            </div>
            {form.accepts_pickup_service && (
              <>
                <div>
                  <label className="block mb-1 font-medium">พื้นที่ให้บริการรับของ</label>
                  <Input name="pickup_service_area" value={form.pickup_service_area} onChange={handleChange} />
                </div>
                <div>
                  <label className="block mb-1 font-medium">ข้อมูลติดต่อสำหรับรับของ</label>
                  <Input name="pickup_contact_info" value={form.pickup_contact_info} onChange={handleChange} />
                </div>
              </>
            )}
            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
            </Button>
          </form>
        </main>
      </div>
    </div>
  );
};

export default FoundationProfile;
