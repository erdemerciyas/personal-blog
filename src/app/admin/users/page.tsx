'use client';

import { useState, useEffect } from 'react';
import { AdminLayoutNew } from '@/components/admin/layout';
import { AdminCard, AdminButton, AdminTable, AdminBadge, AdminModal, AdminInput, AdminSelect, type Column } from '@/components/admin/ui';
import { PlusIcon, PencilIcon, TrashIcon, UserIcon } from '@heroicons/react/24/outline';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  isActive: boolean;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);

  useEffect(() => {
    fetch('/api/admin/users')
      .then(r => r.ok ? r.json() : [])
      .then(data => setUsers(data))
      .finally(() => setLoading(false));
  }, []);

  const columns: Column<User>[] = [
    { key: 'name', label: 'İsim', render: u => <span className="font-medium">{u.name}</span> },
    { key: 'email', label: 'E-posta', render: u => <span className="text-slate-600 dark:text-slate-400">{u.email}</span> },
    { key: 'role', label: 'Rol', render: u => <AdminBadge variant={u.role === 'admin' ? 'success' : 'neutral'} size="sm">{u.role}</AdminBadge> },
    { key: 'isActive', label: 'Durum', render: u => <AdminBadge variant={u.isActive ? 'success' : 'error'} size="sm">{u.isActive ? 'Aktif' : 'Pasif'}</AdminBadge> },
    {
      key: 'actions',
      label: 'İşlemler',
      render: u => (
        <div className="flex gap-2">
          <AdminButton variant="secondary" size="sm" icon={PencilIcon} onClick={() => { setEditUser(u); setShowModal(true); }}>Düzenle</AdminButton>
          <AdminButton variant="danger" size="sm" icon={TrashIcon} onClick={() => handleDelete(u._id)}>Sil</AdminButton>
        </div>
      )
    }
  ];

  const handleDelete = async (id: string) => {
    if (!confirm('Silmek istediğinizden emin misiniz?')) return;
    await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
    setUsers(users.filter(u => u._id !== id));
  };

  return (
    <AdminLayoutNew
      title="Kullanıcı Yönetimi"
      breadcrumbs={[{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Kullanıcılar' }]}
      actions={<AdminButton variant="primary" icon={PlusIcon} onClick={() => { setEditUser(null); setShowModal(true); }}>Yeni Kullanıcı</AdminButton>}
    >
      <AdminCard title="Kullanıcılar" padding="none">
        <AdminTable columns={columns} data={users} loading={loading} />
      </AdminCard>

      <AdminModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editUser ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı'}
        footer={
          <div className="flex gap-2">
            <AdminButton variant="primary">Kaydet</AdminButton>
            <AdminButton variant="secondary" onClick={() => setShowModal(false)}>İptal</AdminButton>
          </div>
        }
      >
        <div className="space-y-4">
          <AdminInput label="İsim" placeholder="İsim" />
          <AdminInput label="E-posta" type="email" placeholder="E-posta" />
          <AdminSelect label="Rol" options={[{ value: 'user', label: 'Kullanıcı' }, { value: 'admin', label: 'Admin' }]} />
        </div>
      </AdminModal>
    </AdminLayoutNew>
  );
}
