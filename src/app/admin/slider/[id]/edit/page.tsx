'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SliderForm from '../../SliderForm';

export default function EditSliderPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [slider, setSlider] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSlider = async () => {
            try {
                const response = await fetch(`/api/admin/slider/${params.id}`);
                if (response.ok) {
                    const data = await response.json();
                    setSlider(data);
                } else {
                    alert('Slider not found');
                    router.push('/admin/slider');
                }
            } catch (error) {
                console.error('Error fetching slider:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSlider();
    }, [params.id, router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (!slider) return null;

    return <SliderForm initialData={slider} isEditing={true} />;
}
