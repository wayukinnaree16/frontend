import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { adminService } from '@/services/admin.service';
import { toast } from '@/hooks/use-toast';

const FoundationVerification = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [foundation, setFoundation] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Try to get foundation by ID first, fallback to filtering all foundations
      let foundationData = null;
      let docsRes = null;
      
      try {
        // Try the new direct endpoint first
        const [foundationRes, docsResTemp] = await Promise.all([
          adminService.getFoundationById(id!),
          adminService.getFoundationDocuments(id!),
        ]);
        
        // Based on console logs, foundation data is directly in foundationRes.data
        if (foundationRes.data) {
          foundationData = foundationRes.data;
          docsRes = docsResTemp;
        }
      } catch (directError) {
        console.log('Direct endpoint failed, trying fallback method:', directError);
        
        // Fallback to the old method
        const [allFoundationsRes, docsResTemp] = await Promise.all([
          adminService.getAllFoundations(),
          adminService.getFoundationDocuments(id!),
        ]);
        
        const found = allFoundationsRes.data?.foundations?.find((f: any) => 
          String(f.foundation_id || f.id) === String(id)
        );
        
        if (found) {
          foundationData = found;
          docsRes = docsResTemp;
        }
      }
      
      if (foundationData) {
        setFoundation(foundationData);

        // Normalize documents response: backend may return an array directly (docsRes.data = [ ... ])
        // or an object with `{ documents: [...] }`. Also DB columns may be `document_id` instead of `id`.
        const rawDocs = docsRes?.data ?? docsRes?.data?.documents ?? [];
        const normalizedDocs = Array.isArray(rawDocs)
          ? rawDocs.map((d: any) => ({
              id: d.id ?? d.document_id,
              document_id: d.document_id ?? d.id,
              document_type: d.document_type,
              document_name: d.document_name,
              document_url: d.document_url,
              description: d.description,
              expiry_date: d.expiry_date,
              upload_date: d.upload_date,
              verification_status_by_admin: foundationData.foundation_status === 'active' ? 'approved' : (d.verification_status_by_admin ?? d.status),
              admin_remarks: d.admin_remarks ?? d.review_notes ?? null,
            }))
          : [];

        setDocuments(normalizedDocs);
      } else {
        setError('ไม่พบข้อมูลมูลนิธิ หรือเกิดข้อผิดพลาดในการโหลดข้อมูล');
        setFoundation(null);
      }
    } catch (e: any) {
      console.error('Error fetching foundation:', e);
      const errorMessage = e.response?.data?.message || e.message || 'ไม่พบข้อมูลมูลนิธิ หรือเกิดข้อผิดพลาดในการโหลดข้อมูล';
      setError(errorMessage);
      setFoundation(null);
    } finally {
      setLoading(false);
    }
  }, [id]); // Add id to useCallback dependencies

  useEffect(() => {
    if (!id || id === 'undefined' || isNaN(Number(id))) {
      navigate('/admin/foundations');
      return;
    }
    fetchData();
  }, [id, fetchData, navigate]); // Add fetchData and navigate to useEffect dependencies

  const handleApprove = async () => {
    if (!id) return;
    
    // Validate foundation state before approval based on foundation_status
    if (foundation.foundation_status === 'active') {
      alert('มูลนิธินี้ได้รับการอนุมัติแล้ว');
      return;
    }
    
    if (foundation.foundation_status === 'rejected') {
      alert('มูลนิธินี้ถูกปฏิเสธแล้ว ไม่สามารถอนุมัติได้');
      return;
    }
    
    setActionLoading(true);
    try {
      console.log('Attempting to approve foundation with ID:', id);
      console.log('Foundation data:', foundation);
      await adminService.approveFoundation(id);

      // Approve all associated documents
      const documentApprovalPromises = documents.map(doc =>
        adminService.reviewDocument(doc.id, { status: 'approved' })
      );
      await Promise.all(documentApprovalPromises);

      toast({ title: 'อนุมัติมูลนิธิและเอกสารสำเร็จ', description: 'สถานะมูลนิธิและเอกสารได้รับการอัปเดตแล้ว' });
      // Re-fetch data to ensure UI is consistent before navigating
      await fetchData(); 
      navigate('/admin/foundations');
    } catch (e: any) {
      console.error('Error approving foundation:', e);
      const errorMessage = e.response?.data?.message || e.message || 'เกิดข้อผิดพลาดในการอนุมัติ';
      const errorDetails = e.response?.data ? JSON.stringify(e.response.data, null, 2) : '';
      alert(`Error: ${errorMessage}\n\nDetails: ${errorDetails}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!id || !rejectReason) return;
    
    // Validate foundation state before rejection based on foundation_status
    if (foundation.foundation_status === 'active') {
      alert('มูลนิธินี้ได้รับการอนุมัติแล้ว ไม่สามารถปฏิเสธได้');
      return;
    }
    
    if (foundation.foundation_status === 'rejected') {
      alert('มูลนิธินี้ถูกปฏิเสธแล้ว');
      return;
    }
    
    setActionLoading(true);
    try {
      console.log('Attempting to reject foundation with ID:', id);
      console.log('Rejection reason:', rejectReason);
      await adminService.rejectFoundation(id, { verification_notes: rejectReason });
      toast({ title: 'ปฏิเสธมูลนิธิสำเร็จ', description: 'สถานะมูลนิธิได้รับการอัปเดตแล้ว' });
      navigate('/admin/foundations');
    } catch (e: any) {
      console.error('Error rejecting foundation:', e);
      const errorMessage = e.response?.data?.message || e.message || 'เกิดข้อผิดพลาดในการปฏิเสธ';
      const errorDetails = e.response?.data ? JSON.stringify(e.response.data, null, 2) : '';
      alert(`Error: ${errorMessage}\n\nDetails: ${errorDetails}`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      <h1 className="text-3xl font-bold mb-6">ตรวจสอบมูลนิธิ</h1>
      {loading ? (
        <div>กำลังโหลดข้อมูล...</div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold mb-2">เกิดข้อผิดพลาด</h3>
          <p className="text-red-700">{error}</p>
          <div className="mt-3 text-sm text-red-600">
            <p><strong>Foundation ID:</strong> {id}</p>
            <p><strong>URL:</strong> /admin/foundation-verification/{id}</p>
          </div>
          <div className="mt-3">
            <Link to="/admin/foundations" className="text-blue-600 hover:underline">
              ← กลับไปยังรายการมูลนิธิ
            </Link>
          </div>
        </div>
      ) : !foundation ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-yellow-800 font-semibold mb-2">ไม่พบข้อมูลมูลนิธิ</h3>
          <p className="text-yellow-700">ไม่พบมูลนิธิที่มี ID: {id}</p>
          <div className="mt-3">
            <Link to="/admin/foundations" className="text-blue-600 hover:underline">
              ← กลับไปยังรายการมูลนิธิ
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">ข้อมูลมูลนิธิ</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><b>ชื่อมูลนิธิ:</b> {foundation.foundation_name}</div>
              <div><b>อีเมล:</b> {foundation.contact_email}</div>
              <div><b>เบอร์โทร:</b> {foundation.contact_phone}</div>
              <div><b>ที่อยู่:</b> {`${foundation.address_line1 || ''} ${foundation.address_line2 || ''} ${foundation.city || ''} ${foundation.province || ''} ${foundation.postal_code || ''} ${foundation.country || ''}`.trim()}</div>
              <div>
                <b>ประเภทมูลนิธิ:</b>{" "}
                {foundation.foundation_type?.name
                  || (foundation.foundation_type_id ? `ประเภท #${foundation.foundation_type_id}` : 'ไม่ระบุ')}
              </div>
              <div><b>เว็บไซต์:</b> {foundation.website_url ? <a href={foundation.website_url} target="_blank" rel="noopener noreferrer" className="text-primary underline">{foundation.website_url}</a> : '-'}</div>
              <div><b>สถานะ:</b> {
                foundation.foundation_status === 'active' ? 'ยืนยันแล้ว' :
                foundation.foundation_status === 'pending_verification' ? 'รอการยืนยัน' :
                foundation.foundation_status === 'rejected' ? 'ถูกปฏิเสธ' :
                'ไม่ทราบสถานะ'
              }</div>
              <div><b>Foundation ID:</b> {foundation.foundation_id || foundation.id}</div>
              <div><b>User ID:</b> {foundation.user_id || foundation.admin_user_id}</div>
              {foundation.verified_at && <div><b>วันที่ยืนยัน:</b> {new Date(foundation.verified_at).toLocaleDateString('th-TH')}</div>}
              {foundation.rejected_at && <div><b>วันที่ปฏิเสธ:</b> {new Date(foundation.rejected_at).toLocaleDateString('th-TH')}</div>}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">เอกสารประกอบ</h2>
            {documents.length === 0 ? (
              <div className="text-muted-foreground">ไม่มีเอกสาร</div>
            ) : (
              <ul className="space-y-2">
                {documents.map(doc => (
                  <li key={doc.id} className="border rounded p-3 flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <b>{doc.document_name}</b> ({doc.document_type})<br/>
                      {doc.description && <span className="text-sm text-muted-foreground">{doc.description}</span>}<br/>
                      {doc.expiry_date && <span className="text-sm">วันหมดอายุ: {new Date(doc.expiry_date).toLocaleDateString('th-TH')}</span>}
                    </div>
                    <div className="mt-2 md:mt-0">
                      <a href={doc.document_url} target="_blank" rel="noopener noreferrer" className="text-primary underline">ดูเอกสาร</a>
                      {doc.verification_status_by_admin === 'approved' && (
                        <span className="text-green-600 text-sm ml-2">ตรวจสอบแล้ว</span>
                      )}
                      {doc.verification_status_by_admin === 'rejected' && (
                        <span className="text-red-600 text-sm ml-2">ปฏิเสธแล้ว</span>
                      )}
                      {doc.verification_status_by_admin === 'pending_review' && (
                        <span className="text-yellow-600 text-sm ml-2">รอตรวจสอบ</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Check if foundation is pending verification based on foundation_status */}
            {foundation.foundation_status === 'pending_verification' && (
              <>
                <button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="px-6 py-2 rounded bg-green-600 text-white font-semibold hover:bg-green-700 transition disabled:opacity-50"
                >
                  {actionLoading ? 'กำลังอนุมัติ...' : 'อนุมัติ'}
                </button>
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    placeholder="เหตุผลการปฏิเสธ (ถ้ามี)"
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    className="px-3 py-2 border rounded"
                  />
                  <button
                    onClick={handleReject}
                    disabled={actionLoading || !rejectReason}
                    className="px-6 py-2 rounded bg-red-600 text-white font-semibold hover:bg-red-700 transition disabled:opacity-50"
                  >
                    {actionLoading ? 'กำลังปฏิเสธ...' : 'ปฏิเสธ'}
                  </button>
                </div>
              </>
            )}
            {/* Show status message if already processed */}
            {foundation.foundation_status === 'active' && (
              <div className="text-green-600 font-semibold">
                ✓ มูลนิธินี้ได้รับการอนุมัติแล้ว
              </div>
            )}
            {foundation.foundation_status === 'rejected' && (
              <div className="text-red-600 font-semibold">
                ✗ มูลนิธินี้ถูกปฏิเสธแล้ว
                {foundation.rejection_reason && (
                  <div className="text-sm text-gray-600 mt-1">
                    เหตุผล: {foundation.rejection_reason}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default FoundationVerification;
