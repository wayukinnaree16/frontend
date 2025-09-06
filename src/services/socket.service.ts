import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';

class SocketService {
  private socket: Socket | null = null;
  private userId: number | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  /**
   * Initialize Socket.IO connection
   */
  connect(userId: number): void {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    const serverUrl = import.meta.env.VITE_API_BASE_URL || 'https://backend-lcjt.onrender.com';
    
    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    });

    this.userId = userId;
    this.setupEventListeners();
  }

  /**
   * Setup Socket.IO event listeners
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to server:', this.socket?.id);
      this.reconnectAttempts = 0;
      
      // Join user's personal notification room
      if (this.userId) {
        this.socket?.emit('join-user-room', this.userId);
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from server:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.handleReconnect();
    });

    // Listen for new notifications
    this.socket.on('new-notification', (notification) => {
      console.log('New notification received:', notification);
      this.handleNewNotification(notification);
    });
  }

  /**
   * Handle incoming real-time notifications
   */
  private handleNewNotification(notification: any): void {
    // Show toast notification
    toast.success(notification.title, {
      description: notification.message,
      duration: 5000,
      action: {
        label: 'ดู',
        onClick: () => {
          // Navigate to notification or related page
          if (notification.related_entity_type === 'pledge') {
            window.location.href = '/donor/pledges';
          }
        }
      }
    });

    // Dispatch custom event for components to listen
    window.dispatchEvent(new CustomEvent('new-notification', {
      detail: notification
    }));
  }

  /**
   * Handle reconnection attempts
   */
  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        if (this.userId) {
          this.connect(this.userId);
        }
      }, 2000 * this.reconnectAttempts); // Exponential backoff
    } else {
      console.error('Max reconnection attempts reached');
      toast.error('การเชื่อมต่อขาดหาย', {
        description: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณารีเฟรชหน้าเว็บ'
      });
    }
  }

  /**
   * Disconnect from server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.userId = null;
      this.reconnectAttempts = 0;
      console.log('Socket disconnected');
    }
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Get socket instance (for advanced usage)
   */
  getSocket(): Socket | null {
    return this.socket;
  }
}

// Export singleton instance
export const socketService = new SocketService();
export default socketService;