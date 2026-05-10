import axios from 'axios';
import { Delivery, CourierOption, TrackingUpdate, Address, PackageDetails } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = document.cookie.match(/auth-token=([^;]+)/)?.[1];
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const deliveriesAPI = {
  getAll: () => api.get<Delivery[]>('/deliveries'),
  getById: (id: string) => api.get<Delivery>(`/deliveries/${id}`),
  create: (data: Partial<Delivery>) => api.post<Delivery>('/deliveries', data),
  update: (id: string, data: Partial<Delivery>) => api.put<Delivery>(`/deliveries/${id}`, data),
  delete: (id: string) => api.delete(`/deliveries/${id}`),
};

export const courierAPI = {
  getRates: (deliveryData: { pickupAddress: Address; deliveryAddress: Address; packageDetails: PackageDetails }) => api.post<CourierOption[]>('/couriers/rates', deliveryData),
  selectCourier: (deliveryId: string, courierId: string) => api.post(`/couriers/select`, { deliveryId, courierId }),
};

export const trackingAPI = {
  getTracking: (trackingNumber: string) => api.get<TrackingUpdate[]>(`/tracking/${trackingNumber}`),
};

export const billingAPI = {
  createPaymentIntent: (amount: number, deliveryId: string) => api.post('/billing/create-payment', { amount, deliveryId }),
  getInvoices: () => api.get('/billing/invoices'),
};

export default api;
