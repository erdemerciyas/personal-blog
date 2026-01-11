'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/outline';

interface SliderFormProps {
    initialData?: any;
    isEditing?: boolean;
}

export default function SliderForm({ initialData, isEditing = false }: SliderFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        description: '',
        imageUrl: '',
        buttonText: 'Daha Fazla',
        buttonLink: '',
        order: 0,
        isActive: true, // Boolean as per API
        badge: 'Yenilik',
        duration: 5000,
        imageType: 'url',
        aiProvider: 'unsplash'
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || '',
                subtitle: initialData.subtitle || '',
                description: initialData.description || '',
                imageUrl: initialData.imageUrl || initialData.image || '', // Handle legacy/mismatch
                buttonText: initialData.buttonText || 'Daha Fazla',
                buttonLink: initialData.buttonLink || initialData.link || '',
                order: initialData.order || 0,
                isActive: initialData.isActive !== undefined ? initialData.isActive : (initialData.status === 'active'),
                badge: initialData.badge || 'Yenilik',
                duration: initialData.duration || 5000,
                imageType: initialData.imageType || 'url',
                aiProvider: initialData.aiProvider || 'unsplash'
            });
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        // Handle checkbox/select for boolean
        if (name === 'isActive') {
            const boolValue = (e.target as HTMLSelectElement).value === 'true';
            setFormData(prev => ({ ...prev, [name]: boolValue }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = isEditing
                ? `/api/admin/slider/${initialData._id}`
                : '/api/admin/slider';

            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                router.push('/admin/slider');
                router.refresh();
            } else {
                const data = await response.json();
                alert(data.error || 'Operation failed');
            }
        } catch (error) {
            console.error('Error saving slider:', error);
            alert('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center space-x-4 mb-8">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                    <ArrowLeftIcon className="w-5 h-5 text-slate-500" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        {isEditing ? 'Slider Düzenle' : 'Yeni Slider Ekle'}
                    </h1>
                    <p className="text-slate-500">Slider detaylarını yönet</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 space-y-6">

                    {/* Image Upload / URL Input */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Görsel URL (Zorunlu)</label>
                        <div className="flex gap-4">
                            <input
                                type="text"
                                name="imageUrl"
                                value={formData.imageUrl}
                                onChange={handleChange}
                                className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="https://example.com/image.jpg"
                                required
                            />
                        </div>
                        {formData.imageUrl && (
                            <div className="mt-4 relative aspect-video w-full max-w-md rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                                <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Başlık (Zorunlu)</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Alt Başlık (Subtitle) (Zorunlu)</label>
                            <input
                                type="text"
                                name="subtitle"
                                value={formData.subtitle}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Açıklama (Zorunlu)</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Buton Metni</label>
                            <input
                                type="text"
                                name="buttonText"
                                value={formData.buttonText}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Buton Link (Opsiyonel)</label>
                            <input
                                type="text"
                                name="buttonLink"
                                value={formData.buttonLink}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="/contact"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Badge (Etiket)</label>
                            <input
                                type="text"
                                name="badge"
                                value={formData.badge}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Süre (ms)</label>
                            <input
                                type="number"
                                name="duration"
                                value={formData.duration}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Sıra (Order)</label>
                            <input
                                type="number"
                                name="order"
                                value={formData.order}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Durum</label>
                            <select
                                name="isActive"
                                value={formData.isActive ? 'true' : 'false'}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                <option value="true">Aktif</option>
                                <option value="false">Pasif</option>
                            </select>
                        </div>
                    </div>

                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center space-x-2 bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <CheckIcon className="w-5 h-5" />
                        )}
                        <span>{isEditing ? 'Güncelle' : 'Oluştur'}</span>
                    </button>
                </div>

            </form>
        </div>
    );
}
