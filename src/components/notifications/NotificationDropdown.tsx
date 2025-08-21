import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Check, X, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { sharedService, Notification } from '@/services/shared.service';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface NotificationDropdownProps {
  className?: string;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  className
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Listen for real-time notifications
  useEffect(() => {
    const handleNewNotification = (event: CustomEvent) => {
      const newNotification = event.detail;
      console.log('Received new notification in dropdown:', newNotification);
      
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

  const markAsRead = async (notificationId: number) => {
    try {
      const response = await sharedService.markNotificationAsRead(notificationId);
      if (response.success) {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
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

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    
    // Navigate based on notification type or related entity
    if (notification.type === 'new_foundation_application' || notification.related_entity_type === 'foundation') {
      navigate('/admin/foundations');
    } else if (notification.related_entity_type === 'pledge' && notification.related_entity_id) {
      navigate(`/donor/donations/${notification.related_entity_id}`);
    }
    
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={`relative ${className}`}>
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <div className="p-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm">การแจ้งเตือน</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/notifications')}
              className="text-xs"
            >
              ดูทั้งหมด
            </Button>
          </div>
          
          {loading ? (
            <div className="text-center py-4 text-sm text-muted-foreground">
              กำลังโหลด...
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-4 text-sm text-muted-foreground">
              ไม่มีการแจ้งเตือน
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.slice(0, 5).map((notification) => (
                <div
                  key={notification.id}
                  className={`p-2 rounded-lg cursor-pointer hover:bg-muted transition-colors ${
                    !notification.is_read ? 'bg-primary/5 border-l-2 border-primary' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {notification.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notification.created_at).toLocaleDateString('th-TH', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <div className="w-2 h-2 bg-primary rounded-full ml-2 mt-1 flex-shrink-0" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;