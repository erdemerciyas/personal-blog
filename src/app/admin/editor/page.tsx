'use client';

import { useState } from 'react';
import { AdminLayoutNew } from '@/components/admin/layout';
import { AdminCard, AdminButton, AdminTextarea, AdminAlert } from '@/components/admin/ui';
import { DocumentTextIcon, CheckIcon } from '@heroicons/react/24/outline';

export default function EditorPage() {
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSave = async () => {
    setSaving(true);
    // Simulate save
    setTimeout(() => {
      setSaving(false);
      setSuccess('İçerik kaydedildi!');
      setTimeout(() => setSuccess(''), 3000);
    }, 1000);
  };

  return (
    <AdminLayoutNew
      title="İçerik Editörü"
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin/dashboard' },
        { label: 'Editör' }
      ]}
      actions={
        <AdminButton variant="primary" icon={CheckIcon} onClick={handleSave} loading={saving}>
          Kaydet
        </AdminButton>
      }
    >
      <div className="space-y-6">
        {success && <AdminAlert variant="success" onClose={() => setSuccess('')}>{success}</AdminAlert>}
        
        <AdminCard title="İçerik" padding="md">
          <AdminTextarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={20}
            placeholder="İçeriğinizi buraya yazın..."
          />
        </AdminCard>
      </div>
    </AdminLayoutNew>
  );
}
