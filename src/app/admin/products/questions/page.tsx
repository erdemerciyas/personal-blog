'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ChatBubbleLeftRightIcon,
    MagnifyingGlassIcon,
    TrashIcon,
    EnvelopeIcon,
    CheckIcon,
    ClockIcon,
    ShoppingBagIcon,
    ArrowTopRightOnSquareIcon,
    PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

interface Message {
    _id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    status: 'unread' | 'read' | 'new' | 'replied' | 'closed';
    createdAt: string;
    type: string;
    productId?: string;
    productName?: string;
    orderId?: string;
    adminReply?: string;
    conversation?: any[];
}

const slugify = (text: string) => {
    const trMap: { [key: string]: string } = {
        'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
        'Ç': 'c', 'Ğ': 'g', 'İ': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u'
    };

    return text
        .split('')
        .map(char => trMap[char] || char)
        .join('')
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
};

export default function AdminProductQuestionsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState<Message[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'unread' | 'read' | 'replied'>('all');
    const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());

    // Reply Modal State
    const [replyModalOpen, setReplyModalOpen] = useState(false);
    const [replyingTo, setReplyingTo] = useState<Message | null>(null);
    const [replyText, setReplyText] = useState('');
    const [replyLoading, setReplyLoading] = useState(false);

    useEffect(() => {
        if (status === 'loading') return;

        if (status === 'unauthenticated') {
            router.push('/admin/login');
            return;
        }

        loadMessages();
    }, [status, router]);

    const loadMessages = async () => {
        try {
            const response = await fetch('/api/admin/messages');
            if (response.ok) {
                const data = await response.json();
                // Filter product questions and order questions
                const productQuestions = data.filter((m: Message) => m.type === 'product_question' || m.type === 'order_question');
                setMessages(productQuestions);
            }
        } catch (error) {
            console.error('Error loading messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (messageId: string) => {
        const result = await Swal.fire({
            title: 'Emin misiniz?',
            text: "Bu soruyu silmek istediğinize emin misiniz?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Evet, sil!'
        });

        if (!result.isConfirmed) return;

        try {
            const response = await fetch(`/api/admin/messages/${messageId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setMessages(messages.filter(msg => msg._id !== messageId));
                toast.success('Soru başarıyla silindi');
            } else {
                toast.error('Görüş silinemedi');
            }
        } catch (error) {
            console.error('Error deleting message:', error);
            toast.error('Hata oluştu');
        }
    };

    const handleBulkDelete = async () => {
        const result = await Swal.fire({
            title: 'Emin misiniz?',
            text: `${selectedMessages.size} soruyu silmek istediğinize emin misiniz?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Evet, seçilenleri sil!'
        });

        if (!result.isConfirmed) return;

        try {
            await Promise.all(
                Array.from(selectedMessages).map(id =>
                    fetch(`/api/admin/messages/${id}`, { method: 'DELETE' })
                )
            );
            setMessages(messages.filter(msg => !selectedMessages.has(msg._id)));
            setSelectedMessages(new Set());
            toast.success('Seçilen sorular başarıyla silindi');
        } catch (error) {
            console.error('Error deleting messages:', error);
            toast.error('Hata oluştu');
        }
    };

    const handleMarkAsRead = async (messageId: string) => {
        // Optimistically update
        const message = messages.find(m => m._id === messageId);
        if (message?.status === 'read' || message?.status === 'replied') return;

        try {
            const response = await fetch(`/api/admin/messages/${messageId}/read`, {
                method: 'POST',
            });

            if (response.ok) {
                setMessages(messages.map(msg =>
                    msg._id === messageId ? { ...msg, status: 'read' as const } : msg
                ));
            }
        } catch (error) {
            console.error('Error marking message as read:', error);
        }
    };

    const openReplyModal = (e: React.MouseEvent, message: Message) => {
        e.stopPropagation();
        setReplyingTo(message);
        setReplyText('');
        setReplyModalOpen(true);
    };

    const handleSendReply = async () => {
        if (!replyingTo || !replyText.trim()) return;

        setReplyLoading(true);
        try {
            const res = await fetch('/api/admin/messages/reply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messageId: replyingTo._id,
                    reply: replyText
                })
            });
            const data = await res.json();

            if (data.success) {
                toast.success('Yanıt gönderildi.');
                setReplyModalOpen(false);
                setReplyingTo(null);
                setReplyText('');
                loadMessages(); // Refresh messages immediately
            } else {
                toast.error(data.error || 'Gönderilemedi.');
            }
        } catch (error) {
            console.error('Reply error', error);
            toast.error('Bir hata oluştu.');
        } finally {
            setReplyLoading(false);
        }
    };

    const filteredMessages = messages.filter(message => {
        const matchesSearch = message.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            message.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            message.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (message.productName || '').toLowerCase().includes(searchQuery.toLowerCase());

        let matchesStatus = true;
        if (statusFilter === 'unread') {
            matchesStatus = message.status === 'unread' || message.status === 'new';
        } else if (statusFilter === 'read') {
            matchesStatus = message.status === 'read';
        } else if (statusFilter === 'replied') {
            matchesStatus = message.status === 'replied';
        }

        return matchesSearch && matchesStatus;
    });

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('tr-TR', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const unreadCount = messages.filter(m => m.status === 'unread' || m.status === 'new').length;

    if (status === 'loading' || loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-indigo-200 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-indigo-600 rounded-full animate-spin"></div>
                    </div>
                    <p className="text-lg font-medium text-slate-600">Sorular yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 relative">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Ürün Mesajları</h1>
                    <p className="text-slate-500 mt-1">Ürünleriniz hakkında gelen soruları yönetin</p>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-slate-600">
                        {unreadCount} okunmamış
                    </span>
                </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Mesajlarda veya ürün isminde ara..."
                            className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                    </div>
                    <div className="flex space-x-2 bg-slate-100 p-1 rounded-xl">
                        <button
                            onClick={() => setStatusFilter('all')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === 'all'
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            Tümü ({messages.length})
                        </button>
                        <button
                            onClick={() => setStatusFilter('unread')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === 'unread'
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            Okunmamış ({unreadCount})
                        </button>
                        <button
                            onClick={() => setStatusFilter('read')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === 'read'
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            Okunmuş
                        </button>
                        <button
                            onClick={() => setStatusFilter('replied')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === 'replied'
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            Yanıtlanmış
                        </button>
                    </div>
                </div>

                {/* Bulk Actions */}
                {selectedMessages.size > 0 && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
                        <p className="text-sm text-slate-600">
                            {selectedMessages.size} mesaj seçildi
                        </p>
                        <button
                            onClick={handleBulkDelete}
                            className="flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                        >
                            <TrashIcon className="w-4 h-4 mr-2" />
                            Seçilenleri Sil
                        </button>
                    </div>
                )}
            </div>

            {/* Messages List */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
                {filteredMessages.length > 0 ? (
                    <>
                        <div className="px-6 py-3 border-b border-slate-200 bg-slate-50/50 flex items-center">
                            <input
                                type="checkbox"
                                checked={selectedMessages.size > 0 && selectedMessages.size === filteredMessages.length}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setSelectedMessages(new Set(filteredMessages.map(m => m._id)));
                                    } else {
                                        setSelectedMessages(new Set());
                                    }
                                }}
                                className="w-5 h-5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 mr-4"
                            />
                            <span className="text-sm font-medium text-slate-600">Tümünü Seç</span>
                        </div>
                        <div className="divide-y divide-slate-200">
                            {filteredMessages.map((message) => (
                                <div
                                    key={message._id}
                                    className={`p-6 hover:bg-slate-50 transition-colors cursor-pointer ${message.status === 'unread' || message.status === 'new' ? 'bg-indigo-50/50' : message.status === 'replied' ? 'bg-green-50/30' : ''
                                        }`}
                                    onClick={() => handleMarkAsRead(message._id)}
                                >
                                    <div className="flex flex-col sm:flex-row gap-6">
                                        {/* Selection Checkbox */}
                                        <div className="flex-shrink-0 pt-1">
                                            <input
                                                type="checkbox"
                                                checked={selectedMessages.has(message._id)}
                                                onChange={(e) => {
                                                    e.stopPropagation();
                                                    const newSelected = new Set(selectedMessages);
                                                    if (newSelected.has(message._id)) {
                                                        newSelected.delete(message._id);
                                                    } else {
                                                        newSelected.add(message._id);
                                                    }
                                                    setSelectedMessages(newSelected);
                                                }}
                                                className="w-5 h-5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                                            />
                                        </div>

                                        {/* Main Content Area */}
                                        <div className="flex-1 min-w-0">

                                            {/* Header: Sender & Meta */}
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-sm shadow-indigo-200">
                                                        {message.name?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm font-bold text-slate-900 leading-tight">
                                                            {message.name}
                                                        </h3>
                                                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                                            <EnvelopeIcon className="w-3 h-3" />
                                                            {message.email}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    {(message.status === 'unread' || message.status === 'new') && (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-indigo-100 text-indigo-700 border border-indigo-200">
                                                            Yeni
                                                        </span>
                                                    )}
                                                    {message.status === 'replied' && (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                                                            Yanıtlandı
                                                        </span>
                                                    )}
                                                    <div className="flex items-center gap-1 text-xs text-slate-400 font-medium bg-slate-50 px-2 py-1 rounded border border-slate-100">
                                                        <ClockIcon className="w-3.5 h-3.5" />
                                                        {formatDate(message.createdAt)}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Context Block: Order or Product */}
                                            {(message.orderId || message.productId) && (
                                                <div className="mb-4 bg-slate-50 rounded-xl border border-slate-200/60 p-3 flex items-center justify-between group-hover:border-indigo-200 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-white rounded-lg border border-slate-100 text-slate-400">
                                                            {message.orderId ? <ShoppingBagIcon className="w-5 h-5" /> : <ShoppingBagIcon className="w-5 h-5" />}
                                                        </div>
                                                        <div>
                                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                                                                {message.orderId ? 'İlgili Sipariş' : 'İlgili Ürün'}
                                                            </div>
                                                            <div className="text-sm font-semibold text-slate-900">
                                                                {message.orderId ? `Sipariş #${message.subject.match(/#([0-9A-Z]+)/)?.[1] || message.orderId.slice(-6).toUpperCase()}` : message.productName}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {message.orderId && (
                                                        <Link
                                                            href={`/admin/orders/${message.orderId}`}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1"
                                                        >
                                                            Siparişe Git <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                                                        </Link>
                                                    )}
                                                    {message.productName && !message.orderId && (
                                                        <Link
                                                            href={message.productId ? `/products/${message.productId}` : `/products/${slugify(message.productName)}`}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1"
                                                        >
                                                            Ürüne Git <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                                                        </Link>
                                                    )}
                                                </div>
                                            )}

                                            {/* Message Content */}
                                            <div className="space-y-2">
                                                <h4 className="text-base font-bold text-slate-900">
                                                    {message.subject}
                                                </h4>
                                                <p className="text-sm text-slate-600 leading-relaxed max-w-4xl">
                                                    {message.message}
                                                </p>
                                            </div>

                                            {/* Conversation / Reply Preview */}
                                            {message.conversation && message.conversation.length > 0 && (
                                                <div className="mt-4 flex flex-col gap-2">
                                                    {message.conversation.slice(-1).map((msg: any, i: number) => (
                                                        <div key={i} className="flex items-start gap-2 max-w-2xl opacity-75">
                                                            <div className="w-0.5 self-stretch bg-indigo-200 ml-1"></div>
                                                            <div className="text-xs text-slate-500 italic bg-slate-50 px-3 py-2 rounded-lg w-full">
                                                                <span className="font-bold not-italic mr-1">{msg.sender === 'admin' ? 'Yanıtınız:' : 'Son Mesaj:'}</span>
                                                                {msg.message}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Admin Reply Indicator (Legacy) */}
                                            {!message.conversation?.length && message.adminReply && (
                                                <div className="mt-4 flex items-start gap-2 max-w-2xl opacity-75">
                                                    <div className="w-0.5 self-stretch bg-green-200 ml-1"></div>
                                                    <div className="text-xs text-slate-500 italic bg-slate-50 px-3 py-2 rounded-lg w-full">
                                                        <span className="font-bold text-green-600 not-italic mr-1">Yanıtınız:</span>
                                                        {message.adminReply}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions Column (Right Side) */}
                                        <div className="flex flex-row sm:flex-col gap-2 pl-0 sm:pl-4 sm:border-l sm:border-slate-100 sm:ml-4 justify-end sm:justify-start">
                                            <button
                                                onClick={(e) => openReplyModal(e, message)}
                                                className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 hover:shadow-sm hover:scale-105 transition-all text-sm font-medium flex items-center justify-center gap-2 w-full sm:w-auto"
                                                title="Yanıtla"
                                            >
                                                <PaperAirplaneIcon className="w-4 h-4" />
                                                <span className="sm:hidden">Yanıtla</span>
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(message._id);
                                                }}
                                                className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all text-sm font-medium flex items-center justify-center gap-2 w-full sm:w-auto"
                                                title="Sil"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                                <span className="sm:hidden">Sil</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="text-center py-16">
                        <ChatBubbleLeftRightIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">Soru bulunamadı</h3>
                        <p className="text-slate-500">
                            {searchQuery || statusFilter !== 'all'
                                ? 'Arama kriterlerinizi değiştirmeyi deneyin'
                                : 'Henüz ürünlerle ilgili soru gelmemiş'
                            }
                        </p>
                    </div>
                )}
            </div>

            {/* Reply Modal */}
            {replyModalOpen && replyingTo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-lg text-slate-900">
                                Yanıtla: <span className="font-normal text-slate-500">{replyingTo.name}</span>
                            </h3>
                            <button onClick={() => setReplyModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <span className="sr-only">Kapat</span>
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm max-h-60 overflow-y-auto space-y-3">
                                {replyingTo.conversation && replyingTo.conversation.length > 0 ? (
                                    replyingTo.conversation.map((msg: any, i: number) => (
                                        <div key={i} className={`flex flex-col ${msg.sender === 'admin' ? 'items-end' : 'items-start'}`}>
                                            <span className="text-xs font-bold text-slate-500 mb-1">
                                                {msg.sender === 'admin' ? 'Siz' : 'Müşteri'}
                                            </span>
                                            <div className={`p-2 rounded-lg max-w-[90%] ${msg.sender === 'admin' ? 'bg-indigo-100 text-indigo-900' : 'bg-white border border-slate-200 text-slate-700'}`}>
                                                {msg.message}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <>
                                        <p className="font-bold text-slate-700 mb-1">Müşteri Sorusu:</p>
                                        <p className="text-slate-600 italic">"{replyingTo.message}"</p>
                                    </>
                                )}
                            </div>

                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Yanıtınız
                            </label>
                            <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                rows={6}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                                placeholder="Yanıtınızı buraya yazın..."
                            ></textarea>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    onClick={() => setReplyModalOpen(false)}
                                    className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-medium transition-colors"
                                >
                                    İptal
                                </button>
                                <button
                                    onClick={handleSendReply}
                                    disabled={replyLoading || !replyText.trim()}
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                >
                                    {replyLoading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Gönderiliyor...
                                        </>
                                    ) : (
                                        <>
                                            <PaperAirplaneIcon className="w-4 h-4" />
                                            Yanıtı Gönder
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
