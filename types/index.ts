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
  weight?: number;
  dimensions?: string;
  description?: string;
  quantity?: number;
  dimensionsObj?: {
    length: number;
    width: number;
    height: number;
  };
  isFragile?: boolean;
  value?: number;
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
  id?: string;
  name: string;
  price: number;
  estimatedDays?: string;
  durationHours: number;
  eta: Date;
  trackingSupported: boolean;
  serviceLevel: 'economy' | 'standard' | 'express';
  description?: string;
  features?: string[];
  logo?: string;
  rating?: number;
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

export interface Transaction {
  _id: string;
  orderNumber: string;
  amount: number;
  type: 'payment' | 'refund' | 'deposit';
  status: 'pending' | 'completed' | 'failed';
  description: string;
  createdAt: Date;
  paymentMethod?: string;
}

export interface BillingInfo {
  balance: number;
  totalSpent: number;
  totalRefunds: number;
  pendingPayments: number;
  monthlySpending: {
    month: string;
    amount: number;
  }[];
  paymentMethods: {
    id: string;
    type: string;
    last4: string;
    isDefault: boolean;
  }[];
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  companyName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  website: string;
  notificationPreferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
    orderUpdates: boolean;
    promotions: boolean;
  };
  businessHours: {
    monday: { enabled: boolean; start: string; end: string };
    tuesday: { enabled: boolean; start: string; end: string };
    wednesday: { enabled: boolean; start: string; end: string };
    thursday: { enabled: boolean; start: string; end: string };
    friday: { enabled: boolean; start: string; end: string };
    saturday: { enabled: boolean; start: string; end: string };
    sunday: { enabled: boolean; start: string; end: string };
  };
  defaultAddresses: {
    pickupAddress: string;
    returnAddress: string;
  };
  apiKeys: {
    key: string;
    secret: string;
  }[];
}

