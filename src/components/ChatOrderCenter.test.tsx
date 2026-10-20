import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup, within, waitFor } from '@testing-library/react';
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

    expect(screen.getByText('Tin Nhắn & Đơn Đa Kênh SNS')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Tổng Quan Hoạt Động Bán Hàng Sub-site/ })).toBeInTheDocument();
    expect(screen.getByText('Đồng bộ tất cả tin nhắn từ các nền tảng mạng xã hội')).toBeInTheDocument();
    // channel filter chips
    expect(screen.getByText('Tất Cả Kênh')).toBeInTheDocument();
    expect(screen.getByText('Facebook Messenger')).toBeInTheDocument();
    expect(screen.getByText('Zalo OA')).toBeInTheDocument();
    expect(screen.getByText('Shopee Mall')).toBeInTheDocument();
    // conversation items
    expect(screen.getByText('Thanh Thảo (Facebook)')).toBeInTheDocument();
    expect(screen.getByText('Diệu Linh (@linh.bookworm)')).toBeInTheDocument();
    expect(screen.getByText('Văn Huy (@huy_reviewsach)')).toBeInTheDocument();
    expect(screen.getByText('Chị Mai Lan (Giáo viên Văn)')).toBeInTheDocument();
    expect(screen.getByText('Quốc Bảo (Shopee)')).toBeInTheDocument();
    expect(screen.getByText('Hoàng Yến (Khách BookPress)')).toBeInTheDocument();
    expect(screen.getByText('Trần Minh Quân (Độc giả BookHub)')).toBeInTheDocument();
    expect(screen.getByText('Đặng Tuấn Kiệt (Khách BookPress)')).toBeInTheDocument();
  });

  it('filters conversations by SNS channel chip', () => {
    render(<ChatOrderCenter {...defaultProps} />);

    fireEvent.click(screen.getByText('Tất Cả Kênh'));
    expect(screen.getByText('Tất Cả Kênh')).toBeInTheDocument();
    expect(screen.getByText('6 Kênh')).toBeInTheDocument();
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

    const input = screen.getByPlaceholderText('Tìm khách hàng, nick SNS, mã đơn...');
    fireEvent.change(input, { target: { value: 'Thanh Thảo' } });
    expect(screen.getByText('Thanh Thảo (Facebook)')).toBeInTheDocument();
    expect(screen.queryByText('Thanh Thảo (Facebook)')).not.toBeInTheDocument();
  });

  it('selects a conversation and renders the active chat', () => {
    render(<ChatOrderCenter {...defaultProps} />);

    fireEvent.click(screen.getByText('Thanh Thảo (Facebook)'));
    expect(screen.getByText('Thanh Thảo (Facebook)')).toBeInTheDocument();
    expect(screen.getByText('order.id: #FB-99210')).toBeInTheDocument();
    expect(screen.getByText('Chào shop, mình inbox từ bài post trên Fanpage Facebook!')).toBeInTheDocument();
  });

  it('sends a message and calls onUpdateConversation', () => {
    render(<ChatOrderCenter {...defaultProps} />);

    fireEvent.click(screen.getByText('Thanh Thảo (Facebook)'));
    const input = screen.getByPlaceholderText('Tìm khách hàng, nick SNS, mã đơn...');
    fireEvent.change(input, { target: { value: 'Mã vận đơn #12345' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(defaultProps.onUpdateConversation).toHaveBeenCalled();
    const updated = defaultProps.onUpdateConversation.mock.calls[0][0];
    expect(updated.order?.id).toBeDefined();
    expect(updated.order?.status).toBe('Chờ xử lý');
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
    fireEvent.click(screen.getByRole('button', { name: /Chốt Đơn/ }));

    expect(defaultProps.onConfirmOrderFromChat).toHaveBeenCalled();
  });

  it('opens hold order modal and confirms hold', () => {
    render(<ChatOrderCenter {...defaultProps} />);

    fireEvent.click(screen.getByText('Thanh Thảo (Facebook)'));
    fireEvent.click(screen.getByRole('button', { name: /Giữ Đơn/ }));

    expect(screen.getByText('Đã lưu giữ đơn 156823 (3 ngày)')).toBeInTheDocument();
    expect(defaultProps.onHoldOrderFromChat).toHaveBeenCalled();
  });

  it('navigates to orders when clicking a conversation order link', () => {
    render(<ChatOrderCenter {...defaultProps} />);

    fireEvent.click(screen.getByText('Thanh Thảo (Facebook)'));
    fireEvent.click(screen.getByRole('button', { name: /Mở Đơn Hàng Tại Quản Lý Đơn Hàng/ }));

    expect(defaultProps.onNavigateToOrders).toHaveBeenCalledWith('ORD-BH88412');
  });

  it('shows empty state when no conversations match filter', () => {
    render(<ChatOrderCenter conversations={[]} {...defaultProps} />);

    expect(screen.getByText('Không có tin nhắn nào từ bộ lọc này.')).toBeInTheDocument();
  });

  it('shows quick replies bar and sends a quick reply', () => {
    render(<ChatOrderCenter {...defaultProps} />);

    fireEvent.click(screen.getByText('Thanh Thảo (Facebook)'));
    fireEvent.click(screen.getByText('Dạ cuốn sách này kho đang có sẵn 100% bản quyền ạ!'));

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