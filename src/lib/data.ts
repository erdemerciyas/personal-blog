import connectDB from './mongoose';
import Slider from '../models/Slider';
import Portfolio from '../models/Portfolio';
import Service from '../models/Service';
import { cache } from 'react';

// Cache the data fetching for the duration of the request
export const getSliderItems = cache(async () => {
    try {
        await connectDB();
        const sliders = await Slider.find({ isActive: true })
            .sort({ order: 1 })
            .lean();

        return sliders.map((slider: any) => ({
            _id: slider._id.toString(),
            title: slider.title,
            subtitle: slider.subtitle,
            description: slider.description,
            image: slider.imageUrl || slider.backgroundImage || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
            buttonText: slider.buttonText || 'Keşfet',
            buttonLink: slider.buttonLink || '/portfolio',
            badge: slider.badge,
            duration: slider.duration || 5000,
            createdAt: slider.createdAt ? new Date(slider.createdAt).toISOString() : null,
            updatedAt: slider.updatedAt ? new Date(slider.updatedAt).toISOString() : null,
        }));
    } catch (error) {
        console.error('Error fetching slider items:', error);
        return [];
    }
});

export const getPortfolioItems = cache(async (limit = 6) => {
    try {
        await connectDB();
        const items = await Portfolio.find({ isActive: true })
            .sort({ completionDate: -1 })
            .limit(limit)
            .populate('categoryIds', 'name slug')
            .lean();

        return items.map((item: any) => ({
            ...item,
            _id: item._id.toString(),
            categories: Array.isArray(item.categoryIds)
                ? item.categoryIds.map((cat: any) => ({
                    ...cat,
                    _id: cat._id ? cat._id.toString() : '',
                }))
                : [],
            completionDate: item.completionDate ? new Date(item.completionDate).toISOString() : null,
            createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : null,
            updatedAt: item.updatedAt ? new Date(item.updatedAt).toISOString() : null,
        }));
    } catch (error) {
        console.error('Error fetching portfolio items:', error);
        return [];
    }
});

export const getServices = cache(async (limit = 6) => {
    try {
        await connectDB();
        const services = await Service.find({ isActive: true })
            .sort({ order: 1 })
            .limit(limit)
            .lean();

        return services.map((service: any) => ({
            ...service,
            _id: service._id.toString(),
            createdAt: service.createdAt ? new Date(service.createdAt).toISOString() : null,
            updatedAt: service.updatedAt ? new Date(service.updatedAt).toISOString() : null,
        }));
    } catch (error) {
        console.error('Error fetching services:', error);
        return [];
    }
});
