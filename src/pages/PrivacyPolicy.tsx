import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Shield, Eye, Lock, Database, UserCheck, Bell, Trash2, Phone, Mail, MapPin } from 'lucide-react';

const PrivacyPolicy = () => (
  <Layout>
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <Shield className="w-16 h-16 mx-auto mb-6 text-blue-100" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">นโยบายความเป็นส่วนตัว</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            เราให้ความสำคัญกับความเป็นส่วนตัวและการปกป้องข้อมูลส่วนบุคคลของคุณ
          </p>
          <div className="mt-8 text-sm text-blue-200">
            อัปเดตล่าสุด: 1 มกราคม 2025
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid gap-8 max-w-4xl mx-auto">
          {/* Section 1: การเก็บรวบรวมข้อมูล */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-6">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <Database className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">การเก็บรวบรวมข้อมูล</h2>
            </div>
            <div className="space-y-4 text-gray-600">
              <p>เราเก็บรวบรวมข้อมูลส่วนบุคคลของคุณในกรณีต่อไปนี้:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>ข้อมูลที่คุณให้ไว้เมื่อสมัครสมาชิก (ชื่อ, อีเมล, เบอร์โทรศัพท์)</li>
                <li>ข้อมูลการใช้งานเว็บไซต์และแอปพลิเคชัน</li>
                <li>ข้อมูลการบริจาคและประวัติการทำธุรกรรม</li>
                <li>ข้อมูลที่ได้จากคุกกี้และเทคโนโลยีติดตาม</li>
              </ul>
            </div>
          </div>

          {/* Section 2: การใช้ข้อมูล */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-6">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">การใช้ข้อมูล</h2>
            </div>
            <div className="space-y-4 text-gray-600">
              <p>เราใช้ข้อมูลส่วนบุคคลของคุณเพื่อ:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>ให้บริการแพลตฟอร์มบริจาคออนไลน์</li>
                <li>ประมวลผลการบริจาคและการทำธุรกรรม</li>
                <li>ส่งการแจ้งเตือนและข้อมูลข่าวสารที่เกี่ยวข้อง</li>
                <li>ปรับปรุงและพัฒนาบริการของเรา</li>
                <li>ป้องกันการฉ้อโกงและรักษาความปลอดภัย</li>
              </ul>
            </div>
          </div>

          {/* Section 3: การปกป้องข้อมูล */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-6">
              <div className="bg-purple-100 p-3 rounded-full mr-4">
                <Lock className="w-6 h-6 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">การปกป้องข้อมูล</h2>
            </div>
            <div className="space-y-4 text-gray-600">
              <p>เรามีมาตรการรักษาความปลอดภัยข้อมูลดังนี้:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>การเข้ารหัสข้อมูลด้วยเทคโนโลยี SSL/TLS</li>
                <li>การจำกัดการเข้าถึงข้อมูลเฉพาะบุคคลที่ได้รับอนุญาต</li>
                <li>การสำรองข้อมูลและระบบกู้คืนข้อมูล</li>
                <li>การตรวจสอบและประเมินความปลอดภัยอย่างสม่ำเสมอ</li>
              </ul>
            </div>
          </div>

          {/* Section 4: สิทธิของผู้ใช้ */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-6">
              <div className="bg-orange-100 p-3 rounded-full mr-4">
                <UserCheck className="w-6 h-6 text-orange-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">สิทธิของผู้ใช้</h2>
            </div>
            <div className="space-y-4 text-gray-600">
              <p>คุณมีสิทธิในการ:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>เข้าถึงและขอสำเนาข้อมูลส่วนบุคคลของคุณ</li>
                <li>แก้ไขหรือปรับปรุงข้อมูลที่ไม่ถูกต้อง</li>
                <li>ขอให้ลบข้อมูลส่วนบุคคลของคุณ</li>
                <li>คัดค้านการประมวลผลข้อมูลในบางกรณี</li>
                <li>ถอนความยินยอมในการประมวลผลข้อมูล</li>
              </ul>
            </div>
          </div>

          {/* Section 5: คุกกี้ */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-6">
              <div className="bg-indigo-100 p-3 rounded-full mr-4">
                <Bell className="w-6 h-6 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">การใช้คุกกี้</h2>
            </div>
            <div className="space-y-4 text-gray-600">
              <p>เราใช้คุกกี้เพื่อ:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>จดจำการตั้งค่าและความต้องการของคุณ</li>
                <li>วิเคราะห์การใช้งานเว็บไซต์</li>
                <li>ปรับปรุงประสบการณ์การใช้งาน</li>
                <li>แสดงเนื้อหาและโฆษณาที่เหมาะสม</li>
              </ul>
              <p className="mt-4">คุณสามารถปิดการใช้งานคุกกี้ได้ในการตั้งค่าเบราว์เซอร์ของคุณ</p>
            </div>
          </div>

          {/* Section 6: การลบข้อมูล */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-6">
              <div className="bg-red-100 p-3 rounded-full mr-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">การเก็บรักษาและลบข้อมูล</h2>
            </div>
            <div className="space-y-4 text-gray-600">
              <p>เราจะเก็บรักษาข้อมูลส่วนบุคคลของคุณ:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>ตราบเท่าที่จำเป็นสำหรับการให้บริการ</li>
                <li>ตามระยะเวลาที่กฎหมายกำหนด</li>
                <li>จนกว่าคุณจะขอให้ลบข้อมูล</li>
              </ul>
              <p className="mt-4">เมื่อไม่จำเป็นต้องใช้ข้อมูลแล้ว เราจะลบหรือทำลายข้อมูลอย่างปลอดภัย</p>
            </div>
          </div>

          {/* Contact Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg p-8 text-white">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-4">ติดต่อเรา</h2>
              <p className="text-blue-100">หากคุณมีคำถามเกี่ยวกับนโยบายความเป็นส่วนตัวนี้</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-center justify-center">
                <MapPin className="w-5 h-5 mr-3 text-blue-200" />
                <div>
                  <div className="font-semibold">ที่อยู่</div>
                  <div className="text-sm text-blue-200">41/11 ต.โพนทอง อ.เชียงยืน มหาสารคาม</div>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <Phone className="w-5 h-5 mr-3 text-blue-200" />
                <div>
                  <div className="font-semibold">โทรศัพท์</div>
                  <div className="text-sm text-blue-200">0633141354</div>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <Mail className="w-5 h-5 mr-3 text-blue-200" />
                <div>
                  <div className="font-semibold">อีเมล</div>
                  <div className="text-sm text-blue-200">it.keygay@gmail.com</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Layout>
);

export default PrivacyPolicy;