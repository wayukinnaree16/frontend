import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { adminService, FoundationType } from '@/services/admin.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Trash, PlusCircle } from 'lucide-react';
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

const FoundationTypes = () => {
  const [foundationTypes, setFoundationTypes] = useState<FoundationType[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<FoundationType | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchFoundationTypes();
  }, []);

  const fetchFoundationTypes = async () => {
    try {
      const response = await adminService.getAllFoundationTypes();
      if (response.success && response.data) {
        setFoundationTypes(response.data || []);
      } else {
        console.error('Failed to fetch foundation types:', response);
      }
    } catch (error) {
      console.error('Error fetching foundation types:', error);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingType) {
        await adminService.updateFoundationType(editingType.type_id, formData);
      } else {
        await adminService.createFoundationType(formData);
      }
      fetchFoundationTypes();
      setIsDialogOpen(false);
      setEditingType(null);
      setFormData({ name: '', description: '' });
    } catch (error) {
      console.error('Error saving foundation type:', error);
    }
  };

  const handleEdit = (type: FoundationType) => {
    setEditingType(type);
    setFormData({ name: type.name, description: type.description || '' });
    setIsDialogOpen(true);
  };

  const handleDelete = async (type_id: number) => {
    try {
      await adminService.deleteFoundationType(type_id);
      fetchFoundationTypes();
    } catch (error) {
      console.error('Error deleting foundation type:', error);
    }
  };

  return (
    <>
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">ประเภทมูลนิธิ</h1>
          <p className="text-muted-foreground">จัดการประเภทของมูลนิธิในระบบ</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingType(null);
              setFormData({ name: '', description: '' });
            }}>
              <PlusCircle className="mr-2 h-4 w-4" />
              เพิ่มประเภทใหม่
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingType ? 'แก้ไข' : 'เพิ่ม'}ประเภทมูลนิธิ</DialogTitle>
              <DialogDescription>
                {editingType ? 'แก้ไขรายละเอียดประเภทมูลนิธิ' : 'เพิ่มประเภทมูลนิธิใหม่'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleFormSubmit}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">ชื่อประเภท</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">คำอธิบาย</Label>
                  <Input
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  ยกเลิก
                </Button>
                <Button type="submit">บันทึก</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>รายการประเภทมูลนิธิ</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ชื่อ</TableHead>
                <TableHead>คำอธิบาย</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {foundationTypes.map((type) => (
                <TableRow key={type.type_id}>
                  <TableCell className="font-medium">{type.name}</TableCell>
                  <TableCell>{type.description}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(type)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
                          <AlertDialogDescription>
                            คุณแน่ใจหรือไม่ว่าต้องการลบประเภทมูลนิธิ "{type.name}"?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(type.type_id)}>
                            ยืนยัน
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
};

export default FoundationTypes;
