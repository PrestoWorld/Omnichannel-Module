export type SnsChannel = 
  | 'bookhub' 
  | 'bookpress' 
  | 'facebook' 
  | 'instagram' 
  | 'tiktok' 
  | 'zalo' 
  | 'shopee' 
  | 'web';

export type ShopOrderStatus = 
  | 'draft' 
  | 'pending' 
  | 'confirmed' 
  | 'shipping' 
  | 'delivered' 
  | 'cancelled' 
  | 'on_hold';

export interface ShopOrderBookItem {
  id?: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
}

export interface HoldOrderData {
  holdUntil: string;
  holdReason: 'chờ_gom_đơn' | 'chờ_lương' | 'hẹn_ngày_lấy' | 'chờ_sách_mới_về' | 'khác';
  holdReasonText?: string;
  holdNotes?: string;
  lockedStockCount?: number;
  daysRemaining?: number;
}

export interface DraftOrderData {
  orderId: string;
  items: ShopOrderBookItem[];
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  status: 'draft' | 'confirmed';
  notes?: string;
  confirmedAt?: string;
}

export interface ShopOrder {
  id: string;
  source: 'messages' | 'bookhub' | 'bookpress' | 'facebook' | 'zalo' | 'tiktok' | 'instagram' | 'shopee' | 'web';
  sourceConversationId?: string;
  sourceMessageSnippet?: string;
  customer: {
    name: string;
    avatar?: string;
    phone: string;
    address: string;
    socialHandle?: string;
  };
  items: ShopOrderBookItem[];
  subtotal: number;
  shippingFee: number;
  discount?: number;
  totalAmount: number;
  status: ShopOrderStatus;
  createdAt: string;
  confirmedAt?: string;
  paymentMethod: string;
  isPaid?: boolean;
  notes?: string;
  shippingCode?: string;
  shippingCarrier?: string;
  draftedByBookHub?: boolean;
  holdData?: HoldOrderData;
  isMerged?: boolean;
  mergedFromOrderIds?: string[];
  fulfillmentWarehouseId?: string;
  fulfillmentWarehouseName?: string;
  outboundSlipCode?: string;
  fulfillmentStatus?: 'unassigned' | 'routed' | 'picking' | 'dispatched';
  routingRecommendation?: {
    recommendedWarehouseId: string;
    recommendedWarehouseName: string;
    matchReason: string;
    isInStockFull: boolean;
    missingItemsCount: number;
    savingsNote?: string;
  };
}

export interface ChatMessage {
  id: string;
  sender: 'customer' | 'seller' | 'system';
  text: string;
  timestamp: string;
  mediaUrl?: string;
  isOrderCard?: boolean;
  draftOrder?: DraftOrderData;
  linkedOrderId?: string;
  orderActionType?: 
    | 'draft_created' 
    | 'order_confirmed' 
    | 'order_shipping' 
    | 'order_held' 
    | 'order_merged';
}

export interface OrderChatConversation {
  id: string;
  channel?: SnsChannel;
  channelBadge?: string;
  linkedOrderId?: string;
  customer: {
    id: string;
    name: string;
    avatar: string;
    phone: string;
    email: string;
    address: string;
    isOnline?: boolean;
    socialHandle?: string;
  };
  order: {
    id: string;
    bookTitle: string;
    bookImage: string;
    quantity: number;
    price: number;
    shippingFee: number;
    status: 'Chờ xử lý' | 'Đang giao' | 'Đã hoàn thành' | 'Đã hủy' | 'Đang giữ đơn';
    date: string;
    paymentMethod: string;
    shippingCode?: string;
    holdUntil?: string;
  };
  unreadCount: number;
  lastMessage: string;
  lastMessageTime: string;
  messages: ChatMessage[];
  tags?: string[];
}

export interface BookDetail {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  category: string;
  publisher: string;
  pages: number;
  description: string;
  condition: 'Sách mới 100%' | '98% Likenew' | 'Sách cũ sưu tầm';
  sellerName: string;
  sellerAvatar: string;
  galleryImages?: string[];
  isbn?: string;
  dimensions?: string;
  weightGrams?: number;
  coverType?: string;
  publicationYear?: number;
  translator?: string;
  distributor?: string;
  stockCount?: number;
  soldCount?: number;
}