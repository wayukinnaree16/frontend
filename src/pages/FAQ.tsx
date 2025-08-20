import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ChevronDown, ChevronUp, HelpCircle, Heart, Shield, Users, Phone } from 'lucide-react';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  {
    id: 1,
    question: "ระบบบริจาคออนไลน์นี้คืออะไร?",
    answer: "ระบบบริจาคออนไลน์ของเราเป็นแพลตฟอร์มที่เชื่อมต่อผู้บริจาคกับมูลนิธิและองค์กรการกุศลที่ได้รับการตรวจสอบแล้ว ช่วยให้การบริจาคเป็นไปอย่างโปร่งใสและปลอดภัย",
    category: "ทั่วไป"
  },
  {
    id: 2,
    question: "วิธีการสมัครสมาชิกอย่างไร?",
    answer: "คุณสามารถสมัครสมาชิกได้โดยคลิกปุ่ม 'สมัครสมาชิก' ที่มุมขวาบนของหน้าเว็บ กรอกข้อมูลส่วนตัว อีเมล และรหัสผ่าน จากนั้นยืนยันอีเมลเพื่อเปิดใช้งานบัญชี",
    category: "บัญชีผู้ใช้"
  },
  {
    id: 3,
    question: "การบริจาคผ่านระบบปลอดภัยหรือไม่?",
    answer: "ใช่ ระบบของเราใช้เทคโนโลยีการเข้ารหัสข้อมูลระดับธนาคาร (SSL 256-bit) และร่วมมือกับผู้ให้บริการชำระเงินที่ได้รับการรับรองมาตรฐานสากล เพื่อความปลอดภัยสูงสุด",
    category: "ความปลอดภัย"
  },

  {
    id: 6,
    question: "มูลนิธิที่อยู่ในระบบได้รับการตรวจสอบอย่างไร?",
    answer: "มูลนิธิทุกแห่งต้องผ่านกระบวนการตรวจสอบเอกสารทางกฎหมาย ใบอนุญาตจัดตั้ง และข้อมูลการดำเนินงาน โดยทีมงานของเราจะตรวจสอบความถูกต้องก่อนอนุมัติให้เข้าร่วมระบบ",
    category: "มูลนิธิ"
  },
  {
    id: 7,
    question: "สามารถติดตามการใช้เงินบริจาคได้หรือไม่?",
    answer: "ได้ เราส่งเสริมความโปร่งใส มูลนิธิจะต้องรายงานการใช้เงินบริจาคและผลการดำเนินงาน คุณสามารถดูรายงานเหล่านี้ได้ในหน้าโปรไฟล์ของแต่ละมูลนิธิ",
    category: "มูลนิธิ"
  },

  {
    id: 8,
    question: "มูลนิธิสามารถสมัครเข้าร่วมระบบได้อย่างไร?",
    answer: "มูลนิธิสามารถสมัครได้โดยคลิกปุ่ม 'สมัครสมาชิก' และเลือกประเภท 'มูลนิธิ' จากนั้นกรอกข้อมูลองค์กร อัปโหลดเอกสารที่จำเป็น เช่น ใบอนุญาตจัดตั้ง และรอการตรวจสอบจากทีมงาน",
    category: "มูลนิธิ"
  },
  {
    id: 9,
    question: "สามารถดูประวัติการบริจาคได้ที่ไหน?",
    answer: "หลังจากเข้าสู่ระบบแล้ว คุณสามารถดูประวัติการบริจาคทั้งหมดได้ในหน้า 'บัญชีของฉัน' ซึ่งจะแสดงรายละเอียดการบริจาค วันที่ จำนวนเงิน และสถานะของแต่ละรายการ",
    category: "บัญชีผู้ใช้"
  },
  {
    id: 10,
    question: "ระบบมีการแจ้งเตือนหรือไม่?",
    answer: "ใช่ ระบบจะส่งการแจ้งเตือนผ่านอีเมลเมื่อมีการบริจาคสำเร็จ เมื่อมูลนิธิที่คุณติดตามมีอัปเดตใหม่ หรือเมื่อมีกิจกรรมพิเศษที่น่าสนใจ",
    category: "ทั่วไป"
  },
  {
    id: 11,
    question: "สามารถค้นหามูลนิธิตามประเภทได้หรือไม่?",
    answer: "ได้ คุณสามารถค้นหามูลนิธิได้หลายวิธี เช่น ตามประเภทมูลนิธิ (เด็ก ผู้สูงอายุ สัตว์) ตามจังหวัด หรือค้นหาจากชื่อมูลนิธิโดยตรง ผ่านหน้า 'ค้นหามูลนิธิ'",
    category: "มูลนิธิ"
  },
  {
    id: 12,
    question: "มีระบบรีวิวและความคิดเห็นหรือไม่?",
    answer: "ใช่ ผู้บริจาคสามารถให้คะแนนและเขียนรีวิวเกี่ยวกับมูลนิธิได้หลังจากบริจาค ซึ่งจะช่วยให้ผู้บริจาครายอื่นได้ข้อมูลในการตัดสินใจ และช่วยสร้างความโปร่งใสในระบบ",
    category: "ทั่วไป"
  },
  {
    id: 13,
    question: "ติดต่อทีมสนับสนุนได้อย่างไร?",
    answer: "คุณสามารถติดต่อเราได้ผ่าน อีเมล: it.keygay@gmail.com, โทรศัพท์: 063-314-1354 หรือส่งข้อความผ่านแบบฟอร์มติดต่อในเว็บไซต์ เราพร้อมให้บริการทุกวันจันทร์-ศุกร์ เวลา 9:00-18:00 น.",
    category: "ติดต่อ"
  }
];

