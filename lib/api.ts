import axios from 'axios';
import { Delivery, CourierOption, TrackingUpdate, Address, PackageDetails } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  if (typeof document !== 'undefined') {
    const token = document.cookie.match(/token=([^;]+)/)?.[1];
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Detect if we should use mock mode (no backend running)
const isMockMode = () => {
  if (typeof window === 'undefined') return false;
  return !process.env.NEXT_PUBLIC_API_URL;
};

// In-memory mock data
let mockDeliveries: Delivery[] = [
  {
    id: 'del_001',
    runnerId: '1',
    customerName: 'Alice Johnson',
    customerEmail: 'alice@example.com',
    customerPhone: '+1234567890',
    deliveryAddress: {
      street: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      country: 'US',
    },
    pickupAddress: {
      street: '456 Warehouse Blvd',
      city: 'Oakland',
      state: 'CA',
      zipCode: '94607',
      country: 'US',
    },
    packageDetails: {
      weight: 2.5,
      // NOTE: `PackageDetails.dimensions` is typed as `string` in this repo.
      dimensions: '12x8x6',
      description: 'Electronics - Laptop',
      isFragile: true,
      value: 1200,
    },
    status: 'in_transit',
    price: 24.99,
    paymentStatus: 'paid',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    selectedCourier: {
      courierId: 'ups_next_day',
      name: 'UPS Next Day Air',
      price: 24.99,
      durationHours: 24,
      eta: new Date(Date.now() + 24 * 60 * 60 * 1000),
      trackingSupported: true,
      serviceLevel: 'express',
      rating: 4.8,
    },
  },
  {
    id: 'del_002',
    runnerId: '1',
    customerName: 'Bob Smith',
    customerEmail: 'bob@example.com',
    customerPhone: '+1987654321',
    deliveryAddress: {
      street: '789 Market St',
      city: 'San Diego',
      state: 'CA',
      zipCode: '92101',
      country: 'US',
    },
    pickupAddress: {
      street: '101 Industrial Way',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90001',
      country: 'US',
    },
    packageDetails: {
      weight: 5.0,
      // NOTE: `PackageDetails.dimensions` is typed as `string` in this repo.
      dimensions: '24x12x10',
      description: 'Furniture - Chair',
      isFragile: false,
      value: 350,
    },
    status: 'delivered',
    price: 45.5,
    paymentStatus: 'paid',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    estimatedDelivery: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    actualDelivery: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    selectedCourier: {
      courierId: 'fedex_ground',
      name: 'FedEx Ground',
      price: 45.5,
      durationHours: 48,
      eta: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      trackingSupported: true,
      serviceLevel: 'standard',
      rating: 4.5,
    },
  },
];

export const deliveriesAPI = {
  getAll: async () => {
    if (isMockMode()) {
      return { data: mockDeliveries };
    }
    return api.get<Delivery[]>('/deliveries');
  },
  getById: async (id: string) => {
    if (isMockMode()) {
      const delivery = mockDeliveries.find((d) => d.id === id);
      if (!delivery) throw new Error('Delivery not found');
      return { data: delivery };
    }
    return api.get<Delivery>(`/deliveries/${id}`);
  },
  create: async (data: Partial<Delivery>) => {
    if (isMockMode()) {
      const newDelivery: Delivery = {
        id: `del_${Date.now()}`,
        runnerId: '1',
        customerName: data.customerName || 'Unknown',
        customerEmail: data.customerEmail || '',
        customerPhone: data.customerPhone || '',
        pickupAddress: data.pickupAddress!,
        deliveryAddress: data.deliveryAddress!,
        packageDetails: data.packageDetails!,
        selectedCourier: data.selectedCourier,
        status: 'pending',
        price: data.price || 0,
        paymentStatus: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockDeliveries.unshift(newDelivery);
      return { data: newDelivery };
    }
    return api.post<Delivery>('/deliveries', data);
  },
  update: async (id: string, data: Partial<Delivery>) => {
    if (isMockMode()) {
      const index = mockDeliveries.findIndex((d) => d.id === id);
      if (index === -1) throw new Error('Delivery not found');
      mockDeliveries[index] = { ...mockDeliveries[index], ...data, updatedAt: new Date() };
      return { data: mockDeliveries[index] };
    }
    return api.put<Delivery>(`/deliveries/${id}`, data);
  },
  delete: async (id: string) => {
    if (isMockMode()) {
      mockDeliveries = mockDeliveries.filter((d) => d.id !== id);
      return { data: { success: true } };
    }
    return api.delete(`/deliveries/${id}`);
  },
};

export const courierAPI = {
  getRates: async (deliveryData: { pickupAddress: Address; deliveryAddress: Address; packageDetails: PackageDetails }) => {
    if (isMockMode()) {
      const rates: CourierOption[] = [
        {
          courierId: 'fedex_ground',
          name: 'FedEx Ground',
          price: 8.99,
          durationHours: 48,
          eta: new Date(Date.now() + 48 * 60 * 60 * 1000),
          trackingSupported: true,
          serviceLevel: 'standard',
          rating: 4.5,
        },
        {
          courierId: 'ups_next_day',
          name: 'UPS Next Day Air',
          price: 24.99,
          durationHours: 24,
          eta: new Date(Date.now() + 24 * 60 * 60 * 1000),
          trackingSupported: true,
          serviceLevel: 'express',
          rating: 4.8,
        },
        {
          courierId: 'usps_priority',
          name: 'USPS Priority Mail',
          price: 7.49,
          durationHours: 72,
          eta: new Date(Date.now() + 72 * 60 * 60 * 1000),
          trackingSupported: true,
          serviceLevel: 'economy',
          rating: 4.2,
        },
      ];
      return { data: rates };
    }
    return api.post<CourierOption[]>('/couriers/rates', deliveryData);
  },
  selectCourier: async (deliveryId: string, courierId: string) => {
    if (isMockMode()) {
      return { data: { success: true, trackingNumber: `TRK${Date.now()}` } };
    }
    return api.post(`/couriers/select`, { deliveryId, courierId });
  },
};

export const trackingAPI = {
  getTracking: async (trackingNumber: string) => {
    if (isMockMode()) {
      const updates: TrackingUpdate[] = [
        {
          status: 'confirmed',
          location: 'Warehouse',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          description: 'Order confirmed',
        },
        {
          status: 'picked_up',
          location: 'Distribution Center',
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
          description: 'Package picked up',
        },
        {
          status: 'in_transit',
          location: 'En route',
          timestamp: new Date(),
          description: 'Package in transit',
        },
      ];
      return { data: updates };
    }
    return api.get<TrackingUpdate[]>(`/tracking/${trackingNumber}`);
  },
};

export const billingAPI = {
  createPaymentIntent: async (amount: number, deliveryId: string) => {
    if (isMockMode()) {
      return { data: { clientSecret: `mock_secret_${Date.now()}`, deliveryId } };
    }
    return api.post('/billing/create-payment', { amount, deliveryId });
  },
  getInvoices: async () => {
    if (isMockMode()) {
      return { data: [] };
    }
    return api.get('/billing/invoices');
  },
};

export default api;
