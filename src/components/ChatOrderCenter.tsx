import React, { useState, useEffect } from 'react';
import {
  Search,
  Paperclip,
  Smile,
  Send,
  User,
  Phone,
  Mail,
  MapPin,
  Tag,
  MoreVertical,
  CheckCircle2,
  Truck,
  XCircle,
  ShoppingBag,
  ArrowLeft,
  ChevronRight,
  Info,
  Copy,
  Printer,
  Sparkles,
  RefreshCw,
  Globe,
  Share2,
  DollarSign,
  Zap,
  ExternalLink,
  MessageCircle,
  Clock,
  ShieldCheck,
  Check,
  Bookmark,
} from 'lucide-react';
import { OrderChatConversation, ChatMessage, SnsChannel } from '../types/omnichannel';

interface ChatOrderCenterProps {
  conversations: OrderChatConversation[];
  onUpdateConversation: (updated: OrderChatConversation) => void;
  onClose?: () => void;
  onNavigateToOrders?: (orderId?: string) => void;
  onConfirmOrderFromChat?: (orderId: string, conversationId: string) => void;
  onHoldOrderFromChat?: (orderId: string, days: number, reason: string) => void;
  selectedConversationId?: string;
}

export const ChatOrderCenter: React.FC<ChatOrderCenterProps> = ({
  conversations,
  onUpdateConversation,
  onClose,
  onNavigateToOrders,
  onConfirmOrderFromChat,
  onHoldOrderFromChat,
  selectedConversationId,
}) => {
  // Active conversation state
  const [activeChatId, setActiveChatId] = useState<string>(
    selectedConversationId || (conversations.length > 0 ? conversations[0].id : '')
  );

  // Hold Order Modal in Chat
  const [showHoldModal, setShowHoldModal] = useState(false);
  const [chatHoldDays, setChatHoldDays] = useState(3);
  const [chatHoldReason, setChatHoldReason] = useState('Chờ gom đơn (canh thêm sách livestream)');

  useEffect(() => {
    if (selectedConversationId) {
      setActiveChatId(selectedConversationId);
    }
  }, [selectedConversationId]);

  // Omnichannel SNS Channel Filter
  const [selectedChannel, setSelectedChannel] = useState<'all' | SnsChannel>('all');
  const [sourceTab, setSourceTab] = useState<'all' | 'internal' | 'bookpress'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  // Helper to distinguish BookPress orders vs Internal / System orders
  const isBookPressOrder = (c: OrderChatConversation) => {
    return (
      c.channel === 'bookpress' ||
      c.channel === 'web' ||
      c.order.id.toLowerCase().includes('bp') ||
      Boolean(c.tags && c.tags.some((t) => t.toLowerCase().includes('bookpress')))
    );
  };

  const internalCount = conversations.filter((c) => !isBookPressOrder(c)).length;
  const bookpressCount = conversations.filter((c) => isBookPressOrder(c)).length;

  // Input text for new message
  const [inputText, setInputText] = useState('');
  const [showOrderModal, setShowOrderModal] = useState(false);

  // Mobile views: 'list' | 'chat' | 'details'
  const [mobileView, setMobileView] = useState<'list' | 'chat' | 'details'>('list');

  // Quick replies for Social Commerce sales
  const QUICK_REPLIES = [
    'Dạ cuốn sách này kho đang có sẵn 100% bản quyền ạ!',
    'Shop gói kỹ 3 lớp màng co xốp khí chống sốc bạn nha.',
    'Đơn từ 200k áp dụng mã FREESHIP miễn phí giao hàng toàn quốc.',
    'Dạ bạn gửi shop xin Số điện thoại & Địa chỉ để lên đơn ngay nhé!',
    'Đơn hàng đã bàn giao shipper, dự kiến giao trong ngày mai ạ.',
  ];

  const triggerSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncToast('Đã đồng bộ tin nhắn mới nhất từ 6 kênh SNS (Facebook, Instagram, TikTok, Zalo, Shopee, BookPress)!');
      setTimeout(() => setSyncToast(null), 3000);
    }, 900);
  };

  // Filter conversations by SNS channel, order source (Internal vs BookPress), search and status
  const filteredConversations = conversations.filter((c) => {
    const matchesSource =
      sourceTab === 'all'
        ? true
        : sourceTab === 'internal'
        ? !isBookPressOrder(c)
        : isBookPressOrder(c);

    const matchesChannel = selectedChannel === 'all' || c.channel === selectedChannel;
    const matchesSearch =
      c.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.customer.phone.includes(searchQuery) ||
      c.order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.order.bookTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.customer.socialHandle && c.customer.socialHandle.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || c.order.status === statusFilter;
    return matchesSource && matchesChannel && matchesSearch && matchesStatus;
  });

  const activeChat =
    filteredConversations.find((c) => c.id === activeChatId) ||
    filteredConversations[0] ||
    conversations.find((c) => c.id === activeChatId) ||
    conversations[0];

  // Helper for SNS Channel brand icons & colors
  const getChannelBadge = (channel?: SnsChannel) => {
    switch (channel) {
      case 'bookhub':
        return {
          label: 'BookHub Sàn (Nội bộ)',
          badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
          dotBg: 'bg-blue-600',
          tag: 'Đơn Nội Bộ',
        };
      case 'bookpress':
        return {
          label: 'BookPress Sub-site',
          badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dotBg: 'bg-[#10B981]',
          tag: 'Đơn BookPress',
        };
      case 'facebook':
        return {
          label: 'Facebook',
          badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
          dotBg: 'bg-[#1877F2]',
          tag: 'Messenger',
        };
      case 'instagram':
        return {
          label: 'Instagram',
          badgeBg: 'bg-pink-50 text-pink-700 border-pink-200',
          dotBg: 'bg-[#E1306C]',
          tag: 'Direct DM',
        };
      case 'tiktok':
        return {
          label: 'TikTok Shop',
          badgeBg: 'bg-slate-900 text-white border-slate-700',
          dotBg: 'bg-[#00F2FE]',
          tag: 'Live & Shop',
        };
      case 'zalo':
        return {
          label: 'Zalo OA',
          badgeBg: 'bg-sky-50 text-sky-700 border-sky-200',
          dotBg: 'bg-[#0068FF]',
          tag: 'Official Account',
        };
      case 'shopee':
        return {
          label: 'Shopee Mall',
          badgeBg: 'bg-orange-50 text-orange-700 border-orange-200',
          dotBg: 'bg-[#EE4D2D]',
          tag: 'Shopee Chat',
        };
      case 'web':
      default:
        return {
          label: 'BookPress Web',
          badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dotBg: 'bg-[#10B981]',
          tag: 'Đơn BookPress',
        };
    }
  };

  // Handle send message
  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || !activeChat) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'seller',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    const updatedChat: OrderChatConversation = {
      ...activeChat,
      unreadCount: 0,
      lastMessage: text.trim(),
      lastMessageTime: newMessage.timestamp,
      messages: [...activeChat.messages, newMessage],
    };

    onUpdateConversation(updatedChat);
    if (!textToSend) setInputText('');
  };

  // Handle BookHub Auto-drafting order from conversation
  const handleDraftOrderByBookHub = () => {
    if (!activeChat) return;

    const draftId = activeChat.order.id.startsWith('#')
      ? activeChat.order.id
      : `#DRAFT-${Math.floor(10000 + Math.random() * 90000)}`;

    const systemDraftMsg: ChatMessage = {
      id: `msg-draft-${Date.now()}`,
      sender: 'system',
      text: `⚡ BookHub AI đã soạn draft đơn hàng ${draftId} từ cuộc trò chuyện:\n• Sản phẩm: ${activeChat.order.bookTitle} (x${activeChat.order.quantity})\n• Người nhận: ${activeChat.customer.name} - ${activeChat.customer.phone}\n• Địa chỉ: ${activeChat.customer.address}\n• Tổng tiền: ${((activeChat.order.price * activeChat.order.quantity) + activeChat.order.shippingFee).toLocaleString('vi-VN')}đ (${activeChat.order.paymentMethod})\n\n👉 Vui lòng nhấn [Chủ Shop Xác Nhận (Chốt Đơn)] để liên kết đơn vào Quản Lý Đơn Hàng.`,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      isOrderCard: true,
      linkedOrderId: draftId,
      orderActionType: 'draft_created',
    };

    const updatedChat: OrderChatConversation = {
      ...activeChat,
      order: {
        ...activeChat.order,
        id: draftId,
        status: 'Chờ xử lý',
      },
      messages: [...activeChat.messages, systemDraftMsg],
    };

    onUpdateConversation(updatedChat);
    setSyncToast(`⚡ BookHub đã soạn draft đơn hàng ${draftId} thành công!`);
    setTimeout(() => setSyncToast(null), 3000);
  };

  // Quick Order Confirmation Handler
  const handleQuickConfirmOrder = () => {
    if (!activeChat) return;
    const shippingCode = activeChat.order.shippingCode || `SHIP-${Math.floor(100000 + Math.random() * 900000)}`;

    const confirmMsg: ChatMessage = {
      id: `msg-confirm-${Date.now()}`,
      sender: 'seller',
      text: `✅ ĐÃ CHỐT ĐƠN: Đơn hàng ${activeChat.order.id} đã được chủ shop xác nhận thành công!\n• Mã vận đơn: #${shippingCode} (Đơn vị: GHN / Viettel Post)\n• Trạng thái: Đang chuẩn bị bàn giao bưu tá\n🔗 Đơn hàng và tin nhắn này đã được liên kết hai chiều để đối soát và theo dõi vận chuyển.`,
      timestamp: new Date().toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      isOrderCard: true,
      linkedOrderId: activeChat.order.id,
      orderActionType: 'order_confirmed',
    };

    const updatedChat: OrderChatConversation = {
      ...activeChat,
      order: {
        ...activeChat.order,
        status: 'Đang giao',
        shippingCode,
      },
      messages: [...activeChat.messages, confirmMsg],
    };

    onUpdateConversation(updatedChat);
    if (onConfirmOrderFromChat) {
      onConfirmOrderFromChat(activeChat.order.id, activeChat.id);
    }
    setSyncToast(`Đã chốt đơn ${activeChat.order.id} và liên kết với tin nhắn!`);
    setTimeout(() => setSyncToast(null), 3000);
  };

  // Hold order from chat handler
  const handleHoldOrderFromChat = () => {
    if (!activeChat) return;
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + chatHoldDays);
    const holdDateStr = `${targetDate.toLocaleDateString('vi-VN')} - 18:00`;

    const holdMsg: ChatMessage = {
      id: `msg-hold-${Date.now()}`,
      sender: 'seller',
      text: `⏳ SHOP ĐÃ GIỮ ĐƠN CHO BẠN:\n• Đơn hàng: ${activeChat.order.id}\n• Sách: "${activeChat.order.bookTitle}" (x${activeChat.order.quantity})\n• Thời hạn giữ: Đến ${holdDateStr} (còn ${chatHoldDays} ngày)\n• Lý do: ${chatHoldReason}\n\n👉 Shop đã tạm khóa sách trong kho. Bạn cứ thong thả chọn thêm sách trong các bài viết hoặc livestream tiếp theo để gộp đơn ship chung một lần nhé!`,
      timestamp: new Date().toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      isOrderCard: true,
      linkedOrderId: activeChat.order.id,
      orderActionType: 'order_held',
    };

    const updatedChat: OrderChatConversation = {
      ...activeChat,
      order: {
        ...activeChat.order,
        status: 'Giữ đơn' as any,
        holdUntil: holdDateStr,
      },
      messages: [...activeChat.messages, holdMsg],
    };

    onUpdateConversation(updatedChat);
    if (onHoldOrderFromChat) {
      onHoldOrderFromChat(activeChat.order.id, chatHoldDays, chatHoldReason);
    }
    setShowHoldModal(false);
    setSyncToast(`Đã lưu giữ đơn ${activeChat.order.id} (${chatHoldDays} ngày) và thông báo cho khách!`);
    setTimeout(() => setSyncToast(null), 3000);
  };

  return (
    <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-200/90 shadow-md flex flex-col h-full overflow-hidden relative">
      {/* Toast Notification */}
      {syncToast && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white font-bold text-xs px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 border border-slate-700 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{syncToast}</span>
        </div>
      )}

      {/* TOP OMNICHANNEL BAR (Unified SNS Social Commerce Header) */}
      <div className="px-3 sm:px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2">
        <div className="flex items-center space-x-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs flex-shrink-0">
            <MessageCircle className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight truncate">
                Tin Nhắn & Đơn Đa Kênh SNS
              </h2>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full hidden md:inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                6 Kênh
              </span>
            </div>
            <p className="text-[10px] text-slate-500 hidden sm:block truncate">
              Facebook, Instagram, TikTok Shop, Zalo OA, Shopee, BookPress
            </p>
          </div>
        </div>

        {/* Sync Action Button */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={triggerSync}
            disabled={isSyncing}
            className="px-2.5 sm:px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Đồng bộ tất cả tin nhắn từ các nền tảng mạng xã hội"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="hidden xs:inline">{isSyncing ? 'Đang sync...' : 'Đồng Bộ'}</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* SNS CHANNEL FILTER CHIPS BAR */}
      <div className="px-3 py-2 bg-white border-b border-slate-200/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {[
          { id: 'all', label: 'Tất Cả Kênh', count: conversations.length, color: 'bg-slate-100 text-slate-800' },
          { id: 'bookhub', label: 'BookHub Sàn (Nội bộ)', count: conversations.filter(c => c.channel === 'bookhub').length, color: 'bg-blue-50 text-blue-700 border-blue-200' },
          { id: 'facebook', label: 'Facebook Messenger', count: conversations.filter(c => c.channel === 'facebook').length, color: 'bg-blue-50 text-blue-700 border-blue-200' },
          { id: 'instagram', label: 'Instagram Direct', count: conversations.filter(c => c.channel === 'instagram').length, color: 'bg-pink-50 text-pink-700 border-pink-200' },
          { id: 'tiktok', label: 'TikTok Shop', count: conversations.filter(c => c.channel === 'tiktok').length, color: 'bg-slate-900 text-white border-slate-800' },
          { id: 'zalo', label: 'Zalo OA', count: conversations.filter(c => c.channel === 'zalo').length, color: 'bg-sky-50 text-sky-700 border-sky-200' },
          { id: 'shopee', label: 'Shopee Mall', count: conversations.filter(c => c.channel === 'shopee').length, color: 'bg-orange-50 text-orange-700 border-orange-200' },
          { id: 'web', label: 'BookPress Web', count: conversations.filter(c => c.channel === 'web' || c.channel === 'bookpress').length, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
        ].map((tab) => {
          const isSelected = selectedChannel === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedChannel(tab.id as any)}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer flex-shrink-0 ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100/90 text-slate-600 hover:text-slate-900 hover:bg-slate-200/80'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold tabular-nums ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-white text-slate-700'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* MAIN 3-PANEL OMNICHANNEL CHAT LAYOUT */}
      <div className="flex-1 flex overflow-hidden">
        {/* COLUMN 1: CONVERSATIONS LIST (Hidden on mobile if viewing chat) */}
        <div
          className={`w-full md:w-80 lg:w-96 flex-shrink-0 border-r border-slate-200 bg-white flex flex-col ${
            mobileView !== 'list' ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Quick Order Source Filter Tabs (Tất cả / Đơn nội bộ / Đơn BookPress) */}
          <div className="p-2.5 border-b border-slate-200 bg-slate-50/90">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1.5 px-0.5">
              <span>NGUỒN ĐƠN HÀNG:</span>
              <span className="text-[10px] text-slate-400 font-medium">Bấm chuyển nhanh</span>
            </div>
            <div className="grid grid-cols-3 gap-1 bg-slate-200/70 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setSourceTab('all')}
                className={`py-1.5 px-1 rounded-lg transition-all text-center flex items-center justify-center gap-1 cursor-pointer ${
                  sourceTab === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Tất cả</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold tabular-nums ${sourceTab === 'all' ? 'bg-slate-100 text-slate-700' : 'bg-white/60 text-slate-500'}`}>
                  {conversations.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSourceTab('internal')}
                className={`py-1.5 px-1 rounded-lg transition-all text-center flex items-center justify-center gap-1 cursor-pointer ${
                  sourceTab === 'internal'
                    ? 'bg-blue-600 text-white shadow-2xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Đơn hệ thống BookOwl, Facebook, Zalo, TikTok, Shopee"
              >
                <span className="truncate">Đơn nội bộ</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold tabular-nums ${sourceTab === 'internal' ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-700'}`}>
                  {internalCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSourceTab('bookpress')}
                className={`py-1.5 px-1 rounded-lg transition-all text-center flex items-center justify-center gap-1 cursor-pointer ${
                  sourceTab === 'bookpress'
                    ? 'bg-emerald-600 text-white shadow-2xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Đơn từ website / landing BookPress riêng"
              >
                <span className="truncate">Đơn BookPress</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold tabular-nums ${sourceTab === 'bookpress' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-700'}`}>
                  {bookpressCount}
                </span>
              </button>
            </div>
          </div>

          {/* Search & Order Status Filter */}
          <div className="p-2.5 border-b border-slate-100 space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm khách hàng, nick SNS, mã đơn..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar text-[11px] font-semibold">
              {['all', 'Chờ xử lý', 'Giữ đơn', 'Đang giao', 'Đã hoàn thành'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2 py-0.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors ${
                    statusFilter === st
                      ? 'bg-slate-800 text-white font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st === 'all' ? 'Tất cả' : st}
                </button>
              ))}
            </div>
          </div>

          {/* Conversations Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Không có tin nhắn nào từ bộ lọc này.
              </div>
            ) : (
              filteredConversations.map((item) => {
                const isActive = item.id === activeChatId;
                const badgeInfo = getChannelBadge(item.channel);
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setActiveChatId(item.id);
                      setMobileView('chat');
                    }}
                    className={`p-3 hover:bg-blue-50/40 cursor-pointer transition-all flex items-start gap-2.5 relative ${
                      isActive ? 'bg-blue-50/70 border-l-4 border-blue-600' : ''
                    }`}
                  >
                    {/* Customer Avatar & Channel Icon */}
                    <div className="relative flex-shrink-0">
                      <img
                        src={item.customer.avatar}
                        alt={item.customer.name}
                        className="w-11 h-11 rounded-2xl object-cover border border-slate-200 shadow-2xs"
                      />
                      {/* Channel Badge Indicator */}
                      <span
                        className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-black text-white ${badgeInfo.dotBg}`}
                        title={badgeInfo.label}
                      >
                        {item.channel === 'bookhub' && 'bh'}
                        {item.channel === 'bookpress' && 'bp'}
                        {item.channel === 'facebook' && 'f'}
                        {item.channel === 'instagram' && 'ig'}
                        {item.channel === 'tiktok' && 'tt'}
                        {item.channel === 'zalo' && 'z'}
                        {item.channel === 'shopee' && 's'}
                        {item.channel === 'web' && 'bp'}
                      </span>
                    </div>

                    {/* Customer Info & Message Preview */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {item.customer.name}
                        </h4>
                        <span className="text-[10px] text-slate-400 tabular-nums">
                          {item.lastMessageTime}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 mt-0.5">
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md border ${badgeInfo.badgeBg}`}>
                          {badgeInfo.label}
                        </span>
                        <span
                          className={`text-[9px] font-extrabold px-1 py-0.2 rounded-sm ${
                            isBookPressOrder(item)
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {isBookPressOrder(item) ? 'BookPress' : 'Nội bộ'}
                        </span>
                        {item.customer.socialHandle && (
                          <span className="text-[10px] text-slate-500 font-mono truncate">
                            {item.customer.socialHandle}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-600 truncate mt-1">
                        {item.lastMessage}
                      </p>

                      {/* Attached Order Snapshot */}
                      <div className="flex items-center justify-between gap-1 mt-1.5 pt-1 border-t border-slate-100/80 text-[10px]">
                        <span className="text-slate-500 truncate font-mono">
                          {item.order.id} · {item.order.bookTitle}
                        </span>
                        <span
                          className={`px-1.5 py-0.2 rounded-md font-bold text-[9px] flex-shrink-0 ${
                            item.order.status === 'Chờ xử lý' || item.order.status === 'Nháp'
                              ? 'bg-amber-100 text-amber-800'
                              : item.order.status === 'Giữ đơn' || item.order.status === 'Đang giữ đơn'
                              ? 'bg-purple-100 text-purple-800'
                              : item.order.status === 'Đang giao'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {item.order.status === 'Đang giữ đơn' ? 'Giữ đơn' : item.order.status}
                        </span>
                      </div>
                    </div>

                    {/* Unread Pill */}
                    {item.unreadCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 border-2 border-white shadow-2xs">
                        {item.unreadCount}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* COLUMN 2: ACTIVE CHAT CONVERSATION */}
        {activeChat ? (
          <div
            className={`flex-1 flex flex-col bg-slate-50/50 ${
              mobileView === 'list' ? 'hidden md:flex' : mobileView === 'details' ? 'hidden' : 'flex'
            }`}
          >
            {/* Chat Top Header */}
            <div className="px-4 py-2.5 bg-white border-b border-slate-200 flex items-center justify-between gap-2 shadow-2xs">
              <div className="flex items-center space-x-2.5">
                <button
                  onClick={() => setMobileView('list')}
                  className="md:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <div className="relative">
                  <img
                    src={activeChat.customer.avatar}
                    alt={activeChat.customer.name}
                    className="w-9 h-9 rounded-2xl object-cover border border-slate-200 shadow-2xs"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                      {activeChat.customer.name}
                    </h3>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md border ${
                        getChannelBadge(activeChat.channel).badgeBg
                      }`}
                    >
                      {getChannelBadge(activeChat.channel).label}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 flex items-center gap-2">
                    {activeChat.customer.socialHandle && (
                      <span className="font-mono text-blue-600">{activeChat.customer.socialHandle}</span>
                    )}
                    <span>· {activeChat.customer.phone}</span>
                  </p>
                </div>
              </div>

              {/* Chat Actions */}
              <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
                <button
                  onClick={handleDraftOrderByBookHub}
                  className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer transition-all active:scale-95"
                  title="BookOwl AI tự động quét tin nhắn và soạn thảo đơn nháp để chủ shop duyệt"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span className="hidden sm:inline">Soạn Draft Đơn</span>
                </button>

                <button
                  onClick={() => setShowHoldModal(true)}
                  className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 rounded-xl text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer transition-all active:scale-95"
                  title="Tạm giữ đơn này cho khách chờ gom thêm sách"
                >
                  <Bookmark className="w-3.5 h-3.5 text-purple-600" />
                  <span className="hidden sm:inline">Giữ Đơn</span>
                </button>

                <button
                  onClick={handleQuickConfirmOrder}
                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer transition-all active:scale-95"
                  title="Chốt đơn & gửi cho đơn vị vận chuyển"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Chốt Đơn Nhanh</span>
                </button>

                {onNavigateToOrders && (
                  <button
                    onClick={() => onNavigateToOrders(activeChat.order.id)}
                    className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    title="Mở đơn hàng này trong trang Quản Lý Đơn Hàng"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
                    <span className="hidden md:inline">Quản Lý Đơn</span>
                  </button>
                )}

                <button
                  onClick={() => setMobileView('details')}
                  className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  title="Xem chi tiết đơn hàng & CRM"
                >
                  <Info className="w-4 h-4 text-blue-600" />
                  <span className="hidden lg:inline">Chi Tiết</span>
                </button>
              </div>
            </div>

            {/* Embedded Order Floating Banner */}
            <div className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center space-x-2.5 min-w-0">
                <img
                  src={activeChat.order.bookImage}
                  alt={activeChat.order.bookTitle}
                  className="w-8 h-11 object-cover rounded-md border border-blue-200 shadow-2xs flex-shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-blue-800">{activeChat.order.id}</span>
                    <span className="text-[10px] bg-white text-slate-700 font-bold px-1.5 py-0.2 rounded-md border border-blue-200">
                      {activeChat.order.status}
                    </span>
                  </div>
                  <p className="text-[11px] font-bold text-slate-900 truncate">
                    {activeChat.order.bookTitle}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="text-right">
                  <span className="font-extrabold text-rose-600 text-xs tabular-nums">
                    {activeChat.order.price.toLocaleString('vi-VN')}đ
                  </span>
                  <span className="block text-[10px] text-slate-500">
                    SL: {activeChat.order.quantity}
                  </span>
                </div>
                {onNavigateToOrders && (
                  <button
                    onClick={() => onNavigateToOrders(activeChat.order.id)}
                    className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-100/60 rounded-lg transition-colors cursor-pointer text-[11px] font-bold flex items-center gap-0.5"
                    title="Mở trong Quản Lý Đơn Hàng"
                  >
                    <span>Xem Đơn</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {activeChat.messages.map((msg) => {
                const isSeller = msg.sender === 'seller';
                const isSystem = msg.sender === 'system';

                if (msg.orderActionType === 'draft_created') {
                  return (
                    <div key={msg.id} className="flex justify-center my-2">
                      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 text-amber-950 p-3.5 rounded-2xl max-w-md shadow-xs space-y-2">
                        <div className="flex items-center justify-between border-b border-amber-200/80 pb-1.5">
                          <span className="font-extrabold text-xs text-amber-900 flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-amber-600" />
                            BookOwl AI: Đơn Nháp Tự Động Từ Tin Nhắn
                          </span>
                          <span className="text-[10px] font-mono text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                            {msg.linkedOrderId || activeChat.order.id}
                          </span>
                        </div>
                        <p className="text-xs whitespace-pre-wrap leading-relaxed font-medium">
                          {msg.text}
                        </p>
                        <div className="pt-1 flex items-center gap-2">
                          <button
                            onClick={handleQuickConfirmOrder}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-2xs flex items-center gap-1 cursor-pointer active:scale-95"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Chủ Shop Xác Nhận (Chốt Đơn)</span>
                          </button>
                          {onNavigateToOrders && (
                            <button
                              onClick={() => onNavigateToOrders(msg.linkedOrderId || activeChat.order.id)}
                              className="px-2.5 py-1.5 bg-white hover:bg-amber-100/50 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold cursor-pointer"
                            >
                              Xem Quản Lý Đơn
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }

                if (msg.orderActionType === 'order_confirmed') {
                  return (
                    <div key={msg.id} className="flex justify-center my-2">
                      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300 text-emerald-950 p-3.5 rounded-2xl max-w-md shadow-xs space-y-2">
                        <div className="flex items-center justify-between border-b border-emerald-200/80 pb-1.5">
                          <span className="font-extrabold text-xs text-emerald-900 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            Đã Chốt Đơn & Liên Kết Hai Chiều Thành Công
                          </span>
                          <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                            {msg.linkedOrderId || activeChat.order.id}
                          </span>
                        </div>
                        <p className="text-xs whitespace-pre-wrap leading-relaxed font-medium">
                          {msg.text}
                        </p>
                        {onNavigateToOrders && (
                          <div className="pt-1">
                            <button
                              onClick={() => onNavigateToOrders(msg.linkedOrderId || activeChat.order.id)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1.5 cursor-pointer"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>Mở Đơn Hàng Tại Quản Lý Đơn Hàng</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }

                if (msg.orderActionType === 'order_held') {
                  return (
                    <div key={msg.id} className="flex justify-center my-2">
                      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-300 text-purple-950 p-3.5 rounded-2xl max-w-md shadow-xs space-y-2">
                        <div className="flex items-center justify-between border-b border-purple-200/80 pb-1.5">
                          <span className="font-extrabold text-xs text-purple-900 flex items-center gap-1.5">
                            <Bookmark className="w-4 h-4 text-purple-600" />
                            Đã Tạm Giữ Đơn Chờ Gom Hàng
                          </span>
                          <span className="text-[10px] font-mono text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">
                            {msg.linkedOrderId || activeChat.order.id}
                          </span>
                        </div>
                        <p className="text-xs whitespace-pre-wrap leading-relaxed font-medium">
                          {msg.text}
                        </p>
                        <div className="pt-1 flex items-center gap-2">
                          <button
                            onClick={handleQuickConfirmOrder}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-2xs flex items-center gap-1 cursor-pointer active:scale-95"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Chốt Xuất Kho Giao Ngay</span>
                          </button>
                          {onNavigateToOrders && (
                            <button
                              onClick={() => onNavigateToOrders(msg.linkedOrderId || activeChat.order.id)}
                              className="px-2.5 py-1.5 bg-white hover:bg-purple-100/50 text-purple-900 border border-purple-200 rounded-xl text-xs font-bold cursor-pointer"
                            >
                              Xem Tại Quản Lý Đơn
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }

                if (isSystem) {
                  return (
                    <div key={msg.id} className="flex justify-center my-2">
                      <div className="bg-slate-200 text-slate-700 text-[10px] font-semibold px-3 py-1 rounded-full text-center max-w-sm shadow-2xs">
                        {msg.text}
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2 ${isSeller ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isSeller && (
                      <img
                        src={activeChat.customer.avatar}
                        alt="Customer"
                        className="w-7 h-7 rounded-full object-cover border border-slate-200 flex-shrink-0 mb-1"
                      />
                    )}

                    <div
                      className={`max-w-[85%] md:max-w-[70%] p-3 rounded-2xl text-xs leading-relaxed font-medium shadow-2xs ${
                        isSeller
                          ? 'bg-blue-600 text-white rounded-br-xs'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                      <span
                        className={`block text-[9px] mt-1 text-right font-normal tabular-nums ${
                          isSeller ? 'text-blue-200' : 'text-slate-400'
                        }`}
                      >
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Replies Bar */}
            <div className="px-3 py-1.5 bg-white border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-500" /> Mẫu:
              </span>
              {QUICK_REPLIES.map((reply, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(reply)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-[10px] font-semibold rounded-full whitespace-nowrap transition-all flex-shrink-0 cursor-pointer"
                >
                  {reply}
                </button>
              ))}
            </div>

            {/* Message Input Box */}
            <div className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2">
              <button
                onClick={() => handleSendMessage(`Dạ gửi bạn link thanh toán và ưu đãi độc quyền BookPress: https://phuongnambooks.vn/order/${activeChat.order.id}`)}
                className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                title="Gửi link thanh toán / voucher BookPress"
              >
                <Tag className="w-4 h-4 text-emerald-600" />
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage();
                }}
                placeholder={`Nhắn tin trực tiếp qua ${getChannelBadge(activeChat.channel).label}...`}
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
              />

              <button
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim()}
                className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8 text-slate-400 text-xs">
            Chọn một cuộc hội thoại từ danh sách để bắt đầu tư vấn & chốt đơn.
          </div>
        )}

        {/* COLUMN 3: CUSTOMER CRM & ORDER DETAILS PANEL */}
        {activeChat && (
          <div
            className={`w-full md:w-72 lg:w-80 border-l border-slate-200 bg-white flex flex-col overflow-y-auto p-4 space-y-4 ${
              mobileView === 'details' ? 'flex' : 'hidden lg:flex'
            }`}
          >
            {mobileView === 'details' && (
              <button
                onClick={() => setMobileView('chat')}
                className="md:hidden flex items-center gap-1 text-xs font-bold text-blue-600 pb-2 border-b"
              >
                <ArrowLeft className="w-4 h-4" /> Quay lại cuộc trò chuyện
              </button>
            )}

            {/* Customer CRM Profile */}
            <div className="text-center space-y-2 border-b border-slate-100 pb-4">
              <div className="relative inline-block">
                <img
                  src={activeChat.customer.avatar}
                  alt={activeChat.customer.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md mx-auto"
                />
                <span
                  className={`absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-md text-[8px] font-black text-white ${
                    getChannelBadge(activeChat.channel).dotBg
                  }`}
                >
                  {getChannelBadge(activeChat.channel).label}
                </span>
              </div>
              <h4 className="font-extrabold text-sm text-slate-900">{activeChat.customer.name}</h4>
              <p className="text-[11px] text-slate-500 font-mono">
                {activeChat.customer.socialHandle || activeChat.customer.phone}
              </p>
              <div className="flex flex-wrap justify-center gap-1 pt-1">
                {(activeChat.tags || ['Khách Mua Sách', 'Thân Thiết']).map((t, idx) => (
                  <span
                    key={idx}
                    className="text-[9px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200/60"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Delivery Info */}
            <div className="space-y-2 text-xs">
              <h5 className="font-bold text-slate-700 uppercase text-[10px] tracking-wider">
                Địa Chỉ Giao Hàng & Liên Hệ
              </h5>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-[11px]">
                <p className="flex items-center gap-2 text-slate-700">
                  <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>{activeChat.customer.phone}</span>
                </p>
                <p className="flex items-start gap-2 text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span>{activeChat.customer.address}</span>
                </p>
                <p className="flex items-center gap-2 text-slate-700">
                  <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{activeChat.customer.email}</span>
                </p>
              </div>
            </div>

            {/* Current Order Summary */}
            <div className="space-y-2 text-xs">
              <h5 className="font-bold text-slate-700 uppercase text-[10px] tracking-wider">
                Chi Tiết Đơn Hàng {activeChat.order.id}
              </h5>
              <div className="p-3 rounded-xl border border-slate-200 space-y-2">
                <div className="flex gap-2.5">
                  <img
                    src={activeChat.order.bookImage}
                    alt={activeChat.order.bookTitle}
                    className="w-12 h-16 object-cover rounded-lg border border-slate-200 shadow-2xs flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-900 text-xs line-clamp-2">
                      {activeChat.order.bookTitle}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Số lượng: {activeChat.order.quantity}
                    </p>
                    <p className="text-xs font-extrabold text-rose-600 mt-1 tabular-nums">
                      {activeChat.order.price.toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-1 text-[11px] text-slate-600">
                  <div className="flex justify-between">
                    <span>Phí giao hàng:</span>
                    <span className="tabular-nums font-semibold">
                      {activeChat.order.shippingFee === 0 ? 'Miễn phí' : `${activeChat.order.shippingFee.toLocaleString('vi-VN')}đ`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Thanh toán:</span>
                    <span className="font-semibold text-slate-800 truncate max-w-[140px] text-right">
                      {activeChat.order.paymentMethod}
                    </span>
                  </div>
                  {activeChat.order.shippingCode && (
                    <div className="flex justify-between text-blue-600 font-mono font-bold">
                      <span>Mã vận đơn:</span>
                      <span>{activeChat.order.shippingCode}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="space-y-1.5 pt-2">
              <button
                onClick={handleQuickConfirmOrder}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-95"
              >
                <Truck className="w-3.5 h-3.5" /> Giao Hàng Ngay
              </button>
              <button
                onClick={() => setShowHoldModal(true)}
                className="w-full py-2 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Bookmark className="w-3.5 h-3.5 text-purple-600" /> Giữ Đơn Này Cho Khách
              </button>
              <button
                onClick={() => handleSendMessage(`Mã vận đơn của bạn là #${activeChat.order.shippingCode || 'VTP-882910'}. Sách đã được đóng gói và đang trên đường giao!`)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" /> Gửi Tracking Mã Vận Đơn
              </button>
            </div>
          </div>
        )}

        {/* QUICK HOLD MODAL IN CHAT */}
        {showHoldModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 animate-in zoom-in-95">
              <div className="p-3.5 bg-purple-900 text-white flex items-center justify-between">
                <h3 className="font-bold text-xs sm:text-sm flex items-center gap-1.5">
                  <Bookmark className="w-4 h-4 text-purple-300" />
                  Giữ Đơn Cho Khách: {activeChat.customer.name}
                </h3>
                <button onClick={() => setShowHoldModal(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <div className="p-4 space-y-3 text-xs">
                <div className="p-2.5 rounded-xl bg-purple-50 text-purple-950 border border-purple-200 space-y-0.5">
                  <p className="font-bold">{activeChat.order.bookTitle}</p>
                  <p className="text-[11px] text-purple-700">SL: {activeChat.order.quantity} cuốn · Tiền: {activeChat.order.price.toLocaleString('vi-VN')}đ</p>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Thời hạn giữ sách:</label>
                  <select
                    value={chatHoldDays}
                    onChange={(e) => setChatHoldDays(Number(e.target.value))}
                    className="w-full p-2 border rounded-xl bg-slate-50 font-semibold"
                  >
                    <option value={1}>1 ngày (24 giờ)</option>
                    <option value={2}>2 ngày (48 giờ)</option>
                    <option value={3}>3 ngày (tiêu chuẩn gom đơn)</option>
                    <option value={5}>5 ngày</option>
                    <option value={7}>7 ngày (1 tuần chờ lương)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Lý do giữ đơn:</label>
                  <input
                    type="text"
                    value={chatHoldReason}
                    onChange={(e) => setChatHoldReason(e.target.value)}
                    placeholder="Ví dụ: Chờ live thứ 6 gom thêm sách..."
                    className="w-full p-2 border rounded-xl bg-slate-50"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowHoldModal(false)}
                    className="px-3 py-1.5 border rounded-xl"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleHoldOrderFromChat}
                    className="px-4 py-1.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl shadow-xs"
                  >
                    Xác Nhận Giữ Đơn
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
