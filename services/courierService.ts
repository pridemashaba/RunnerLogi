import { CourierOption } from '@/types';
import { COURIER_PRICING, SERVICE_MODIFIERS } from '@/config/courierPricing';
import { calculateDistance } from './geocodingService';

function calculatePrice(
  courierName: string,
  distanceKm: number,
  weightKg: number,
  serviceType: string = 'standard'
): number {
  const pricing = COURIER_PRICING[courierName];
  if (!pricing) {
    throw new Error(`Pricing not found for courier: ${courierName}`);
  }

  const serviceModifier = SERVICE_MODIFIERS[serviceType as keyof typeof SERVICE_MODIFIERS] || 1.0;

  let price = pricing.baseRate +
              (distanceKm * pricing.ratePerKm) +
              (weightKg * pricing.ratePerKg);

  price = price * serviceModifier;

  if (price < pricing.minPrice) {
    price = pricing.minPrice;
  }

  if (pricing.maxPrice && price > pricing.maxPrice) {
    price = pricing.maxPrice;
  }

  return Math.round(price * 100) / 100;
}

function getEstimatedDeliveryTime(courierName: string, distanceKm: number): string {
  const avgSpeed = 60;
  const days = Math.ceil(distanceKm / avgSpeed);

  if (courierName.includes('DHL') || courierName.includes('Express')) {
    return days <= 1 ? 'Same day' : `${days} business days (Express)`;
  }

  return `${Math.max(1, days)}-${Math.max(2, days + 1)} business days`;
}

export async function fetchCourierRates(
  pickupAddress: string,
  deliveryAddress: string,
  packageDetails: { weight?: number; dimensions?: string; description?: string }
): Promise<CourierOption[]> {
  try {
    const distance = await calculateDistance(pickupAddress, deliveryAddress);
    const weight = packageDetails.weight || 2;
    const now = new Date();

    const courierOptions: CourierOption[] = Object.keys(COURIER_PRICING).map(courierName => {
      const price = calculatePrice(courierName, distance, weight);
      const estimatedDays = getEstimatedDeliveryTime(courierName, distance);
      const isExpress = courierName.includes('Express');
      const durationHours = isExpress ? Math.max(4, Math.ceil(distance / 100 * 24)) : Math.max(24, Math.ceil(distance / 80 * 24));
      const eta = new Date(now.getTime() + durationHours * 60 * 60 * 1000);

      let description = '';
      let features: string[] = [];

      switch(courierName) {
        case 'The Courier Guy':
          description = 'Most popular SA courier with strong e-commerce integration';
          features = ['Real-time tracking', 'SMS notifications', 'Insurance included'];
          break;
        case 'RAM Hand-to-Hand':
          description = 'Secure B2B deliveries with hand-to-hand signature';
          features = ['High security', 'Proof of delivery', 'Cargo insurance'];
          break;
        case 'Fastway Couriers':
          description = 'Affordable option with wide branch network';
          features = ['Budget friendly', 'Branch drop-off', 'Basic tracking'];
          break;
        case 'DHL Express South Africa':
          description = 'Premium international shipping with fastest delivery';
          features = ['Express delivery', 'International shipping', 'Full tracking'];
          break;
        case 'PAXI (PEP Stores)':
          description = 'Cheapest counter-to-counter delivery';
          features = ['Lowest price', 'PEP store pickup/dropoff', '2-5 day delivery'];
          break;
        default:
          description = `Reliable delivery service across South Africa`;
          features = ['Tracking included', 'Proof of delivery'];
      }

      return {
        courierId: courierName.toLowerCase().replace(/\s+/g, '-'),
        id: courierName.toLowerCase().replace(/\s+/g, '-'),
        name: courierName,
        price: price,
        estimatedDays: estimatedDays,
        durationHours: durationHours,
        eta: eta,
        trackingSupported: true,
        serviceLevel: isExpress ? 'express' : 'standard',
        description: description,
        features: features,
        logo: `/images/couriers/${courierName.toLowerCase().replace(/\s+/g, '-')}.png`,
        rating: 4.0 + (Math.random() * 1),
      };
    });

    return courierOptions.sort((a, b) => a.price - b.price);

  } catch (error) {
    console.error('Error fetching courier rates:', error);
    throw new Error('Failed to fetch courier rates');
  }
}

export function applyBulkDiscount(price: number, packageCount: number): number {
  if (packageCount >= 10) return price * 0.85;
  if (packageCount >= 5) return price * 0.9;
  return price;
}
