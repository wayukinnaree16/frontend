import React, { useEffect, useState } from 'react';
import { adminService, PendingFoundation } from '@/services/admin.service';
import { Foundation } from '@/services/public.service';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

const AdminFoundations = () => {
  const [pendingFoundations, setPendingFoundations] = useState<PendingFoundation[]>([]);
  const [allFoundations, setAllFoundations] = useState<Foundation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFoundations = async () => {
      setLoading(true);
      setError(null);
      try {
        const [pendingRes, allRes] = await Promise.all([
          adminService.getPendingFoundations(),
          adminService.getAllFoundations()
        ]);
        
        const filteredPending = (pendingRes.data?.foundations || []).filter(
          (f: PendingFoundation) => f.user?.account_status === 'pending_verification'
        );
        setPendingFoundations(filteredPending);
        setAllFoundations(allRes.data?.foundations || []);
      } catch (e) {
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูลมูลนิธิ');
      } finally {
        setLoading(false);
      }
    };
    fetchFoundations();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">อนุมัติแล้ว</Badge>;
      case 'suspended':
        return <Badge variant="destructive">ระงับ</Badge>;
      case 'pending_verification':
        return <Badge variant="secondary">รอตรวจสอบ</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const renderTable = (foundations: (PendingFoundation | Foundation)[], isPendingTab: boolean) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ชื่อมูลนิธิ</TableHead>
          <TableHead>อีเมลผู้ดูแล</TableHead>
          <TableHead>วันที่สมัคร</TableHead>
          {!isPendingTab && <TableHead>สถานะ</TableHead>}
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {foundations.length === 0 ? (
          <TableRow>
            <TableCell colSpan={isPendingTab ? 4 : 5} className="text-center py-8 text-muted-foreground">
              {isPendingTab ? 'ยังไม่มีมูลนิธิที่รอการอนุมัติ' : 'ยังไม่มีมูลนิธิในระบบ'}
            </TableCell>
          </TableRow>
        ) : (
          foundations.map((foundation) => {
            const id = foundation.foundation_id || (foundation as any).id;
            const email = (foundation as any).user?.email || foundation.contact_email || '-';
            const createdAt = foundation.created_at ? format(new Date(foundation.created_at), 'd MMM yyyy', { locale: th }) : '-';
            let status = (foundation as any).user?.account_status || 'N/A';
            if (!isPendingTab && status === 'N/A') {
              status = 'active';
            }
            return (
              <TableRow key={id}>
                <TableCell className="font-medium">{foundation.foundation_name}</TableCell>
                <TableCell>{email}</TableCell>
                <TableCell>{createdAt}</TableCell>
                {!isPendingTab && <TableCell>{getStatusBadge(status)}</TableCell>}
                <TableCell className="text-right">
                  <Button asChild variant="ghost" size="icon">
                    <Link to={`/admin/foundation-verification/${id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );

  return (
    <>
      <header className="mb-6">
        <h1 className="text-3xl font-bold">จัดการมูลนิธิ</h1>
        <p className="text-muted-foreground">อนุมัติและดูแลมูลนิธิทั้งหมดในระบบ</p>
      </header>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>กำลังโหลด...</p>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center">{error}</div>
      ) : (
        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">รอการอนุมัติ ({pendingFoundations.length})</TabsTrigger>
            <TabsTrigger value="all">มูลนิธิทั้งหมด ({allFoundations.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>มูลนิธิที่รอการอนุมัติ</CardTitle>
              </CardHeader>
              <CardContent>
                {renderTable(pendingFoundations, true)}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>มูลนิธิทั้งหมด</CardTitle>
              </CardHeader>
              <CardContent>
                {renderTable(allFoundations, false)}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </>
  );
};

export default AdminFoundations;
