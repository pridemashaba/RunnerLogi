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
      </div>
    </div>
  );
}

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
