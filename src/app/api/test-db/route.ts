import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import mongoose from 'mongoose';

export async function GET() {
    try {
        await connectDB();
        const collections = await mongoose.connection.db.listCollections().toArray();
        const collectionNames = collections.map(c => c.name);

        // Also try to fetch one document from probable collections
        const debugData: any = {};

        for (const name of collectionNames) {
            if (name.includes('model') || name.includes('file') || name.includes('3d') || name.includes('upload')) {
                const data = await mongoose.connection.db.collection(name).findOne({});
                debugData[name] = data;
            }
        }

        return NextResponse.json({
            collections: collectionNames,
            samples: debugData
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
