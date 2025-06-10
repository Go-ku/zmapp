import Property from '@/lib/models/Property';
import connectDB from '@/lib/db/connection';
import { NextResponse } from 'next/server';

export async function GET(req, res) {
  await connectDB();
  
  try {
    const stats = await Property.getSystemStats({
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
    });
   

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching landlord stats:', error);
     return NextResponse.json({ error: 'Failed to fetch stats' }, {status: 500});
  }
}