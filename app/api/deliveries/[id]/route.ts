import { NextResponse } from 'next/server';
import { getDeliveryById } from '@/lib/database/delivery-queries';

export async function GET(request: Request) {
  try {
    const { pathname } = new URL(request.url);
    const segments = pathname.split('/');
    const id = segments[segments.length - 1];

    if (!id) {
      return NextResponse.json({ error: 'Delivery ID is required' }, { status: 400 });
    }

    const delivery = await getDeliveryById(id);
    if (!delivery) {
      return NextResponse.json({ error: 'Delivery not found' }, { status: 404 });
    }

    return NextResponse.json(delivery);
  } catch (error) {
    console.error('Error fetching delivery:', error);
    return NextResponse.json({ error: 'Failed to fetch delivery' }, { status: 500 });
  }
}
