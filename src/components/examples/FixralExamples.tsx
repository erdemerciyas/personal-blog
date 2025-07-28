import React, { useState } from 'react';
import { FixralButton, FixralCard, FixralInput, FixralTextarea, FixralSelect } from '../ui';

const FixralExamples: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
        category: ''
    });

    const categoryOptions = [
        { value: '', label: 'Kategori Seçin' },
        { value: 'web', label: 'Web Geliştirme' },
        { value: 'mobile', label: 'Mobil Uygulama' },
        { value: 'design', label: 'Tasarım' },
        { value: 'consulting', label: 'Danışmanlık' }
    ];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="container-main py-16">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-sans font-bold text-fixral-night-blue mb-8 text-center">
                    Fixral Design System Örnekleri
                </h1>

                {/* Button Examples */}
                <FixralCard className="mb-8">
                    <h2 className="text-2xl font-sans font-semibold text-fixral-night-blue mb-6">
                        Butonlar
                    </h2>
                    <div className="flex flex-wrap gap-4">
                        <FixralButton variant="primary">
                            Primary Button
                        </FixralButton>
                        <FixralButton variant="secondary">
                            Secondary Button
                        </FixralButton>
                        <FixralButton variant="outline">
                            Outline Button
                        </FixralButton>
                        <FixralButton variant="ghost">
                            Ghost Button
                        </FixralButton>
                    </div>

                    <div className="mt-6">
                        <h3 className="text-lg font-sans font-medium text-fixral-night-blue mb-4">
                            Farklı Boyutlar
                        </h3>
                        <div className="flex flex-wrap items-center gap-4">
                            <FixralButton size="sm" variant="primary">
                                Küçük
                            </FixralButton>
                            <FixralButton size="md" variant="primary">
                                Orta
                            </FixralButton>
                            <FixralButton size="lg" variant="primary">
                                Büyük
                            </FixralButton>
                        </div>
                    </div>

                    <div className="mt-6">
                        <h3 className="text-lg font-sans font-medium text-fixral-night-blue mb-4">
                            Loading State
                        </h3>
                        <FixralButton variant="primary" loading>
                            Yükleniyor...
                        </FixralButton>
                    </div>
                </FixralCard>

                {/* Card Examples */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <FixralCard variant="default">
                        <h3 className="text-lg font-sans font-semibold text-fixral-night-blue mb-3">
                            Default Card
                        </h3>
                        <p className="text-fixral-charcoal">
                            Bu standart kart tasarımıdır. Temiz ve modern görünüm sunar.
                        </p>
                    </FixralCard>

                    <FixralCard variant="glass">
                        <h3 className="text-lg font-sans font-semibold text-fixral-night-blue mb-3">
                            Glass Card
                        </h3>
                        <p className="text-fixral-charcoal">
                            Cam efektli kart tasarımı. Şeffaflık ve bulanıklık efekti içerir.
                        </p>
                    </FixralCard>

                    <FixralCard variant="elevated">
                        <h3 className="text-lg font-sans font-semibold text-fixral-night-blue mb-3">
                            Elevated Card
                        </h3>
                        <p className="text-fixral-charcoal">
                            Yükseltilmiş kart tasarımı. Daha belirgin gölge efekti vardır.
                        </p>
                    </FixralCard>
                </div>

                {/* Form Examples */}
                <FixralCard>
                    <h2 className="text-2xl font-sans font-semibold text-fixral-night-blue mb-6">
                        Form Elemanları
                    </h2>

                    <div className="grid md:grid-cols-2 gap-6">
                        <FixralInput
                            label="Ad Soyad"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Adınızı ve soyadınızı girin"
                            helperText="Bu alan zorunludur"
                        />

                        <FixralInput
                            label="E-posta"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="ornek@email.com"
                        />
                    </div>

                    <div className="mt-6">
                        <FixralSelect
                            label="Kategori"
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            options={categoryOptions}
                            helperText="Lütfen bir kategori seçin"
                        />
                    </div>

                    <div className="mt-6">
                        <FixralTextarea
                            label="Mesaj"
                            name="message"
                            value={formData.message}
                            onChange={handleInputChange}
                            placeholder="Mesajınızı buraya yazın..."
                            rows={4}
                            helperText="En az 10 karakter olmalıdır"
                        />
                    </div>

                    <div className="mt-8 flex gap-4">
                        <FixralButton variant="primary" type="submit">
                            Gönder
                        </FixralButton>
                        <FixralButton variant="outline" type="button">
                            Temizle
                        </FixralButton>
                    </div>
                </FixralCard>

                {/* Typography Examples */}
                <FixralCard className="mt-8">
                    <h2 className="text-2xl font-sans font-semibold text-fixral-night-blue mb-6">
                        Tipografi
                    </h2>

                    <div className="space-y-4">
                        <h1 className="text-4xl font-sans font-bold text-fixral-night-blue">
                            H1 Başlık - Inter Font
                        </h1>
                        <h2 className="text-3xl font-sans font-semibold text-fixral-night-blue">
                            H2 Başlık - Inter Font
                        </h2>
                        <h3 className="text-2xl font-sans font-medium text-fixral-night-blue">
                            H3 Başlık - Inter Font
                        </h3>
                        <p className="text-base font-sans text-fixral-charcoal leading-relaxed">
                            Bu normal paragraf metnidir. Inter font ailesi kullanılmaktadır.
                            Okunabilirlik ve modern görünüm için optimize edilmiştir.
                        </p>
                        <p className="text-sm font-sans text-fixral-gray-blue">
                            Bu küçük metin örneğidir. Yardımcı bilgiler için kullanılabilir.
                        </p>
                    </div>
                </FixralCard>

                {/* Color Palette */}
                <FixralCard className="mt-8">
                    <h2 className="text-2xl font-sans font-semibold text-fixral-night-blue mb-6">
                        Renk Paleti
                    </h2>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="text-center">
                            <div className="w-full h-20 bg-fixral-night-blue rounded-fixral mb-2"></div>
                            <p className="text-sm font-sans text-fixral-charcoal">Ana Gece Mavisi</p>
                            <p className="text-xs font-sans text-fixral-gray-blue">#0D1B2A</p>
                        </div>

                        <div className="text-center">
                            <div className="w-full h-20 bg-fixral-turquoise rounded-fixral mb-2"></div>
                            <p className="text-sm font-sans text-fixral-charcoal">Canlı Turkuaz</p>
                            <p className="text-xs font-sans text-fixral-gray-blue">#00B4D8</p>
                        </div>

                        <div className="text-center">
                            <div className="w-full h-20 bg-fixral-light-gray border border-gray-200 rounded-fixral mb-2"></div>
                            <p className="text-sm font-sans text-fixral-charcoal">Açık Gri-Beyaz</p>
                            <p className="text-xs font-sans text-fixral-gray-blue">#F8F9FA</p>
                        </div>

                        <div className="text-center">
                            <div className="w-full h-20 bg-fixral-charcoal rounded-fixral mb-2"></div>
                            <p className="text-sm font-sans text-fixral-charcoal">Kömür Grisi</p>
                            <p className="text-xs font-sans text-fixral-gray-blue">#3D3D3D</p>
                        </div>

                        <div className="text-center">
                            <div className="w-full h-20 bg-fixral-gray-blue rounded-fixral mb-2"></div>
                            <p className="text-sm font-sans text-fixral-charcoal">Gri Mavi</p>
                            <p className="text-xs font-sans text-fixral-gray-blue">#3A506B</p>
                        </div>
                    </div>
                </FixralCard>
            </div>
        </div>
    );
};

export default FixralExamples;