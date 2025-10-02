'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AdminLayoutNew } from '@/components/admin/layout';
import {
  AdminButton,
  AdminCard,
  AdminSpinner,
  AdminAlert,
  AdminEmptyState,
  AdminModal,
  AdminSearchInput,
  AdminSelect,
  AdminBadge,
  type SelectOption
} from '@/components/admin/ui';
import {
  PhoneIcon,
  BuildingOfficeIcon,
  ClockIcon,
  EyeIcon,
  TrashIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  InboxIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

interface Message {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject: string;
  message: string;
  projectType: string;
  budget: string;
  urgency: string;
  status: 'new' | 'read' | 'replied' | 'closed';
  isRead: boolean;
  adminNotes?: string;
  createdAt: string;
  readAt?: string;
  repliedAt?: string;
}

function AdminMessagesContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');

  // Auth check
  useEffect(() => {
    if (status === 'loading') return;
    
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/');
    }
  }, [status, session, router]);

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch('/api/messages');
        if (response.ok) {
          const data = await response.json();
          setMessages(data);
          setFilteredMessages(data);
        } else {
          throw new Error('Mesajlar yüklenirken hata oluştu');
        }
      } catch {
        setError('Mesajlar yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchMessages();
    }
  }, [status]);

  // Auto-open message from notification
  useEffect(() => {
    const messageId = searchParams?.get('id') ?? null;
    if (messageId && messages.length > 0) {
      const message = messages.find(m => m._id === messageId);
      if (message) {
        handleViewMessage(message);
        router.replace('/admin/messages', { scroll: false });
      }
    }
  }, [messages, searchParams, router]);

  // Filter messages
  useEffect(() => {
    let filtered = messages;

    if (searchTerm) {
      filtered = filtered.filter(message =>
        message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.company?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(message => message.status === statusFilter);
    }

    if (urgencyFilter !== 'all') {
      filtered = filtered.filter(message => message.urgency === urgencyFilter);
    }

    setFilteredMessages(filtered);
  }, [messages, searchTerm, statusFilter, urgencyFilter]);

  const handleViewMessage = async (message: Message) => {
    setSelectedMessage(message);
    setShowMessageModal(true);

    if (!message.isRead) {
      try {
        const response = await fetch(`/api/messages/${message._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            isRead: true,
            status: message.status === 'new' ? 'read' : message.status,
            wasRead: message.isRead
          }),
        });

        if (response.ok) {
          setMessages(prev => prev.map(m => 
            m._id === message._id 
              ? { ...m, isRead: true, status: m.status === 'new' ? 'read' : m.status }
              : m
          ));
        }
      } catch {
        // Silently fail - marking as read is not critical
      }
    }
  };

  const handleUpdateStatus = async (messageId: string, newStatus: 'new' | 'read' | 'replied' | 'closed') => {
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const updatedMessage = await response.json();
        setMessages(prev => prev.map(m => 
          m._id === messageId ? { ...m, status: newStatus, isRead: updatedMessage.isRead } : m
        ));
        setSuccess('Mesaj durumu güncellendi');
        setTimeout(() => setSuccess(''), 3000);
        setShowMessageModal(false);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Durum güncellenemedi');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Durum güncellenirken hata oluştu');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Bu mesajı silmek istediğinizden emin misiniz?')) return;

    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessages(prev => prev.filter(m => m._id !== messageId));
        setSuccess('Mesaj silindi');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error('Mesaj silinemedi');
      }
    } catch {
      setError('Mesaj silinirken hata oluştu');
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'new': return 'info';
      case 'read': return 'warning';
      case 'replied': return 'success';
      case 'closed': return 'neutral';
      default: return 'neutral';
    }
  };

  const getUrgencyBadgeVariant = (urgency: string) => {
    switch (urgency) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      default: return 'neutral';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const statusOptions: SelectOption[] = [
    { value: 'all', label: 'Tüm Durumlar' },
    { value: 'new', label: 'Yeni' },
    { value: 'read', label: 'Okunmuş' },
    { value: 'replied', label: 'Yanıtlanmış' },
    { value: 'closed', label: 'Kapalı' }
  ];

  const urgencyOptions: SelectOption[] = [
    { value: 'all', label: 'Tüm Aciliyetler' },
    { value: 'low', label: 'Düşük' },
    { value: 'medium', label: 'Orta' },
    { value: 'high', label: 'Yüksek' }
  ];

  if (status === 'loading' || loading) {
    return (
      <AdminLayoutNew
        title="Mesajlar"
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Mesajlar' }
        ]}
      >
        <div className="flex items-center justify-center py-12">
          <AdminSpinner size="lg" />
        </div>
      </AdminLayoutNew>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <AdminLayoutNew 
      title="Mesajlar"
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin/dashboard' },
        { label: 'Mesajlar' }
      ]}
    >
      <div className="space-y-6">
        
        {/* Header Info */}
        <div>
          <p className="text-slate-600 dark:text-slate-400">Gelen mesajları görüntüleyin ve yönetin</p>
          <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-400 mt-2">
            <span>Toplam: {messages.length} mesaj</span>
            <span>•</span>
            <span>Okunmamış: {messages.filter(m => !m.isRead).length}</span>
            <span>•</span>
            <span>Filtrelenen: {filteredMessages.length}</span>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <AdminAlert variant="success" onClose={() => setSuccess('')}>
            {success}
          </AdminAlert>
        )}

        {error && (
          <AdminAlert variant="error" onClose={() => setError('')}>
            {error}
          </AdminAlert>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <AdminCard padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Toplam Mesaj</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{messages.length}</p>
              </div>
              <InboxIcon className="w-8 h-8 text-slate-400 dark:text-slate-500" />
            </div>
          </AdminCard>
          
          <AdminCard padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Okunmamış</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{messages.filter(m => !m.isRead).length}</p>
              </div>
              <EnvelopeIcon className="w-8 h-8 text-blue-400 dark:text-blue-500" />
            </div>
          </AdminCard>
          
          <AdminCard padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Yanıtlanan</p>
                <p className="text-2xl font-bold text-brand-primary-700 dark:text-brand-primary-400">{messages.filter(m => m.status === 'replied').length}</p>
              </div>
              <CheckIcon className="w-8 h-8 text-brand-primary-400 dark:text-brand-primary-600" />
            </div>
          </AdminCard>
          
          <AdminCard padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Acil</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{messages.filter(m => m.urgency === 'high').length}</p>
              </div>
              <ExclamationTriangleIcon className="w-8 h-8 text-red-400 dark:text-red-500" />
            </div>
          </AdminCard>
        </div>

        {/* Filters */}
        <AdminCard padding="md">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1">
              <AdminSearchInput
                placeholder="Mesaj ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                loading={false}
              />
            </div>
            <AdminSelect
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={statusOptions}
            />
            <AdminSelect
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              options={urgencyOptions}
            />
          </div>
        </AdminCard>

        {/* Messages List */}
        <AdminCard title="Mesajlar" padding="none">
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {filteredMessages.length === 0 ? (
              <AdminEmptyState
                icon={<InboxIcon className="w-12 h-12" />}
                title="Mesaj bulunamadı"
                description="Farklı filtreler deneyebilirsiniz"
              />
            ) : (
              filteredMessages.map((message) => (
                <div key={message._id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div className="flex-1 min-w-0 w-full">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h4 className={`text-lg font-semibold ${!message.isRead ? 'text-slate-900 dark:text-slate-100' : 'text-slate-700 dark:text-slate-300'}`}>
                          {message.name}
                        </h4>
                        <AdminBadge variant={getStatusBadgeVariant(message.status)} size="sm">
                          {message.status === 'new' && 'Yeni'}
                          {message.status === 'read' && 'Okunmuş'}
                          {message.status === 'replied' && 'Yanıtlanmış'}
                          {message.status === 'closed' && 'Kapalı'}
                        </AdminBadge>
                        <AdminBadge variant={getUrgencyBadgeVariant(message.urgency)} size="sm">
                          {message.urgency === 'low' && 'Düşük'}
                          {message.urgency === 'medium' && 'Orta'}
                          {message.urgency === 'high' && 'Yüksek'}
                        </AdminBadge>
                        {!message.isRead && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                      
                      <p className="text-slate-600 dark:text-slate-400 mb-2 font-medium">{message.subject}</p>
                      <p className="text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">{message.message}</p>
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500 dark:text-slate-500">
                        <span className="flex items-center space-x-1">
                          <EnvelopeIcon className="w-4 h-4" />
                          <span>{message.email}</span>
                        </span>
                        {message.phone && (
                          <span className="flex items-center space-x-1">
                            <PhoneIcon className="w-4 h-4" />
                            <span>{message.phone}</span>
                          </span>
                        )}
                        {message.company && (
                          <span className="flex items-center space-x-1">
                            <BuildingOfficeIcon className="w-4 h-4" />
                            <span>{message.company}</span>
                          </span>
                        )}
                        <span className="flex items-center space-x-1">
                          <ClockIcon className="w-4 h-4" />
                          <span>{formatDate(message.createdAt)}</span>
                        </span>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <AdminButton
                        variant="secondary"
                        size="sm"
                        icon={EyeIcon}
                        onClick={() => handleViewMessage(message)}
                      >
                        Görüntüle
                      </AdminButton>
                      <AdminButton
                        variant="danger"
                        size="sm"
                        icon={TrashIcon}
                        onClick={() => handleDeleteMessage(message._id)}
                      >
                        Sil
                      </AdminButton>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </AdminCard>
      </div>

      {/* Message Detail Modal */}
      <AdminModal
        isOpen={showMessageModal}
        onClose={() => setShowMessageModal(false)}
        title="Mesaj Detayı"
        size="lg"
        footer={
          <div className="flex justify-between w-full">
            <div className="flex space-x-2">
              <AdminButton
                variant="primary"
                onClick={() => selectedMessage && handleUpdateStatus(selectedMessage._id, 'replied')}
              >
                Yanıtlandı Olarak İşaretle
              </AdminButton>
              <AdminButton
                variant="secondary"
                onClick={() => selectedMessage && handleUpdateStatus(selectedMessage._id, 'closed')}
              >
                Kapat
              </AdminButton>
            </div>
            <AdminButton
              variant="secondary"
              onClick={() => setShowMessageModal(false)}
            >
              Kapat
            </AdminButton>
          </div>
        }
      >
        {selectedMessage && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">İsim</label>
                <p className="text-slate-900 dark:text-slate-100">{selectedMessage.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">E-posta</label>
                <p className="text-slate-900 dark:text-slate-100">{selectedMessage.email}</p>
              </div>
              {selectedMessage.phone && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Telefon</label>
                  <p className="text-slate-900 dark:text-slate-100">{selectedMessage.phone}</p>
                </div>
              )}
              {selectedMessage.company && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Şirket</label>
                  <p className="text-slate-900 dark:text-slate-100">{selectedMessage.company}</p>
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Konu</label>
              <p className="text-slate-900 dark:text-slate-100">{selectedMessage.subject}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Mesaj</label>
              <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                <p className="text-slate-900 dark:text-slate-100 whitespace-pre-wrap">{selectedMessage.message}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Proje Türü</label>
                <p className="text-slate-900 dark:text-slate-100">{selectedMessage.projectType}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Bütçe</label>
                <p className="text-slate-900 dark:text-slate-100">{selectedMessage.budget}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Aciliyet</label>
                <AdminBadge variant={getUrgencyBadgeVariant(selectedMessage.urgency)} size="sm">
                  {selectedMessage.urgency === 'low' && 'Düşük'}
                  {selectedMessage.urgency === 'medium' && 'Orta'}
                  {selectedMessage.urgency === 'high' && 'Yüksek'}
                </AdminBadge>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tarih</label>
              <p className="text-slate-900 dark:text-slate-100">{formatDate(selectedMessage.createdAt)}</p>
            </div>
          </div>
        )}
      </AdminModal>
    </AdminLayoutNew>
  );
}

export default function AdminMessagesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <AdminSpinner size="lg" />
      </div>
    }>
      <AdminMessagesContent />
    </Suspense>
  );
}
