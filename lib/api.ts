import axios from 'axios';
import { Delivery, CourierOption, TrackingUpdate, Address, PackageDetails } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  if (typeof document !== 'undefined') {
    const token = document.cookie.match(/token=([^;]+)/)?.[1];
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      error.message = 'The request timed out. Please check your connection and try again.';
    }
    return Promise.reject(error);
  }
);

function mapDbDeliveryToType(row: Record<string, unknown>): Delivery {
  return {
    id: row.id as string,
    runnerId: (row.assigned_courier_runner as string) || '',
    customerName: row.customer_name as string,
    customerEmail: row.customer_email as string,
    customerPhone: row.customer_phone as string,
    pickupAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US',
    },
    deliveryAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US',
    },
    packageDetails: {
      weight: Number(row.weight_kg) || 0,
      dimensions: (row.dimensions as string) || '',
      description: (row.description as string) || '',
      isFragile: (row.is_fragile as boolean) || false,
      value: Number(row.declared_value) || 0,
    },
    status: row.status as Delivery['status'],
    trackingNumber: row.tracking_number as string | undefined,
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
    estimatedDelivery: row.estimated_delivery ? new Date(row.estimated_delivery as string) : undefined,
    actualDelivery: row.actual_delivery ? new Date(row.actual_delivery as string) : undefined,
    price: Number(row.price) || 0,
    paymentStatus: (row.payment_status as Delivery['paymentStatus']) || 'pending',
  };
}

export const deliveriesAPI = {
  getAll: async () => {
    const response = await api.get('/deliveries');
    const rows = response.data;
    if (!Array.isArray(rows)) {
      const message = (rows && (rows as Record<string, unknown>).error) || 'Failed to load deliveries';
      throw new Error(String(message));
    }
    return { data: (rows as Record<string, unknown>[]).map(mapDbDeliveryToType) };
  },
  getById: async (id: string) => {
    const response = await api.get<Record<string, unknown>>(`/deliveries/${id}`);
    return { data: mapDbDeliveryToType(response.data) };
  },
  create: async (data: Partial<Delivery>) => {
    const response = await api.post<Record<string, unknown>>('/deliveries', data);
    return { data: mapDbDeliveryToType(response.data) };
  },
  update: async (id: string, data: Partial<Delivery>) => {
    const response = await api.put<Record<string, unknown>>(`/deliveries/${id}`, data);
    return { data: mapDbDeliveryToType(response.data) };
  },
  delete: async (id: string) => {
    await api.delete(`/deliveries/${id}`);
    return { data: { success: true } };
  },
};

export const courierAPI = {
  getRates: async (deliveryData: { pickupAddress: Address; deliveryAddress: Address; packageDetails: PackageDetails }) => {
    return api.post<CourierOption[]>('/couriers/rates', deliveryData);
  },
  selectCourier: async (deliveryId: string, courierId: string) => {
    return api.post(`/couriers/select`, { deliveryId, courierId });
  },
};

export const trackingAPI = {
  getTracking: async (trackingNumber: string) => {
    return api.get<TrackingUpdate[]>(`/tracking/${trackingNumber}`);
  },
};

export const billingAPI = {
  createPaymentIntent: async (amount: number, deliveryId: string) => {
    return api.post('/billing/create-payment', { amount, deliveryId });
  },
  getInvoices: async () => {
    return api.get('/billing/invoices');
  },
};

export default api;
