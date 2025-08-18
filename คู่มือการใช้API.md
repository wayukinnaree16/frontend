# คู่มือการใช้ API ระบบบริจาค (donation-api)

## ภาพรวม
API นี้ให้บริการสำหรับระบบบริจาค แบ่งกลุ่มตามประเภทผู้ใช้และฟังก์ชัน เช่น ผู้ใช้ทั่วไป, ผู้ดูแลมูลนิธิ, ผู้บริจาค, และแอดมิน

- Base URL: https://backend-lcjt.onrender.com
- รองรับ JSON เป็นหลัก
- ต้องส่ง `Content-Type: application/json` ทุก request ที่มี body
- Endpoint ที่ต้องยืนยันตัวตน ต้องส่ง JWT token ใน header: `Authorization: Bearer <token>`

## โครงสร้าง URL หลัก
| กลุ่ม | Prefix | คำอธิบาย |
|-------|--------|----------|
| Auth | `/api/auth` | สมัคร, ล็อกอิน, รีเซ็ตรหัสผ่าน |
| User | `/api/users` | ข้อมูลโปรไฟล์ผู้ใช้ |
| Public | `/api/public` | ข้อมูลสาธารณะ (มูลนิธิ, รายการที่ต้องการ, หมวดหมู่) |
| Foundation | `/api/foundation` | สำหรับผู้ดูแลมูลนิธิ |
| Donor | `/api/donor` | สำหรับผู้บริจาค |
| Admin | `/api/admin` | สำหรับแอดมินระบบ |
| Shared | `/api/notifications`, `/api/messages` | ฟีเจอร์ที่ใช้ร่วมกัน |

## การยืนยันตัวตน (Authentication)
- สมัครและล็อกอินสำเร็จ จะได้รับ JWT token
- ส่ง token ทุกครั้งใน header: `Authorization: Bearer <token>`
- Token ใช้สำหรับเข้าถึง endpoint ที่ต้องยืนยันตัวตน

## ตัวอย่าง Response เมื่อเกิดข้อผิดพลาด
```json
{
  "status": 401,
  "message": "Unauthorized"
}
```

---

## 1. Auth (สมัคร, ล็อกอิน, ออกจากระบบ, รีเซ็ตรหัสผ่าน)

### 1.1 สมัครสมาชิก (Register)
- **POST** `/api/auth/register`
- **Body**
```json
{
  "email": "user@email.com",
  "password": "รหัสผ่านอย่างน้อย 6 ตัว",
  "first_name": "ชื่อจริง",
  "last_name": "นามสกุล",
  "phone_number": "เบอร์โทรศัพท์ (ไม่บังคับ)",
  "profile_image_url": "URL รูปโปรไฟล์ (ไม่บังคับ)",
  "user_type": "donor | foundation_admin | system_admin"
}
```
- **Response ตัวอย่าง**
```json
{
  "statusCode": 201,
  "data": {
    "user": {
      "user_id": 9,
      "email": "user1@email.com",
      "first_name": "wa",
      "last_name": "yu",
      "phone_number": "0812345678",
      "profile_image_url": "https://example.com/profile.jpg",
      "user_type": "donor",
      "is_email_verified": false,
      "account_status": "active",
      "agreed_to_terms_at": "2025-06-30T08:18:37.693+00:00",
      "agreed_to_privacy_at": "2025-06-30T08:18:37.693+00:00",
      "created_at": "2025-06-30T08:18:39.081355+00:00",
      "updated_at": "2025-06-30T08:18:39.081355+00:00",
      "last_login_at": null
    }
  },
  "message": "Registration successful.",
  "success": true
}
```

### 1.2 ล็อกอิน (Login)
- **POST** `/api/auth/login`
- **Body**
```json
{
  "email": "user@email.com",
  "password": "รหัสผ่าน"
}
```
- **Response ตัวอย่าง**
```json
{
  "statusCode": 200,
  "data": {
    "user": {
      "user_id": 9,
      "email": "user1@email.com",
      "first_name": "wa",
      "last_name": "yu",
      "phone_number": "0812345678",
      "profile_image_url": "https://example.com/profile.jpg",
      "user_type": "donor",
      "is_email_verified": false,
      "account_status": "active",
      "agreed_to_terms_at": "2025-06-30T08:18:37.693+00:00",
      "agreed_to_privacy_at": "2025-06-30T08:18:37.693+00:00",
      "created_at": "2025-06-30T08:18:39.081355+00:00",
      "updated_at": "2025-06-30T08:18:39.081355+00:00",
      "last_login_at": null
    },
    "token": "<JWT Token>"
  },
  "message": "Login successful",
  "success": true
}
```

### 1.3 ออกจากระบบ (Logout)
- **POST** `/api/auth/logout`
- **Header**: `Authorization: Bearer <token>`
- **Response ตัวอย่าง**
```json
{
  "statusCode": 200,
  "data": null,
  "message": "Logout successful",
  "success": true
}
```

### 1.4 ขอรีเซ็ตรหัสผ่าน (Request Password Reset)
- **POST** `/api/auth/request-password-reset`
- **Body**
```json
{
  "email": "user@email.com"
}
```
- **Response ตัวอย่าง**
```json
{
  "message": "If the email exists, a reset link will be sent"
}
```

### 1.5 อัปเดตรหัสผ่านใหม่ (Update Password After Reset)
- **POST** `/api/auth/update-password`
- **Header**: `Authorization: Bearer <token>` (token จากลิงก์รีเซ็ต)
- **Body**
```json
{
  "new_password": "รหัสผ่านใหม่อย่างน้อย 6 ตัว"
}
```
- **Response ตัวอย่าง**
```json
{
  "message": "Password updated successfully"
}
```

### 1.6 รีเซ็ตรหัสผ่านโดยแอดมิน (Force Reset Password)
- **POST** `/api/auth/force-reset-password`
- **Body**
```json
{
  "email": "user@email.com",
  "new_password": "user456"
}
```
- **Response ตัวอย่าง**
```json
{
  "statusCode": 200,
  "message": "Password updated successfully.",
  "success": true
}
```

---

## 2. User (ข้อมูลโปรไฟล์ผู้ใช้)

