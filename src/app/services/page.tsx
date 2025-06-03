'use client';
import { useState, useEffect } from 'react';
import Hero from '../../components/Hero';
import ServiceCard from '../../components/ServiceCard';
import PageAccessControl from '../../components/PageAccessControl';

interface Service {
  _id: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
  price: {
    type: 'fixed' | 'hourly' | 'project';
    amount?: number;
    currency: string;
    note?: string;
  };
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services');
      if (response.ok) {
        const data = await response.json();
        setServices(data.filter((service: Service) => service.isActive));
      } else {
        setError('Hizmetler yüklenirken bir hata oluştu.');
      }
    } catch (error) {
      setError('Hizmetler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageAccessControl pageName="services">
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <Hero 
          title="Hizmetlerim"
          subtitle="Profesyonel web çözümleri ve yazılım geliştirme hizmetleri"
        />

        <main className="container mx-auto px-4 py-16">
          {loading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-400"></div>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center">
                <p className="text-red-300 text-lg">{error}</p>
              </div>
            </div>
          ) : services.length === 0 ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                <p className="text-white text-lg">Henüz hizmet eklenmemiş.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service) => (
                <ServiceCard key={service._id} service={service} />
              ))}
            </div>
          )}
        </main>
      </div>
    </PageAccessControl>
  );
} 