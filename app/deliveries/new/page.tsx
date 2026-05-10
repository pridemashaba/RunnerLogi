// app/deliveries/new/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DeliveryForm } from '@/components/forms/DeliveryForm';
import { CourierComparisonTable } from '@/components/courier/CourierComparisonTable';
import { Delivery, CourierOption } from '@/types';
import { deliveriesAPI } from '@/lib/api';
import { fetchCourierRates } from '@/services/courierService';
import { showNotification } from '@/services/notificationService';

export default function NewDeliveryPage() {
  const router = useRouter();
  const [step, setStep] = useState<'form' | 'compare' | 'payment'>('form');
  const [deliveryData, setDeliveryData] = useState<Partial<Delivery>>({});
  const [courierOptions, setCourierOptions] = useState<CourierOption[]>([]);
  const [selectedCourier, setSelectedCourier] = useState<CourierOption | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFormSubmit = async (data: Partial<Delivery>) => {
    setLoading(true);
    setDeliveryData(data);

    try {
      const rates = await fetchCourierRates(
        data.pickupAddress!,
        data.deliveryAddress!,
        data.packageDetails!
      );
      setCourierOptions(rates);
      setStep('compare');
    } catch {
      showNotification('Failed to fetch courier rates', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCourier = (courier: CourierOption) => {
    setSelectedCourier(courier);
    setStep('payment');
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      const deliveryToCreate = {
        ...deliveryData,
        selectedCourier: selectedCourier!,
        status: 'payment_pending' as const,
        price: selectedCourier!.price,
      };

      const response = await deliveriesAPI.create(deliveryToCreate);
      showNotification('Delivery created successfully!', 'success');
      router.push(`/deliveries/${response.data.id}`);
    } catch {
      showNotification('Failed to create delivery', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Delivery</h1>
          <p className="mt-2 text-sm text-gray-600">
            Enter delivery details and compare courier options
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {['Delivery Details', 'Compare Couriers', 'Payment'].map((label, index) => (
              <div key={label} className="flex items-center">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  index === ['form', 'compare', 'payment'].indexOf(step)
                    ? 'bg-blue-600 text-white'
                    : index < ['form', 'compare', 'payment'].indexOf(step)
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {index + 1}
                </div>
                <span className="ml-2 text-sm font-medium text-gray-600">{label}</span>
                {index < 2 && <div className="mx-4 h-0.5 w-16 bg-gray-200" />}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        {step === 'form' && (
          <DeliveryForm onSubmit={handleFormSubmit} loading={loading} />
        )}

        {step === 'compare' && (
          <div>
            <CourierComparisonTable
              options={courierOptions}
              onSelect={handleSelectCourier}
            />
            <div className="mt-4">
              <button
                onClick={() => setStep('form')}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                ← Back to edit details
              </button>
            </div>
          </div>
        )}

        {step === 'payment' && selectedCourier && (
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="text-xl font-semibold mb-4">Payment Summary</h2>
              <div className="border-t border-b py-4">
                <div className="flex justify-between mb-2">
                  <span>Courier: {selectedCourier.name}</span>
                  <span>R{selectedCourier.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>R{selectedCourier.price.toFixed(2)}</span>
                </div>
              </div>
            <div className="mt-6">
              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Confirm & Pay'}
              </button>
            </div>
            <div className="mt-4">
              <button
                onClick={() => setStep('compare')}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                ← Back to courier options
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
