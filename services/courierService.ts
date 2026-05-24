import { CourierOption, PackageDetails, Address } from '@/types';

// Mock courier options based on delivery details
export async function fetchCourierRates(
  pickup: Address,
  delivery: Address,
  packageDetails: PackageDetails
): Promise<CourierOption[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Calculate distance factor (mock calculation)
  const distanceFactor = Math.random() * 2 + 1;
  const weightFactor = packageDetails.weight * 1.5;

  const couriers: CourierOption[] = [
    {
      courierId: 'fedex_ground',
      name: 'FedEx Ground',
      price: 8.99 * distanceFactor + weightFactor,
      durationHours: 48,
      eta: new Date(Date.now() + 48 * 60 * 60 * 1000),
      trackingSupported: true,
      serviceLevel: 'standard',
      rating: 4.5,
    },
    {
      courierId: 'ups_next_day',
      name: 'UPS Next Day Air',
      price: 24.99 * distanceFactor + weightFactor * 1.2,
      durationHours: 24,
      eta: new Date(Date.now() + 24 * 60 * 60 * 1000),
      trackingSupported: true,
      serviceLevel: 'express',
      rating: 4.8,
    },
    {
      courierId: 'usps_priority',
      name: 'USPS Priority Mail',
      price: 7.49 * distanceFactor + weightFactor * 0.8,
      durationHours: 72,
      eta: new Date(Date.now() + 72 * 60 * 60 * 1000),
      trackingSupported: true,
      serviceLevel: 'economy',
      rating: 4.2,
    },
    {
      courierId: 'dhl_express',
      name: 'DHL Express',
      price: 19.99 * distanceFactor + weightFactor,
      durationHours: 36,
      eta: new Date(Date.now() + 36 * 60 * 60 * 1000),
      trackingSupported: true,
      serviceLevel: 'express',
      rating: 4.7,
    },
  ];

  return couriers.sort((a, b) => a.price - b.price);
}

export async function bookCourier(_deliveryId: string, _courierId: string): Promise<{ trackingNumber: string; label: string }> {
  await new Promise(resolve => setTimeout(resolve, 2000));

  return {
    trackingNumber: `TRK${Math.random().toString(36).substring(7).toUpperCase()}`,
    label: 'https://example.com/label.pdf',
  };
}

export async function cancelBooking(_trackingNumber: string): Promise<boolean> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return true;
}
