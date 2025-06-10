import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connection';
import Property from '@/lib/models/Property';
import mongoose from 'mongoose';
export async function GET(request) {
  try {
    await connectDB();

    const landlordId = request.nextUrl.searchParams.get('landlordId');

    if (!landlordId) {
      return NextResponse.json({ error: 'landlordId is required' }, { status: 400 });
    }
    // Default to last 30 days if no date filter provided
    const dateFilter = {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    };

    const stats = await Property.getLandlordStats(
      new mongoose.Types.ObjectId(landlordId),
      dateFilter
    );
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching landlord stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}