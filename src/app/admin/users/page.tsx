'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../../components/admin/AdminLayout';
import {
  PencilIcon,
  TrashIcon,
  KeyIcon,
  MagnifyingGlassIcon,
  UserPlusIcon,
  ShieldCheckIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user' as 'admin' | 'user',
    isActive: true
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/admin/login');
      return;
    }

    if (session?.user?.role !== 'admin') {
      router.push('/admin/dashboard');
      return;
    }

    loadUsers();
  }, [status, session, router]);

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Users load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      setMessage({ type: 'error', text: 'Tüm alanları doldurun.' });
      return;
    }

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Kullanıcı başarıyla eklendi!' });
        setShowAddModal(false);
        setNewUser({ name: '', email: '', password: '', role: 'user', isActive: true });
        loadUsers();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.message || 'Kullanıcı eklenirken hata oluştu.' });
      }
    } catch (error) {
      console.error('Add user error:', error);
      setMessage({ type: 'error', text: 'Kullanıcı eklenirken hata oluştu.' });
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`/api/admin/users/${selectedUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: selectedUser.name,
          email: selectedUser.email,
          role: selectedUser.role,
          isActive: selectedUser.isActive
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Kullanıcı başarıyla güncellendi!' });
        setShowEditModal(false);
        setSelectedUser(null);
        loadUsers();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.message || 'Kullanıcı güncellenirken hata oluştu.' });
      }
    } catch (error) {
      console.error('Edit user error:', error);
      setMessage({ type: 'error', text: 'Kullanıcı güncellenirken hata oluştu.' });
    }
  };

  const handleChangePassword = async () => {
    if (!selectedUser) return;

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Şifreler eşleşmiyor.' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Şifre en az 6 karakter olmalıdır.' });
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${selectedUser._id}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newPassword: passwordData.newPassword
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Şifre başarıyla değiştirildi!' });
        setShowPasswordModal(false);
        setSelectedUser(null);
        setPasswordData({ newPassword: '', confirmPassword: '' });
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.message || 'Şifre değiştirilirken hata oluştu.' });
      }
    } catch (error) {
      console.error('Change password error:', error);
      setMessage({ type: 'error', text: 'Şifre değiştirilirken hata oluştu.' });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Kullanıcı başarıyla silindi!' });
        loadUsers();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.message || 'Kullanıcı silinirken hata oluştu.' });
      }
    } catch (error) {
      console.error('Delete user error:', error);
      setMessage({ type: 'error', text: 'Kullanıcı silinirken hata oluştu.' });
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (status === 'loading' || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
            <p className="text-lg text-slate-700">Kullanıcılar yükleniyor...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      title="Kullanıcı Yönetimi"
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin/dashboard' },
        { label: 'Kullanıcı Yönetimi' }
      ]}
    >
      <div className="space-y-6">
        {/* Success/Error Message */}
        {message && (
          <div className={`p-4 rounded-xl border ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Kullanıcı Yönetimi</h1>
            <p className="text-slate-600 mt-1">Sistem kullanıcılarını yönetin</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center space-x-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <UserPlusIcon className="w-4 h-4" />
            <span>Yeni Kullanıcı</span>
          </button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Kullanıcı ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Users List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">
              Kayıtlı Kullanıcılar ({filteredUsers.length})
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Kullanıcı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Kayıt Tarihi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center">
                            <UserIcon className="h-5 w-5 text-slate-500" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900">{user.name}</div>
                          <div className="text-sm text-slate-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role === 'admin' ? (
                          <>
                            <ShieldCheckIcon className="w-3 h-3 mr-1" />
                            Admin
                          </>
                        ) : (
                          <>
                            <UserIcon className="w-3 h-3 mr-1" />
                            Kullanıcı
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? (
                          <>
                            <CheckCircleIcon className="w-3 h-3 mr-1" />
                            Aktif
                          </>
                        ) : (
                          <>
                            <XCircleIcon className="w-3 h-3 mr-1" />
                            Pasif
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowEditModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="Düzenle"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowPasswordModal(true);
                          }}
                          className="text-yellow-600 hover:text-yellow-900 p-1 rounded"
                          title="Şifre Değiştir"
                        >
                          <KeyIcon className="w-4 h-4" />
                        </button>
                        {user._id !== session?.user?.id && (
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded"
                            title="Sil"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Yeni Kullanıcı Ekle</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ad Soyad</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">E-posta</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Şifre</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Rol</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value as 'admin' | 'user' }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="user">Kullanıcı</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={newUser.isActive}
                  onChange={(e) => setNewUser(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="w-4 h-4 text-teal-600 bg-gray-100 border-gray-300 rounded focus:ring-teal-500"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-slate-700">Aktif kullanıcı</label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewUser({ name: '', email: '', password: '', role: 'user', isActive: true });
                }}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleAddUser}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
              >
                Kullanıcı Ekle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Kullanıcı Düzenle</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ad Soyad</label>
                <input
                  type="text"
                  value={selectedUser.name || ''}
                  onChange={(e) => setSelectedUser(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">E-posta</label>
                <input
                  type="email"
                  value={selectedUser.email || ''}
                  onChange={(e) => setSelectedUser(prev => prev ? ({ ...prev, email: e.target.value }) : null)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Rol</label>
                <select
                  value={selectedUser.role}
                  onChange={(e) => setSelectedUser(prev => prev ? ({ ...prev, role: e.target.value as 'admin' | 'user' }) : null)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="user">Kullanıcı</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="editIsActive"
                  checked={selectedUser.isActive || false}
                  onChange={(e) => setSelectedUser(prev => prev ? ({ ...prev, isActive: e.target.checked }) : null)}
                  className="w-4 h-4 text-teal-600 bg-gray-100 border-gray-300 rounded focus:ring-teal-500"
                />
                <label htmlFor="editIsActive" className="ml-2 text-sm text-slate-700">Aktif kullanıcı</label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleEditUser}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
              >
                Güncelle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Şifre Değiştir - {selectedUser.name}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Yeni Şifre</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Şifre Tekrar</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setSelectedUser(null);
                  setPasswordData({ newPassword: '', confirmPassword: '' });
                }}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleChangePassword}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
              >
                Şifre Değiştir
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}