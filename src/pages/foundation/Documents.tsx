import React, { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { FoundationSideMenu } from './FoundationSideMenu';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { useForm } from 'react-hook-form';
import { toast } from '@/hooks/use-toast';
import foundationService, { Document as FoundationDocument, CreateDocumentRequest } from '@/services/foundation.service';

interface CreateDocumentRequestWithDocumentType extends CreateDocumentRequest {
  document_type: string;
}

const DOCUMENT_TYPES = [
  { value: 'license', label: 'ใบอนุญาตมูลนิธิ' },
  { value: 'registration', label: 'หนังสือรับรองการจดทะเบียน' },
  { value: 'other', label: 'อื่นๆ' },
];

const statusLabel: Record<string, string> = {
  pending_review: 'รอตรวจสอบ',
  approved: 'ตรวจสอบแล้ว',
  rejected: 'ถูกปฏิเสธ',
};

const FoundationDocuments = () => {
  const [documents, setDocuments] = useState<FoundationDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const form = useForm<CreateDocumentRequestWithDocumentType>({
    defaultValues: {
      document_url: '',
      document_name: '',
      document_type: '',
    },
  });

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await foundationService.getMyDocuments();
      // Backend returns documents array directly in res.data
      const documents = Array.isArray(res.data) ? res.data : (res.data?.documents || []);
      setDocuments(documents);
    } catch (e: any) {
      toast({ title: 'เกิดข้อผิดพลาด', description: e?.message || 'ไม่สามารถโหลดเอกสารได้', });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
    
    // Add event listeners to refetch documents when user returns to this page
    const handleWindowFocus = () => {
      fetchDocuments();
    };
    
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchDocuments();
      }
    };
    
    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Cleanup event listeners on component unmount
    return () => {
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const onSubmit = async (data: CreateDocumentRequest) => {
    if (!selectedFile) {
      toast({ title: 'กรุณาเลือกไฟล์', description: 'คุณต้องเลือกไฟล์เพื่ออัปโหลด', variant: 'destructive' });
      return;
    }

    const formData = new FormData();
    formData.append('document', selectedFile);

    formData.append('document_name', data.document_name);
    formData.append('document_type', data.document_type);


    try {
      // Note: We are assuming foundationService.uploadDocument can handle FormData.
      // This will likely require changes in foundation.service.ts and the backend.
      await foundationService.uploadDocument(formData as any);
      toast({ title: 'อัปโหลดเอกสารสำเร็จ' });
      setOpen(false);
      form.reset();
      setSelectedFile(null);
      fetchDocuments();
    } catch (e: any) {
      toast({ title: 'เกิดข้อผิดพลาด', description: e?.message || 'ไม่สามารถอัปโหลดเอกสารได้', });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await foundationService.deleteDocument(deleteId);
      toast({ title: 'ลบเอกสารสำเร็จ' });
      setDeleteId(null);
      fetchDocuments();
    } catch (e: any) {
      toast({ title: 'เกิดข้อผิดพลาด', description: e?.message || 'ไม่สามารถลบเอกสารได้', });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex flex-1">
        <FoundationSideMenu />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">จัดการเอกสาร</h1>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>+ อัปโหลดเอกสารใหม่</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>อัปโหลดเอกสารใหม่</DialogTitle>
                  <DialogDescription>กรอกข้อมูลเอกสารให้ครบถ้วน</DialogDescription>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                  <div>
                    <label className="block mb-1">ชื่อเอกสาร</label>
                    <Input {...form.register('document_name', { required: true })} placeholder="เช่น ใบอนุญาตมูลนิธิ" />
                  </div>
                  <div>
                    <label className="block mb-1">ประเภทเอกสาร</label>
                    <Select onValueChange={(value) => form.setValue('document_type', value)} value={form.watch('document_type')}>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกประเภทเอกสาร" />
                      </SelectTrigger>
                      <SelectContent>
                        {DOCUMENT_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block mb-1">ไฟล์เอกสาร</label>
                    <Input 
                      type="file" 
                      onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)} 
                      accept="image/*,application/pdf"
                    />
                  </div>

                  <DialogFooter>
                    <Button type="submit" disabled={form.formState.isSubmitting}>บันทึก</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ชื่อเอกสาร</TableHead>
                  <TableHead>ประเภท</TableHead>
                  <TableHead>รูปภาพ</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>ลิงก์</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={7}>กำลังโหลด...</TableCell></TableRow>
                ) : documents.length === 0 ? (
                  <TableRow><TableCell colSpan={7}>ยังไม่มีเอกสาร</TableCell></TableRow>
                ) : (
                  documents.map((doc: any) => (
                    <TableRow key={doc.document_id}>
                      <TableCell>{doc.document_name}</TableCell>
                      <TableCell>{DOCUMENT_TYPES.find(type => type.value === doc.document_type)?.label || '-'}</TableCell>
                      <TableCell>
                        {doc.document_url ? (
                          <a href={doc.document_url} target="_blank" rel="noopener noreferrer">
                            <img src={doc.document_url} alt={doc.document_name} className="h-16 w-16 object-cover" />
                          </a>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>{statusLabel[doc.verification_status_by_admin] || doc.verification_status_by_admin || '-'}</TableCell>
                      <TableCell>{doc.admin_remarks || '-'}</TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" onClick={() => setDeleteId(doc.document_id)}>ลบ</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>ยืนยันการลบเอกสาร</AlertDialogTitle>
                              <AlertDialogDescription>คุณแน่ใจหรือไม่ว่าต้องการลบเอกสารนี้?</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => setDeleteId(null)}>ยกเลิก</AlertDialogCancel>
                              <AlertDialogAction onClick={handleDelete} disabled={deleteLoading}>ลบ</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </main>
      </div>
    </div>
  );
};

export default FoundationDocuments;
