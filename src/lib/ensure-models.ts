import mongoose from 'mongoose';

/**
 * Ensures required Mongoose models are registered.
 * Uses dynamic imports which CANNOT be tree-shaken by bundlers.
 * Call this before any .populate() operation.
 */
export async function ensureModels(...modelNames: string[]) {
    for (const name of modelNames) {
        if (!mongoose.models[name]) {
            try {
                switch (name) {
                    case 'Portfolio':
                        await import('@/models/Portfolio');
                        break;
                    case 'News':
                        await import('@/models/News');
                        break;
                    case 'User':
                        await import('@/models/User');
                        break;
                    case 'Category':
                        await import('@/models/Category');
                        break;
                    default:
                        console.warn(`[ensureModels] Unknown model: ${name}`);
                }
            } catch (err) {
                console.error(`[ensureModels] Failed to load model ${name}:`, err);
            }
        }
    }
}
