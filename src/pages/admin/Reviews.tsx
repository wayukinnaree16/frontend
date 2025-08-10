import React, { useEffect, useState } from 'react';
import { adminService } from '@/services/admin.service';

const AdminReviews = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<{ id: number, type: 'approve' | 'reject' } | null>(null);
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await adminService.getPendingReviews();
        // รองรับทั้งกรณี data.reviews เป็น array และ fallback เป็น []
        setReviews(Array.isArray(res.data?.reviews) ? res.data.reviews : []);
      } catch (e) {
        setError('เกิดข้อผิดพลาดในการโหลดรีวิว');
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const handleAction = async () => {
    if (!modal || !modal.id) return;
    try {
      if (modal.type === 'approve') {
        await adminService.approveReview(modal.id, { admin_review_remarks: remarks });
      } else {
        await adminService.rejectReview(modal.id, { admin_review_remarks: remarks });
      }
      setReviews(reviews => reviews.filter(r => r.id !== modal.id));
      setModal(null);
      setRemarks('');
    } catch {
      alert(modal.type === 'approve' ? 'อนุมัติไม่สำเร็จ' : 'ปฏิเสธไม่สำเร็จ');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">จัดการรีวิว</h1>
        {loading ? <div>กำลังโหลด...</div> : error ? <div className="text-red-500">{error}</div> : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-xl shadow-soft">
              <thead>
                <tr className="bg-muted">
                  <th className="py-3 px-4 text-left font-semibold">คะแนน</th>
                  <th className="py-3 px-4 text-left font-semibold">ข้อความ</th>
                  <th className="py-3 px-4 text-left font-semibold">ผู้บริจาค</th>
                  <th className="py-3 px-4 text-left font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map(review => {
                  const reviewId = review.review_id || review.id;
                  return (
                    <tr key={reviewId} className="border-b last:border-0">
                      <td className="py-3 px-4">{review.rating}</td>
                      <td className="py-3 px-4">{review.review_text}</td>
                      <td className="py-3 px-4">{review.donor?.first_name} {review.donor?.last_name}</td>
                      <td className="py-3 px-4 flex gap-2">
                        <button onClick={() => { setModal({ id: reviewId, type: 'approve' }); setRemarks(''); }} className="px-3 py-1 bg-green-500 text-white rounded">อนุมัติ</button>
                        <button onClick={() => { setModal({ id: reviewId, type: 'reject' }); setRemarks(''); }} className="px-3 py-1 bg-red-500 text-white rounded">ปฏิเสธ</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {/* Modal */}
        {modal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">{modal.type === 'approve' ? 'อนุมัติรีวิว' : 'ปฏิเสธรีวิว'}</h2>
              <label className="block mb-2">หมายเหตุ (สำหรับแอดมิน)</label>
              <textarea
                className="w-full border rounded px-3 py-2 mb-4"
                rows={3}
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                placeholder="ใส่หมายเหตุ (ถ้ามี)"
              />
              <div className="flex gap-2 justify-end">
                <button onClick={() => setModal(null)} className="px-4 py-2 bg-gray-300 rounded">ยกเลิก</button>
                <button onClick={handleAction} className={`px-4 py-2 rounded text-white ${modal.type === 'approve' ? 'bg-green-600' : 'bg-red-600'}`}>{modal.type === 'approve' ? 'อนุมัติ' : 'ปฏิเสธ'}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReviews;