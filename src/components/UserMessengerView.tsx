import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Send,
  Phone,
  Video,
  Info,
  Smile,
  Image,
  BookOpen,
  ThumbsUp,
  ArrowLeft,
  Check,
  CheckCheck,
  Mic,
  Plus,
  Store,
  Users,
  Sparkles,
  PhoneCall,
  PhoneOff,
  VideoOff,
  MicOff,
  ExternalLink,
  X,
  Heart,
} from 'lucide-react';
import { BookDetail } from '../types/omnichannel';

export interface UserChatContact {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  type: 'store' | 'friend' | 'club';
  badge?: string;
  verified?: boolean;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface UserChatMessage {
  id: string;
  sender: 'me' | 'other';
  text: string;
  timestamp: string;
  isLikeSticker?: boolean;
  attachedBook?: {
    id: string;
    title: string;
    author: string;
    coverImage: string;
    price: number;
  };
  reactions?: { [emoji: string]: number };
  myReaction?: string;
}

interface UserMessengerViewProps {
  books?: BookDetail[];
  onInspectBook?: (book: BookDetail) => void;
  onOpenStore?: () => void;
}

const INITIAL_CONTACTS: UserChatContact[] = [
  {
    id: 'contact-phuongnam',
    name: 'Nhà Sách Phương Nam',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
    isOnline: true,
    type: 'store',
    badge: 'Gian hàng chính hãng',
    verified: true,
    lastMessage: 'Dạ shop còn bookmark kim loại khắc laser tặng kèm bạn nhé! ✨',
    lastMessageTime: '10:45',
    unreadCount: 1,
  },
  {
    id: 'contact-thuha',
    name: 'Thu Hà',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
    isOnline: true,
    type: 'friend',
    badge: 'Top Reviewer',
    lastMessage: 'Cuối tuần này rảnh đi cafe sách ở BookOwl Cafe thảo luận thêm nhé ☕📚',
    lastMessageTime: '09:20',
    unreadCount: 0,
  },
  {
    id: 'contact-maiphuong',
    name: 'Mai Phương',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    isOnline: false,
    type: 'friend',
    badge: 'Podcast Host',
    lastMessage: 'Tập podcast tuần này mình có nhắc đến cuốn Atomic Habits bạn review đó!',
    lastMessageTime: 'Hôm qua',
    unreadCount: 0,
  },
  {
    id: 'contact-nhanam',
    name: 'CLB Sách Nhã Nam',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150',
    isOnline: true,
    type: 'club',
    badge: 'Câu lạc bộ sách',
    verified: true,
    lastMessage: 'Thông báo: Buổi Offline thảo luận "Hiểu Về Trái Tim" thứ 7 tuần này!',
    lastMessageTime: 'Hôm qua',
    unreadCount: 0,
  },
  {
    id: 'contact-bookowl-used',
    name: 'Tiệm Sách Cũ BookOwl',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    isOnline: false,
    type: 'store',
    badge: 'Sách tuyển chọn 95%',
    lastMessage: 'Cuốn Harry Potter bản bìa cứng bên mình vừa về 1 bộ likenew nhé bạn.',
    lastMessageTime: '2 ngày trước',
    unreadCount: 0,
  },
  {
    id: 'contact-lehoang',
    name: 'Lê Hoàng',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    isOnline: true,
    type: 'friend',
    badge: 'Độc giả thân thiết',
    lastMessage: 'Mình vừa đọc xong cuốn Đắc Nhân Tâm, hay thật sự 👍',
    lastMessageTime: '3 ngày trước',
    unreadCount: 0,
  },
];

const INITIAL_CONVERSATION_MESSAGES: Record<string, UserChatMessage[]> = {
  'contact-phuongnam': [
    {
      id: 'msg-pn-1',
      sender: 'other',
      text: 'Dạ chào bạn Minh Anh! Nhà Sách Phương Nam xin chào bạn ạ 👋',
      timestamp: '10:30',
    },
    {
      id: 'msg-pn-2',
      sender: 'other',
      text: 'Bạn đang quan tâm đến cuốn sách nào hoặc cần shop tư vấn thêm không ạ?',
      timestamp: '10:31',
    },
    {
      id: 'msg-pn-3',
      sender: 'me',
      text: 'Chào shop! Cho mình hỏi cuốn "Atomic Habits" này bên mình còn sẵn hàng và có tặng kèm bookmark kim loại không ạ?',
      timestamp: '10:40',
      attachedBook: {
        id: 'bk-atomic-habits',
        title: 'Atomic Habits - Thay Đổi Tí Hon Hiệu Quả Bất Ngờ',
        author: 'James Clear',
        coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400',
        price: 189000,
      },
    },
    {
      id: 'msg-pn-4',
      sender: 'other',
      text: 'Dạ shop còn sẵn hàng bản mới 100% nguyên màng co bạn nhé! Đơn đặt trực tiếp qua BookOwl hôm nay đều được tặng kèm bookmark kim loại mạ vàng khắc laser ạ ✨',
      timestamp: '10:45',
    },
  ],
  'contact-thuha': [
    {
      id: 'msg-th-1',
      sender: 'other',
      text: 'Minh Anh ơi, cậu đọc xong cuốn Atomic Habits của James Clear chưa? Thấy bài review trên Feed sáng nay của cậu hay quá!',
      timestamp: '09:10',
    },
    {
      id: 'msg-th-2',
      sender: 'me',
      text: 'Mình vừa đọc xong hôm kia á Hà! Thích nhất quy tắc 2 phút với cách thiết kế môi trường để duy trì thói quen đọc sách mỗi ngày.',
      timestamp: '09:15',
    },
    {
      id: 'msg-th-3',
      sender: 'other',
      text: 'Chuẩn luôn á! Cuối tuần này rảnh đi cafe sách ở BookOwl Cafe thảo luận thêm nhé ☕📚',
      timestamp: '09:20',
      reactions: { '❤️': 1 },
    },
  ],
  'contact-maiphuong': [
    {
      id: 'msg-mp-1',
      sender: 'other',
      text: 'Chào Minh Anh! Tập podcast tuần này mình có trích dẫn góc nhìn trong bài viết review sách tâm lý của bạn đó nhé 🎙️',
      timestamp: 'Hôm qua',
    },
    {
      id: 'msg-mp-2',
      sender: 'me',
      text: 'Oa cảm ơn Mai Phương nhiều nha! Mình vừa nghe trên trang chủ BookOwl sáng nay rồi, giọng bạn truyền cảm cực kỳ 🥰',
      timestamp: 'Hôm qua',
    },
  ],
  'contact-nhanam': [
    {
      id: 'msg-nn-1',
      sender: 'other',
      text: 'CLB Sách Nhã Nam thân chào độc giả Minh Anh! Thứ 7 tuần này lúc 15:00 tại Đường Sách TP.HCM sẽ có buổi Offline bàn luận cuốn "Hiểu Về Trái Tim", thân mời bạn tham gia cùng các thành viên nha!',
      timestamp: 'Hôm qua',
    },
  ],
  'contact-bookowl-used': [
    {
      id: 'msg-bu-1',
      sender: 'other',
      text: 'Chào bạn Minh Anh, cuốn Harry Potter bản bìa cứng bạn hỏi đợt trước bên mình vừa tìm được 1 bộ likenew 98% rất đẹp nhé.',
      timestamp: '2 ngày trước',
    },
  ],
  'contact-lehoang': [
    {
      id: 'msg-lh-1',
      sender: 'other',
      text: 'Mình vừa đọc xong cuốn Đắc Nhân Tâm, hay thật sự 👍',
      timestamp: '3 ngày trước',
    },
  ],
};

const SAMPLE_SHAREABLE_BOOKS: BookDetail[] = [
  {
    id: 'bk-atomic-habits',
    title: 'Atomic Habits',
    author: 'James Clear',
    coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400',
    price: 189000,
    rating: 4.8,
    reviewCount: 1200,
    category: 'Kỹ năng sống',
    publisher: 'NXB Trẻ',
    pages: 320,
    description: 'Thay đổi nhỏ gộp lại thành kết quả lớn.',
    condition: 'Sách mới 100%',
    sellerName: 'Nhà Sách Phương Nam',
    sellerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
  },
  {
    id: 'bk-dac-nhan-tam',
    title: 'Đắc Nhân Tâm',
    author: 'Dale Carnegie',
    coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400',
    price: 169000,
    rating: 4.9,
    reviewCount: 2100,
    category: 'Kỹ năng sống',
    publisher: 'NXB Trẻ',
    pages: 300,
    description: 'Kỹ năng xử sự và giao tiếp kinh điển.',
    condition: 'Sách mới 100%',
    sellerName: 'Nhà Sách Phương Nam',
    sellerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
  },
  {
    id: 'bk-nha-gia-kim',
    title: 'Nhà Giả Kim',
    author: 'Paulo Coelho',
    coverImage: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=300',
    price: 135000,
    rating: 4.9,
    reviewCount: 2150,
    category: 'Văn học kinh điển',
    publisher: 'NXB Hội Nhà Văn',
    pages: 228,
    description: 'Cuộc phiêu lưu tìm kiếm kho báu và đánh thức giấc mơ.',
    condition: 'Sách mới 100%',
    sellerName: 'Nhà Sách Phương Nam',
    sellerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
  },
  {
    id: 'bk-cay-cam-ngot',
    title: 'Cây Cam Ngọt Của Tôi',
    author: 'José Mauro',
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=300',
    price: 108000,
    rating: 4.96,
    reviewCount: 1680,
    category: 'Văn học thiếu nhi',
    publisher: 'NXB Hội Nhà Văn',
    pages: 244,
    description: 'Tiểu thuyết tự truyện cảm động về cậu bé Zezé.',
    condition: 'Sách mới 100%',
    sellerName: 'CLB Đọc Sách Nhã Nam',
    sellerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150',
  },
  {
    id: 'bk-hieu-ve-trai-tim',
    title: 'Hiểu Về Trái Tim',
    author: 'Thầy Minh Niệm',
    coverImage: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=300',
    price: 110000,
    rating: 4.95,
    reviewCount: 890,
    category: 'Kỹ năng sống / Tâm linh',
    publisher: 'NXB Trẻ',
    pages: 290,
    description: 'Nhận diện cảm xúc để nuôi dưỡng trái tim yêu thương.',
    condition: 'Sách mới 100%',
    sellerName: 'CLB Đọc Sách Nhã Nam',
    sellerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150',
  },
];

export const UserMessengerView: React.FC<UserMessengerViewProps> = ({
  books = [],
  onInspectBook,
  onOpenStore,
}) => {
  const [contacts, setContacts] = useState<UserChatContact[]>(INITIAL_CONTACTS);
  const [activeContactId, setActiveContactId] = useState<string>('contact-phuongnam');
  const [messagesMap, setMessagesMap] = useState<Record<string, UserChatMessage[]>>(
    INITIAL_CONVERSATION_MESSAGES
  );
  const [inputText, setInputText] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'store' | 'friend' | 'unread'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showBookPicker, setShowBookPicker] = useState(false);
  const [showCallModal, setShowCallModal] = useState<'audio' | 'video' | null>(null);
  const [callDuration, setCallDuration] = useState(0);

