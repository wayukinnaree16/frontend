import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { FileText, Shield, Users, Heart, AlertCircle, Mail, RefreshCw, Phone, MapPin } from 'lucide-react';

const Terms = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6">
              <FileText className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              ข้อกำหนดและเงื่อนไขการใช้งาน
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              กรุณาอ่านข้อกำหนดและเงื่อนไขเหล่านี้อย่างละเอียดก่อนใช้งานเว็บไซต์
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            {/* Section 1 */}
            <div className="bg-white rounded-2xl shadow-soft p-8 border border-gray-100">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold mb-4 text-gray-900">1. การยอมรับข้อกำหนด</h2>
                  <p className="text-gray-700 leading-relaxed">
                    การเข้าใช้งานเว็บไซต์นี้ถือว่าท่านได้อ่าน เข้าใจ และยอมรับข้อกำหนดและเงื่อนไขการใช้งานทั้งหมด 
                    หากท่านไม่ยอมรับข้อกำหนดเหล่านี้ กรุณาหยุดการใช้งานเว็บไซต์ทันที
                  </p>
                </div>
              </div>
            </div>

            {/* Section 2 */}
            <div className="bg-white rounded-2xl shadow-soft p-8 border border-gray-100">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Heart className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold mb-4 text-gray-900">2. การใช้งานเว็บไซต์</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    เว็บไซต์นี้มีวัตถุประสงค์เพื่อเป็นแพลตฟอร์มเชื่อมโยงระหว่างผู้บริจาคและมูลนิธิต่างๆ 
                    ท่านสามารถใช้งานเว็บไซต์เพื่อ:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-gray-700">ค้นหาและดูข้อมูลมูลนิธิ</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-gray-700">ดูรายการสิ่งของที่ต้องการความช่วยเหลือ</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-gray-700">ทำการบริจาคหรือให้ความช่วยเหลือ</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-gray-700">สร้างบัญชีและจัดการข้อมูลส่วนตัว</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3 */}
            <div className="bg-white rounded-2xl shadow-soft p-8 border border-gray-100">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold mb-4 text-gray-900">3. บัญชีผู้ใช้งาน</h2>
                  <p className="text-gray-700 leading-relaxed">
                    ท่านมีหน้าที่รับผิดชอบในการรักษาความปลอดภัยของบัญชีและรหัสผ่าน 
                    ห้ามแชร์ข้อมูลบัญชีกับบุคคลอื่น และต้องแจ้งให้เราทราบทันทีหากพบการใช้งานที่ผิดปกติ
                  </p>
                </div>
              </div>
            </div>

            {/* Section 4 */}
            <div className="bg-white rounded-2xl shadow-soft p-8 border border-gray-100">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Heart className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold mb-4 text-gray-900">4. การบริจาคและความรับผิดชอบ</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    เว็บไซต์นี้เป็นเพียงตัวกลางในการเชื่อมโยง เราไม่รับผิดชอบต่อ:
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg border-l-4 border-orange-200">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">ความถูกต้องของข้อมูลที่มูลนิธิให้ไว้</span>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg border-l-4 border-orange-200">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">การใช้งานเงินบริจาคหรือสิ่งของที่บริจาค</span>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg border-l-4 border-orange-200">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">ข้อพิพาทระหว่างผู้บริจาคและมูลนิธิ</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 5 */}
            <div className="bg-white rounded-2xl shadow-soft p-8 border border-gray-100">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-indigo-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold mb-4 text-gray-900">5. ข้อมูลส่วนบุคคล</h2>
                  <p className="text-gray-700 leading-relaxed">
                    เราจะเก็บรักษาข้อมูลส่วนบุคคลของท่านตามนโยบายความเป็นส่วนตัว 
                    และจะไม่เปิดเผยข้อมูลให้กับบุคคลที่สามโดยไม่ได้รับความยินยอมจากท่าน
                  </p>
                </div>
              </div>
            </div>

            {/* Section 6 */}
            <div className="bg-white rounded-2xl shadow-soft p-8 border border-gray-100">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold mb-4 text-gray-900">6. ข้อห้าม</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">ท่านห้าม:</p>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border-l-4 border-red-200">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">ใช้งานเว็บไซต์เพื่อวัตถุประสงค์ที่ผิดกฎหมาย</span>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border-l-4 border-red-200">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">อัปโหลดเนื้อหาที่ไม่เหมาะสม หยาบคาย หรือละเมิดลิขสิทธิ์</span>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border-l-4 border-red-200">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">รบกวนหรือขัดขวางการทำงานของระบบ</span>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border-l-4 border-red-200">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">ปลอมแปลงข้อมูลหรือแอบอ้างเป็นบุคคลอื่น</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 7 */}
            <div className="bg-white rounded-2xl shadow-soft p-8 border border-gray-100">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold mb-4 text-gray-900">7. การเปลี่ยนแปลงข้อกำหนด</h2>
                  <p className="text-gray-700 leading-relaxed">
                    เราขอสงวนสิทธิ์ในการเปลี่ยนแปลงข้อกำหนดและเงื่อนไขเหล่านี้ได้ตลอดเวลา 
                    โดยจะแจ้งให้ทราบผ่านเว็บไซต์ การใช้งานต่อไปถือว่าท่านยอมรับการเปลี่ยนแปลง
                  </p>
                </div>
              </div>
            </div>

            {/* Section 8 */}
            <div className="bg-white rounded-2xl shadow-soft p-8 border border-gray-100">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Mail className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold mb-4 text-gray-900">8. การติดต่อ</h2>
                  <p className="text-gray-700 leading-relaxed">
                    หากท่านมีคำถามเกี่ยวกับข้อกำหนดและเงื่อนไขเหล่านี้ 
                    กรุณาติดต่อเราผ่านช่องทางที่ระบุไว้ในเว็บไซต์
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center mt-12 pt-8 border-t border-gray-200">
              <p className="text-gray-600">
                ข้อกำหนดและเงื่อนไขนี้มีผลบังคับใช้ตั้งแต่วันที่ 1 มกราคม 2025
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Terms;