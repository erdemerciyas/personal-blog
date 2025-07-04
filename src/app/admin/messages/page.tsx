'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import AdminLayout from '../../../components/admin/AdminLayout';
import {
  PhoneIcon,
  BuildingOfficeIcon,
  ClockIcon,
  EyeIcon,
  TrashIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronDownIcon,
  TagIcon,
  CalendarIcon,
  InboxIcon,
  EnvelopeIcon,
  XMarkIcon
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

export default function AdminMessagesPage() {
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
  const [showFilters, setShowFilters] = useState(false);

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
      } catch (error) {
        console.error('Messages fetch error:', error);
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
    const messageId = searchParams.get('id');
    if (messageId && messages.length > 0) {
      const message = messages.find(m => m._id === messageId);
      if (message) {
        handleViewMessage(message);
        // URL'den parametreyi temizle
        router.replace('/admin/messages', { scroll: false });
      }
    }
  }, [messages, searchParams, router]);

  // Filter messages
  useEffect(() => {
    let filtered = messages;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(message =>
        message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.company?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(message => message.status === statusFilter);
    }

    // Urgency filter
    if (urgencyFilter !== 'all') {
      filtered = filtered.filter(message => message.urgency === urgencyFilter);
    }

    setFilteredMessages(filtered);
  }, [messages, searchTerm, statusFilter, urgencyFilter]);

  const handleViewMessage = async (message: Message) => {
    setSelectedMessage(message);
    setShowMessageModal(true);

    // Mark as read if not already
    if (!message.isRead) {
      try {
        const response = await fetch(`/api/messages/${message._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            isRead: true,
            status: message.status === 'new' ? 'read' : message.status,
            wasRead: message.isRead
          }),
        });

        if (response.ok) {
          // Update local state
          setMessages(prev => prev.map(m => 
            m._id === message._id 
              ? { ...m, isRead: true, status: m.status === 'new' ? 'read' : m.status }
              : m
          ));
        }
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    }
  };

  const handleUpdateStatus = async (messageId: string, newStatus: 'new' | 'read' | 'replied' | 'closed') => {
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const updatedMessage = await response.json();
        setMessages(prev => prev.map(m => 
          m._id === messageId ? { ...m, status: newStatus, isRead: updatedMessage.isRead } : m
        ));
        setSuccess('Mesaj durumu güncellendi');
        setTimeout(() => setSuccess(''), 3000);
        
        // Modal'ı kapat
        setShowMessageModal(false);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Durum güncellenemedi');
      }
    } catch (error) {
      console.error('Status update error:', error);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'read': return 'bg-yellow-100 text-yellow-800';
      case 'replied': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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

  if (status === 'loading' || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
            <p className="text-slate-600">Mesajlar yükleniyor...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <AdminLayout 
      title="Mesajlar"
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin/dashboard' },
        { label: 'Mesajlar' }
      ]}
    >
      <div className="space-y-6">
        
        {/* Header Actions */}
        <div className="flex items-center justify-between">
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
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200/60 dark:border-green-800/60 text-green-800 dark:text-green-400 p-4 rounded-xl shadow-sm">
            {success}
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200/60 dark:border-red-800/60 text-red-800 dark:text-red-400 p-4 rounded-xl shadow-sm">
            {error}
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Toplam Mesaj</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{messages.length}</p>
              </div>
              <InboxIcon className="w-8 h-8 text-slate-400 dark:text-slate-500" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Okunmamış</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{messages.filter(m => !m.isRead).length}</p>
              </div>
              <EnvelopeIcon className="w-8 h-8 text-blue-400 dark:text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Yanıtlanan</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{messages.filter(m => m.status === 'replied').length}</p>
              </div>
              <CheckIcon className="w-8 h-8 text-green-400 dark:text-green-500" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Acil</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{messages.filter(m => m.urgency === 'high').length}</p>
              </div>
              <ExclamationTriangleIcon className="w-8 h-8 text-red-400 dark:text-red-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200/60 dark:border-slate-700/60">
          <div className="flex flex-col lg:flex-row gap-4">
            
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  placeholder="Mesaj ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50/80 dark:bg-slate-700/80 border border-slate-200/60 dark:border-slate-600/60 rounded-xl pl-10 pr-4 py-3 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FunnelIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-50/80 dark:bg-slate-700/80 border border-slate-200/60 dark:border-slate-600/60 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="all">Tüm Durumlar</option>
                  <option value="new">Yeni</option>
                  <option value="read">Okunmuş</option>
                  <option value="replied">Yanıtlanmış</option>
                  <option value="closed">Kapalı</option>
                </select>
              </div>

              <select
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value)}
                className="bg-slate-50/80 dark:bg-slate-700/80 border border-slate-200/60 dark:border-slate-600/60 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
              >
                <option value="all">Tüm Aciliyetler</option>
                <option value="low">Düşük</option>
                <option value="medium">Orta</option>
                <option value="high">Yüksek</option>
              </select>
            </div>
          </div>
        </div>

        {/* Messages List */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200/60 dark:border-slate-700/60">
          <div className="p-6 border-b border-slate-200/60 dark:border-slate-700/60">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Mesajlar</h3>
          </div>
          
          <div className="divide-y divide-slate-200/60 dark:divide-slate-700/60">
            {filteredMessages.length === 0 ? (
              <div className="p-12 text-center">
                <InboxIcon className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400 text-lg">Mesaj bulunamadı</p>
                <p className="text-slate-500 dark:text-slate-500 mt-2">Farklı filtreler deneyebilirsiniz</p>
              </div>
            ) : (
              filteredMessages.map((message) => (
                <div key={message._id} className="p-6 hover:bg-slate-50/80 dark:hover:bg-slate-700/50 transition-all duration-200 group">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className={`text-lg font-semibold ${!message.isRead ? 'text-slate-900 dark:text-slate-100' : 'text-slate-700 dark:text-slate-300'}`}>
                          {message.name}
                        </h4>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(message.status)}`}>
                          {message.status === 'new' && 'Yeni'}
                          {message.status === 'read' && 'Okunmuş'}
                          {message.status === 'replied' && 'Yanıtlanmış'}
                          {message.status === 'closed' && 'Kapalı'}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUrgencyColor(message.urgency)}`}>
                          {message.urgency === 'low' && 'Düşük'}
                          {message.urgency === 'medium' && 'Orta'}
                          {message.urgency === 'high' && 'Yüksek'}
                        </span>
                        {!message.isRead && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                      
                      <p className="text-slate-600 dark:text-slate-400 mb-2 font-medium">{message.subject}</p>
                      <p className="text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">{message.message}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-500">
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
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleViewMessage(message)}
                        className="p-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Görüntüle"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteMessage(message._id)}
                        className="p-2 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Sil"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Message Detail Modal */}
      {showMessageModal && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                      <div className="bg-white dark:bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200/60 dark:border-slate-700/60">
            <div className="p-6 border-b border-slate-200/60 dark:border-slate-700/60">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Mesaj Detayı</h3>
                <button
                  onClick={() => setShowMessageModal(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 text-slate-900 dark:text-slate-100" />
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto">
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
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUrgencyColor(selectedMessage.urgency)}`}>
                      {selectedMessage.urgency === 'low' && 'Düşük'}
                      {selectedMessage.urgency === 'medium' && 'Orta'}
                      {selectedMessage.urgency === 'high' && 'Yüksek'}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tarih</label>
                  <p className="text-slate-900 dark:text-slate-100">{formatDate(selectedMessage.createdAt)}</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-200/60 dark:border-slate-700/60">
              <div className="flex justify-between">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleUpdateStatus(selectedMessage._id, 'replied')}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Yanıtlandı Olarak İşaretle
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedMessage._id, 'closed')}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Kapat
                  </button>
                </div>
                <button
                  onClick={() => setShowMessageModal(false)}
                  className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
} 