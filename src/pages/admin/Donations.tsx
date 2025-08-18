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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { adminService, DonatedItem, UpdateDonatedItemStatusRequest } from '@/services/admin.service';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { HandHeart, Package } from 'lucide-react';

const STATUS_TABS = [
  { key: 'pending', label: 'กำลังจัดส่ง' },
  { key: 'delivered', label: 'จัดส่งสำเร็จ' },
];

const Donations = () => {
  const [donatedItems, setDonatedItems] = useState<DonatedItem[]>([]);
  const [statistics, setStatistics] = useState({
    totalPledges: 0,
    totalAmountDonated: 0
  });
  const [activeTab, setActiveTab] = useState('pending'); // Default to 'กำลังจัดส่ง'

  useEffect(() => {
    fetchDonatedItems(activeTab); // Fetch data based on active tab
    fetchDonationStatistics();
  }, [activeTab]); // Re-fetch when activeTab changes

  const fetchDonatedItems = async (statusFilter: string) => {
    try {
      const response = await adminService.getAllDonatedItems({ status: statusFilter });
      if (response.success) {
        setDonatedItems(response.data || []);
      } else {
        console.error('Failed to fetch donated items:', response);
        setDonatedItems([]);
      }
    } catch (error) {
      console.error('Error fetching donated items:', error);
      setDonatedItems([]);
    }
  };

  const fetchDonationStatistics = async () => {
    try {
      const response = await adminService.getDonationStatistics();
      if (response.success && response.data) {
        setStatistics(response.data);
      } else {
        console.error('Failed to fetch donation statistics:', response);
      }
    } catch (error) {
      console.error('Error fetching donation statistics:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return <Badge variant="secondary">จัดส่งสำเร็จ</Badge>;
      case 'pending':
      default:
        return <Badge variant="secondary">กำลังจัดส่ง</Badge>;
    }
  };

  return (
    <>
      <header className="mb-6">
        <h1 className="text-3xl font-bold">ตรวจสอบสิ่งของที่บริจาค</h1>
        <p className="text-muted-foreground">จัดการและตรวจสอบรายการสิ่งของที่ได้รับบริจาค</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">จำนวนการบริจาคต่อครั้ง</CardTitle>
            <HandHeart className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalPledges}</div>
            <p className="text-xs text-muted-foreground">จำนวนการบริจาคทั้งหมด</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">สิ่งของที่บริจาค</CardTitle>
            <Package className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalAmountDonated}</div>
            <p className="text-xs text-muted-foreground">จำนวนสิ่งของที่ได้รับบริจาคทั้งหมด</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>รายการบริจาคทั้งหมด</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2 mb-4">
            {STATUS_TABS.map(tab => (
              <Button
                key={tab.key}
                variant={activeTab === tab.key ? 'default' : 'outline'}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </Button>
            ))}
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ชื่อสิ่งของ</TableHead>
                <TableHead className="text-center">จำนวน</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead>ผู้บริจาค</TableHead>
                <TableHead>มูลนิธิ</TableHead>
                <TableHead>วันที่บริจาค</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {donatedItems
                .filter(item => {
                  // Client-side filter to ensure correct display based on active tab
                  if (activeTab === 'pending') {
                    return item.status === 'pending';
                  } else if (activeTab === 'delivered') {
                    return item.status === 'delivered';
                  }
                  return true; // Should not happen with defined tabs
                })
                .map((item) => (
                <TableRow key={item.donation_id}>
                  <TableCell className="font-medium">{item.item_name}</TableCell>
                  <TableCell className="text-center">{item.quantity}</TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell>{item.donor ? item.donor.full_name : 'N/A'}</TableCell>
                  <TableCell>{item.foundation ? item.foundation.name : 'N/A'}</TableCell>
                  <TableCell>
                    {item.created_at ? format(new Date(item.created_at), 'd MMM yyyy', { locale: th }) : 'N/A'}
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

export default Donations;
