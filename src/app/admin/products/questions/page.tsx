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
    ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';

interface Message {
    _id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    status: 'unread' | 'read';
    createdAt: string;
    type: string;
    productId?: string;
    productName?: string;
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
    const [statusFilter, setStatusFilter] = useState<'all' | 'unread' | 'read'>('all');
    const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());

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
                // Filter only product questions
                const productQuestions = data.filter((m: Message) => m.type === 'product_question');
                setMessages(productQuestions);
            }
        } catch (error) {
            console.error('Error loading messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (messageId: string) => {
        if (!confirm('Are you sure you want to delete this question?')) return;

        try {
            const response = await fetch(`/api/admin/messages/${messageId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setMessages(messages.filter(msg => msg._id !== messageId));
            }
        } catch (error) {
            console.error('Error deleting message:', error);
        }
    };

    const handleBulkDelete = async () => {
        if (!confirm(`Are you sure you want to delete ${selectedMessages.size} question(s)?`)) return;

        try {
            await Promise.all(
                Array.from(selectedMessages).map(id =>
                    fetch(`/api/admin/messages/${id}`, { method: 'DELETE' })
                )
            );
            setMessages(messages.filter(msg => !selectedMessages.has(msg._id)));
            setSelectedMessages(new Set());
        } catch (error) {
            console.error('Error deleting messages:', error);
        }
    };

    const handleMarkAsRead = async (messageId: string) => {
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

    const filteredMessages = messages.filter(message => {
        const matchesSearch = message.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            message.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            message.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (message.productName || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || message.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (status === 'loading' || loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-indigo-200 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-indigo-600 rounded-full animate-spin"></div>
                    </div>
                    <p className="text-lg font-medium text-slate-600">Loading questions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Ürün Mesajları</h1>
                    <p className="text-slate-500 mt-1">Ürünleriniz hakkında gelen soruları yönetin</p>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-slate-600">
                        {messages.filter(m => m.status === 'unread').length} okunmamış
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
                            Okunmamış ({messages.filter(m => m.status === 'unread').length})
                        </button>
                        <button
                            onClick={() => setStatusFilter('read')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === 'read'
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            Okunmuş ({messages.filter(m => m.status === 'read').length})
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
                    <div className="divide-y divide-slate-200">
                        {filteredMessages.map((message) => (
                            <div
                                key={message._id}
                                className={`p-6 hover:bg-slate-50 transition-colors cursor-pointer ${message.status === 'unread' ? 'bg-indigo-50/50' : ''
                                    }`}
                                onClick={() => handleMarkAsRead(message._id)}
                            >
                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0">
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
                                            className="w-5 h-5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-semibold">
                                                    {message.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="text-sm font-semibold text-slate-900">
                                                            {message.name}
                                                        </h3>
                                                        {message.productId && (
                                                            <Link
                                                                href={`/products/${slugify(message.productName || '')}`}
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 hover:bg-slate-200"
                                                            >
                                                                <ShoppingBagIcon className="w-3 h-3 mr-1" />
                                                                {message.productName}
                                                                <ArrowTopRightOnSquareIcon className="w-3 h-3 ml-1 text-slate-400" />
                                                            </Link>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center space-x-2 text-xs text-slate-500">
                                                        <EnvelopeIcon className="w-3 h-3" />
                                                        <span className="truncate">{message.email}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                {message.status === 'unread' && (
                                                    <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                                                )}
                                                <div className="flex items-center space-x-1 text-xs text-slate-500">
                                                    <ClockIcon className="w-3 h-3" />
                                                    <span>{formatDate(message.createdAt)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <h4 className="text-sm font-medium text-slate-900 mb-2">
                                            {message.subject}
                                        </h4>
                                        <p className="text-sm text-slate-600 line-clamp-2">
                                            {message.message}
                                        </p>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(message._id);
                                            }}
                                            className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                                            title="Sil"
                                        >
                                            <TrashIcon className="w-4 h-4 text-slate-600" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
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
        </div>
    );
}
