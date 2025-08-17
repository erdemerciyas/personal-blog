'use client';

import { useState } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import UniversalEditor from '../../../components/ui/UniversalEditor';

export default function EditorPage() {
  const [content, setContent] = useState('Bu basit ve güvenli bir metin editörüdür.\n\nÖzellikler:\n• Güvenli input handling\n• Responsive tasarım\n• Platform bağımsız\n• GitHub/Vercel uyumlu');

  return (
    <AdminLayout 
      title="Universal Editor"
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin/dashboard' },
        { label: 'Universal Editor' }
      ]}
    >
      <div className="space-y-8">
        
        {/* Editör */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            Basit Metin Editörü
          </h2>
          <p className="text-slate-600 mb-6">
            Güvenli, basit ve etkili metin düzenleme
          </p>
          <UniversalEditor
            value={content}
            onChange={setContent}
            placeholder="İçeriğinizi buraya yazın..."
            rows={8}
            mode="rich"
          />
        </div>

        {/* Kullanım */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            Kullanım Örneği
          </h2>
          <div className="p-4 bg-slate-50 rounded-lg">
            <pre className="text-sm text-slate-700">
{`<UniversalEditor
  value={content}
  onChange={setContent}
  placeholder="İçeriğinizi yazın..."
  rows={6}
  disabled={false}
/>`}
            </pre>
          </div>
        </div>

        {/* Önizleme */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            İçerik Önizlemesi
          </h2>
          <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
            <pre className="whitespace-pre-wrap text-slate-700">{content}</pre>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}