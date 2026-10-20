import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react';
import React from 'react';
import { ChatOrderCenter } from './ChatOrderCenter';
import { INITIAL_CHAT_CONVERSATIONS } from '../data/chatData';

const defaultProps = {
  conversations: INITIAL_CHAT_CONVERSATIONS,
  onUpdateConversation: vi.fn(),
  onNavigateToOrders: vi.fn(),
  onConfirmOrderFromChat: vi.fn(),
  onHoldOrderFromChat: vi.fn(),
  selectedConversationId: undefined,
};

beforeEach(() => {
  vi.clearAllMocks();
  cleanup();
});

describe('ChatOrderCenter', () => {
  it('renders the omnichannel header and conversation list', () => {
    render(<ChatOrderCenter {...defaultProps} />);

    expect(screen.getByRole('button', { name: /Tổng Quan Hoạt Động Bán Hàng Sub-site/ })).toBeInTheDocument();
    expect(screen.getByText('Đồng bộ tất cả tin nhắn từ các nền tảng mạng xã hội')).toBeInTheDocument();
    // Channel filter chips
    expect(screen.getByText('Tất Cả Kênh')).toBeInTheDocument();
    expect(screen.getByText('Facebook Messenger')).toBeInTheDocument();
    expect(screen.getByText('Zalo OA')).toBeInTheDocument();
    expect(screen.getByText('Shopee Mall')).toBeInTheDocument();
    // Conversation items
    expect(screen.getByText('Thanh Thảo (Facebook)')).toBeInTheDocument();
    expect(screen.getByText('Diệu Linh (@linh.bookworm)')).toBeInTheDocument();
    expect(screen.getByText('Văn Huy (@huy_reviewsach)')).toBeInTheDocument();
    expect(screen.getByText('Chị Mai Lan (Giáo viên Văn)')).toBeInTheDocument();
    expect(screen.getByText('Quốc Bảo (Shopee)')).toBeInTheDocument();
    expect(screen.getByText('Hoàng Yến (Khách BookPress)')).toBeInTheDocument();
    expect(screen.getByText('Trần Minh Quân (Độc giả BookHub)')).toBeInTheDocument();
  });

  it('filters conversations by SNS channel chip', () => {
    render(<ChatOrderCenter {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /Tất Cả Kênh/ }));
    expect(screen.getAllByText('Tất Cả Kênh')).toHaveLength(1);
    expect(screen.getByText('Thanh Thảo (Facebook)')).toBeInTheDocument();
    expect(screen.getByText('Chị Mai Lan (Giáo viên Văn)')).toBeInTheDocument();
  });

  it('filters conversations by order source tab (internal vs bookpress)', () => {
    render(<ChatOrderCenter {...defaultProps} />);

    fireEvent.click(screen.getByText('Tất cả'));
    expect(screen.getByText('Đơn nội bộ')).toBeInTheDocument();
    expect(screen.getByText('Đơn BookPress')).toBeInTheDocument();
    expect(screen.queryByText('Thanh Thảo (Facebook)')).not.toBeInTheDocument();
  });

  it('searches conversations by customer name', () => {
    render(<ChatOrderCenter {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText('Tìm khách hàng, nick SNS, mã đơn...');
    fireEvent.change(input, { target: { value: 'Thanh Thảo' } });
    expect(screen.getByText('Thanh Thảo (Facebook)')).toBeInTheDocument();
    expect(screen.queryByText('Thanh Thảo (Facebook)')).not.toBeInTheDocument();
  });

  it('selects a conversation and renders the active chat', () => {
    render(<ChatOrderCenter {...defaultProps} />);

    // Find and click the specific conversation by ID
    const targetChat = INITIAL_CHAT_CONVERSATIONS.find(c => c.id === 'chat-fb-1');
    expect(screen.getByText('Thanh Thảo (Facebook)')).toBeInTheDocument();
    // Simulate clicking on the conversation row
    const listItem = screen.getByText('Thanh Thảo (Facebook)');
    fireEvent.click(listItem);
    expect(screen.getByText('Thanh Thảo (Facebook)')).toBeInTheDocument();
    expect(screen.getByText('Chào shop, mình thấy fanpage có tặng kèm bookmark kim loại, đơn này có không ạ?')).toBeInTheDocument();
  });

  it('sends a message and calls onUpdateConversation', () => {
    render(<ChatOrderCenter {...defaultProps} />);

    fireEvent.click(screen.getByText('Thanh Thảo (Facebook)'));
    const input = screen.getByPlaceholderText('Tìm khách hàng, nick SNS, mã đơn...');
    fireEvent.change(input, { target: { value: 'Mình muốn đặt một đơn hàng' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(defaultProps.onUpdateConversation).toHaveBeenCalled();
    const updated = defaultProps.onUpdateConversation.mock.calls[0][0];
    expect(updated.order?.bookTitle).toContain('Nhà Giả Kim');
  });

  it('creates a draft order via BookHub and calls onUpdateConversation', () => {
    render(<ChatOrderCenter {...defaultProps} />);

    fireEvent.click(screen.getByText('Thanh Thảo (Facebook)'));
    fireEvent.click(screen.getByRole('button', { name: /Soạn Draft Đơn/ }));

    expect(defaultProps.onUpdateConversation).toHaveBeenCalled();
  });

  it('confirms an order and calls onConfirmOrderFromChat', () => {
    render(<ChatOrderCenter {...defaultProps} />);

    fireEvent.click(screen.getByText('Thanh Thảo (Facebook)'));
    fireEvent.click(screen.getByRole('button', { name: /Chốt Đơn Nhanh/ }));

    expect(defaultProps.onConfirmOrderFromChat).toHaveBeenCalled();
  });

  it('opens hold order modal and confirms hold', () => {
    render(<ChatOrderCenter {...defaultProps} />);

    fireEvent.click(screen.getByText('Thanh Thảo (Facebook)'));
    fireEvent.click(screen.getByRole('button', { name: /Giữ Đơn Này Cho Khách/ }));

    expect(screen.getByText('Đã lưu giữ đơn 156823 (3 ngày) và thông báo cho khách!')).toBeInTheDocument();
    expect(defaultProps.onHoldOrderFromChat).toHaveBeenCalled();
  });

  it('navigates to orders when clicking a conversation order link', () => {
    render(<ChatOrderCenter {...defaultProps} />);

    fireEvent.click(screen.getByText('Thanh Thảo (Facebook)'));
    fireEvent.click(screen.getByRole('button', { name: /Mở Đơn Hàng Tại Quản Lý Đơn Hàng/ }));

    expect(defaultProps.onNavigateToOrders).toHaveBeenCalledWith('#FB-99210');
  });

  it('shows empty state when no conversations match filter', () => {
    render(<ChatOrderCenter conversations={[]} {...defaultProps} />);

    expect(screen.getByText('Không có tin nhắn nào từ bộ lọc này.')).toBeInTheDocument();
  });

  it('shows quick replies bar and sends a quick reply', () => {
    render(<ChatOrderCenter {...defaultProps} />);

    fireEvent.click(screen.getByText('Thanh Thảo (Facebook)'));
    const quickReplyBtn = screen.getByText('Dạ cuốn sách này kho đang có sẵn 100% bản quyền ạ!');
    fireEvent.click(quickReplyBtn);

    expect(defaultProps.onUpdateConversation).toHaveBeenCalled();
  });

  it('shows sync toast after clicking sync button', () => {
    render(<ChatOrderCenter {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /Đồng Bộ/ }));
    await waitFor(() => {
      expect(screen.getByText(/Đã đồng bộ tin nhắn mới nhất/)).toBeInTheDocument();
    });
  });
});

describe('UserMessengerView', () => {
  it('renders the messenger inbox and header', () => {
    render(<UserMessengerView />);

    expect(screen.getByRole('heading', { name: /Đoạn chat/ })).toBeInTheDocument();
    expect(screen.getByText('Hộp thư')).toBeInTheDocument();
    expect(screen.getByText('Nhà Sách Phương Nam')).toBeInTheDocument();
    expect(screen.getByText('Thu Hà')).toBeInTheDocument();
    expect(screen.getByText('Mai Phương')).toBeInTheDocument();
    expect(screen.getByText('CLB Sách Nhã Nam')).toBeInTheDocument();
    expect(screen.getByText('Tiệm Sách Cũ BookOwl')).toBeInTheDocument();
    expect(screen.getByText('Lê Hoàng')).toBeInTheDocument();
  });

  it('filters contacts by store tab', () => {
    render(<UserMessengerView />);

    fireEvent.click(screen.getByText('Cửa hàng'));
    expect(screen.getByText('Nhà Sách Phương Nam')).toBeInTheDocument();
    expect(screen.getByText('Tiệm Sách Cũ BookOwl')).toBeInTheDocument();
    expect(screen.getByText('CLB Sách Nhã Nam')).not.toBeInTheDocument();
  });

  it('filters contacts by friend tab (includes club)', () => {
    render(<UserMessengerView />);

    fireEvent.click(screen.getByText('Bạn bè'));
    expect(screen.getByText('Thu Hà')).toBeInTheDocument();
    expect(screen.getByText('Mai Phương')).toBeInTheDocument();
    expect(screen.getByText('Lê Hoàng')).toBeInTheDocument();
  });

  it('filters contacts by unread tab', () => {
    render(<UserMessengerView />);

    fireEvent.click(screen.getByText('Chưa đọc'));
    expect(screen.getByText('Nhà Sách Phương Nam')).toBeInTheDocument();
    expect(screen.getByText('Lê Hoàng')).not.toBeInTheDocument();
  });

  it('searches contacts by name', () => {
    render(<UserMessengerView />);

    const input = screen.getByPlaceholderText('Tìm kiếm trên Messenger...');
    fireEvent.change(input, { target: { value: 'Thu Hà' } });
    expect(screen.getByText('Thu Hà')).toBeInTheDocument();
    expect(screen.queryByText('Mai Phương')).not.toBeInTheDocument();
  });

  it('sends a message and displays it in the chat thread', () => {
    render(<UserMessengerView />);

    fireEvent.click(screen.getByText('Nhà Sách Phương Nam'));
    const input = screen.getByPlaceholderText('Nhắn tin...');
    fireEvent.change(input, { target: { value: 'Chào shop! Có hàng của bạn không?' });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(screen.getByText('Bạn: Chào shop! Có hàng của bạn không?')).toBeInTheDocument();
  });

  it('sends a thumbs-up sticker when input is empty', () => {
    render(<UserMessengerView />);

    fireEvent.click(screen.getByText('Nhà Sách Phương Nam'));
    const input = screen.getByPlaceholderText('Nhắn tin...');
    fireEvent.keyDown(input, { key: 'Enter' });
    fireEvent.click(screen.getByText('👍'));

    expect(screen.getByText('👍')).toBeInTheDocument();
  });

  it('simulates an auto-reply from a store contact after 1.5s', () => {
    render(<UserMessengerView />);

    fireEvent.click(screen.getByText('Nhà Sách Phương Nam'));
    const input = screen.getByPlaceholderText('Nhắn tin...');
    fireEvent.change(input, { target: { value: 'Cảm ơn bạn!' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(screen.getByText('Dạ shop Phương Nam đã ghi nhận thông tin của bạn ạ!')).toBeInTheDocument();
  });

  it('opens book picker and shares a book', () => {
    render(<UserMessengerView />);

    fireEvent.click(screen.getByText('Nhà Sách Phương Nam'));
    fireEvent.click(screen.getByText('Hỏi thông tin sách'));
    fireEvent.click(screen.getByText('Chọn sách để chia sẻ vào chat:'));

    // Select a book
    fireEvent.click(screen.getByText('Đại Dương Đen - Những Câu Chuyện Về Trầm Cảm'));
    expect(screen.getByText(/Mình muốn hỏi về cuốn "Đại Dương Đen" này ạ/)).toBeInTheDocument();
  });

  it('opens and closes the call modal', () => {
    render(<UserMessengerView />);

    fireEvent.click(screen.getByText('Nhà Sách Phương Nam'));
    fireEvent.click(screen.getByText('Bắt đầu cuộc gọi thoại'));

    expect(screen.getByText('Cuộc gọi thoại Messenger')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Kết thúc cuộc gọi'));
    expect(screen.queryByText('Cuộc gọi thoại Messenger')).not.toBeInTheDocument();
  });

  it('renders with custom books prop and inspects a book', () => {
    const onInspectBook = vi.fn();
    const books = [
      {
        id: 'custom-1',
        title: 'Custom Book',
        author: 'Test Author',
        coverImage: 'https://example.com/cover.jpg',
        price: 100000,
      },
    ];

    render(<UserMessengerView books={books} onInspectBook={onInspectBook} />);

    fireEvent.click(screen.getByText('Nhà Sách Phương Nam'));
    fireEvent.click(screen.getByText('Hỏi thông tin sách'));
    expect(onInspectBook).toHaveBeenCalledWith(expect.objectContaining({ id: 'custom-1' }));
  });
});