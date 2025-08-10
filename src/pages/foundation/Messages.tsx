import React, { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { FoundationSideMenu } from './FoundationSideMenu';
import { sharedService, Conversation, ConversationDetail } from '@/services/shared.service';
import { authService } from '@/services/auth.service';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

const Messages = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [conversationDetail, setConversationDetail] = useState<ConversationDetail | null>(null);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingThread, setLoadingThread] = useState(false);
  const [sending, setSending] = useState(false);
  const [reply, setReply] = useState('');

  const fetchConversations = async () => {
    setLoadingConversations(true);
    try {
      const res = await sharedService.getConversations();
      setConversations(res.data?.conversations || []);
    } catch (e: any) {
      toast({ title: 'เกิดข้อผิดพลาด', description: e?.message || 'ไม่สามารถโหลดกล่องข้อความได้' });
    } finally {
      setLoadingConversations(false);
    }
  };

  const fetchThread = async (userId: number) => {
    setLoadingThread(true);
    try {
      const res = await sharedService.getConversation(userId);
      setConversationDetail(res.data?.conversation || null);
    } catch (e: any) {
      toast({ title: 'เกิดข้อผิดพลาด', description: e?.message || 'ไม่สามารถโหลดข้อความได้' });
    } finally {
      setLoadingThread(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedUserId) fetchThread(selectedUserId);
  }, [selectedUserId]);

  const handleSelectConversation = (userId: number) => {
    setSelectedUserId(userId);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || !conversationDetail) return;
    setSending(true);
    try {
      await sharedService.sendMessage({
        recipient_user_id: conversationDetail.other_user.id,
        subject: conversationDetail.messages[0]?.subject || '',
        message_content: reply,
        message_type: 'reply',
      });
      setReply('');
      fetchThread(conversationDetail.other_user.id);
      toast({ title: 'ส่งข้อความสำเร็จ' });
    } catch (e: any) {
      toast({ title: 'เกิดข้อผิดพลาด', description: e?.message || 'ไม่สามารถส่งข้อความได้' });
    } finally {
      setSending(false);
    }
  };

  const currentUser = authService.getCurrentUser();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex flex-1">
        <FoundationSideMenu />
        <main className="flex-1 container mx-auto py-8 flex gap-8">
          {/* Sidebar: Conversation List */}
          <aside className="w-80 bg-white rounded-lg shadow p-4 h-[70vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">กล่องข้อความ</h2>
            {loadingConversations ? (
              <div>กำลังโหลด...</div>
            ) : conversations.length === 0 ? (
              <div>ยังไม่มีข้อความ</div>
            ) : (
              <ul className="space-y-2">
                {conversations.map((c) => (
                  <li
                    key={c.other_user.id}
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-muted ${selectedUserId === c.other_user.id ? 'bg-muted' : ''}`}
                    onClick={() => handleSelectConversation(c.other_user.id)}
                  >
                    <Avatar>
                      {c.other_user.profile_image_url ? (
                        <AvatarImage src={c.other_user.profile_image_url} alt={c.other_user.first_name} />
                      ) : (
                        <AvatarFallback>{c.other_user.first_name[0]}</AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{c.other_user.first_name} {c.other_user.last_name}</div>
                      <div className="text-xs text-muted-foreground truncate">{c.last_message.message_content}</div>
                    </div>
                    {c.unread_count > 0 && <Badge>{c.unread_count}</Badge>}
                  </li>
                ))}
              </ul>
            )}
          </aside>

          {/* Main: Thread + Reply */}
          <section className="flex-1 bg-white rounded-lg shadow p-4 flex flex-col h-[70vh]">
            {loadingThread ? (
              <div>กำลังโหลด...</div>
            ) : !conversationDetail ? (
              <div className="text-muted-foreground flex-1 flex items-center justify-center">เลือกบทสนทนาเพื่อดูข้อความ</div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-4 border-b pb-2">
                  <Avatar>
                    {conversationDetail.other_user.profile_image_url ? (
                      <AvatarImage src={conversationDetail.other_user.profile_image_url} alt={conversationDetail.other_user.first_name} />
                    ) : (
                      <AvatarFallback>{conversationDetail.other_user.first_name[0]}</AvatarFallback>
                    )}
                  </Avatar>
                  <div className="font-medium">{conversationDetail.other_user.first_name} {conversationDetail.other_user.last_name}</div>
                </div>
                <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
                  {conversationDetail.messages.map((m) => (
                    <div key={m.id} className={`flex flex-col ${m.sender_user_id === currentUser?.user_id || m.sender_user_id === currentUser?.id ? 'items-end' : 'items-start'}`}>
                      <div className={`rounded-lg px-3 py-2 ${m.sender_user_id === currentUser?.user_id || m.sender_user_id === currentUser?.id ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        <div className="text-sm whitespace-pre-line">{m.message_content}</div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">{new Date(m.created_at).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleSend} className="flex gap-2 mt-auto">
                  <Textarea
                    value={reply}
                    onChange={e => setReply(e.target.value)}
                    placeholder="พิมพ์ข้อความตอบกลับ..."
                    className="flex-1"
                    rows={2}
                    required
                  />
                  <Button type="submit" disabled={sending || !reply.trim()}>ส่ง</Button>
                </form>
              </>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default Messages; 