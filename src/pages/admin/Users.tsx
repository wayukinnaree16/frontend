import React, { useEffect, useState } from 'react';
import { adminService, AdminUser } from '@/services/admin.service';
import { Link, useNavigate } from 'react-router-dom';
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
import { Eye, UserX, UserCheck, FileText } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const AdminUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [foundations, setFoundations] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [usersRes, foundationsRes] = await Promise.all([
          adminService.getAllUsers({ page: 1, limit: 100 }),
          adminService.getAllFoundations()
        ]);
        setUsers(usersRes.data?.users || []);
        setFoundations(foundationsRes.data?.foundations || []);
      } catch (e) {
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleStatusChange = async (userId: number, status: 'active' | 'suspended') => {
    try {
      await adminService.updateUserStatus(userId, { account_status: status });
      setUsers(users => users.map(u => (u.user_id === userId || u.id === userId) ? { ...u, account_status: status } : u));
    } catch {
      alert('เปลี่ยนสถานะไม่สำเร็จ');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">ใช้งาน</Badge>;
      case 'suspended':
        return <Badge variant="destructive">ระงับ</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <>
      <header className="mb-6">
        <h1 className="text-3xl font-bold">จัดการผู้ใช้</h1>
        <p className="text-muted-foreground">ดูแลและจัดการบัญชีผู้ใช้ทั้งหมดในระบบ</p>
      </header>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>กำลังโหลด...</p>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center">{error}</div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>รายชื่อผู้ใช้</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>อีเมล</TableHead>
                  <TableHead>ชื่อ</TableHead>
                  <TableHead>ประเภทผู้ใช้</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map(user => {
                  const userId = user.user_id || user.id;
                  const userFoundation = foundations.find(f => f.user_id === userId);
                  return (
                    <TableRow key={userId}>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell>{user.first_name} {user.last_name}</TableCell>
                      <TableCell>
                        <Badge variant={user.user_type === 'foundation_admin' ? 'default' : 'secondary'}>
                          {user.user_type === 'foundation_admin' ? 'ผู้ดูแลมูลนิธิ' : 
                           user.user_type === 'donor' ? 'ผู้บริจาค' : 
                           user.user_type === 'system_admin' ? 'ผู้ดูแลระบบ' : user.user_type}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(user.account_status)}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button asChild variant="ghost" size="icon">
                          <Link to={`/admin/users/${userId}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        {user.user_type === 'foundation_admin' && userFoundation && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => navigate(`/admin/foundation-review/${userFoundation.foundation_id}`)}
                            className="text-blue-600"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        )}
                        {user.account_status === 'active' ? (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive">
                                <UserX className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>ยืนยันการระงับผู้ใช้</AlertDialogTitle>
                                <AlertDialogDescription>
                                  คุณแน่ใจหรือไม่ว่าต้องการระงับผู้ใช้ {user.email}?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleStatusChange(userId, 'suspended')}>
                                  ยืนยัน
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-green-600">
                                <UserCheck className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>ยืนยันการเปิดใช้งานผู้ใช้</AlertDialogTitle>
                                <AlertDialogDescription>
                                  คุณแน่ใจหรือไม่ว่าต้องการเปิดใช้งานผู้ใช้ {user.email}?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleStatusChange(userId, 'active')}>
                                  ยืนยัน
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default AdminUsers;
