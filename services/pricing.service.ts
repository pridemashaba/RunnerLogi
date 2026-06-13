import {
  DeliveryEstimateResponse,
  DeliveryServiceType,
  VehicleType,
} from '@/types/api.types';

type PricingResult = DeliveryEstimateResponse['pricing'] & DeliveryEstimateResponse['breakdown'];

export class PricingService {
  private readonly RATES: Record<
    VehicleType,
    {
      base_fare: number;
      per_km: number;
      per_minute: number;
      minimum_fare: number;
    }
  > = {
    bike: {
      base_fare: 2.5,
      per_km: 0.85,
      per_minute: 0.25,
      minimum_fare: 4,
    },
    car: {
      base_fare: 3.5,
      per_km: 1.25,
      per_minute: 0.35,
      minimum_fare: 6,
    },
    van: {
      base_fare: 5,
      per_km: 1.85,
      per_minute: 0.5,
      minimum_fare: 9,
    },
    truck: {
      base_fare: 8,
      per_km: 2.5,
      per_minute: 0.75,
      minimum_fare: 15,
    },
  };

  private readonly SERVICE_FEES: Record<DeliveryServiceType, number> = {
    express: 5,
    standard: 0,
    scheduled: -2,
  };

  private readonly ADDITIONAL_FEES = {
    signature_required: 1.5,
    fragile: 3,
  };

  calculatePrice(
    distanceMeters: number,
    durationSeconds: number,
    vehicleType: VehicleType = 'car',
    serviceType: DeliveryServiceType = 'standard',
    options: { requires_signature?: boolean; fragile?: boolean } = {}
  ): PricingResult {
    const distanceKm = distanceMeters / 1000;
    const durationMinutes = durationSeconds / 60;

    const rates = this.RATES[vehicleType] || this.RATES.car;
    const serviceFee = this.SERVICE_FEES[serviceType] || 0;

    let additionalFees = 0;
    if (options.requires_signature) additionalFees += this.ADDITIONAL_FEES.signature_required;
    if (options.fragile) additionalFees += this.ADDITIONAL_FEES.fragile;

    const distanceFare = distanceKm * rates.per_km;
    const timeFare = durationMinutes * rates.per_minute;
    let total = rates.base_fare + distanceFare + timeFare + serviceFee + additionalFees;

    const surgeMultiplier = this.calculateSurgeMultiplier();
    total *= surgeMultiplier;
    total = Math.max(total, rates.minimum_fare);

    return {
      base_fare: rates.base_fare,
      distance_fare: distanceFare,
      time_fare: timeFare,
      service_fee: serviceFee,
      surge_multiplier: surgeMultiplier,
      total: Math.round(total * 100) / 100,
      currency: 'USD',
      per_km_rate: rates.per_km,
      per_minute_rate: rates.per_minute,
      minimum_fare: rates.minimum_fare,
    };
  }

  private calculateSurgeMultiplier(): number {
    return 1;
  }
}