### 2.1 ดูข้อมูลโปรไฟล์ของตัวเอง (Get My Profile)
- **GET** `/api/users/me`
- **Header**: `Authorization: Bearer <token>`
- **Response ตัวอย่าง**
```json
{
  "user": {
    "id": 1,
    "email": "user@email.com",
    "first_name": "ชื่อจริง",
    "last_name": "นามสกุล",
    "phone_number": "0812345678",
    "profile_image_url": "https://example.com/image.jpg",
    "user_type": "donor",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### 2.2 อัปเดตข้อมูลโปรไฟล์ (Update User Profile)
- **PUT** `/api/users/me`
- **Header**: `Authorization: Bearer <token>`
- **Body**
```json
{
  "first_name": "ชื่อจริงใหม่",
  "last_name": "นามสกุลใหม่",
  "phone_number": "เบอร์โทรศัพท์ใหม่ (ไม่บังคับ)",
  "profile_image_url": "URL รูปโปรไฟล์ใหม่ (ไม่บังคับ)"
}
```
- **Response ตัวอย่าง**
```json
{
  "user": {
    "id": 1,
    "email": "user@email.com",
    "first_name": "ชื่อจริงใหม่",
    "last_name": "นามสกุลใหม่",
    "phone_number": "0812345678",
    "profile_image_url": "https://example.com/new-image.jpg",
    "user_type": "donor",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### 2.3 เปลี่ยนรหัสผ่าน (Change Password)
- **PUT** `/api/users/me/change-password`
- **Header**: `Authorization: Bearer <token>`
- **Body**
```json
{
  "current_password": "รหัสผ่านปัจจุบัน",
  "new_password": "รหัสผ่านใหม่อย่างน้อย 6 ตัว"
}
```
- **Response ตัวอย่าง**
```json
{
  "message": "Password changed successfully"
}
```

---

## 3. Public (ข้อมูลสาธารณะ)

### 3.1 Foundation Types (ประเภทมูลนิธิ)

#### 3.1.1 รายการประเภทมูลนิธิทั้งหมด
- **GET** `/api/public/foundations/types`
- **Response ตัวอย่าง**
```json
{
  "foundation_types": [
    {
      "id": 1,
      "name": "มูลนิธิเด็ก",
      "description": "มูลนิธิที่ช่วยเหลือเด็ก"
    },
    {
      "id": 2,
      "name": "มูลนิธิผู้สูงอายุ",
      "description": "มูลนิธิที่ช่วยเหลือผู้สูงอายุ"
    }
  ]
}
```

### 3.2 Foundations (มูลนิธิ)

#### 3.2.1 รายการมูลนิธิทั้งหมด
- **GET** `/api/public/foundations`
- **Query Parameters** (ไม่บังคับ)
  - `name`: ชื่อมูลนิธิ (ค้นหา)
  - `type_id`: ID ประเภทมูลนิธิ
  - `province`: จังหวัด
  - `sort_by`: เรียงลำดับ (`name_asc`, `name_desc`, `created_at_asc`, `created_at_desc`)
  - `page`: หน้า (default: 1)
  - `limit`: จำนวนต่อหน้า (default: 10, max: 100)
- **Response ตัวอย่าง**
```json
{
  "foundations": [
    {
      "id": 1,
      "foundation_name": "มูลนิธิเด็กไทย",
      "logo_url": "https://example.com/logo.jpg",
      "history_mission": "ช่วยเหลือเด็กด้อยโอกาส",
      "foundation_type": {
        "id": 1,
        "name": "มูลนิธิเด็ก"
      },
      "address_line1": "123 ถนนสุขุมวิท",
      "city": "กรุงเทพฯ",
      "province": "กรุงเทพมหานคร",
      "contact_phone": "021234567",
      "contact_email": "info@foundation.com",
      "website_url": "https://foundation.com",
      "verified": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "total_pages": 5
  }
}
```

#### 3.2.2 ดูรายละเอียดมูลนิธิ
- **GET** `/api/public/foundations/:foundationId`
- **Response ตัวอย่าง**
```json
{
  "foundation": {
    "id": 1,
    "foundation_name": "มูลนิธิเด็กไทย",
    "logo_url": "https://example.com/logo.jpg",
    "history_mission": "ช่วยเหลือเด็กด้อยโอกาส",
    "foundation_type": {
      "id": 1,
      "name": "มูลนิธิเด็ก"
    },
    "address_line1": "123 ถนนสุขุมวิท",
    "address_line2": "แขวงคลองเตย",
    "city": "กรุงเทพฯ",
    "province": "กรุงเทพมหานคร",
    "postal_code": "10110",
    "country": "Thailand",
    "gmaps_embed_url": "https://maps.google.com/...",
    "contact_phone": "021234567",
    "contact_email": "info@foundation.com",
    "website_url": "https://foundation.com",
    "social_media_links": {
      "facebook": "https://facebook.com/foundation",
      "instagram": "https://instagram.com/foundation"
    },
    "license_number": "123456789",
    "accepts_pickup_service": true,
    "pickup_service_area": "กรุงเทพฯ และปริมณฑล",
    "pickup_contact_info": "โทร 0812345678",
    "verified": true,
    "verified_at": "2024-01-01T00:00:00Z"
  }
}
```

### 3.3 Item Categories (หมวดหมู่สิ่งของ)

#### 3.3.1 รายการหมวดหมู่สิ่งของ
- **GET** `/api/public/item-categories`
- **Response ตัวอย่าง**
```json
{
  "item_categories": [
    {
      "id": 1,
      "name": "เสื้อผ้า",
      "description": "เสื้อผ้าเด็กและผู้ใหญ่",
      "icon_url": "https://example.com/clothing-icon.png"
    },
    {
      "id": 2,
      "name": "หนังสือ",
      "description": "หนังสือเรียนและหนังสือทั่วไป",
      "icon_url": "https://example.com/book-icon.png"
    }
  ]
}
```

### 3.4 Wishlist Items (รายการที่ต้องการ)

#### 3.4.1 รายการสิ่งของที่ต้องการทั้งหมด
- **GET** `/api/public/wishlist-items`
- **Query Parameters** (ไม่บังคับ)
  - `foundation_id`: ID มูลนิธิ
  - `category_id`: ID หมวดหมู่
  - `status`: สถานะ (`active`, `fulfilled`, `expired`)
  - `sort_by`: เรียงลำดับ
  - `page`: หน้า
  - `limit`: จำนวนต่อหน้า
- **Response ตัวอย่าง**
```json
{
  "wishlist_items": [
    {
      "id": 1,
      "title": "เสื้อผ้าเด็ก",
      "description": "เสื้อผ้าเด็กอายุ 5-10 ปี",
      "quantity_needed": 50,
      "quantity_received": 30,
      "priority_level": "high",
      "status": "active",
      "expiry_date": "2024-12-31",
      "images": [
        "https://example.com/image1.jpg",
        "https://example.com/image2.jpg"
      ],
      "foundation": {
        "id": 1,
        "foundation_name": "มูลนิธิเด็กไทย",
        "logo_url": "https://example.com/logo.jpg"
      },
      "category": {
        "id": 1,
        "name": "เสื้อผ้า"
      },
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "total_pages": 10
  }
}
```

#### 3.4.2 ดูรายละเอียดสิ่งของที่ต้องการ
- **GET** `/api/public/wishlist-items/:wishlistItemId`
- **Response ตัวอย่าง**
```json
{
  "wishlist_item": {
    "id": 1,
    "title": "เสื้อผ้าเด็ก",
    "description": "เสื้อผ้าเด็กอายุ 5-10 ปี ขนาด S, M, L",
    "quantity_needed": 50,
    "quantity_received": 30,
    "priority_level": "high",
    "status": "active",
    "expiry_date": "2024-12-31",
    "images": [
      "https://example.com/image1.jpg",
      "https://example.com/image2.jpg"
    ],
    "foundation": {
      "id": 1,
      "foundation_name": "มูลนิธิเด็กไทย",
      "logo_url": "https://example.com/logo.jpg",
      "contact_phone": "021234567",
      "contact_email": "info@foundation.com"
    },
    "category": {
      "id": 1,
      "name": "เสื้อผ้า",
      "description": "เสื้อผ้าเด็กและผู้ใหญ่"
    },
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

---

## 4. Foundation Admin (สำหรับผู้ดูแลมูลนิธิ)

**หมายเหตุ**: ทุก endpoint ในกลุ่มนี้ต้องใช้ token ของ `foundation_admin` เท่านั้น

### 4.1 Foundation Profile (โปรไฟล์มูลนิธิ)

#### 4.1.1 ดูโปรไฟล์มูลนิธิของตัวเอง
- **GET** `/api/foundation/profile/me`
- **Header**: `Authorization: Bearer <token>`
- **Response ตัวอย่าง**
```json
{
  "foundation": {
    "id": 1,
    "foundation_name": "มูลนิธิเด็กไทย",
    "logo_url": "https://example.com/logo.jpg",
    "history_mission": "ช่วยเหลือเด็กด้อยโอกาส",
    "foundation_type_id": 1,
    "address_line1": "123 ถนนสุขุมวิท",
    "address_line2": "แขวงคลองเตย",
    "city": "กรุงเทพฯ",
    "province": "กรุงเทพมหานคร",
    "postal_code": "10110",
    "country": "Thailand",
    "gmaps_embed_url": "https://maps.google.com/...",
    "contact_phone": "021234567",
    "contact_email": "info@foundation.com",
    "website_url": "https://foundation.com",
    "social_media_links": {
      "facebook": "https://facebook.com/foundation",
      "instagram": "https://instagram.com/foundation"
    },
    "license_number": "123456789",
    "accepts_pickup_service": true,
    "pickup_service_area": "กรุงเทพฯ และปริมณฑล",
    "pickup_contact_info": "โทร 0812345678",
    "verified": true,
    "verified_at": "2024-01-01T00:00:00Z",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

#### 4.1.2 อัปเดตโปรไฟล์มูลนิธิ
- **PUT** `/api/foundation/profile/me`
- **Header**: `Authorization: Bearer <token>`
- **Body**
```json
{
  "foundation_name": "มูลนิธิเด็กไทย",
  "logo_url": "https://example.com/new-logo.jpg",
  "history_mission": "ช่วยเหลือเด็กด้อยโอกาสและครอบครัว",
  "foundation_type_id": 1,
  "address_line1": "123 ถนนสุขุมวิท",
  "address_line2": "แขวงคลองเตย",
  "city": "กรุงเทพฯ",
  "province": "กรุงเทพมหานคร",
  "postal_code": "10110",
  "country": "Thailand",
  "gmaps_embed_url": "https://maps.google.com/...",
  "contact_phone": "021234567",
  "contact_email": "info@foundation.com",
  "website_url": "https://foundation.com",
  "social_media_links": {
    "facebook": "https://facebook.com/foundation",
    "instagram": "https://instagram.com/foundation"
  },
  "license_number": "123456789",
  "accepts_pickup_service": true,
  "pickup_service_area": "กรุงเทพฯ และปริมณฑล",
  "pickup_contact_info": "โทร 0812345678"
}
```
- **Response ตัวอย่าง**
```json
{
  "foundation": {
    "id": 1,
    "foundation_name": "มูลนิธิเด็กไทย",
    "logo_url": "https://example.com/new-logo.jpg",
    "history_mission": "ช่วยเหลือเด็กด้อยโอกาสและครอบครัว",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### 4.2 Wishlist Items (จัดการรายการที่ต้องการ)

#### 4.2.1 สร้างรายการสิ่งของที่ต้องการ
- **POST** `/api/foundation/wishlist-items`
- **Header**: `Authorization: Bearer <token>`
- **Body**
```json
{
  "title": "เสื้อผ้าเด็ก",
  "description": "เสื้อผ้าเด็กอายุ 5-10 ปี ขนาด S, M, L",
  "quantity_needed": 50,
  "priority_level": "high",
  "expiry_date": "2024-12-31",
  "category_id": 1,
  "images": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ]
}
```
- **Response ตัวอย่าง**
```json
{
  "wishlist_item": {
    "id": 1,
    "title": "เสื้อผ้าเด็ก",
    "description": "เสื้อผ้าเด็กอายุ 5-10 ปี ขนาด S, M, L",
    "quantity_needed": 50,
    "quantity_received": 0,
    "priority_level": "high",
    "status": "active",
    "expiry_date": "2024-12-31",
    "images": [
      "https://example.com/image1.jpg",
      "https://example.com/image2.jpg"
    ],
    "category_id": 1,
    "foundation_id": 1,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### 4.2.2 รายการสิ่งของที่ต้องการของมูลนิธิ
- **GET** `/api/foundation/wishlist-items`
- **Header**: `Authorization: Bearer <token>`
- **Response ตัวอย่าง**
```json
{
  "wishlist_items": [
    {
      "id": 1,
      "title": "เสื้อผ้าเด็ก",
      "description": "เสื้อผ้าเด็กอายุ 5-10 ปี",
      "quantity_needed": 50,
      "quantity_received": 30,
      "priority_level": "high",
      "status": "active",
      "expiry_date": "2024-12-31",
      "images": [
        "https://example.com/image1.jpg",
        "https://example.com/image2.jpg"
      ],
      "category": {
        "id": 1,
        "name": "เสื้อผ้า"
      },
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### 4.2.3 ดูรายละเอียดสิ่งของที่ต้องการ
- **GET** `/api/foundation/wishlist-items/:wishlistItemId`
- **Header**: `Authorization: Bearer <token>`
- **Response ตัวอย่าง**
```json
{
  "wishlist_item": {
    "id": 1,
    "title": "เสื้อผ้าเด็ก",
    "description": "เสื้อผ้าเด็กอายุ 5-10 ปี ขนาด S, M, L",
    "quantity_needed": 50,
    "quantity_received": 30,
    "priority_level": "high",
    "status": "active",
    "expiry_date": "2024-12-31",
    "images": [
      "https://example.com/image1.jpg",
      "https://example.com/image2.jpg"
    ],
    "category": {
      "id": 1,
      "name": "เสื้อผ้า"
    },
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

#### 4.2.4 อัปเดตรายการสิ่งของที่ต้องการ
- **PUT** `/api/foundation/wishlist-items/:wishlistItemId`
- **Header**: `Authorization: Bearer <token>`
- **Body**
```json
{
  "title": "เสื้อผ้าเด็ก (อัปเดต)",
  "description": "เสื้อผ้าเด็กอายุ 5-10 ปี ขนาด S, M, L (อัปเดต)",
  "quantity_needed": 60,
  "priority_level": "medium",
  "expiry_date": "2024-12-31",
  "images": [
    "https://example.com/new-image1.jpg",
    "https://example.com/new-image2.jpg"
  ]
}
```
- **Response ตัวอย่าง**
```json
{
  "wishlist_item": {
    "id": 1,
    "title": "เสื้อผ้าเด็ก (อัปเดต)",
    "description": "เสื้อผ้าเด็กอายุ 5-10 ปี ขนาด S, M, L (อัปเดต)",
    "quantity_needed": 60,
    "quantity_received": 30,
    "priority_level": "medium",
    "status": "active",
    "expiry_date": "2024-12-31",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

#### 4.2.5 ลบรายการสิ่งของที่ต้องการ
- **DELETE** `/api/foundation/wishlist-items/:wishlistItemId`
- **Header**: `Authorization: Bearer <token>`
- **Response ตัวอย่าง**
```json
{
  "message": "Wishlist item deleted successfully"
}
```

### 4.3 Pledges (จัดการการบริจาค)

#### 4.3.1 รายการการบริจาคที่ได้รับ
- **GET** `/api/foundation/pledges/received`
- **Header**: `Authorization: Bearer <token>`
- **Response ตัวอย่าง**
```json
{
  "pledges": [
    {
      "id": 1,
      "wishlist_item": {
        "id": 1,
        "title": "เสื้อผ้าเด็ก",
        "description": "เสื้อผ้าเด็กอายุ 5-10 ปี"
      },
      "donor": {
        "id": 2,
        "first_name": "ผู้บริจาค",
        "last_name": "ตัวอย่าง",
        "email": "donor@example.com"
      },
      "quantity_pledged": 10,
      "donor_item_description": "เสื้อผ้าเด็กมือสอง สภาพดี",
      "delivery_method": "courier_service",
      "courier_company_name": "Kerry Express",
      "tracking_number": "KRY123456789",
      "status": "pending_approval",
      "pledged_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### 4.3.2 อนุมัติการบริจาค
- **PATCH** `/api/foundation/pledges/:pledgeId/approve`
- **Header**: `Authorization: Bearer <token>`
- **Response ตัวอย่าง**
```json
{
  "message": "Pledge approved successfully",
  "pledge": {
    "id": 1,
    "status": "approved",
    "approved_at": "2024-01-01T00:00:00Z"
  }
}
```

#### 4.3.3 ปฏิเสธการบริจาค
- **PATCH** `/api/foundation/pledges/:pledgeId/reject`
- **Header**: `Authorization: Bearer <token>`
- **Body**
```json
{
  "rejection_reason_by_foundation": "สิ่งของไม่ตรงตามที่ต้องการ"
}
```
- **Response ตัวอย่าง**
```json
{
  "message": "Pledge rejected successfully",
  "pledge": {
    "id": 1,
    "status": "rejected",
    "rejection_reason_by_foundation": "สิ่งของไม่ตรงตามที่ต้องการ",
    "rejected_at": "2024-01-01T00:00:00Z"
  }
}
```

#### 4.3.4 ยืนยันการรับสิ่งของ
- **PATCH** `/api/foundation/pledges/:pledgeId/confirm-receipt`
- **Header**: `Authorization: Bearer <token>`
- **Response ตัวอย่าง**
```json
{
  "message": "Receipt confirmed successfully",
  "pledge": {
    "id": 1,
    "status": "received",
    "received_at": "2024-01-01T00:00:00Z"
  }
}
```

### 4.4 Documents (เอกสารมูลนิธิ)

#### 4.4.1 อัปโหลดเอกสารมูลนิธิ
- **POST** `/api/foundation/documents`
- **Header**: `Authorization: Bearer <token>`
- **Body**
```json
{
  "document_type": "license",
  "document_url": "https://example.com/document.pdf",
  "document_name": "ใบอนุญาตมูลนิธิ",
  "expiry_date": "2025-12-31",
  "description": "ใบอนุญาตจัดตั้งมูลนิธิ"
}
```
- **Response ตัวอย่าง**
```json
{
  "document": {
    "id": 1,
    "document_type": "license",
    "document_url": "https://example.com/document.pdf",
    "document_name": "ใบอนุญาตมูลนิธิ",
    "expiry_date": "2025-12-31",
    "description": "ใบอนุญาตจัดตั้งมูลนิธิ",
    "status": "pending_review",
    "foundation_id": 1,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### 4.4.2 รายการเอกสารของมูลนิธิ
- **GET** `/api/foundation/documents`
- **Header**: `Authorization: Bearer <token>`
- **Response ตัวอย่าง**
```json
{
  "documents": [
    {
      "id": 1,
      "document_type": "license",
      "document_url": "https://example.com/document.pdf",
      "document_name": "ใบอนุญาตมูลนิธิ",
      "expiry_date": "2025-12-31",
      "description": "ใบอนุญาตจัดตั้งมูลนิธิ",
      "status": "pending_review",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### 4.4.3 ลบเอกสาร
- **DELETE** `/api/foundation/documents/:documentId`
- **Header**: `Authorization: Bearer <token>`
- **Response ตัวอย่าง**
```json
{
  "message": "Document deleted successfully"
}
```

---

ส่วนถัดไป: Donor (การบริจาค, มูลนิธิที่ชื่นชอบ, รีวิว)

---

## 5. Donor (สำหรับผู้บริจาค)

**หมายเหตุ**: ทุก endpoint ในกลุ่มนี้ต้องใช้ token ของ `donor` เท่านั้น

### 5.1 Pledges (การบริจาค)

#### 5.1.1 สร้างการบริจาค
- **POST** `/api/donor/pledges`
- **Header**: `Authorization: Bearer <token>`
- **Body**
```json
{
  "wishlist_item_id": 1,
  "quantity_pledged": 10,
  "donor_item_description": "เสื้อผ้าเด็กมือสอง สภาพดี",
  "delivery_method": "courier_service",
  "courier_company_name": "Kerry Express",
  "tracking_number": "KRY123456789",
  "pickup_address_details": "123 ถนนสุขุมวิท กรุงเทพฯ",
  "pickup_preferred_datetime": "2024-01-15T10:00:00Z"
}
```
**หมายเหตุ**: 
- `courier_company_name` และ `tracking_number` จำเป็นเมื่อ `delivery_method` เป็น `courier_service`
- `pickup_address_details` และ `pickup_preferred_datetime` จำเป็นเมื่อ `delivery_method` เป็น `foundation_pickup`
- **Response ตัวอย่าง**
```json
{
  "pledge": {
    "id": 1,
    "wishlist_item_id": 1,
    "foundation_id": 1,
    "donor_id": 2,
    "quantity_pledged": 10,
    "donor_item_description": "เสื้อผ้าเด็กมือสอง สภาพดี",
    "delivery_method": "courier_service",
    "courier_company_name": "Kerry Express",
    "tracking_number": "KRY123456789",
    "status": "pending_approval",
    "pledged_at": "2024-01-01T00:00:00Z"
  }
}
```

#### 5.1.2 รายการการบริจาคของตัวเอง
- **GET** `/api/donor/pledges`
- **Header**: `Authorization: Bearer <token>`
- **Response ตัวอย่าง**
```json
{
  "pledges": [
    {
      "id": 1,
      "wishlist_item": {
        "id": 1,
        "title": "เสื้อผ้าเด็ก",
        "description": "เสื้อผ้าเด็กอายุ 5-10 ปี"
      },
      "foundation": {
        "id": 1,
        "foundation_name": "มูลนิธิเด็กไทย",
        "logo_url": "https://example.com/logo.jpg"
      },
      "quantity_pledged": 10,
      "donor_item_description": "เสื้อผ้าเด็กมือสอง สภาพดี",
      "delivery_method": "courier_service",
      "courier_company_name": "Kerry Express",
      "tracking_number": "KRY123456789",
      "status": "pending_approval",
      "pledged_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### 5.1.3 ดูรายละเอียดการบริจาค
- **GET** `/api/donor/pledges/:pledgeId`
- **Header**: `Authorization: Bearer <token>`
- **Response ตัวอย่าง**
```json
{
  "pledge": {
    "id": 1,
    "wishlist_item": {
      "id": 1,
      "title": "เสื้อผ้าเด็ก",
      "description": "เสื้อผ้าเด็กอายุ 5-10 ปี"
    },
    "foundation": {
      "id": 1,
      "foundation_name": "มูลนิธิเด็กไทย",
      "logo_url": "https://example.com/logo.jpg",
      "contact_phone": "021234567",
      "contact_email": "info@foundation.com"
    },
    "quantity_pledged": 10,
    "donor_item_description": "เสื้อผ้าเด็กมือสอง สภาพดี",
    "delivery_method": "courier_service",
    "courier_company_name": "Kerry Express",
    "tracking_number": "KRY123456789",
    "status": "pending_approval",
    "pledged_at": "2024-01-01T00:00:00Z",
    "approved_at": null,
    "rejected_at": null,
    "received_at": null
  }
}
```

#### 5.1.4 ยกเลิกการบริจาค
- **PATCH** `/api/donor/pledges/:pledgeId/cancel`
- **Header**: `Authorization: Bearer <token>`
- **Response ตัวอย่าง**
```json
{
  "message": "Pledge cancelled successfully",
  "pledge": {
    "id": 1,
    "status": "cancelled",
    "cancelled_at": "2024-01-01T00:00:00Z"
  }
}
```

#### 5.1.5 อัปเดตข้อมูลการจัดส่ง
- **PATCH** `/api/donor/pledges/:pledgeId/tracking`
- **Header**: `Authorization: Bearer <token>`
- **Body**
```json
{
  "courier_company_name": "Kerry Express",
  "tracking_number": "KRY123456789"
}
```
- **Response ตัวอย่าง**
```json
{
  "message": "Tracking information updated successfully",
  "pledge": {
    "id": 1,
    "courier_company_name": "Kerry Express",
    "tracking_number": "KRY123456789",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### 5.2 Favorites (มูลนิธิที่ชื่นชอบ)

#### 5.2.1 เพิ่มมูลนิธิที่ชื่นชอบ
- **POST** `/api/donor/favorites`
- **Header**: `Authorization: Bearer <token>`
- **Body**
```json
{
  "foundation_id": 1
}
```
- **Response ตัวอย่าง**
```json
{
  "message": "Foundation added to favorites successfully",
  "favorite": {
    "id": 1,
    "donor_id": 2,
    "foundation_id": 1,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### 5.2.2 รายการมูลนิธิที่ชื่นชอบ
- **GET** `/api/donor/favorites`
- **Header**: `Authorization: Bearer <token>`
- **Response ตัวอย่าง**
```json
{
  "favorites": [
    {
      "id": 1,
      "foundation": {
        "id": 1,
        "foundation_name": "มูลนิธิเด็กไทย",
        "logo_url": "https://example.com/logo.jpg",
        "history_mission": "ช่วยเหลือเด็กด้อยโอกาส",
        "contact_phone": "021234567",
        "contact_email": "info@foundation.com"
      },
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### 5.2.3 ลบมูลนิธิที่ชื่นชอบ
- **DELETE** `/api/donor/favorites/:foundationId`
- **Header**: `Authorization: Bearer <token>`
- **Response ตัวอย่าง**
```json
{
  "message": "Foundation removed from favorites successfully"
}
```

### 5.3 Reviews (รีวิว)

#### 5.3.1 ส่งรีวิวสำหรับการบริจาค
- **POST** `/api/donor/pledges/:pledgeId/reviews`
- **Header**: `Authorization: Bearer <token>`
- **Body**
```json
{
  "rating": 5,
  "review_text": "มูลนิธิให้บริการดีมาก รับสิ่งของอย่างเป็นมิตร",
  "anonymous": false
}
```
- **Response ตัวอย่าง**
```json
{
  "message": "Review submitted successfully",
  "review": {
    "id": 1,
    "pledge_id": 1,
    "donor_id": 2,
    "foundation_id": 1,
    "rating": 5,
    "review_text": "มูลนิธิให้บริการดีมาก รับสิ่งของอย่างเป็นมิตร",
    "anonymous": false,
    "status": "pending_approval",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

ส่วนถัดไป: Admin (จัดการผู้ใช้, มูลนิธิ, เนื้อหา, รีวิว)

---

## 6. Admin (สำหรับแอดมินระบบ)

**หมายเหตุ**: ทุก endpoint ในกลุ่มนี้ต้องใช้ token ของ `system_admin` เท่านั้น

### 6.1 Users (จัดการผู้ใช้)

#### 6.1.1 รายการผู้ใช้ทั้งหมด
- **GET** `/api/admin/users`
- **Header**: `Authorization: Bearer <token>`
- **Response ตัวอย่าง**
```json
{
  "users": [
    {
      "id": 1,
      "email": "user@example.com",
      "first_name": "ชื่อจริง",
      "last_name": "นามสกุล",
      "phone_number": "0812345678",
      "profile_image_url": "https://example.com/image.jpg",
      "user_type": "donor",
      "account_status": "active",
      "created_at": "2024-01-01T00:00:00Z",
      "last_login_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "total_pages": 10
  }
}
```

#### 6.1.2 ดูรายละเอียดผู้ใช้
- **GET** `/api/admin/users/:userId`
- **Header**: `Authorization: Bearer <token>`
- **Response ตัวอย่าง**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "ชื่อจริง",
    "last_name": "นามสกุล",
    "phone_number": "0812345678",
    "profile_image_url": "https://example.com/image.jpg",
    "user_type": "donor",
    "account_status": "active",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z",
    "last_login_at": "2024-01-01T00:00:00Z"
  }
}
```

#### 6.1.3 อัปเดตสถานะบัญชีผู้ใช้
- **PATCH** `/api/admin/users/:userId/status`
- **Header**: `Authorization: Bearer <token>`
- **Body**
```json
{
  "account_status": "suspended"
}
```
- **Response ตัวอย่าง**
```json
{
  "message": "User account status updated successfully",
  "user": {
    "id": 1,
    "account_status": "suspended",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### 6.2 Foundations (จัดการมูลนิธิ)

#### 6.2.1 รายการมูลนิธิที่รอการยืนยัน
- **GET** `/api/admin/foundations/pending-verification`
- **Header**: `Authorization: Bearer <token>`
- **Response ตัวอย่าง**
```json
{
  "foundations": [
    {
      "id": 1,
      "foundation_name": "มูลนิธิเด็กไทย",
      "logo_url": "https://example.com/logo.jpg",
      "history_mission": "ช่วยเหลือเด็กด้อยโอกาส",
      "contact_phone": "021234567",
      "contact_email": "info@foundation.com",
      "license_number": "123456789",
      "verified": false,
      "created_at": "2024-01-01T00:00:00Z",
      "admin_user": {
        "id": 2,
        "first_name": "ผู้ดูแล",
        "last_name": "มูลนิธิ",
        "email": "admin@foundation.com"
      }
    }
  ]
}
```

#### 6.2.2 อนุมัติบัญชีมูลนิธิ
- **PATCH** `/api/admin/foundations/:foundationId/approve-account`
- **Header**: `Authorization: Bearer <token>`
- **Response ตัวอย่าง**
```json
{
  "message": "Foundation account approved successfully",
  "foundation": {
    "id": 1,
    "verified": true,
    "verified_at": "2024-01-01T00:00:00Z",
    "verified_by_admin_id": 1
  }
}
```

#### 6.2.3 ปฏิเสธบัญชีมูลนิธิ
- **PATCH** `/api/admin/foundations/:foundationId/reject-account`
- **Header**: `Authorization: Bearer <token>`
- **Body**
```json
{
  "rejection_reason": "เอกสารไม่ครบถ้วน",
  "admin_notes": "กรุณาส่งเอกสารเพิ่มเติม"
}
```
- **Response ตัวอย่าง**
```json
{
  "message": "Foundation account rejected successfully",
  "foundation": {
    "id": 1,
    "verified": false,
    "rejection_reason": "เอกสารไม่ครบถ้วน",
    "admin_notes": "กรุณาส่งเอกสารเพิ่มเติม",
    "rejected_at": "2024-01-01T00:00:00Z",
    "rejected_by_admin_id": 1
  }
}
```

#### 6.2.4 ดูเอกสารของมูลนิธิ
- **GET** `/api/admin/foundations/:foundationId/documents`
- **Header**: `Authorization: Bearer <token>`
- **Response ตัวอย่าง**
```json
{
  "documents": [
    {
      "id": 1,
      "document_type": "license",
      "document_url": "https://example.com/document.pdf",
      "document_name": "ใบอนุญาตมูลนิธิ",
      "expiry_date": "2025-12-31",
      "description": "ใบอนุญาตจัดตั้งมูลนิธิ",
      "status": "pending_review",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### 6.2.5 ตรวจสอบเอกสารมูลนิธิ
- **PATCH** `/api/admin/foundations/documents/:documentId/review`
- **Header**: `Authorization: Bearer <token>`
- **Body**
```json
{
  "status": "approved",
  "review_notes": "เอกสารถูกต้องและครบถ้วน"
}
```
- **Response ตัวอย่าง**
```json
{
  "message": "Document reviewed successfully",
  "document": {
    "id": 1,
    "status": "approved",
    "review_notes": "เอกสารถูกต้องและครบถ้วน",
    "reviewed_at": "2024-01-01T00:00:00Z",
    "reviewed_by_admin_id": 1
  }
}
```

### 6.3 Content Pages (จัดการเนื้อหา)

#### 6.3.1 สร้างหน้าเนื้อหา
- **POST** `/api/admin/content-pages`
- **Header**: `Authorization: Bearer <token>`
- **Body**
```json
{
  "title": "เกี่ยวกับเรา",
  "slug": "about-us",
  "content": "<h1>เกี่ยวกับเรา</h1><p>เนื้อหาเกี่ยวกับเรา...</p>",
  "meta_description": "ข้อมูลเกี่ยวกับระบบบริจาค",
  "is_published": true,
  "page_type": "static"
}
```
- **Response ตัวอย่าง**
```json
{
  "content_page": {
    "id": 1,
    "title": "เกี่ยวกับเรา",
    "slug": "about-us",
    "content": "<h1>เกี่ยวกับเรา</h1><p>เนื้อหาเกี่ยวกับเรา...</p>",
    "meta_description": "ข้อมูลเกี่ยวกับระบบบริจาค",
    "is_published": true,
    "page_type": "static",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### 6.3.2 รายการหน้าเนื้อหาทั้งหมด
- **GET** `/api/admin/content-pages`
- **Header**: `Authorization: Bearer <token>`
- **Response ตัวอย่าง**
```json
{
  "content_pages": [
    {
      "id": 1,
      "title": "เกี่ยวกับเรา",
      "slug": "about-us",
      "meta_description": "ข้อมูลเกี่ยวกับระบบบริจาค",
      "is_published": true,
      "page_type": "static",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### 6.3.3 ดูรายละเอียดหน้าเนื้อหา
- **GET** `/api/admin/content-pages/:pageIdOrSlug`
- **Header**: `Authorization: Bearer <token>`
- **Response ตัวอย่าง**
```json
{
  "content_page": {
    "id": 1,
    "title": "เกี่ยวกับเรา",
    "slug": "about-us",
    "content": "<h1>เกี่ยวกับเรา</h1><p>เนื้อหาเกี่ยวกับเรา...</p>",
    "meta_description": "ข้อมูลเกี่ยวกับระบบบริจาค",
    "is_published": true,
    "page_type": "static",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

#### 6.3.4 อัปเดตหน้าเนื้อหา
- **PUT** `/api/admin/content-pages/:pageIdOrSlug`
- **Header**: `Authorization: Bearer <token>`
- **Body**
```json
{
  "title": "เกี่ยวกับเรา (อัปเดต)",
  "content": "<h1>เกี่ยวกับเรา</h1><p>เนื้อหาใหม่...</p>",
  "meta_description": "ข้อมูลใหม่เกี่ยวกับระบบบริจาค",
  "is_published": true
}
```
- **Response ตัวอย่าง**
```json
{
  "content_page": {
    "id": 1,
    "title": "เกี่ยวกับเรา (อัปเดต)",
    "content": "<h1>เกี่ยวกับเรา</h1><p>เนื้อหาใหม่...</p>",
    "meta_description": "ข้อมูลใหม่เกี่ยวกับระบบบริจาค",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

#### 6.3.5 ลบหน้าเนื้อหา
- **DELETE** `/api/admin/content-pages/:pageIdOrSlug`
- **Header**: `Authorization: Bearer <token>`
- **Response ตัวอย่าง**
```json
{
  "message": "Content page deleted successfully"
}
```

### 6.4 Reviews (จัดการรีวิว)

#### 6.4.1 รายการรีวิวที่รอการอนุมัติ
- **GET** `/api/admin/reviews/pending-approval`
- **Header**: `Authorization: Bearer <token>`
- **Response ตัวอย่าง**
```json
{
  "reviews": [
    {
      "id": 1,
      "rating": 5,
      "review_text": "มูลนิธิให้บริการดีมาก รับสิ่งของอย่างเป็นมิตร",
      "anonymous": false,
      "status": "pending_approval",
      "created_at": "2024-01-01T00:00:00Z",
      "donor": {
        "id": 2,
        "first_name": "ผู้บริจาค",
        "last_name": "ตัวอย่าง",
        "email": "donor@example.com"
      },
      "foundation": {
        "id": 1,
        "foundation_name": "มูลนิธิเด็กไทย"
      },
      "pledge": {
        "id": 1,
        "quantity_pledged": 10
      }
    }
  ]
}
```

#### 6.4.2 อนุมัติรีวิว
- **PATCH** `/api/admin/reviews/:reviewId/approve`
- **Header**: `Authorization: Bearer <token>`
- **Body**
```json
{
  "admin_review_remarks": "รีวิวเหมาะสม"
}
```
- **Response ตัวอย่าง**
```json
{
  "message": "Review approved successfully",
  "review": {
    "id": 1,
    "status": "approved",
    "admin_review_remarks": "รีวิวเหมาะสม",
    "approved_at": "2024-01-01T00:00:00Z",
    "approved_by_admin_id": 1
  }
}
```

#### 6.4.3 ปฏิเสธรีวิว
- **PATCH** `/api/admin/reviews/:reviewId/reject`
- **Header**: `Authorization: Bearer <token>`
- **Body**
```json
{
  "admin_review_remarks": "รีวิวไม่เหมาะสม ใช้คำที่ไม่สุภาพ"
}
```
- **Response ตัวอย่าง**
```json
{
  "message": "Review rejected successfully",
  "review": {
    "id": 1,
    "status": "rejected",
    "admin_review_remarks": "รีวิวไม่เหมาะสม ใช้คำที่ไม่สุภาพ",
    "rejected_at": "2024-01-01T00:00:00Z",
    "rejected_by_admin_id": 1
  }
}
```

---

ส่วนถัดไป: Shared (การแจ้งเตือน, ข้อความ)

---

## 7. Shared (ฟีเจอร์ที่ใช้ร่วมกัน)

**หมายเหตุ**: ทุก endpoint ในกลุ่มนี้ต้องใช้ token ของผู้ใช้ที่ล็อกอินแล้ว (ทุกประเภท)

### 7.1 Notifications (การแจ้งเตือน)

#### 7.1.1 รายการการแจ้งเตือนของตัวเอง
- **GET** `/api/notifications`
- **Header**: `Authorization: Bearer <token>`
- **Response ตัวอย่าง**
```json
{
  "notifications": [
    {
      "id": 1,
      "title": "การบริจาคได้รับการอนุมัติ",
      "message": "การบริจาคเสื้อผ้าเด็กได้รับการอนุมัติจากมูลนิธิเด็กไทย",
      "type": "pledge_approved",
      "is_read": false,
      "related_entity_type": "pledge",
      "related_entity_id": 1,
      "created_at": "2024-01-01T00:00:00Z"
    },
    {
      "id": 2,
      "title": "มีรีวิวใหม่",
      "message": "มีรีวิวใหม่สำหรับมูลนิธิของคุณ",
      "type": "new_review",
      "is_read": true,
      "related_entity_type": "review",
      "related_entity_id": 1,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### 7.1.2 มาร์คการแจ้งเตือนเป็นอ่านแล้ว
- **PATCH** `/api/notifications/:notificationId/read`
- **Header**: `Authorization: Bearer <token>`
- **Response ตัวอย่าง**
```json
{
  "message": "Notification marked as read",
  "notification": {
    "id": 1,
    "is_read": true,
    "read_at": "2024-01-01T00:00:00Z"
  }
}
```

#### 7.1.3 มาร์คการแจ้งเตือนทั้งหมดเป็นอ่านแล้ว
- **PATCH** `/api/notifications/mark-all-as-read`
- **Header**: `Authorization: Bearer <token>`
- **Response ตัวอย่าง**
```json
{
  "message": "All notifications marked as read",
  "updated_count": 5
}
```

### 7.2 Messages (ข้อความภายในระบบ)

#### 7.2.1 ส่งข้อความภายในระบบ
- **POST** `/api/messages`
- **Header**: `Authorization: Bearer <token>`
- **Body**
```json
{
  "recipient_user_id": 2,
  "subject": "สอบถามเกี่ยวกับการบริจาค",
  "message_content": "สวัสดีครับ ผมต้องการสอบถามเกี่ยวกับการบริจาคเสื้อผ้าเด็ก",
  "message_type": "inquiry"
}
```
- **Response ตัวอย่าง**
```json
{
  "message": "Message sent successfully",
  "internal_message": {
    "id": 1,
    "sender_user_id": 1,
    "recipient_user_id": 2,
    "subject": "สอบถามเกี่ยวกับการบริจาค",
    "message_content": "สวัสดีครับ ผมต้องการสอบถามเกี่ยวกับการบริจาคเสื้อผ้าเด็ก",
    "message_type": "inquiry",
    "is_read": false,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### 7.2.2 รายการการสนทนาของตัวเอง
- **GET** `/api/messages/conversations`
- **Header**: `Authorization: Bearer <token>`
- **Response ตัวอย่าง**
```json
{
  "conversations": [
    {
      "other_user": {
        "id": 2,
        "first_name": "ผู้รับ",
        "last_name": "ข้อความ",
        "profile_image_url": "https://example.com/image.jpg"
      },
      "last_message": {
        "id": 1,
        "subject": "สอบถามเกี่ยวกับการบริจาค",
        "message_content": "สวัสดีครับ ผมต้องการสอบถามเกี่ยวกับการบริจาคเสื้อผ้าเด็ก",
        "is_read": false,
        "created_at": "2024-01-01T00:00:00Z"
      },
      "unread_count": 1
    }
  ]
}
```

#### 7.2.3 ดูข้อความในบทสนทนา
- **GET** `/api/messages/conversation/:otherUserId`
- **Header**: `Authorization: Bearer <token>`
- **Response ตัวอย่าง**
```json
{
  "conversation": {
    "other_user": {
      "id": 2,
      "first_name": "ผู้รับ",
      "last_name": "ข้อความ",
      "profile_image_url": "https://example.com/image.jpg"
    },
    "messages": [
      {
        "id": 1,
        "sender_user_id": 1,
        "recipient_user_id": 2,
        "subject": "สอบถามเกี่ยวกับการบริจาค",
        "message_content": "สวัสดีครับ ผมต้องการสอบถามเกี่ยวกับการบริจาคเสื้อผ้าเด็ก",
        "message_type": "inquiry",
        "is_read": true,
        "created_at": "2024-01-01T00:00:00Z"
      },
      {
        "id": 2,
        "sender_user_id": 2,
        "recipient_user_id": 1,
        "subject": "Re: สอบถามเกี่ยวกับการบริจาค",
        "message_content": "สวัสดีครับ ยินดีให้คำแนะนำครับ",
        "message_type": "reply",
        "is_read": false,
        "created_at": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

---

## สรุป

### สถานะการตอบสนอง (HTTP Status Codes)
- `200` - สำเร็จ
- `201` - สร้างสำเร็จ
- `400` - ข้อมูลไม่ถูกต้อง
- `401` - ไม่ได้รับอนุญาต (ไม่มี token หรือ token ไม่ถูกต้อง)
- `403` - ไม่อนุญาต (ไม่มีสิทธิ์เข้าถึง)
- `404` - ไม่พบข้อมูล
- `422` - ข้อมูลไม่ผ่านการตรวจสอบ
- `500` - ข้อผิดพลาดภายในเซิร์ฟเวอร์

### ประเภทผู้ใช้ (User Types)
- `donor` - ผู้บริจาค
- `foundation_admin` - ผู้ดูแลมูลนิธิ
- `system_admin` - แอดมินระบบ

### สถานะการบริจาค (Pledge Status)
- `pending_approval` - รอการอนุมัติ
- `approved` - อนุมัติแล้ว
- `rejected` - ปฏิเสธ
- `cancelled` - ยกเลิก
- `received` - รับแล้ว

### วิธีการจัดส่ง (Delivery Methods)
- `self_delivery` - ส่งเอง
- `courier_service` - บริการขนส่ง
- `foundation_pickup` - มูลนิธิรับเอง

### ระดับความสำคัญ (Priority Levels)
- `low` - ต่ำ
- `medium` - ปานกลาง
- `high` - สูง

### สถานะการแจ้งเตือน (Notification Types)
- `pledge_approved` - การบริจาคได้รับการอนุมัติ
- `pledge_rejected` - การบริจาคถูกปฏิเสธ
- `new_review` - มีรีวิวใหม่
- `foundation_verified` - มูลนิธิได้รับการยืนยัน

---

**หมายเหตุ**: คู่มือนี้ครอบคลุม API ทั้งหมดของระบบบริจาค หากมีการอัปเดตหรือเพิ่มเติม endpoint ใหม่ กรุณาอัปเดตคู่มือนี้ตามความเหมาะสม 