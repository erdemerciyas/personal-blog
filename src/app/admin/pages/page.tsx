 "use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AdminLayout from "../../../components/admin/AdminLayout";
import { PageLoader } from "../../../components/AdminLoader";
import UniversalEditor from "../../../components/ui/UniversalEditor";
import {
  DocumentTextIcon,
  EyeIcon,
  EyeSlashIcon,
  Cog6ToothIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";

type PageSetting = {
  _id: string;
  pageId: string;
  title: string;
  path: string;
  description: string;
  buttonText?: string;
  buttonLink?: string;
  icon?: string;
  isExternal?: boolean;
  isActive: boolean;
  showInNavigation: boolean;
  order: number;
};

export default function AdminPages() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [pages, setPages] = useState<PageSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editingPage, setEditingPage] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    title: string;
    description: string;
    buttonText: string;
    buttonLink: string;
    icon?: string;
    isExternal?: boolean;
    isActive?: boolean;
    showInNavigation?: boolean;
  }>({
    title: "",
    description: "",
    buttonText: "",
    buttonLink: "",
    icon: "",
    isExternal: false,
    isActive: true,
    showInNavigation: true,
  });

  const [newPage, setNewPage] = useState<{
    pageId: string;
    title: string;
    path: string;
    icon?: string;
    isExternal?: boolean;
    isActive: boolean;
    showInNavigation: boolean;
  }>({
    pageId: "",
    title: "",
    path: "",
    icon: "",
    isExternal: false,
    isActive: true,
    showInNavigation: true,
  });

  useEffect(() => {
    if (status === "loading") return;
    const role = (session?.user as { role?: string } | undefined)?.role;
    if (!session?.user || role !== "admin") {
      router.replace("/admin/login");
      return;
    }
    const fetchPages = async () => {
      try {
        const res = await fetch("/api/admin/page-settings", { cache: "no-store" });
        const data = await res.json();
        setPages(Array.isArray(data) ? data : []);
      } catch {
        setError("Sayfalar yüklenirken bir hata oluştu");
        setTimeout(() => setError(""), 3000);
      } finally {
        setLoading(false);
      }
    };
    fetchPages();
  }, [status, session, router]);

  const updatePage = async (pageId: string, updates: Partial<PageSetting>) => {
    try {
      setSaving(true);
      const res = await fetch("/api/admin/page-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId, ...updates }),
      });
      if (!res.ok) throw new Error("Güncelleme başarısız");
      const updated: PageSetting = await res.json();
      setPages(prev => prev.map(p => (p.pageId === pageId ? { ...p, ...updated } : p)));
      setSuccess("Güncellendi");
      setTimeout(() => setSuccess(""), 1500);
      await fetch("/api/admin/clear-cache", { method: "POST" }).catch(() => {});
      window.dispatchEvent(new CustomEvent("pageSettingsChanged"));
    } catch {
      setError("Güncelleme sırasında hata oluştu");
      setTimeout(() => setError(""), 3000);
    } finally {
      setSaving(false);
    }
  };

  const reorderPages = async (pageId: string, dir: "up" | "down") => {
    const idx = pages.findIndex(p => p.pageId === pageId);
    if (idx < 0) return;
    const swapWith = dir === "up" ? idx - 1 : idx + 1;
    if (swapWith < 0 || swapWith >= pages.length) return;
    const newArr = [...pages];
    [newArr[idx], newArr[swapWith]] = [newArr[swapWith], newArr[idx]];
    const reOrdered = newArr.map((p, i) => ({ ...p, order: i }));
    setPages(reOrdered);
    try {
      setSaving(true);
      const res = await fetch("/api/admin/page-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orders: reOrdered.map(p => ({ pageId: p.pageId, order: p.order })) }),
      });
      if (!res.ok) throw new Error("Sıralama başarısız");
      await fetch("/api/admin/clear-cache", { method: "POST" }).catch(() => {});
      window.dispatchEvent(new CustomEvent("pageSettingsChanged"));
    } catch {
      setError("Sıralama kaydedilemedi");
      setTimeout(() => setError(""), 3000);
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (page: PageSetting) => {
    setEditingPage(page.pageId);
    setEditForm({
      title: page.title,
      description: page.description,
      buttonText: page.buttonText || "",
      buttonLink: page.buttonLink || "",
      icon: page.icon || "",
      isExternal: page.isExternal ?? false,
      isActive: page.isActive,
      showInNavigation: page.showInNavigation,
    });
  };

  const saveEditing = async () => {
    if (!editingPage) return;
    await updatePage(editingPage, {
      title: editForm.title,
      description: editForm.description,
      buttonText: editForm.buttonText,
      buttonLink: editForm.buttonLink,
      icon: editForm.icon || undefined,
      isExternal: !!editForm.isExternal,
      isActive: editForm.isActive ?? true,
      showInNavigation: editForm.showInNavigation ?? true,
    });
    setEditingPage(null);
  };

  const cancelEditing = () => {
    setEditingPage(null);
    setEditForm({
      title: "",
      description: "",
      buttonText: "",
      buttonLink: "",
      icon: "",
      isExternal: false,
      isActive: true,
      showInNavigation: true,
    });
  };

  const addNewPage = async () => {
    try {
      setSaving(true);
      if (!newPage.pageId || !newPage.title || !newPage.path) {
        setError("Yeni sayfa için Page ID, Başlık ve Path zorunludur");
        setTimeout(() => setError(""), 2500);
        return;
      }
      const order = pages.length;
      const res = await fetch("/api/admin/page-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageId: newPage.pageId,
          title: newPage.title,
          path: newPage.path,
          icon: newPage.icon || undefined,
          isExternal: !!newPage.isExternal,
          isActive: newPage.isActive,
          showInNavigation: newPage.showInNavigation,
          order,
          description: "",
        }),
      });
      if (!res.ok) throw new Error("Yeni sayfa eklenemedi");
      const created: PageSetting = await res.json();
      setPages(prev => [...prev, created].sort((a, b) => a.order - b.order));
      setNewPage({ pageId: "", title: "", path: "", icon: "", isExternal: false, isActive: true, showInNavigation: true });
      setSuccess("Yeni sayfa eklendi");
      setTimeout(() => setSuccess(""), 1500);
      await fetch("/api/admin/clear-cache", { method: "POST" }).catch(() => {});
      window.dispatchEvent(new CustomEvent("pageSettingsChanged"));
    } catch {
      setError("Yeni sayfa eklenirken bir hata oluştu");
      setTimeout(() => setError(""), 3000);
    } finally {
      setSaving(false);
    }
  };

  const deletePage = async (pageId: string) => {
    if (!confirm("Bu sayfa silinecek. Devam edilsin mi?")) return;
    try {
      setSaving(true);
      const res = await fetch("/api/admin/page-settings", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId }),
      });
      if (!res.ok) throw new Error("Silme başarısız");
      setPages(prev => prev.filter(p => p.pageId !== pageId).map((p, i) => ({ ...p, order: i })));
      setSuccess("Sayfa silindi");
      setTimeout(() => setSuccess(""), 1500);
      await fetch("/api/admin/clear-cache", { method: "POST" }).catch(() => {});
      window.dispatchEvent(new CustomEvent("pageSettingsChanged"));
    } catch {
      setError("Sayfa silinirken bir hata oluştu");
      setTimeout(() => setError(""), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="p-6">
        <PageLoader />
      </div>
    );
  }

  return (
    <AdminLayout title="Sayfa Ayarları">
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                <Cog6ToothIcon className="w-5 h-5" />
                Sayfa Ayarları
              </h2>
              <p className="text-slate-600">Sitenizin sayfalarını aktif/pasif yapın ve menüde gösterilecek sayfaları belirleyin</p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-slate-500">
              <span>Toplam {pages.length} sayfa</span>
            </div>
          </div>
        </div>

        {/* Yeni Sayfa Ekle */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">Yeni Link / Sayfa Ekle</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Page ID</label>
              <input type="text" value={newPage.pageId} onChange={(e) => setNewPage(p => ({ ...p, pageId: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary-600 focus:border-transparent" placeholder="örn: blog veya github" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Başlık</label>
              <input type="text" value={newPage.title} onChange={(e) => setNewPage(p => ({ ...p, title: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary-600 focus:border-transparent" placeholder="Menüde görünecek başlık" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Path / URL</label>
              <input type="text" value={newPage.path} onChange={(e) => setNewPage(p => ({ ...p, path: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary-600 focus:border-transparent" placeholder="örn: /blog veya https://github.com/kullanici" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Icon (opsiyonel)</label>
              <input type="text" value={newPage.icon} onChange={(e) => setNewPage(p => ({ ...p, icon: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary-600 focus:border-transparent" placeholder="örn: HomeIcon, UserIcon" />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">Dış Bağlantı</span>
                <button onClick={() => setNewPage(p => ({ ...p, isExternal: !p.isExternal }))} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${newPage.isExternal ? 'bg-brand-primary-700' : 'bg-slate-200'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${newPage.isExternal ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">Menüde Göster</span>
                <button onClick={() => setNewPage(p => ({ ...p, showInNavigation: !p.showInNavigation }))} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${newPage.showInNavigation ? 'bg-brand-primary-700' : 'bg-slate-200'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${newPage.showInNavigation ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">Aktif</span>
                <button onClick={() => setNewPage(p => ({ ...p, isActive: !p.isActive }))} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${newPage.isActive ? 'bg-brand-primary-700' : 'bg-slate-200'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${newPage.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          </div>
          <div className="px-6 pb-6">
            <button onClick={addNewPage} disabled={saving} className="px-4 py-2 bg-brand-primary-700 text-white rounded-lg hover:bg-brand-primary-800 disabled:opacity-50 transition-colors">Ekle</button>
          </div>
        </div>

        {/* Bildirimler */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-center space-x-3">
            <ExclamationTriangleIcon className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="bg-brand-primary-50 border border-brand-primary-200 text-brand-primary-900 p-4 rounded-xl flex items-center space-x-3">
            <CheckIcon className="w-5 h-5" />
            <span>{success}</span>
          </div>
        )}

        {/* Sayfa Listesi */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center space-x-2">
              <DocumentTextIcon className="w-5 h-5 text-brand-primary-700" />
              <span>Sayfa Listesi</span>
            </h3>
          </div>
          <div className="divide-y divide-slate-200">
            {pages.map((page) => (
              <div key={page._id} className="p-6 hover:bg-slate-50 transition-colors">
                {editingPage === page.pageId ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${page.isActive ? 'bg-brand-primary-100 text-brand-primary-700' : 'bg-slate-100 text-slate-400'}`}>
                          {page.icon && <span className={`text-lg ${page.icon}`}></span>}
                          {!page.icon && page.pageId === 'home' && <HomeIcon className="w-5 h-5" />}
                          {!page.icon && page.pageId !== 'home' && <DocumentTextIcon className="w-5 h-5" />}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded">{page.path}</span>
                          <span className="text-sm text-slate-500">- Hero Alanı Düzenleme</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Hero Başlığı</label>
                        <input type="text" value={editForm.title} onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary-600 focus:border-transparent" placeholder="Sayfa hero başlığı" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Hero Açıklaması</label>
                        <UniversalEditor value={editForm.description} onChange={(value) => setEditForm(prev => ({ ...prev, description: value }))} placeholder="Sayfa hero açıklaması..." minHeight="150px" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Buton Metni</label>
                        <input type="text" value={editForm.buttonText} onChange={(e) => setEditForm(prev => ({ ...prev, buttonText: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary-600 focus:border-transparent" placeholder="Buton metni (örn: Projeleri İncele)" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Buton Linki</label>
                        <input type="text" value={editForm.buttonLink} onChange={(e) => setEditForm(prev => ({ ...prev, buttonLink: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary-600 focus:border-transparent" placeholder="Buton linki (örn: #projects veya /contact)" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Icon</label>
                        <input type="text" value={editForm.icon} onChange={(e) => setEditForm(prev => ({ ...prev, icon: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary-600 focus:border-transparent" placeholder="Icon adı" />
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-600">Dış Bağlantı</span>
                          <button onClick={() => setEditForm(prev => ({ ...prev, isExternal: !prev.isExternal }))} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${editForm.isExternal ? 'bg-brand-primary-700' : 'bg-slate-200'}`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${editForm.isExternal ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-600">Menüde Göster</span>
                          <button onClick={() => setEditForm(prev => ({ ...prev, showInNavigation: !prev.showInNavigation }))} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${editForm.showInNavigation ? 'bg-brand-primary-700' : 'bg-slate-200'}`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${editForm.showInNavigation ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <button onClick={saveEditing} disabled={saving} className="px-4 py-2 bg-brand-primary-700 text-white rounded-lg hover:bg-brand-primary-800 disabled:opacity-50 transition-colors flex items-center space-x-2">
                        <CheckIcon className="w-4 h-4" />
                        <span>Kaydet</span>
                      </button>
                      <button onClick={cancelEditing} disabled={saving} className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 disabled:opacity-50 transition-colors flex items-center space-x-2">
                        <XMarkIcon className="w-4 h-4" />
                        <span>İptal</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${page.isActive ? 'bg-brand-primary-100 text-brand-primary-700' : 'bg-slate-100 text-slate-400'}`}>
                            {page.icon && <span className={`text-lg ${page.icon}`}></span>}
                            {!page.icon && page.pageId === 'home' && <HomeIcon className="w-5 h-5" />}
                            {!page.icon && page.pageId !== 'home' && <DocumentTextIcon className="w-5 h-5" />}
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="text-lg font-semibold text-slate-900">{page.title}</h4>
                            <span className="text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded">{page.path}</span>
                            <button onClick={() => startEditing(page)} className="p-1 text-slate-400 hover:text-brand-primary-700 transition-colors" title="Hero alanını düzenle">
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button onClick={() => deletePage(page.pageId)} className="p-1 text-slate-400 hover:text-red-600 transition-colors" title="Sayfayı sil">
                              <XMarkIcon className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-sm text-slate-600 mt-1">{page.description}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-slate-600">Aktif</span>
                        <button onClick={() => updatePage(page.pageId, { isActive: !page.isActive })} disabled={saving} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${page.isActive ? 'bg-brand-primary-700' : 'bg-slate-200'}`}>
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${page.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-slate-600">Menüde</span>
                        <button onClick={() => updatePage(page.pageId, { showInNavigation: !page.showInNavigation })} disabled={saving} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${page.showInNavigation ? 'bg-brand-primary-700' : 'bg-slate-200'}`}>
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${page.showInNavigation ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button onClick={() => reorderPages(page.pageId, 'up')} disabled={saving || page.order === 0} className="p-2 text-slate-400 hover:text-slate-600 disabled:opacity-50 transition-colors">
                          <ArrowUpIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => reorderPages(page.pageId, 'down')} disabled={saving || page.order === pages.length - 1} className="p-2 text-slate-400 hover:text-slate-600 disabled:opacity-50 transition-colors">
                          <ArrowDownIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Durum Açıklamaları */}
        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
          <h4 className="text-sm font-semibold text-slate-900 mb-3">Durum Açıklamaları</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="w-4 h-4 text-brand-primary-700" />
              <span className="text-slate-700">Aktif: Sayfa erişilebilir</span>
            </div>
            <div className="flex items-center space-x-2">
              <XCircleIcon className="w-4 h-4 text-slate-400" />
              <span className="text-slate-700">Pasif: Sayfa 404 döndürür</span>
            </div>
            <div className="flex items-center space-x-2">
              <EyeIcon className="w-4 h-4 text-brand-primary-700" />
              <span className="text-slate-700">Menüde: Navigasyon menüsünde gösterilir</span>
            </div>
            <div className="flex items-center space-x-2">
              <EyeSlashIcon className="w-4 h-4 text-slate-400" />
              <span className="text-slate-700">Menüde değil: Navigasyon menüsünde gizli</span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
 