  // Mobile layout view mode: 'list' (inbox list) or 'chat' (active chat window)
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeContact = contacts.find((c) => c.id === activeContactId) || contacts[0];
  const activeMessages = messagesMap[activeContactId] || [];

  // Scroll to bottom on message change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeMessages.length, isTyping, activeContactId]);

  // Timer for calling simulation
  useEffect(() => {
    let timer: any = null;
    if (showCallModal) {
      setCallDuration(0);
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showCallModal]);

  // Handle sending a message
  const handleSendMessage = (textToSend?: string, attachedBook?: any, isLike = false) => {
    const text = textToSend !== undefined ? textToSend : inputText.trim();
    if (!text && !attachedBook && !isLike) return;

    const newMsg: UserChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'me',
      text: isLike ? '👍' : text,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      isLikeSticker: isLike,
      attachedBook,
    };

    setMessagesMap((prev) => ({
      ...prev,
      [activeContactId]: [...(prev[activeContactId] || []), newMsg],
    }));

    if (!textToSend && !isLike) {
      setInputText('');
    }

    // Update contacts preview
    setContacts((prev) =>
      prev.map((c) =>
        c.id === activeContactId
          ? {
              ...c,
              lastMessage: isLike ? 'Bạn: 👍' : attachedBook ? `Bạn: [Chia sẻ sách] ${attachedBook.title}` : `Bạn: ${text}`,
              lastMessageTime: 'Vừa xong',
            }
          : c
      )
    );

    // Simulate smart auto-reply from shop or friend after 1.5s
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        let replyText = 'Mình đã nhận được tin nhắn rồi nhé! Sẽ phản hồi ngay nha.';
        if (activeContact.type === 'store') {
          replyText =
            'Dạ shop Phương Nam đã ghi nhận thông tin của bạn ạ! Nhân viên tư vấn sẽ hỗ trợ giải đáp chi tiết trong ít phút nữa nhé ạ ❤️';
        } else if (activeContact.id === 'contact-thuha') {
          replyText = 'Oke cậu nè! Để mình ghi chú lại lịch hẹn cafe nhé! ✨';
        }

        const replyMsg: UserChatMessage = {
          id: `reply-${Date.now()}`,
          sender: 'other',
          text: replyText,
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        };

        setMessagesMap((prev) => ({
          ...prev,
          [activeContactId]: [...(prev[activeContactId] || []), replyMsg],
        }));

        setContacts((prev) =>
          prev.map((c) =>
            c.id === activeContactId
              ? {
                  ...c,
                  lastMessage: replyText,
                  lastMessageTime: 'Vừa xong',
                }
              : c
          )
        );
      }, 1500);
    }, 600);
  };

  // Add emoji reaction to a message
  const handleReact = (messageId: string, emoji: string) => {
    setMessagesMap((prev) => {
      const currentList = prev[activeContactId] || [];
      const updated = currentList.map((m) => {
        if (m.id !== messageId) return m;
        const currentReactions = { ...(m.reactions || {}) };
        if (m.myReaction === emoji) {
          // unreact
          if (currentReactions[emoji] > 1) {
            currentReactions[emoji] -= 1;
          } else {
            delete currentReactions[emoji];
          }
          return { ...m, reactions: currentReactions, myReaction: undefined };
        } else {
          // change reaction
          if (m.myReaction && currentReactions[m.myReaction]) {
            currentReactions[m.myReaction] -= 1;
            if (currentReactions[m.myReaction] <= 0) delete currentReactions[m.myReaction];
          }
          currentReactions[emoji] = (currentReactions[emoji] || 0) + 1;
          return { ...m, reactions: currentReactions, myReaction: emoji };
        }
      });
      return { ...prev, [activeContactId]: updated };
    });
  };

  // Filter contacts
  const filteredContacts = contacts.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterTab === 'store') return c.type === 'store';
    if (filterTab === 'friend') return c.type === 'friend' || c.type === 'club';
    if (filterTab === 'unread') return c.unreadCount > 0;
    return true;
  });

  return (
    <div className="w-full h-[calc(100vh-140px)] min-h-[560px] max-h-[820px] bg-white rounded-none sm:rounded-2xl border-0 sm:border border-slate-200/90 shadow-sm flex overflow-hidden relative">
      {/* =========================================================================
          LEFT PANEL: MESSENGER INBOX / CONVERSATION LIST
          - Hidden on mobile when viewing a chat (mobileView === 'chat')
         ========================================================================= */}
      <div
        className={`w-full md:w-80 lg:w-96 flex-shrink-0 border-r border-slate-200/90 bg-white flex flex-col ${
          mobileView === 'chat' ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Messenger Header (Facebook Messenger Style) */}
        <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Đoạn chat</h2>
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {contacts.length}
            </span>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => {
                // Quick start chat with Thu Hà
                setActiveContactId('contact-thuha');
                setMobileView('chat');
              }}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
              title="Nhắn tin với bạn đọc"
            >
              <Users className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                // Quick start chat with bookstore
                setActiveContactId('contact-phuongnam');
                setMobileView('chat');
              }}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
              title="Nhắn tin với Nhà Sách Phương Nam"
            >
              <Store className="w-4 h-4 text-blue-600" />
            </button>
          </div>
        </div>

        {/* Search Bar Capsule */}
        <div className="px-3 py-2 border-b border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Tìm kiếm trên Messenger..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 text-xs pl-9 pr-3 py-2 rounded-full placeholder-slate-400 text-slate-800 focus:outline-hidden focus:bg-slate-50 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          {/* Quick Filter Tabs (Tất cả / Cửa hàng / Bạn bè / Chưa đọc) */}
          <div className="flex items-center space-x-1 pt-2 overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'Hộp thư' },
              { id: 'store', label: 'Cửa hàng' },
              { id: 'friend', label: 'Bạn bè' },
              { id: 'unread', label: 'Chưa đọc' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id as any)}
                className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  filterTab === tab.id
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Active Stories / Online Friends Bar (Facebook Messenger Style) */}
        <div className="py-2.5 px-3 border-b border-slate-100 flex items-center space-x-3 overflow-x-auto no-scrollbar bg-slate-50/50">
          {contacts.map((c) => (
            <div
              key={c.id}
              onClick={() => {
                setActiveContactId(c.id);
                setMobileView('chat');
              }}
              className="flex flex-col items-center space-y-1 flex-shrink-0 cursor-pointer group"
              title={c.name}
            >
              <div className="relative">
                <img
                  src={c.avatar}
                  alt={c.name}
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-blue-500/80 p-0.5 group-hover:scale-105 transition-transform"
                />
                {c.isOnline && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full shadow-2xs" />
                )}
              </div>
              <span className="text-[10px] text-slate-600 font-medium max-w-[50px] truncate">
                {c.name.split(' ').slice(-1)[0]}
              </span>
            </div>
          ))}
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-1">
          {filteredContacts.map((contact) => {
            const isSelected = contact.id === activeContactId;
            return (
              <div
                key={contact.id}
                onClick={() => {
                  setActiveContactId(contact.id);
                  setMobileView('chat');
                  // Mark as read
                  setContacts((prev) =>
                    prev.map((c) => (c.id === contact.id ? { ...c, unreadCount: 0 } : c))
                  );
                }}
                className={`p-2.5 rounded-xl flex items-center space-x-3 cursor-pointer transition-all ${
                  isSelected ? 'bg-blue-50/80 border border-blue-200/60' : 'hover:bg-slate-50'
                }`}
              >
                {/* Avatar with online dot */}
                <div className="relative flex-shrink-0">
                  <img
                    src={contact.avatar}
                    alt={contact.name}
                    className="w-12 h-12 rounded-full object-cover shadow-2xs"
                  />
                  {contact.isOnline && (
                    <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full shadow-2xs" />
                  )}
                </div>

                {/* Content preview */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1 truncate">
                      <h4
                        className={`text-xs sm:text-sm font-bold truncate ${
                          contact.unreadCount > 0 ? 'text-slate-900 font-extrabold' : 'text-slate-800'
                        }`}
                      >
                        {contact.name}
                      </h4>
                      {contact.verified && (
                        <span className="w-3.5 h-3.5 bg-blue-600 text-white rounded-full flex items-center justify-center text-[8px] flex-shrink-0">
                          ✓
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium flex-shrink-0 ml-1">
                      {contact.lastMessageTime}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-0.5">
                    <p
                      className={`text-xs truncate ${
                        contact.unreadCount > 0
                          ? 'font-bold text-slate-900'
                          : 'text-slate-500'
                      }`}
                    >
                      {contact.lastMessage}
                    </p>

                    {contact.unreadCount > 0 && (
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600 flex-shrink-0 ml-1.5 shadow-xs" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {filteredContacts.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-xs">
              Không tìm thấy đoạn chat nào
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          RIGHT PANEL: ACTIVE FACEBOOK MESSENGER CHAT WINDOW
          - Visible on desktop, or on mobile when mobileView === 'chat'
         ========================================================================= */}
      <div
        className={`flex-1 flex flex-col bg-white overflow-hidden ${
          mobileView === 'list' ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Header: User Info + Voice/Video Call + Info Actions */}
        <div className="px-4 py-3 bg-white border-b border-slate-100 flex items-center justify-between shadow-2xs z-10">
          <div className="flex items-center space-x-3">
            {/* Mobile Back Button to inbox list */}
            <button
              onClick={() => setMobileView('list')}
              className="md:hidden p-1.5 rounded-full hover:bg-slate-100 text-slate-600 cursor-pointer"
              title="Quay lại danh sách chat"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="relative">
              <img
                src={activeContact.avatar}
                alt={activeContact.name}
                className="w-10 h-10 rounded-full object-cover shadow-2xs"
              />
              {activeContact.isOnline && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
              )}
            </div>

            <div>
              <div className="flex items-center space-x-1.5">
                <h3 className="font-bold text-sm sm:text-base text-slate-900 leading-tight">
                  {activeContact.name}
                </h3>
                {activeContact.verified && (
                  <span className="w-3.5 h-3.5 bg-blue-600 text-white rounded-full flex items-center justify-center text-[8px]">
                    ✓
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                {activeContact.isOnline ? (
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Đang hoạt động
                  </span>
                ) : (
                  <span>Hoạt động 15 phút trước</span>
                )}
                {activeContact.badge && (
                  <>
                    <span>•</span>
                    <span className="text-blue-600 font-medium">{activeContact.badge}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Action icons (Facebook Messenger: Phone, Video, Info) */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => setShowCallModal('audio')}
              className="p-2 sm:p-2.5 rounded-full text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
              title="Bắt đầu cuộc gọi thoại"
            >
              <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <button
              onClick={() => setShowCallModal('video')}
              className="p-2 sm:p-2.5 rounded-full text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
              title="Bắt đầu cuộc gọi video"
            >
              <Video className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {activeContact.type === 'store' && onOpenStore && (
              <button
                onClick={onOpenStore}
                className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors cursor-pointer"
                title="Ghé thăm gian hàng"
              >
                <Store className="w-3.5 h-3.5" />
                <span>Xem Shop</span>
              </button>
            )}
          </div>
        </div>

        {/* Message Thread (Facebook Messenger Bubbles) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-slate-50/50 via-white to-slate-50/40">
          {/* Top Profile Intro in Chat */}
          <div className="text-center py-6 border-b border-slate-100/80 mb-2 space-y-2">
            <div className="relative inline-block">
              <img
                src={activeContact.avatar}
                alt={activeContact.name}
                className="w-18 h-18 sm:w-20 sm:h-20 rounded-full object-cover mx-auto shadow-md ring-4 ring-slate-100"
              />
            </div>
            <h4 className="font-extrabold text-base text-slate-900">{activeContact.name}</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {activeContact.type === 'store'
                ? 'Gian hàng chính thức trên mạng xã hội BookOwl. Bạn có thể hỏi về tình trạng sách, đặt hàng hoặc theo dõi đơn.'
                : 'Bạn bè cùng câu lạc bộ đọc sách BookOwl. Chia sẻ cảm nhận và rủ nhau cafe sách!'}
            </p>
            <div className="flex justify-center gap-2 pt-1">
              {activeContact.type === 'store' ? (
                <button
                  onClick={() => setShowBookPicker(true)}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-full text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" /> Hỏi thông tin sách
                </button>
              ) : (
                <button
                  onClick={() => handleSendMessage('Chào bạn! Cuốn sách gần đây nhất bạn đọc là gì thế?')}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-full text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Gửi lời chào 📚
                </button>
              )}
            </div>
          </div>

          {/* Date pill */}
          <div className="flex justify-center my-3">
            <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
              Hôm nay
            </span>
          </div>

          {/* Messages Loop */}
          {activeMessages.map((msg) => {
            const isMe = msg.sender === 'me';

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group space-y-1`}
              >
                <div
                  className={`flex items-end space-x-2 max-w-[85%] sm:max-w-[70%] ${
                    isMe ? 'flex-row-reverse space-x-reverse' : 'flex-row'
                  }`}
                >
                  {/* Avatar next to incoming messages */}
                  {!isMe && (
                    <img
                      src={activeContact.avatar}
                      alt={activeContact.name}
                      className="w-7 h-7 rounded-full object-cover mb-1 flex-shrink-0"
                    />
                  )}

                  {/* Message Bubble */}
                  <div className="relative">
                    {msg.isLikeSticker ? (
                      <div className="text-4xl sm:text-5xl transform hover:scale-110 transition-transform cursor-pointer select-none py-1">
                        👍
                      </div>
                    ) : (
                      <div
                        className={`p-3 sm:px-4 sm:py-2.5 text-xs sm:text-sm leading-relaxed ${
                          isMe
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl rounded-br-xs shadow-xs'
                            : 'bg-slate-100 text-slate-800 rounded-2xl rounded-bl-xs shadow-2xs'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.text}</p>

                        {/* Embedded Book Card if message attached a book */}
                        {msg.attachedBook && (
                          <div
                            onClick={() => {
                              const foundBook = books.find((b) => b.id === msg.attachedBook?.id);
                              if (foundBook && onInspectBook) onInspectBook(foundBook);
                            }}
                            className="mt-2.5 p-2 bg-white text-slate-900 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-3 cursor-pointer hover:bg-slate-50 transition-colors"
                          >
                            <img
                              src={msg.attachedBook.coverImage}
                              alt={msg.attachedBook.title}
                              className="w-12 h-16 object-cover rounded-md flex-shrink-0 shadow-2xs"
                            />
                            <div className="min-w-0 flex-1 space-y-0.5 text-left">
                              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                                Sách liên kết
                              </span>
                              <h5 className="font-bold text-xs text-slate-900 truncate">
                                {msg.attachedBook.title}
                              </h5>
                              <p className="text-[11px] text-slate-500 font-medium">
                                {msg.attachedBook.author}
                              </p>
                              <div className="flex items-center justify-between pt-1">
                                <span className="text-xs font-black text-blue-600 tabular-nums">
                                  {new Intl.NumberFormat('vi-VN').format(msg.attachedBook.price)}đ
                                </span>
                                <span className="text-[10px] text-blue-600 font-bold underline flex items-center gap-0.5">
                                  Xem sách <ExternalLink className="w-2.5 h-2.5" />
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Emoji Reactions Pill attached to bottom-right of bubble */}
                    {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                      <div
                        className={`absolute -bottom-2 ${
                          isMe ? 'left-2' : 'right-2'
                        } bg-white border border-slate-200/90 rounded-full px-1.5 py-0.5 text-[11px] flex items-center gap-1 shadow-xs z-10 cursor-pointer`}
                      >
                        {Object.entries(msg.reactions).map(([emoji, count]) => {
                          const countNum = Number(count);
                          return (
                            <span key={emoji} className="flex items-center gap-0.5 font-bold text-slate-700">
                              <span>{emoji}</span>
                              {countNum > 1 && <span className="text-[9px]">{countNum}</span>}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Sub row: Timestamp + Reaction trigger on hover */}
                <div
                  className={`flex items-center space-x-2 text-[10px] text-slate-400 px-2 opacity-70 group-hover:opacity-100 transition-opacity ${
                    isMe ? 'justify-end' : 'justify-start pl-9'
                  }`}
                >
                  <span>{msg.timestamp}</span>

                  {/* Reaction Buttons bar on hover */}
                  <div className="hidden group-hover:flex items-center space-x-1 bg-white border border-slate-200 rounded-full px-1.5 py-0.5 shadow-xs">
                    {['👍', '❤️', '😆', '😮', '😢'].map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleReact(msg.id, emoji)}
                        className={`text-xs hover:scale-125 transition-transform cursor-pointer p-0.5 ${
                          msg.myReaction === emoji ? 'bg-blue-100 rounded-full' : ''
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>

                  {isMe && (
                    <span className="flex items-center text-blue-600">
                      <CheckCheck className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {/* Animated Typing Indicator */}
          {isTyping && (
            <div className="flex items-end space-x-2">
              <img
                src={activeContact.avatar}
                alt={activeContact.name}
                className="w-7 h-7 rounded-full object-cover mb-1"
              />
              <div className="bg-slate-100 p-3 rounded-2xl rounded-bl-xs flex items-center space-x-1.5 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Messenger Bottom Input Bar (Facebook Messenger Style) */}
        <div className="p-2 sm:p-3 bg-white border-t border-slate-100 flex items-center space-x-1.5 sm:space-x-2 relative">
          {/* Quick Book Share Button */}
          <button
            onClick={() => setShowBookPicker(!showBookPicker)}
            className={`p-2 rounded-full transition-colors cursor-pointer flex-shrink-0 ${
              showBookPicker ? 'bg-blue-600 text-white shadow-xs' : 'text-blue-600 hover:bg-blue-50'
            }`}
            title="Chia sẻ sách vào cuộc trò chuyện"
          >
            <BookOpen className="w-5 h-5" />
          </button>

          {/* Add Photo Button (mock) */}
          <button
            onClick={() => {
              handleSendMessage('Đã gửi 1 ảnh bìa sách 📸', undefined);
            }}
            className="p-2 rounded-full text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer flex-shrink-0 hidden sm:block"
            title="Gửi hình ảnh"
          >
            <Image className="w-5 h-5" />
          </button>

          {/* Voice Memo Button (mock) */}
          <button
            onClick={() => {
              handleSendMessage('🎙️ [Tin nhắn thoại 0:14]', undefined);
            }}
            className="p-2 rounded-full text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer flex-shrink-0 hidden sm:block"
            title="Gửi tin nhắn thoại"
          >
            <Mic className="w-5 h-5" />
          </button>

          {/* Text Input Pill */}
          <div className="flex-1 relative flex items-center">
            <input
              type="text"
              placeholder="Nhắn tin..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="w-full bg-slate-100 hover:bg-slate-100/80 focus:bg-white text-xs sm:text-sm pl-4 pr-10 py-2 sm:py-2.5 rounded-full text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 border border-transparent focus:border-blue-400 transition-all"
            />

            {/* Quick Emoji Trigger */}
            <button
              onClick={() => {
                setInputText((prev) => prev + ' 😊');
              }}
              className="absolute right-3 p-1 text-slate-400 hover:text-amber-500 cursor-pointer transition-colors"
              title="Thêm emoji"
            >
              <Smile className="w-4 h-4" />
            </button>
          </div>

          {/* Right Action: Send Button (if text entered) OR Big Thumbs-Up 👍 (if empty) */}
          {inputText.trim() ? (
            <button
              onClick={() => handleSendMessage()}
              className="p-2 sm:p-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-md active:scale-95 cursor-pointer flex-shrink-0"
              title="Gửi tin nhắn"
            >
              <Send className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => handleSendMessage(undefined, undefined, true)}
              className="p-2 sm:p-2.5 rounded-full text-blue-600 hover:bg-blue-50 hover:scale-110 active:scale-90 transition-all cursor-pointer flex-shrink-0"
              title="Gửi biểu tượng thích"
            >
              <ThumbsUp className="w-5 h-5 fill-blue-600" />
            </button>
          )}

          {/* Quick Book Picker Popup */}
          {showBookPicker && (
            <div className="absolute bottom-16 left-3 sm:left-4 w-72 sm:w-80 bg-white rounded-2xl border border-slate-200 shadow-2xl p-3 z-30 animate-in fade-in slide-in-from-bottom-2 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  Chọn sách để chia sẻ vào chat:
                </span>
                <button
                  onClick={() => setShowBookPicker(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="max-h-56 overflow-y-auto space-y-1.5 divide-y divide-slate-100">
                {SAMPLE_SHAREABLE_BOOKS.map((bk) => (
                  <div
                    key={bk.id}
                    onClick={() => {
                      handleSendMessage(
                        `Mình muốn hỏi về cuốn "${bk.title}" này ạ:`,
                        bk
                      );
                      setShowBookPicker(false);
                    }}
                    className="pt-1.5 flex items-center space-x-2.5 p-1.5 rounded-xl hover:bg-blue-50 cursor-pointer transition-colors group"
                  >
                    <img
                      src={bk.coverImage}
                      alt={bk.title}
                      className="w-10 h-14 object-cover rounded-md flex-shrink-0 shadow-2xs group-hover:scale-105 transition-transform"
                    />
                    <div className="min-w-0 flex-1">
                      <h5 className="font-bold text-xs text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                        {bk.title}
                      </h5>
                      <p className="text-[11px] text-slate-500 font-medium truncate">{bk.author}</p>
                      <span className="text-xs font-black text-blue-600 tabular-nums block mt-0.5">
                        {new Intl.NumberFormat('vi-VN').format(bk.price)}đ
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      Gửi
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          SIMULATED FACEBOOK MESSENGER CALL MODAL (AUDIO / VIDEO CALL)
         ========================================================================= */}
      {showCallModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 text-white rounded-3xl w-full max-w-sm p-6 text-center space-y-6 shadow-2xl border border-white/10 relative">
            <div className="space-y-3">
              <div className="relative inline-block">
                <img
                  src={activeContact.avatar}
                  alt={activeContact.name}
                  className="w-24 h-24 rounded-full object-cover mx-auto ring-4 ring-blue-500/50 shadow-xl"
                />
                <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900" />
              </div>
              <h3 className="font-black text-lg text-white">{activeContact.name}</h3>
              <p className="text-xs text-slate-400">
                {showCallModal === 'video' ? 'Cuộc gọi video Messenger' : 'Cuộc gọi thoại Messenger'}
              </p>
              <div className="font-mono text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-full inline-block border border-emerald-500/20">
                {String(Math.floor(callDuration / 60)).padStart(2, '0')}:
                {String(callDuration % 60).padStart(2, '0')}
              </div>
            </div>

            {/* Simulated Call Controls */}
            <div className="flex items-center justify-center space-x-4 pt-2">
              <button
                className="p-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Tắt tiếng mic"
              >
                <MicOff className="w-5 h-5" />
              </button>

              {showCallModal === 'video' && (
                <button
                  className="p-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  title="Tắt camera"
                >
                  <VideoOff className="w-5 h-5" />
                </button>
              )}

              <button
                onClick={() => setShowCallModal(null)}
                className="p-4 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/40 transition-transform active:scale-95 cursor-pointer"
                title="Kết thúc cuộc gọi"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
