'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import FixralInput from '@/components/ui/FixralInput';
import FixralTextarea from '@/components/ui/FixralTextarea';
import FixralSelect from '@/components/ui/FixralSelect';
import { AdminLayoutNew } from '@/components/admin/layout';
import { FixralButton, TagInput, FixralCard } from '@/components/ui';
import { PhotoIcon, CloudArrowUpIcon, StarIcon as StarOutline, TrashIcon, PaperClipIcon, TagIcon } from '@heroicons/react/24/outline';

type EditProduct = {
  _id: string;
  title: string;
  description: string;
  condition?: 'new'|'used';
  price?: number;
  currency?: string;
  stock?: number;
  coverImage?: string;
  images?: string[];
  attachments?: Array<{ url: string; type: string; name?: string; size?: number }>;
  categoryIds?: string[];
  colors?: string[];
  sizes?: string[];
  attributes?: Array<{ key: string; value: string }>;  
};

export default function AdminProductEditPage() {
  const params = useParams() as { id: string };
  const [form, setForm] = useState<EditProduct | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Array<{ _id: string; name: string }>>([]);
  const [attrKey, setAttrKey] = useState('');
  const [attrVal, setAttrVal] = useState('');
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const attachInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetch(`/api/admin/products/${params.id}`)
      .then((r) => r.json())
      .then(setForm);
  }, [params.id]);

  useEffect(() => {
    fetch('/api/admin/product-categories')
      .then(r=>r.json())
      .then(d=> setCategories((d.items as Array<{_id:string; name:string}>)||[]))
      .catch(()=> setCategories([]));
  }, []);

  async function uploadFile(file: File): Promise<{ url: string; resourceType: string; bytes: number; format: string }> {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('context', 'products');
    const res = await fetch('/api/admin/product-upload', { method: 'POST', body: fd });
    if (!res.ok) throw new Error('Yükleme başarısız');
    return res.json();
  }

  async function save() {
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/admin/products/${params.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setSaving(false);
    if (res.ok) alert('Güncellendi'); else setError('Hata');
  }

  if (!form) return null;
  return (
    <AdminLayoutNew
      title="Ürün Düzenle"
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin/dashboard' },
        { label: 'Ürün Yönetimi', href: '/admin/products' },
        { label: 'Ürün Düzenle' }
      ]}
    >
    <div className="space-y-6">
      {error && <div className="p-3 bg-red-50 text-red-700 rounded">{error}</div>}

      {/* Temel Bilgiler */}
      <FixralCard>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-slate-700">
            <TagIcon className="w-5 h-5 text-emerald-600" />
            <div className="font-semibold">Temel Bilgiler</div>
          </div>
          <FixralInput label="Başlık" value={form.title} onChange={(e) => setForm({ ...form, title: (e.target as HTMLInputElement).value })} />
          <FixralTextarea label="Açıklama" value={form.description} onChange={(e) => setForm({ ...form, description: (e.target as HTMLTextAreaElement).value })} />
          <div className="grid sm:grid-cols-3 gap-3">
            <FixralSelect label="Durum" value={form.condition || 'new'} onChange={(e)=> setForm({ ...form, condition: (e.target as HTMLSelectElement).value as 'new'|'used' })} options={[{ value: 'new', label: 'Sıfır' }, { value: 'used', label: 'İkinci El' }]} />
            <FixralInput label="Fiyat" type="number" value={form.price ?? ''} onChange={(e) => setForm({ ...form, price: (e.target as HTMLInputElement).value ? Number((e.target as HTMLInputElement).value) : undefined })} />
            <div className="grid grid-cols-2 gap-3">
              <FixralInput label="Para Birimi" value={form.currency || 'TRY'} onChange={(e) => setForm({ ...form, currency: (e.target as HTMLInputElement).value })} />
              <FixralInput label="Stok" type="number" value={form.stock ?? 0} onChange={(e) => setForm({ ...form, stock: Number((e.target as HTMLInputElement).value) })} />
            </div>
          </div>
        </div>
      </FixralCard>

      {/* Görseller */}
      <FixralCard>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-slate-700">
            <PhotoIcon className="w-5 h-5 text-emerald-600" />
            <div className="font-semibold">Ürün Görselleri</div>
            <span className="text-xs text-slate-500">Kapak görselini işaretleyin</span>
          </div>
          <div
            className="rounded-lg border-2 border-dashed border-emerald-300 bg-emerald-50/40 p-5 text-sm text-emerald-700 flex flex-col items-center justify-center gap-2 cursor-pointer"
            onDragOver={(e)=> e.preventDefault()}
            onDrop={async (e)=>{
              e.preventDefault();
              const files = Array.from(e.dataTransfer.files || []).filter(f=>f.type.startsWith('image/'));
              const uploaded: string[] = [];
              for (const f of files) {
                const up = await uploadFile(f);
                uploaded.push(up.url);
              }
              setForm((prev) => prev ? ({ ...prev, images: [ ...(prev.images||[]), ...uploaded ], coverImage: prev.coverImage || uploaded[0] }) : prev);
            }}
          onClick={() => imageInputRef.current?.click()}
          >
            <CloudArrowUpIcon className="w-6 h-6" />
            <div><span className="font-medium">Görsel yüklemek için tıklayın veya sürükleyip bırakın</span></div>
            <input ref={imageInputRef} type="file" accept="image/*" multiple className="hidden" onChange={async (e) => {
              const files = Array.from(e.target.files || []);
              const uploaded: string[] = [];
              for (const f of files) {
                const up = await uploadFile(f);
                uploaded.push(up.url);
              }
              setForm((prev) => prev ? ({ ...prev, images: [ ...(prev.images||[]), ...uploaded ], coverImage: prev.coverImage || uploaded[0] }) : prev);
            }} />
          </div>

          {Array.isArray(form.images) && form.images.length>0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {form.images.map((u, idx) => (
                <div key={u} className="relative group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={u} alt="img" className="w-full h-28 object-cover rounded-md border" />
                  <button
                    className={`absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs ${form.coverImage===u?'bg-emerald-600 text-white':'bg-white/90 text-slate-700 border'}`}
                    title="Kapağa ayarla"
                    onClick={() => setForm((p) => ({ ...p!, coverImage: u }))}
                  >
                    <StarOutline className="w-4 h-4" /> Kapak
                  </button>
                  <button
                    className="absolute top-2 right-2 inline-flex items-center justify-center w-7 h-7 rounded-md bg-red-600 text-white opacity-90 hover:opacity-100"
                    title="Kaldır"
                    onClick={() => setForm((p) => p ? ({ ...p, images: (p.images||[]).filter((_, i) => i !== idx), coverImage: p.coverImage===u ? ((p.images||[]).filter((_, i) => i !== idx)[0]||'') : p.coverImage }) : p)}
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </FixralCard>

      {/* Ek Dosyalar */}
      <FixralCard>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-slate-700">
            <PaperClipIcon className="w-5 h-5 text-emerald-600" />
            <div className="font-semibold">Ek Dosyalar</div>
          </div>
          <div
            className="rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-700 flex flex-col items-center justify-center gap-2"
            onDragOver={(e)=> e.preventDefault()}
            onDrop={async (e)=>{
              e.preventDefault();
              const files = Array.from(e.dataTransfer.files || []);
              const uploaded: Array<{ url: string; type: string; name?: string; size?: number }> = [];
              for (const f of files) {
                const up = await uploadFile(f);
                uploaded.push({ url: up.url, type: up.resourceType === 'image' ? 'image' : (up.format === 'pdf' ? 'pdf' : 'raw'), name: f.name, size: f.size });
              }
              setForm((prev) => prev ? ({ ...prev, attachments: [ ...(prev.attachments||[]), ...uploaded ] }) : prev);
            }}
          onClick={() => attachInputRef.current?.click()}
          >
            <div className="flex items-center gap-2"><CloudArrowUpIcon className="w-5 h-5" /> Dosya yüklemek için bırakın</div>
            <input ref={attachInputRef} type="file" className="hidden" multiple onChange={async (e) => {
              const files = Array.from(e.target.files || []);
              const uploaded: Array<{ url: string; type: string; name?: string; size?: number }> = [];
              for (const f of files) {
                const up = await uploadFile(f);
                uploaded.push({ url: up.url, type: up.resourceType === 'image' ? 'image' : (up.format === 'pdf' ? 'pdf' : 'raw'), name: f.name, size: f.size });
              }
              setForm((prev) => prev ? ({ ...prev, attachments: [ ...(prev.attachments||[]), ...uploaded ] }) : prev);
            }} />
          </div>
          <div className="flex items-center gap-2">
            <FixralInput placeholder="Dosya URL ekle" onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const url = (e.target as HTMLInputElement).value.trim();
                if (!url) return;
                setForm((prev) => prev ? ({ ...prev, attachments: [ ...(prev.attachments||[]), { url, type: 'raw' } ] }) : prev);
                (e.target as HTMLInputElement).value='';
              }
            }} />
            <span className="text-xs text-slate-500">Enter ile ekle</span>
          </div>
          {Array.isArray(form.attachments) && form.attachments.length>0 && (
            <ul className="space-y-2 text-sm">
              {form.attachments.map((a, i) => (
                <li key={`${a.url}-${i}`} className="flex items-center justify-between gap-3 rounded-md border bg-white px-3 py-2">
                  <a href={a.url} target="_blank" rel="noreferrer" className="text-emerald-700 hover:underline truncate">{a.name || a.url}</a>
                  <button className="inline-flex items-center gap-1 text-red-600 hover:text-red-700" onClick={() => setForm((p) => p ? ({ ...p, attachments: (p.attachments||[]).filter((_, idx) => idx !== i) }) : p)}>
                    <TrashIcon className="w-4 h-4" /> Kaldır
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </FixralCard>

      {/* Kategoriler */}
      <FixralCard>
        <div className="space-y-2">
          <div className="font-semibold text-slate-700">Kategoriler</div>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => {
              const checked = (form.categoryIds||[]).includes(c._id);
              return (
                <label key={c._id} className={`px-3 py-1 rounded-full border text-sm cursor-pointer ${checked ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-white border-slate-300 text-slate-700'}`}>
                  <input type="checkbox" className="hidden" checked={checked} onChange={(e) => {
                    setForm((prev) => prev ? ({ ...prev, categoryIds: e.target.checked ? [ ...(prev.categoryIds||[]), c._id ] : (prev.categoryIds||[]).filter((id) => id !== c._id) }) : prev);
                  }} />
                  {c.name}
                </label>
              );
            })}
          </div>
        </div>
      </FixralCard>

      {/* Renk ve Ölçüler */}
      <FixralCard>
        <div className="grid sm:grid-cols-2 gap-3">
          <TagInput label="Renkler" values={form.colors || []} onChange={(vals)=>setForm((p)=> p ? ({ ...p, colors: vals }) : p)} />
          <TagInput label="Ölçüler" values={form.sizes || []} onChange={(vals)=>setForm((p)=> p ? ({ ...p, sizes: vals }) : p)} />
        </div>
      </FixralCard>

      {/* Özellikler */}
      <FixralCard>
        <div className="space-y-3">
          <div className="font-semibold text-slate-700">Teknik Özellikler</div>
          {Array.isArray(form.attributes) && form.attributes.length>0 && (
            <div className="flex flex-wrap gap-2">
              {form.attributes.map((a, i)=> (
                <span key={`${a.key}-${i}`} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs">
                  {a.key}: {a.value}
                  <button className="text-slate-500" onClick={()=> setForm((p)=> p ? ({ ...p, attributes: (p.attributes||[]).filter((_,idx)=> idx!==i) }) : p)}>×</button>
                </span>
              ))}
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            <FixralInput placeholder="Özellik adı (ör: Ağırlık)" value={attrKey} onChange={(e)=> setAttrKey((e.target as HTMLInputElement).value)} onKeyDown={(e)=>{
              if(e.key==='Enter'){
                e.preventDefault();
                if(!attrKey.trim()||!attrVal.trim()) return;
                setForm((p)=> p ? ({ ...p, attributes: [ ...(p.attributes||[]), { key: attrKey.trim(), value: attrVal.trim() } ] }) : p);
                setAttrKey(''); setAttrVal('');
              }
            }} />
            <FixralInput placeholder="Değer (ör: 2kg)" value={attrVal} onChange={(e)=> setAttrVal((e.target as HTMLInputElement).value)} onKeyDown={(e)=>{
              if(e.key==='Enter'){
                e.preventDefault();
                if(!attrKey.trim()||!attrVal.trim()) return;
                setForm((p)=> p ? ({ ...p, attributes: [ ...(p.attributes||[]), { key: attrKey.trim(), value: attrVal.trim() } ] }) : p);
                setAttrKey(''); setAttrVal('');
              }
            }} />
          </div>
        </div>
      </FixralCard>

      {/* Save Bar */}
      <div className="sticky bottom-0 z-10 bg-white/90 backdrop-blur border-t p-3 flex justify-end">
        <FixralButton onClick={save} disabled={saving} loading={saving}>{saving ? 'Kaydediliyor...' : 'Kaydet'}</FixralButton>
      </div>
    </div>
    </AdminLayoutNew>
  );
}


