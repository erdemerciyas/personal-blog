'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  UserGroupIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  EnvelopeIcon,
  PlusIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'user';
  status: 'active' | 'inactive';
  createdAt: string;
  lastLogin?: string;
  addresses?: {
    title: string;
    fullName: string;
    phone: string;
    country: string;
    city: string;
    district: string;
    address: string;
    zipCode: string;
    isPrimary: boolean;
  }[];
}

export default function AdminUsersPage() {
  const { status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'editor' | 'user'>('all');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [passwordModalUser, setPasswordModalUser] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user',
    status: 'active',
    password: ''
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
    verificationCode: ''
  });

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/admin/login');
      return;
    }

    loadUsers();
  }, [status, router]);

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        const mappedData = data.map((item: any) => ({
          ...item,
          role: item.role as 'admin' | 'editor' | 'user',
          status: item.isActive ? 'active' : 'inactive'
        }));
        setUsers(mappedData);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      password: ''
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const response = await fetch(`/api/admin/users/${editingUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          isActive: formData.status === 'active',
          password: formData.password
        }),
      });

      if (response.ok) {
        setUsers(users.map(user =>
          user._id === editingUser._id
            ? {
              ...user,
              ...formData,
              status: formData.status as 'active' | 'inactive',
              role: formData.role as 'admin' | 'editor' | 'user'
            }
            : user
        ));
        setEditingUser(null);
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          isActive: formData.status === 'active'
        }),
      });

      if (response.ok) {
        const newUser = await response.json();
        setUsers([{
          ...newUser.data,
          status: newUser.data.isActive ? 'active' : 'inactive',
          role: newUser.data.role as 'admin' | 'editor' | 'user'
        }, ...users]);
        setIsAddUserOpen(false);
        toast.success('User created successfully');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const handleSendVerificationCode = async () => {
    if (!passwordModalUser) return;

    try {
      const response = await fetch('/api/admin/users/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: passwordModalUser._id }),
      });

      if (response.ok) {
        toast.success('Verification code sent to user email');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to send verification code');
      }
    } catch (error) {
      console.error('Error sending verification code:', error);
      toast.error('Failed to send verification code');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModalUser) return;

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!passwordData.verificationCode) {
      toast.error('Please enter the verification code sent to the user');
      return;
    }

    try {
      const response = await fetch('/api/admin/users/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: passwordModalUser._id,
          newPassword: passwordData.newPassword,
          isAdmin: true,
          verificationCode: passwordData.verificationCode
        }),
      });

      if (response.ok) {
        setPasswordModalUser(null);
        setPasswordData({ newPassword: '', confirmPassword: '', verificationCode: '' });
        toast.success('Password updated successfully');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update password');
      }
    } catch (error) {
      console.error('Error updating password:', error);
    }
  };

  const handleDelete = async (userId: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setUsers(users.filter(user => user._id !== userId));
        toast.success('User deleted successfully');
      } else {
        const data = await response.json();
        toast.error(data.message || 'Error deleting user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });



  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-lg font-medium text-slate-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Users</h1>
          <p className="text-slate-500 mt-1">Manage user accounts</p>
        </div>
        <button
          onClick={() => {
            setFormData({ name: '', email: '', role: 'user', status: 'active', password: '' });
            setIsAddUserOpen(true);
          }}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          <span>New User</span>
        </button>
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
              placeholder="Search users..."
              className="w-select pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex space-x-2 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setRoleFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${roleFilter === 'all'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              All ({users.length})
            </button>
            <button
              onClick={() => setRoleFilter('admin')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${roleFilter === 'admin'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              Admin ({users.filter(u => u.role === 'admin').length})
            </button>
            <button
              onClick={() => setRoleFilter('editor')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${roleFilter === 'editor'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              Editor ({users.filter(u => u.role === 'editor').length})
            </button>
            <button
              onClick={() => setRoleFilter('user')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${roleFilter === 'user'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              User ({users.filter(u => u.role === 'user').length})
            </button>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
        {filteredUsers.length > 0 ? (
          <div className="divide-y divide-slate-200">
            {filteredUsers.map((user) => (
              <div
                key={user._id}
                className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0 text-white font-semibold text-lg">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                      {user.name}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1 text-xs text-slate-500">
                      <EnvelopeIcon className="w-3 h-3" />
                      <span className="truncate">{user.email}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${user.role === 'admin'
                      ? 'bg-indigo-100 text-indigo-700'
                      : user.role === 'editor'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-700'
                      }`}>
                      {user.role}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${user.status === 'active'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-red-100 text-red-700'
                      }`}>
                      {user.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(user)}
                      className="p-2 hover:bg-indigo-100 rounded-lg transition-colors"
                    >
                      <PencilIcon className="w-4 h-4 text-slate-600" />
                    </button>
                    {user.role !== 'admin' && (
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <TrashIcon className="w-4 h-4 text-slate-600" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <UserGroupIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No users found</h3>
            <p className="text-slate-500">
              {searchQuery || roleFilter !== 'all'
                ? 'Try adjusting your search or filter'
                : 'No users registered yet'
              }
            </p>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Edit User</h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="user">User</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Saved Addresses Section */}
              {editingUser.addresses && editingUser.addresses.length > 0 && (
                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <MapPinIcon className="w-4 h-4 text-indigo-500" />
                    Saved Addresses ({editingUser.addresses.length})
                  </h4>
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                    {editingUser.addresses.map((addr, idx) => (
                      <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-slate-700">{addr.title}</span>
                          {addr.isPrimary && (
                            <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] rounded-md font-medium">Primary</span>
                          )}
                        </div>
                        <div className="text-slate-600 text-xs space-y-0.5">
                          <div>{addr.fullName} • {addr.phone}</div>
                          <div>{addr.address}</div>
                          <div>{addr.district}, {addr.city} / {addr.country}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-2 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Add New User</h3>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="user">User</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {passwordModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Change Password</h3>
            <p className="text-sm text-slate-500 mb-4">
              Changing password for <span className="font-medium text-slate-900">{passwordModalUser.name}</span>
            </p>
            <div className="mb-4 bg-blue-50 p-3 rounded-lg border border-blue-100">
              <p className="text-sm text-blue-700 mb-2">
                This process requires email verification.
              </p>
              <button
                type="button"
                onClick={handleSendVerificationCode}
                className="text-sm font-medium text-blue-600 hover:text-blue-800 underline"
              >
                Send Verification Code to {passwordModalUser.email}
              </button>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Verification Code</label>
                <input
                  type="text"
                  value={passwordData.verificationCode}
                  onChange={(e) => setPasswordData({ ...passwordData, verificationCode: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter 6-digit code"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                  minLength={6}
                />
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setPasswordModalUser(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
