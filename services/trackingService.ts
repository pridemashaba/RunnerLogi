import { TrackingUpdate, DeliveryStatus } from '@/types';

export async function getTrackingUpdates(): Promise<TrackingUpdate[]> {
  await new Promise(resolve => setTimeout(resolve, 500));

  // Mock tracking updates
  const mockUpdates: TrackingUpdate[] = [
    {
      status: 'confirmed',
      location: 'Los Angeles, CA',
      timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
      description: 'Order confirmed, waiting for pickup',
    },
    {
      status: 'picked_up',
      location: 'Los Angeles, CA',
      timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000),
      description: 'Package picked up by courier',
    },
    {
      status: 'in_transit',
      location: 'Phoenix, AZ',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      description: 'Package in transit',
    },
    {
      status: 'out_for_delivery',
      location: 'El Paso, TX',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      description: 'Out for delivery',
    },
  ];

  return mockUpdates;
}

export function getStatusColor(status: DeliveryStatus): string {
  const colors = {
    pending: 'gray',
    payment_pending: 'yellow',
    confirmed: 'blue',
    picked_up: 'info',
    in_transit: 'purple',
    out_for_delivery: 'orange',
    delivered: 'green',
    failed: 'red',
    cancelled: 'gray',
  };
  return colors[status] || 'gray';
}

export function formatETA(eta: Date): string {
  const now = new Date();
  const diffHours = Math.ceil((eta.getTime() - now.getTime()) / (1000 * 60 * 60));

  if (diffHours < 0) return 'Delivered';
  if (diffHours < 24) return `${diffHours} hours`;
  return `${Math.ceil(diffHours / 24)} days`;
}
