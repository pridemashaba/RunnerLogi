// components/courier/CourierComparisonTable.tsx
'use client';

import { CourierOption } from '@/types';
import { Star, Clock, Truck } from 'lucide-react';
import { formatETA } from '@/services/trackingService';

interface Props {
  options: CourierOption[];
  onSelect: (courier: CourierOption) => void;
}

export function CourierComparisonTable({ options, onSelect }: Props) {
  const getServiceLevelColor = (level: string) => {
    switch (level) {
      case 'express': return 'text-red-600 bg-red-50';
      case 'standard': return 'text-blue-600 bg-blue-50';
      case 'economy': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Courier
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Service
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Price
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Delivery Time
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Rating
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {options.map((option) => (
            <tr key={option.courierId} className="hover:bg-gray-50 transition-colors">
              <td className="whitespace-nowrap px-6 py-4">
                <div className="flex items-center">
                  <Truck className="h-5 w-5 text-gray-400 mr-2" />
                  <div className="text-sm font-medium text-gray-900">{option.name}</div>
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getServiceLevelColor(option.serviceLevel)}`}>
                  {option.serviceLevel}
                </span>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <div className="flex items-center text-sm text-gray-900">
                  <span className="mr-1">R</span>
                  {option.price.toFixed(2)}
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <div className="flex items-center text-sm text-gray-900">
                  <Clock className="h-4 w-4 text-gray-400 mr-1" />
                  {option.durationHours}h ({formatETA(option.eta)})
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="ml-1 text-sm text-gray-600">{option.rating}</span>
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <button
                  onClick={() => onSelect(option)}
                  className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  Select
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
