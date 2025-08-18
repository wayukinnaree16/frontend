import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminService, Document, PendingFoundation } from '@/services/admin.service';
import { toast } from '@/hooks/use-toast';

const FoundationReview: React.FC = () => {
  const { foundationId } = useParams();
  const navigate = useNavigate();
  const [foundation, setFoundation] = useState<PendingFoundation | null>(null);
  const [foundationDocuments, setFoundationDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [documentActionLoading, setDocumentActionLoading] = useState(false);
  const [foundationActionLoading, setFoundationActionLoading] = useState(false);

  useEffect(() => {
    const fetchFoundationData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Get foundation details
        const allFoundationsRes = await adminService.getAllFoundations();
        const foundFoundation = allFoundationsRes.data?.foundations?.find(
          (f: PendingFoundation) => f.foundation_id === parseInt(foundationId!)
        );

        if (foundFoundation) {
          setFoundation(foundFoundation as PendingFoundation);
          
          // Get foundation documents
          const docsRes = await adminService.getFoundationDocuments(foundFoundation.foundation_id);
          const rawDocs = docsRes?.data?.documents ?? [];
          const normalizedDocs = Array.isArray(rawDocs)
            ? rawDocs.filter(Boolean).map((d: any) => ({
                id: d?.id ?? d?.document_id,
                document_id: d?.document_id ?? d?.id,
                document_type: d?.document_type,
                document_name: d?.document_name,
                document_url: d?.document_url,
                description: d?.description,
                expiry_date: d?.expiry_date,
                upload_date: d?.upload_date,
                status: d?.verification_status_by_admin ?? d?.status,
                admin_remarks: d?.admin_remarks ?? d?.review_notes ?? null,
                created_at: d?.created_at,
              }))
            : [];
          setFoundationDocuments(normalizedDocs);
        } else {
          setError('ไม่พบข้อมูลมูลนิธิ');
        }
      } catch (e: any) {
        console.error('Error fetching foundation data:', e);
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูลมูลนิธิ');
      } finally {
        setLoading(false);
      }
    };

    if (foundationId) {
      fetchFoundationData();
    }
  }, [foundationId]);

  const handleFoundationApproval = async (foundationId: number, action: 'approve' | 'reject', reason?: string) => {
    setFoundationActionLoading(true);
    try {
      if (action === 'approve') {
        await adminService.approveFoundation(foundationId);
      } else {
        await adminService.rejectFoundation(foundationId, { 
          rejection_reason: reason || 'ไม่ระบุเหตุผล',
          admin_notes: reason 
        });
      }
      setFoundation(prev => prev ? { ...prev, user_account_status: action === 'approve' ? 'active' : 'rejected' } : null);
      toast({ 
        title: 'อัปเดตสถานะมูลนิธิสำเร็จ', 
        description: `มูลนิธิถูก ${action === 'approve' ? 'อนุมัติ' : 'ปฏิเสธ'}` 
      });
      // Navigate back to user detail after approval/rejection
      setTimeout(() => navigate(-1), 1500);
    } catch (e: any) {
      console.error('Error reviewing foundation:', e);
      toast({ 
        title: 'อัปเดตสถานะมูลนิธิไม่สำเร็จ', 
        description: e.response?.data?.message || 'เกิดข้อผิดพลาดในการอัปเดตสถานะมูลนิธิ', 
        variant: 'destructive' 
      });
    } finally {
      setFoundationActionLoading(false);
    }
  };

  const handleDocumentReview = async (documentId: number, status: 'approved' | 'rejected', remarks?: string) => {
    setDocumentActionLoading(true);
    try {
      await adminService.reviewDocument(documentId, { status, review_notes: remarks });
      setFoundationDocuments(prevDocs =>
        prevDocs.map(doc =>
          doc.id === documentId ? { ...doc, status: status, admin_remarks: remarks } : doc
        )
      );
      toast({ title: 'อัปเดตสถานะเอกสารสำเร็จ', description: `เอกสารถูก ${status === 'approved' ? 'อนุมัติ' : 'ปฏิเสธ'}` });
    } catch (e: any) {
      console.error('Error reviewing document:', e);
      toast({ title: 'อัปเดตสถานะเอกสารไม่สำเร็จ', description: e.response?.data?.message || 'เกิดข้อผิดพลาดในการอัปเดตสถานะเอกสาร', variant: 'destructive' });
    } finally {
      setDocumentActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-12">
        <div className="text-center">กำลังโหลด...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-12">
        <div className="text-red-500 text-center">{error}</div>
        <div className="text-center mt-4">
          <button 
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            กลับ
          </button>
        </div>
      </div>
    );
  }

  if (!foundation) {
    return (
      <div className="container mx-auto py-12">
        <div className="text-center">ไม่พบข้อมูลมูลนิธิ</div>
        <div className="text-center mt-4">
          <button 
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            กลับ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">ตรวจสอบมูลนิธิ</h1>
        <button 
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          กลับ
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">ข้อมูลมูลนิธิ</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><b>ชื่อมูลนิธิ:</b> {foundation.foundation_name}</div>
          <div><b>สถานะมูลนิธิ:</b> 
            <span className={`ml-2 px-2 py-1 rounded text-sm ${
              foundation.user_account_status === 'active' ? 'bg-green-100 text-green-800' :
              foundation.user_account_status === 'pending_approval' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {foundation.user_account_status === 'active' ? 'อนุมัติแล้ว' :
               foundation.user_account_status === 'pending_approval' ? 'รอการอนุมัติ' :
               'ไม่อนุมัติ'}
            </span>
          </div>
          <div><b>ประเภทมูลนิธิ:</b> {foundation.foundation_type?.name || '-'}</div>
          <div><b>เบอร์โทร:</b> {foundation.contact_phone || '-'}</div>
          <div className="md:col-span-2"><b>ที่อยู่:</b> {foundation.address_line1 || '-'}</div>
          <div className="md:col-span-2"><b>คำอธิบาย:</b> {foundation.history_mission || '-'}</div>
          {foundation.website_url && (
            <div className="md:col-span-2">
              <b>เว็บไซต์:</b> 
              <a href={foundation.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-2">
                {foundation.website_url}
              </a>
            </div>
          )}
        </div>
        
        {foundation.user_account_status === 'pending_approval' && (
          <div className="flex gap-4 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={() => handleFoundationApproval(foundation.foundation_id, 'approve')}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={foundationActionLoading}
            >
              {foundationActionLoading ? 'กำลังดำเนินการ...' : 'อนุมัติมูลนิธิ'}
            </button>
            <button
              onClick={() => {
                const reason = prompt('โปรดระบุเหตุผลในการไม่อนุมัติมูลนิธิ:');
                if (reason) handleFoundationApproval(foundation.foundation_id, 'reject', reason);
              }}
              className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={foundationActionLoading}
            >
              {foundationActionLoading ? 'กำลังดำเนินการ...' : 'ไม่อนุมัติมูลนิธิ'}
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">เอกสารมูลนิธิ</h2>
        {foundationDocuments.length > 0 ? (
          <div className="space-y-6">
            {foundationDocuments.map(doc => (
              <div key={doc.id} className="border border-gray-200 p-6 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div><b>ชื่อเอกสาร:</b> {doc.document_name}</div>
                  <div><b>ประเภทเอกสาร:</b> {doc.document_type}</div>
                  <div>
                    <b>สถานะ:</b> 
                    <span className={`ml-2 px-2 py-1 rounded text-sm ${
                      doc.status === 'approved' ? 'bg-green-100 text-green-800' :
                      doc.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {doc.status === 'approved' ? 'อนุมัติ' :
                       doc.status === 'rejected' ? 'ปฏิเสธ' :
                       'รอการตรวจสอบ'}
                    </span>
                  </div>
                  {doc.expiry_date && (
                    <div><b>วันหมดอายุ:</b> {new Date(doc.expiry_date).toLocaleDateString('th-TH')}</div>
                  )}
                </div>
                
                {doc.description && (
                  <div className="mb-4"><b>คำอธิบาย:</b> {doc.description}</div>
                )}
                
                {doc.admin_remarks && (
                  <div className="mb-4 p-3 bg-gray-50 rounded">
                    <b>หมายเหตุจากผู้ดูแล:</b> {doc.admin_remarks}
                  </div>
                )}
                
                <div className="flex flex-wrap gap-3">
                  {doc.document_url && (
                    <a 
                      href={doc.document_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      ดูเอกสาร
                    </a>
                  )}
                  
                  {doc.status !== 'approved' && (
                    <button
                      onClick={() => handleDocumentReview(doc.id, 'approved')}
                      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                      disabled={documentActionLoading}
                    >
                      อนุมัติ
                    </button>
                  )}
                  
                  {doc.status !== 'rejected' && (
                    <button
                      onClick={() => {
                        const remarks = prompt('โปรดระบุเหตุผลในการปฏิเสธเอกสาร:');
                        if (remarks) handleDocumentReview(doc.id, 'rejected', remarks);
                      }}
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                      disabled={documentActionLoading}
                    >
                      ปฏิเสธ
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-600 text-center py-8">ไม่พบเอกสารสำหรับมูลนิธินี้</div>
        )}
      </div>
    </div>
  );
};

export default FoundationReview;