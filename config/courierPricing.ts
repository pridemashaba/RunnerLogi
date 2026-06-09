export interface CourierPricingRule {
  baseRate: number;
  ratePerKm: number;
  ratePerKg: number;
  minPrice: number;
  maxPrice?: number;
  zones?: string[];
}

export const COURIER_PRICING: Record<string, CourierPricingRule> = {
  'The Courier Guy': {
    baseRate: 45,
    ratePerKm: 3.5,
    ratePerKg: 12,
    minPrice: 65,
  },
  'RAM Hand-to-Hand': {
    baseRate: 60,
    ratePerKm: 4.2,
    ratePerKg: 15,
    minPrice: 85,
  },
  'Fastway Couriers': {
    baseRate: 35,
    ratePerKm: 2.8,
    ratePerKg: 10,
    minPrice: 55,
  },
  'Aramex South Africa': {
    baseRate: 50,
    ratePerKm: 3.8,
    ratePerKg: 13,
    minPrice: 75,
  },
  'DHL Express South Africa': {
    baseRate: 100,
    ratePerKm: 6.5,
    ratePerKg: 25,
    minPrice: 150,
  },
  'PostNet South Africa': {
    baseRate: 30,
    ratePerKm: 2.5,
    ratePerKg: 8,
    minPrice: 45,
  },
  'PAXI (PEP Stores)': {
    baseRate: 25,
    ratePerKm: 1.8,
    ratePerKg: 6,
    minPrice: 35,
  },
  'DPD Laser (Dawn Wing)': {
    baseRate: 40,
    ratePerKm: 3.0,
    ratePerKg: 11,
    minPrice: 60,
  },
  'City Logistics': {
    baseRate: 55,
    ratePerKm: 4.0,
    ratePerKg: 14,
    minPrice: 80,
  },
  'CourierIT': {
    baseRate: 48,
    ratePerKm: 3.6,
    ratePerKg: 12.5,
    minPrice: 70,
  },
  'Takealot Delivery Team': {
    baseRate: 38,
    ratePerKm: 2.9,
    ratePerKg: 9,
    minPrice: 50,
  },
};

export const ZONE_PRICING = {
  'Cape Town-Johannesburg': { multiplier: 1.2, flatRate: 180 },
  'Johannesburg-Durban': { multiplier: 1.1, flatRate: 150 },
  'Cape Town-Durban': { multiplier: 1.3, flatRate: 200 },
  'default': { multiplier: 1.0, flatRate: 0 },
};

export const SERVICE_MODIFIERS = {
  'standard': 1.0,
  'express': 1.5,
  'economy': 0.8,
  'same-day': 2.0,
};
