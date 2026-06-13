<<<<<<< HEAD
'use client';

import { useState, type ComponentType } from 'react';
import {
  TruckIcon,
  CurrencyDollarIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';

interface DashboardStats {
  totalDeliveries: number;
  activeDeliveries: number;
  revenue: number;
  totalDrivers: number;
  completionRate: number;
  recentActivity: Activity[];
}

interface Activity {
  id: string;
  type: 'delivery' | 'driver' | 'payment';
  description: string;
  timestamp: string;
  status?: 'success' | 'pending' | 'failed';
}

const defaultDashboardStats: DashboardStats = {
  totalDeliveries: 0,
  activeDeliveries: 0,
  revenue: 0,
  totalDrivers: 0,
  completionRate: 0,
  recentActivity: [],
};

export default function DashboardPage() {
  const [stats] = useState<DashboardStats>(defaultDashboardStats);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-blue-100">Overview of your logistics operations</p>
        </div>

        <div className="mb-6 flex justify-end">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            {(['week', 'month', 'year'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 text-sm font-medium capitalize ${
                  timeRange === range
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/10 backdrop-blur-sm text-white hover:bg-white/20'
                } ${
                  range === 'week'
                    ? 'rounded-l-lg'
                    : range === 'year'
                    ? 'rounded-r-lg'
                    : ''
                } border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            title="Total Deliveries"
            value={stats?.totalDeliveries.toLocaleString() || '0'}
            icon={TruckIcon}
            trend="+12%"
            trendUp={true}
            color="blue"
          />
          <StatCard
            title="Active Deliveries"
            value={stats?.activeDeliveries.toString() || '0'}
            icon={ClipboardDocumentListIcon}
            trend="-3%"
            trendUp={false}
            color="green"
          />
          <StatCard
            title="Revenue"
            value={`$${stats?.revenue.toLocaleString() || '0'}`}
            icon={CurrencyDollarIcon}
            trend="+8%"
            trendUp={true}
            color="purple"
          />
          <StatCard
            title="Active Drivers"
            value={stats?.totalDrivers.toString() || '0'}
            icon={UserGroupIcon}
            trend="+5%"
            trendUp={true}
            color="orange"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delivery Performance</h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
              <p className="text-gray-500">Chart Component Here</p>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Completion Rate</h3>
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900">{stats?.completionRate || 0}%</div>
                <p className="text-sm text-gray-500 mt-2">on-time deliveries</p>
                <div className="w-48 h-2 bg-gray-200 rounded-full mt-4">
                  <div
                    className="h-2 bg-green-500 rounded-full"
                    style={{ width: `${stats?.completionRate || 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {stats?.recentActivity.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        </div>
=======
// app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Delivery } from '@/types';
import { deliveriesAPI } from '@/lib/api';
import { format } from 'date-fns';
import { Package, Truck, Clock, DollarSign } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [stats, setStats] = useState({
    totalDeliveries: 0,
    activeDeliveries: 0,
    completedDeliveries: 0,
    totalSpent: 0,
  });

  useEffect(() => {
    const token = document.cookie.match(/token=([^;]+)/)?.[1];
    if (!token) {
      router.push('/login');
      return;
    }

    const loadDeliveries = async () => {
      try {
        const response = await deliveriesAPI.getAll();
        const data = response.data;
        setDeliveries(data);

        // Calculate stats
        const active = data.filter(d => !['delivered', 'cancelled'].includes(d.status)).length;
        const completed = data.filter(d => d.status === 'delivered').length;
        const totalSpent = data.reduce((sum, d) => sum + d.price, 0);

        setStats({
          totalDeliveries: data.length,
          activeDeliveries: active,
          completedDeliveries: completed,
          totalSpent: totalSpent,
        });
      } catch (error) {
        console.error('Failed to fetch deliveries:', error);
      }
    };

    loadDeliveries();
  }, [router]);

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-gray-100 text-gray-800',
      payment_pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      picked_up: 'bg-purple-100 text-purple-800',
      in_transit: 'bg-indigo-100 text-indigo-800',
      out_for_delivery: 'bg-orange-100 text-orange-800',
      delivered: 'bg-green-100 text-green-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
<div className="min-h-screen bg-blue-50 focus:ring-blue-500">
      <div className="py-10">
        <header>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-dark-text">
              Dashboard
            </h1>
          </div>
        </header>
        <main>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Stats */}
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 rounded-md bg-primary-blue-dark p-3">
                    <Package className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="truncate text-sm font-medium text-gray-500">Total Deliveries</dt>
                      <dd className="text-lg font-semibold text-gray-900">{stats.totalDeliveries}</dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 rounded-md bg-accent-orange p-3">
                    <Truck className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="truncate text-sm font-medium text-gray-500">Active Deliveries</dt>
                      <dd className="text-lg font-semibold text-gray-900">{stats.activeDeliveries}</dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 rounded-md bg-green-500 p-3">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="truncate text-sm font-medium text-gray-500">Completed</dt>
                      <dd className="text-lg font-semibold text-gray-900">{stats.completedDeliveries}</dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 rounded-md bg-purple-500 p-3">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="truncate text-sm font-medium text-gray-500">Total Spent</dt>
                      <dd className="text-lg font-semibold text-gray-900">R{stats.totalSpent.toFixed(2)}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action */}
            <div className="mt-8">
              <Link
                href="/deliveries/new"
                className="inline-flex items-center rounded-md bg-primary-blue px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-blue-dark"
              >
                + New Delivery
              </Link>
            </div>

            {/* Recent Deliveries */}
            <div className="mt-8">
              <div className="overflow-hidden bg-white shadow sm:rounded-md">
                <ul role="list" className="divide-y divide-gray-200">
                  {deliveries.slice(0, 5).map((delivery) => (
                    <li key={delivery.id}>
                      <Link href={`/deliveries/${delivery.id}`} className="block hover:bg-gray-50">
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <p className="truncate text-sm font-medium text-primary-blue-dark">
                              {delivery.customerName}
                            </p>
                            <div className="ml-2 flex flex-shrink-0">
                              <p className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusBadge(delivery.status)}`}>
                                {delivery.status.replace('_', ' ')}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 sm:flex sm:justify-between">
                            <div className="sm:flex">
                              <p className="flex items-center text-sm text-gray-500">
                                {delivery.pickupAddress.city} → {delivery.deliveryAddress.city}
                              </p>
                            </div>
                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                              <p>
                                {format(new Date(delivery.createdAt), 'MMM d, yyyy')}
                              </p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                  {deliveries.length === 0 && (
                    <li className="px-4 py-8 text-center text-gray-500">
                      No deliveries yet. Create your first delivery!
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </main>
>>>>>>> 3e26547132126c075e46fffc19579da740bdea12
      </div>
    </div>
  );
}
<<<<<<< HEAD

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendUp,
  color,
}: {
  title: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
  trend: string;
  trendUp: boolean;
  color: 'blue' | 'green' | 'purple' | 'orange';
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className="flex items-center">
        <div className={`flex-shrink-0 rounded-lg p-3 ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
        <div className="ml-4">
          <div
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              trendUp
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {trendUp ? (
              <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
            ) : (
              <ArrowTrendingDownIcon className="h-3 w-3 mr-1" />
            )}
            {trend}
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivityItem({ activity }: { activity: Activity }) {
  const statusColors = {
    success: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    failed: 'bg-red-100 text-red-800',
  };

  return (
    <div className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
      <div>
        <p className="text-sm text-gray-900">{activity.description}</p>
        <p className="text-xs text-gray-500 mt-1">{new Date(activity.timestamp).toLocaleString()}</p>
      </div>
      {activity.status && (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            statusColors[activity.status]
          }`}
        >
          {activity.status}
        </span>
      )}
    </div>
  );
}
=======
>>>>>>> 3e26547132126c075e46fffc19579da740bdea12