const FAQ = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ทั้งหมด');

  const categories = ['ทั้งหมด', 'ทั่วไป', 'บัญชีผู้ใช้', 'ความปลอดภัย', 'มูลนิธิ', 'ติดต่อ'];

  const toggleItem = (id: number) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const filteredFAQs = selectedCategory === 'ทั้งหมด' 
    ? faqData 
    : faqData.filter(item => item.category === selectedCategory);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ทั่วไป': return <HelpCircle className="h-4 w-4" />;
      case 'บัญชีผู้ใช้': return <Users className="h-4 w-4" />;
      case 'ความปลอดภัย': return <Shield className="h-4 w-4" />;
      
      case 'มูลนิธิ': return <Heart className="h-4 w-4" />;
      case 'ติดต่อ': return <Phone className="h-4 w-4" />;
      default: return <HelpCircle className="h-4 w-4" />;
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/20 p-4 rounded-full">
                <HelpCircle className="h-12 w-12" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">คำถามที่พบบ่อย</h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              รวมคำถามและคำตอบที่พบบ่อยเกี่ยวกับการใช้งานแพลตฟอร์มบริจาคออนไลน์
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {/* Category Filter */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-white text-gray-600 hover:bg-blue-50 border border-gray-200'
                  }`}
                >
                  {category !== 'ทั้งหมด' && getCategoryIcon(category)}
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* FAQ Items */}
          <div className="max-w-4xl mx-auto">
            <div className="space-y-4">
              {filteredFAQs.map((item) => (
                <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <button
                    onClick={() => toggleItem(item.id)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-blue-600">
                        {getCategoryIcon(item.category)}
                      </div>
                      <h3 className="font-semibold text-gray-900">{item.question}</h3>
                    </div>
                    <div className="text-gray-400">
                      {openItems.includes(item.id) ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </div>
                  </button>
                  
                  {openItems.includes(item.id) && (
                    <div className="px-6 pb-4">
                      <div className="pl-7 text-gray-600 leading-relaxed">
                        {item.answer}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Contact Section */}
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
              <h2 className="text-2xl font-bold mb-4">ไม่พบคำตอบที่ต้องการ?</h2>
              <p className="text-blue-100 mb-6">
                ทีมงานของเราพร้อมให้ความช่วยเหลือและตอบคำถามเพิ่มเติม
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <div className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  <span>063-314-1354</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📧</span>
                  <span>it.keygay@gmail.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FAQ;