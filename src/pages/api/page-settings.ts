import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../lib/mongoose';
import PageSetting from '../../models/PageSetting';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();
    const pages = await PageSetting.find().sort({ order: 1 }).lean();
    
    res.status(200).json(pages || []);
  } catch (error) {
    console.error('Page settings API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}