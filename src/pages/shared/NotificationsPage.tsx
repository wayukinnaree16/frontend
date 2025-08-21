import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Check, X, CheckCheck } from 'lucide-react';
import { sharedService, Notification } from '@/services/shared.service';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await sharedService.getNotifications();
      if (response.success) {
        setNotifications(response.data.notifications || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('เกิดข้อผิดพลาดในการโหลดการแจ้งเตือน');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Listen for real-time notifications
  useEffect(() => {
    const handleNewNotification = (event: CustomEvent) => {
      const newNotification = event.detail;
      console.log('Received new notification in page:', newNotification);
      
      // Add new notification to the beginning of the list
      setNotifications(prev => [newNotification, ...prev]);
    };

    // Add event listener for custom notification events
    window.addEventListener('new-notification', handleNewNotification as EventListener);

    // Cleanup
    return () => {
      window.removeEventListener('new-notification', handleNewNotification as EventListener);
    };
  }, []);

  const markAsRead = async (id: number) => {
    try {
      const response = await sharedService.markNotificationAsRead(id);
      if (response.success) {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === id 
              ? { ...notification, is_read: true }
              : notification
          )
        );
        toast.success('แจ้งเตือนถูกทำเครื่องหมายเป็นอ่านแล้ว');
      }
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการอัปเดตการแจ้งเตือน');
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    
    // Navigate based on notification type or related entity
    if (notification.related_entity_type === 'pledge' && notification.related_entity_id) {
      navigate(`/donor/donations/${notification.related_entity_id}`);
    }
  };

  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case 'pledge_approved':
      case 'pledge_status_update':
        return 'success';
      case 'urgent':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          <Bell className="h-6 w-6" />
          <h1 className="text-2xl font-bold">การแจ้งเตือน</h1>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Bell className="h-6 w-6" />
          <h1 className="text-2xl font-bold">การแจ้งเตือน</h1>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unreadCount} ใหม่
            </Badge>
          )}
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchNotifications}
          className="flex items-center gap-2"
        >
          <Bell className="h-4 w-4" />
          รีเฟรช
        </Button>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">ไม่มีการแจ้งเตือน</p>
              <p className="text-sm">เมื่อมีการแจ้งเตือนใหม่ จะแสดงที่นี่</p>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                !notification.is_read ? 'border-primary bg-primary/5' : ''
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-lg">{notification.title}</CardTitle>
                      <Badge 
                        variant={getNotificationTypeColor(notification.type) as any}
                        className="text-xs"
                      >
                        {notification.type}
                      </Badge>
                      {!notification.is_read && (
                        <div className="w-2 h-2 bg-primary rounded-full" />
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!notification.is_read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-muted-foreground mb-3 leading-relaxed">
                  {notification.message}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {new Date(notification.created_at).toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  {notification.is_read && notification.read_at && (
                    <span className="flex items-center gap-1">
                      <CheckCheck className="h-3 w-3" />
                      อ่านแล้ว {new Date(notification.read_at).toLocaleDateString('th-TH')}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;