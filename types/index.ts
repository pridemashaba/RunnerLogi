// types/index.ts
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'runner' | 'admin';
  phone?: string;
  createdAt: Date;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface PackageDetails {
  weight: number; // in kg
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  description: string;
  isFragile: boolean;
  value: number;
}

export type DeliveryStatus =
  | 'pending'
  | 'payment_pending'
  | 'confirmed'
  | 'picked_up'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'failed'
  | 'cancelled';

export interface CourierOption {
  courierId: string;
  name: string;
  price: number;
  durationHours: number;
  eta: Date;
  trackingSupported: boolean;
  serviceLevel: 'economy' | 'standard' | 'express';
  rating: number;
}

export interface Courier {
  id: string;
  name: string;
  apiEndpoint: string;
  apiKey: string;
  enabled: boolean;
  rates: RateStructure[];
}

export interface RateStructure {
  zone: string;
  basePrice: number;
  pricePerKg: number;
  estimatedDays: number;
}

export interface Delivery {
  id: string;
  runnerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  pickupAddress: Address;
  deliveryAddress: Address;
  packageDetails: PackageDetails;
  selectedCourier?: CourierOption;
  status: DeliveryStatus;
  trackingNumber?: string;
  createdAt: Date;
  updatedAt: Date;
  estimatedDelivery?: Date;
  actualDelivery?: Date;
  price: number;
  paymentStatus: 'pending' | 'paid' | 'refunded';
}

export interface TrackingUpdate {
  status: DeliveryStatus;
  location: string;
  timestamp: Date;
  description: string;
}

