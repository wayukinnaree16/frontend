import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Building2, MapPin, Phone, Mail, Heart, Users, Target, Award } from 'lucide-react';

const About = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Building2 className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-bold mb-6">เกี่ยวกับเรา</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              แพลตฟอร์มเชื่อมโยงการบริจาคที่เชื่อถือได้ เพื่อสร้างสังคมที่ดีกว่าร่วมกัน
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16">
          {/* Company Info Section */}
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-12 border border-gray-100">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-6 text-gray-900">บริษัท ITKEYGAY</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">ที่อยู่</h3>
                        <p className="text-gray-700 leading-relaxed">
                          41/11 ต.โพนทอง อ.เชียงยืน<br />
                          จ.มหาสารคาม ประเทศไทย
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Phone className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">เบอร์โทรศัพท์</h3>
                        <p className="text-gray-700">0633141354</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Mail className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">อีเมล</h3>
                        <p className="text-gray-700">it.keygay@gmail.com</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mission & Vision */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-2xl shadow-soft p-8 border border-gray-100">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-orange-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900">พันธกิจ</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">
                สร้างแพลตฟอร์มที่เชื่อมโยงผู้บริจาคกับมูลนิธิต่างๆ อย่างโปร่งใส 
                เพื่อให้การช่วยเหลือสังคมเป็นไปอย่างมีประสิทธิภาพและเข้าถึงได้ง่าย 
                ด้วยเทคโนโลยีที่ทันสมัยและการบริการที่เป็นเลิศ
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-soft p-8 border border-gray-100">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900">วิสัยทัศน์</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">
                เป็นแพลตฟอร์มการบริจาคออนไลน์อันดับหนึ่งของประเทศไทย 
                ที่สร้างความเชื่อมั่นและความโปร่งใสในการช่วยเหลือสังคม 
                เพื่อให้ทุกคนสามารถมีส่วนร่วมในการสร้างสังคมที่ดีกว่า
              </p>
            </div>
          </div>

          {/* Values */}
          <div className="bg-white rounded-2xl shadow-soft p-8 border border-gray-100 mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">ค่านิยมองค์กร</h2>
              <p className="text-gray-600">หลักการที่เราใช้ในการดำเนินงานและพัฒนาแพลตฟอร์ม</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">ความโปร่งใส</h3>
                <p className="text-gray-600 leading-relaxed">
                  เปิดเผยข้อมูลการบริจาคและการใช้งานเงินอย่างชัดเจน เพื่อสร้างความเชื่อมั่น
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">การมีส่วนร่วม</h3>
                <p className="text-gray-600 leading-relaxed">
                  สร้างชุมชนที่ทุกคนสามารถมีส่วนร่วมในการช่วยเหลือสังคมได้อย่างง่ายดาย
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">ความเป็นเลิศ</h3>
                <p className="text-gray-600 leading-relaxed">
                  มุ่งมั่นพัฒนาเทคโนโลยีและบริการให้ดีที่สุด เพื่อประสบการณ์ที่ยอดเยี่ยม
                </p>
              </div>
            </div>
          </div>

          {/* Contact CTA */}
          <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl p-8 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">ติดต่อเรา</h2>
            <p className="text-blue-100 mb-6 text-lg">
              หากคุณมีคำถามหรือต้องการความช่วยเหลือ เรายินดีให้บริการ
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                <Phone className="w-5 h-5" />
                <span>0633141354</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                <Mail className="w-5 h-5" />
                <span>it.keygay@gmail.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default About;