import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAllDeliveries, createDelivery, createAddress } from '@/lib/database/delivery-queries';
import { getUserFromToken } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const status = requestUrl.searchParams.get('status');
    const sellerId = requestUrl.searchParams.get('seller_id');

    let deliveries = await getAllDeliveries();

    if (status) {
      deliveries = deliveries.filter((d) => d.status === status);
    }

    if (sellerId) {
      deliveries = deliveries.filter((d) => d.seller_id === sellerId);
    }

    return NextResponse.json(deliveries);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch deliveries';
    console.error('Error fetching deliveries:', error);
    if (message.includes('fetch failed') || message.includes('ETIMEDOUT') || message.includes('timeout')) {
      return NextResponse.json({ error: 'Database connection timeout. Please try again in a moment.' }, { status: 503 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Derive seller from the authenticated session when not supplied.
    const cookieStore = await cookies();
    const authUser = await getUserFromToken(cookieStore.get('token')?.value);
    const sellerId = body.seller_id || authUser?.id || null;

    // Accept both snake_case and the camelCase Delivery shape from the form.
    const customerName = body.customer_name ?? body.customerName ?? '';
    const customerEmail = body.customer_email ?? body.customerEmail ?? '';
    const customerPhone = body.customer_phone ?? body.customerPhone ?? '';
    const weightKg = Number(body.weight_kg ?? body.packageDetails?.weight ?? 0);
    const price = Number(body.price ?? 0);
    const declaredValue = Number(body.declared_value ?? body.packageDetails?.value ?? 0);
    const dimensions = body.dimensions ?? body.packageDetails?.dimensions ?? null;
    const description = body.description ?? body.packageDetails?.description ?? null;
    const isFragile = body.is_fragile ?? body.packageDetails?.isFragile ?? false;

    if (!sellerId) {
      return NextResponse.json({ error: 'You must be signed in to create a delivery' }, { status: 401 });
    }
    for (const [field, value] of [
      ['customer_name', customerName],
      ['customer_email', customerEmail],
      ['customer_phone', customerPhone],
      ['weight_kg', weightKg],
      ['price', price],
    ] as const) {
      if (!value) {
        return NextResponse.json({ error: `${field} is required` }, { status: 400 });
      }
    }

    // Persist pickup/delivery addresses (form sends camelCase) and link them.
    const pickup = body.pickupAddress ?? body.pickup_address ?? null;
    const dropoff = body.deliveryAddress ?? body.delivery_address ?? null;

    const pickupAddressId =
      pickup?.street
        ? await createAddress({
            user_id: sellerId,
            label: 'Pickup',
            street: pickup.street,
            city: pickup.city,
            state: pickup.state,
            zip_code: pickup.zipCode ?? pickup.zip_code ?? '',
            country: pickup.country ?? 'US',
          })
        : null;

    const deliveryAddressId =
      dropoff?.street
        ? await createAddress({
            user_id: sellerId,
            label: 'Delivery',
            street: dropoff.street,
            city: dropoff.city,
            state: dropoff.state,
            zip_code: dropoff.zipCode ?? dropoff.zip_code ?? '',
            country: dropoff.country ?? 'US',
          })
        : null;

    const deliveryNumber = `DLV-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const trackingNumber = `TRK-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    const delivery = await createDelivery({
      delivery_number: deliveryNumber,
      seller_id: sellerId,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      weight_kg: weightKg,
      price,
      payment_status: body.payment_status || 'paid',
      status: body.status || 'confirmed',
      dimensions,
      description,
      is_fragile: Boolean(isFragile),
      declared_value: declaredValue,
      courier_id: body.courier_id ?? null,
      pickup_address_id: pickupAddressId ?? undefined,
      delivery_address_id: deliveryAddressId ?? undefined,
      assigned_courier_runner: body.assigned_courier_runner ?? null,
      tracking_number: body.tracking_number || trackingNumber,
      estimated_delivery: body.estimated_delivery ?? null,
      notes: body.notes ?? null,
    });

    return NextResponse.json(delivery, { status: 201 });
  } catch (error) {
    console.error('Error creating delivery:', error);
    return NextResponse.json({ error: 'Failed to create delivery' }, { status: 500 });
  }
}
