import { sql } from '@/lib/db';
import { DeliveryRow, NewDelivery } from './deliveries';

export async function getAllDeliveries(): Promise<DeliveryRow[]> {
  const result = await sql`
    SELECT id, delivery_number, seller_id, courier_id, pickup_address_id,
           delivery_address_id, assigned_courier_runner, customer_name,
           customer_email, customer_phone, weight_kg, dimensions, description,
           is_fragile, declared_value, price, payment_status, status,
           tracking_number, estimated_delivery, actual_delivery,
           created_at, updated_at, cancelled_at, notes, cancellation_reason
    FROM deliveries
    ORDER BY created_at DESC
  `;
  return result as DeliveryRow[];
}

export async function getDeliveryById(id: string): Promise<DeliveryRow | null> {
  const result = await sql`
    SELECT id, delivery_number, seller_id, courier_id, pickup_address_id,
           delivery_address_id, assigned_courier_runner, customer_name,
           customer_email, customer_phone, weight_kg, dimensions, description,
           is_fragile, declared_value, price, payment_status, status,
           tracking_number, estimated_delivery, actual_delivery,
           created_at, updated_at, cancelled_at, notes, cancellation_reason
    FROM deliveries
    WHERE id = ${id}
    LIMIT 1
  `;
  return (result as DeliveryRow[])[0] ?? null;
}

export async function createDelivery(data: NewDelivery): Promise<DeliveryRow> {
  const result = await sql`
    INSERT INTO deliveries (
      delivery_number, seller_id, courier_id, pickup_address_id,
      delivery_address_id, assigned_courier_runner, customer_name,
      customer_email, customer_phone, weight_kg, dimensions, description,
      is_fragile, declared_value, price, payment_status, status,
      tracking_number, estimated_delivery, notes
    ) VALUES (
      ${data.delivery_number}, ${data.seller_id}, ${data.courier_id ?? null},
      ${data.pickup_address_id ?? null}, ${data.delivery_address_id ?? null},
      ${data.assigned_courier_runner ?? null}, ${data.customer_name},
      ${data.customer_email}, ${data.customer_phone}, ${data.weight_kg},
      ${data.dimensions ?? null}, ${data.description ?? null},
      ${data.is_fragile ?? false}, ${data.declared_value ?? 0}, ${data.price},
      ${data.payment_status ?? 'pending'}, ${data.status ?? 'pending'},
      ${data.tracking_number ?? null}, ${data.estimated_delivery ?? null},
      ${data.notes ?? null}
    )
    RETURNING id, delivery_number, seller_id, courier_id, pickup_address_id,
              delivery_address_id, assigned_courier_runner, customer_name,
              customer_email, customer_phone, weight_kg, dimensions, description,
              is_fragile, declared_value, price, payment_status, status,
              tracking_number, estimated_delivery, actual_delivery,
              created_at, updated_at, cancelled_at, notes, cancellation_reason
  `;
  return result[0] as DeliveryRow;
}

export type NewAddress = {
  user_id: string;
  label?: string;
  street: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  is_default?: boolean;
};

export async function createAddress(data: NewAddress): Promise<string> {
  const result = await sql`
    INSERT INTO addresses (user_id, label, street, city, state, zip_code, country, is_default)
    VALUES (
      ${data.user_id}, ${data.label ?? null}, ${data.street}, ${data.city},
      ${data.state}, ${data.zip_code}, ${data.country}, ${data.is_default ?? false}
    )
    RETURNING id
  `;
  return (result[0] as { id: string }).id;
}

export async function updateDelivery(
  id: string,
  data: {
    status?: string;
    tracking_number?: string;
    assigned_courier_runner?: string;
    courier_id?: string;
    notes?: string;
    cancellation_reason?: string;
    actual_delivery?: string;
    cancelled_at?: string;
  }
): Promise<DeliveryRow | null> {
  const result = await sql`
    UPDATE deliveries
    SET
      status = COALESCE(${data.status ?? null}, status),
      tracking_number = COALESCE(${data.tracking_number ?? null}, tracking_number),
      assigned_courier_runner = COALESCE(${data.assigned_courier_runner ?? null}, assigned_courier_runner),
      courier_id = COALESCE(${data.courier_id ?? null}, courier_id),
      notes = COALESCE(${data.notes ?? null}, notes),
      cancellation_reason = COALESCE(${data.cancellation_reason ?? null}, cancellation_reason),
      actual_delivery = COALESCE(${data.actual_delivery ?? null}, actual_delivery),
      cancelled_at = COALESCE(${data.cancelled_at ?? null}, cancelled_at),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
    RETURNING id, delivery_number, seller_id, courier_id, pickup_address_id,
              delivery_address_id, assigned_courier_runner, customer_name,
              customer_email, customer_phone, weight_kg, dimensions, description,
              is_fragile, declared_value, price, payment_status, status,
              tracking_number, estimated_delivery, actual_delivery,
              created_at, updated_at, cancelled_at, notes, cancellation_reason
  `;
  return (result as DeliveryRow[])[0] ?? null;
}

export async function deleteDelivery(id: string): Promise<boolean> {
  const result = await sql`
    DELETE FROM deliveries
    WHERE id = ${id}
    RETURNING id
  `;
  return result.length > 0;
}
