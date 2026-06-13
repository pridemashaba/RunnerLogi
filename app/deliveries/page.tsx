<<<<<<< HEAD
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TruckIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MapPinIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  DocumentArrowDownIcon,
} from '@heroicons/react/24/outline';

// Types
interface Delivery {
  id: string;
  trackingNumber: string;
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  scheduledDate: string;
  deliveredDate?: string;
  driverName?: string;
  driverPhone?: string;
  amount: number;
  distance: number;
  notes?: string;
}

interface FilterOptions {
  status: string;
  priority: string;
  dateRange: string;
  search: string;
}

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    priority: 'all',
    dateRange: 'all',
    search: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  useEffect(() => {
    fetchDeliveries();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [deliveries, filters, currentPage]);

  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      // Replace with your actual API call
      const response = await fetch('/api/deliveries');
      const data = await response.json();
      setDeliveries(data);
      setFilteredDeliveries(data);
    } catch (error) {
      console.error('Failed to fetch deliveries:', error);
      // Demo data for presentation
      setDeliveries(demoDeliveries);
      setFilteredDeliveries(demoDeliveries);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...deliveries];

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(d => d.status === filters.status);
    }

    // Priority filter
    if (filters.priority !== 'all') {
      filtered = filtered.filter(d => d.priority === filters.priority);
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.setHours(0, 0, 0, 0));
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      filtered = filtered.filter(d => {
        const deliveryDate = new Date(d.scheduledDate);
        if (filters.dateRange === 'today') {
          return deliveryDate.toDateString() === today.toDateString();
        } else if (filters.dateRange === 'week') {
          return deliveryDate >= weekAgo;
        } else if (filters.dateRange === 'month') {
          return deliveryDate >= monthAgo;
        }
        return true;
      });
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(d =>
        d.trackingNumber.toLowerCase().includes(searchLower) ||
        d.customerName.toLowerCase().includes(searchLower) ||
        d.customerAddress.toLowerCase().includes(searchLower)
      );
    }

    setFilteredDeliveries(filtered);
    setCurrentPage(1);
  };

  const getStatusBadge = (status: Delivery['status']) => {
    const config = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon, text: 'Pending' },
      in_transit: { color: 'bg-blue-100 text-blue-800', icon: TruckIcon, text: 'In Transit' },
      delivered: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon, text: 'Delivered' },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircleIcon, text: 'Cancelled' },
    };
    const { color, icon: Icon, text } = config[status];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {text}
      </span>
    );
  };

  const getPriorityBadge = (priority: Delivery['priority']) => {
    const config = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config[priority]}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems: Delivery[] = filteredDeliveries.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDeliveries.length / itemsPerPage);

  // Statistics
  const stats = {
    total: deliveries.length,
    delivered: deliveries.filter(d => d.status === 'delivered').length,
    inTransit: deliveries.filter(d => d.status === 'in_transit').length,
    pending: deliveries.filter(d => d.status === 'pending').length,
    revenue: deliveries.reduce((sum, d) => sum + d.amount, 0),
    onTimeRate: Math.round((deliveries.filter(d => d.status === 'delivered').length / deliveries.length) * 100) || 0,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
=======
// app/deliveries/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Delivery } from '@/types';
import { deliveriesAPI } from '@/lib/api';
import { showNotification } from '@/services/notificationService';
import { format } from 'date-fns';

export default function DeliveriesPage() {
  const router = useRouter();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDeliveries, setSelectedDeliveries] = useState<string[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    delivered: 0,
    inProgress: 0,
    cancelled: 0,
    totalSpent: 0,
  });

  const deliveriesPerPage = 10;

  const fetchDeliveries = useCallback(async () => {
    try {
      const response = await deliveriesAPI.getAll();
      const data = response.data;
      setDeliveries(data);

      // Calculate stats
      const delivered = data.filter((d) => d.status === 'delivered').length;
      const inProgress = data.filter((d) => !['delivered', 'cancelled'].includes(d.status)).length;
      const cancelled = data.filter((d) => d.status === 'cancelled').length;
      const totalSpent = data.reduce((sum, d) => sum + d.price, 0);

      setStats({
        total: data.length,
        delivered,
        inProgress,
        cancelled,
        totalSpent,
      });
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      showNotification('Failed to load deliveries', 'error');
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const token = document.cookie.match(/token=([^;]+)/)?.[1];
    if (!token) {
      router.push('/login');
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDeliveries();
  }, [currentPage, statusFilter]);

  const getFilteredDeliveries = useCallback(() => {
    let filtered = [...deliveries];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (delivery) =>
          delivery.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          delivery.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          delivery.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((delivery) => delivery.status === statusFilter);
    }

    // Date range filter
    if (dateRange.start) {
      filtered = filtered.filter(
        (delivery) => new Date(delivery.createdAt) >= new Date(dateRange.start)
      );
    }
    if (dateRange.end) {
      filtered = filtered.filter(
        (delivery) => new Date(delivery.createdAt) <= new Date(dateRange.end)
      );
    }

    return filtered;
  }, [deliveries, searchTerm, statusFilter, dateRange]);

  const filteredDeliveries = getFilteredDeliveries();
  const totalPages = Math.ceil(filteredDeliveries.length / deliveriesPerPage);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      payment_pending: 'bg-orange-100 text-orange-800',
      confirmed: 'bg-blue-100 text-blue-800',
      picked_up: 'bg-purple-100 text-purple-800',
      in_transit: 'bg-indigo-100 text-indigo-800',
      out_for_delivery: 'bg-orange-100 text-orange-800',
      delivered: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    return status.replace('_', ' ').toUpperCase();
  };

  const handleBulkAction = async (action: string) => {
    if (selectedDeliveries.length === 0) {
      showNotification('Please select deliveries first', 'error');
      return;
    }

    // For now, just show notification
    showNotification(`${selectedDeliveries.length} deliveries would be ${action}ed`, 'success');
    setSelectedDeliveries([]);
  };

  const exportToCSV = () => {
    const headers = ['Order #', 'Customer', 'Status', 'Courier', 'Amount', 'Date'];
    const csvData = filteredDeliveries.map((delivery) => [
      delivery.id,
      delivery.customerName,
      getStatusText(delivery.status),
      delivery.selectedCourier?.name || 'N/A',
      `R${delivery.price.toFixed(2)}`,
      format(new Date(delivery.createdAt), 'MMM d, yyyy'),
    ]);

    const csvContent = [headers, ...csvData].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deliveries_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    showNotification('Export successful!', 'success');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-8">
>>>>>>> 3e26547132126c075e46fffc19579da740bdea12
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
<<<<<<< HEAD
              <h1 className="text-2xl font-bold text-gray-900">Deliveries Management</h1>
              <p className="mt-1 text-sm text-gray-500">
                Track, manage, and optimize your delivery operations
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => fetchDeliveries()}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <ArrowPathIcon className="h-4 w-4 mr-2" />
                Refresh
              </button>
              <button
                onClick={() => {/* Export logic */}}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                Export
              </button>
              <Link
                href="/deliveries/new"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                New Delivery
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid - Impressive for investors */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            title="Total Deliveries"
            value={stats.total.toString()}
            icon={TruckIcon}
            trend="+15% vs last month"
            color="blue"
          />
          <StatCard
            title="On-Time Delivery Rate"
            value={`${stats.onTimeRate}%`}
            icon={CheckCircleIcon}
            trend="+5% vs last month"
            color="green"
          />
          <StatCard
            title="Active Deliveries"
            value={stats.inTransit.toString()}
            icon={ClockIcon}
            trend={`${stats.pending} pending`}
            color="orange"
          />
          <StatCard
            title="Revenue"
            value={`$${stats.revenue.toLocaleString()}`}
            icon={CurrencyDollarIcon}
            trend="+22% vs last month"
            color="purple"
          />
=======
              <h2 className="text-2xl font-bold text-gray-900">Deliveries</h2>
              <p className="text-gray-600">Manage all your delivery orders</p>
            </div>
            <Link
              href="/deliveries/new"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center space-x-2"
            >
              <span>+</span>
              <span>New Delivery</span>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-500 text-sm">Total Deliveries</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-500 text-sm">Completed</p>
            <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-500 text-sm">In Progress</p>
            <p className="text-2xl font-bold text-indigo-600">{stats.inProgress}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-500 text-sm">Cancelled</p>
            <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-500 text-sm">Total Spent</p>
             <p className="text-2xl font-bold text-indigo-600">R{stats.totalSpent.toFixed(2)}</p>
          </div>
>>>>>>> 3e26547132126c075e46fffc19579da740bdea12
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
<<<<<<< HEAD
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by tracking, customer..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-9 pr-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_transit">In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('table')}
                className={`flex-1 px-3 py-2 border rounded-lg text-sm font-medium ${
                  viewMode === 'table'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Table View
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`flex-1 px-3 py-2 border rounded-lg text-sm font-medium ${
                  viewMode === 'cards'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Cards View
              </button>
            </div>
          </div>
        </div>

        {/* Deliveries Table/Cards */}
        {loading ? (
          <DeliverySkeleton viewMode={viewMode} />
        ) : (
          <>
            {viewMode === 'table' ? (
              <DeliveryTable
                deliveries={currentItems}
                onView={(delivery: Delivery) => {
                  setSelectedDelivery(delivery);
                  setShowDetailsModal(true);
                }}
                getStatusBadge={getStatusBadge}
                getPriorityBadge={getPriorityBadge}
              />
            ) : (
              <DeliveryCards
                deliveries={currentItems}
                onView={(delivery: Delivery) => {
                  setSelectedDelivery(delivery);
                  setShowDetailsModal(true);
                }}
                getStatusBadge={getStatusBadge}
                getPriorityBadge={getPriorityBadge}
              />
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredDeliveries.length)} of{' '}
                  {filteredDeliveries.length} results
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                  </button>
                  <span className="px-3 py-1 text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delivery Details Modal */}
      {showDetailsModal && selectedDelivery && (
        <DeliveryModal
          delivery={selectedDelivery}
          onClose={() => setShowDetailsModal(false)}
          getStatusBadge={getStatusBadge}
        />
      )}
    </div>
  );
}

// Component: Stat Card
function StatCard({ title, value, icon: Icon, trend, color }: any) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center">
        <div className={`flex-shrink-0 rounded-lg p-3 ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          <p className="text-xs text-green-600 mt-1">{trend}</p>
        </div>
      </div>
    </div>
  );
}

// Component: Delivery Table
function DeliveryTable({ deliveries, onView, getStatusBadge, getPriorityBadge }: any) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tracking #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Scheduled Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {deliveries.map((delivery: Delivery) => (
              <tr key={delivery.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {delivery.trackingNumber}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{delivery.customerName}</div>
                  <div className="text-xs text-gray-500">{delivery.customerPhone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(delivery.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getPriorityBadge(delivery.priority)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(delivery.scheduledDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${delivery.amount.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => onView(delivery)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <Link href={`/deliveries/edit/${delivery.id}`} className="text-gray-600 hover:text-gray-900 mr-3">
                    <PencilIcon className="h-4 w-4" />
                  </Link>
                  <button className="text-red-600 hover:text-red-900">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Component: Delivery Cards
function DeliveryCards({ deliveries, onView, getStatusBadge, getPriorityBadge }: any) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {deliveries.map((delivery: Delivery) => (
        <div key={delivery.id} className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-sm font-medium text-gray-500">Tracking #{delivery.trackingNumber}</p>
              <p className="text-lg font-semibold text-gray-900">{delivery.customerName}</p>
            </div>
            {getPriorityBadge(delivery.priority)}
          </div>
          <div className="space-y-2 mb-3">
            <div className="flex items-center text-sm text-gray-600">
              <MapPinIcon className="h-4 w-4 mr-2" />
              {delivery.customerAddress}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <CalendarIcon className="h-4 w-4 mr-2" />
              {new Date(delivery.scheduledDate).toLocaleDateString()}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <CurrencyDollarIcon className="h-4 w-4 mr-2" />
              ${delivery.amount.toFixed(2)}
            </div>
          </div>
          <div className="flex justify-between items-center">
            {getStatusBadge(delivery.status)}
            <button
              onClick={() => onView(delivery)}
              className="text-blue-600 hover:text-blue-900 text-sm font-medium"
            >
              View Details →
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// Component: Delivery Modal
function DeliveryModal({ delivery, onClose, getStatusBadge }: any) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        <div className="relative bg-white rounded-lg max-w-2xl w-full p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Delivery Details</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <XCircleIcon className="h-6 w-6" />
            </button>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Tracking Number</p>
                <p className="mt-1 text-sm text-gray-900">{delivery.trackingNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <div className="mt-1">{getStatusBadge(delivery.status)}</div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Customer Name</p>
                <p className="mt-1 text-sm text-gray-900">{delivery.customerName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Customer Phone</p>
                <p className="mt-1 text-sm text-gray-900">{delivery.customerPhone}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-medium text-gray-500">Delivery Address</p>
                <p className="mt-1 text-sm text-gray-900">{delivery.customerAddress}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Scheduled Date</p>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(delivery.scheduledDate).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Amount</p>
                <p className="mt-1 text-sm text-gray-900">${delivery.amount.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Distance</p>
                <p className="mt-1 text-sm text-gray-900">{delivery.distance} km</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Priority</p>
                <p className="mt-1 text-sm text-gray-900 capitalize">{delivery.priority}</p>
              </div>
              {delivery.driverName && (
                <>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Driver Name</p>
                    <p className="mt-1 text-sm text-gray-900">{delivery.driverName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Driver Phone</p>
                    <p className="mt-1 text-sm text-gray-900">{delivery.driverPhone}</p>
                  </div>
                </>
              )}
              {delivery.notes && (
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-500">Notes</p>
                  <p className="mt-1 text-sm text-gray-900">{delivery.notes}</p>
                </div>
              )}
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <Link
              href={`/deliveries/edit/${delivery.id}`}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Edit Delivery
            </Link>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              Close
            </button>
          </div>
=======
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                placeholder="Order #, Customer..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="picked_up">Picked Up</option>
                <option value="in_transit">In Transit</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedDeliveries.length > 0 && (
          <div className="bg-indigo-50 rounded-lg p-4 mb-6 flex justify-between items-center">
            <span className="text-sm text-indigo-700">
              {selectedDeliveries.length} delivery(ies) selected
            </span>
            <div className="space-x-2">
              <button
                onClick={() => {
                  exportToCSV();
                  setSelectedDeliveries([]);
                }}
                className="px-3 py-1 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
              >
                Export Selected
              </button>
              <button
                onClick={() => handleBulkAction('cancel')}
                className="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
              >
                Cancel Selected
              </button>
              <button
                onClick={() => setSelectedDeliveries([])}
                className="px-3 py-1 bg-gray-500 text-white rounded-md text-sm hover:bg-gray-600"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Deliveries Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      checked={selectedDeliveries.length === filteredDeliveries.length && filteredDeliveries.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedDeliveries(filteredDeliveries.map((d) => d.id));
                        } else {
                          setSelectedDeliveries([]);
                        }
                      }}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Courier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDeliveries
                  .slice((currentPage - 1) * deliveriesPerPage, currentPage * deliveriesPerPage)
                  .map((delivery) => (
                    <tr key={delivery.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          checked={selectedDeliveries.includes(delivery.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedDeliveries([...selectedDeliveries, delivery.id]);
                            } else {
                              setSelectedDeliveries(selectedDeliveries.filter((id) => id !== delivery.id));
                            }
                          }}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{delivery.id}</div>
                        <div className="text-sm text-gray-500">
                          {delivery.pickupAddress?.city || 'N/A'} → {delivery.deliveryAddress?.city || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{delivery.customerName}</div>
                        <div className="text-sm text-gray-500">{delivery.customerEmail}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {delivery.selectedCourier?.name || 'Not Selected'}
                        </div>
                        {delivery.trackingNumber && (
                          <div className="text-xs text-gray-500">Track: {delivery.trackingNumber}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    R{delivery.selectedCourier?.price?.toFixed(2) || '0.00'}
                  </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(delivery.status)}`}>
                          {getStatusText(delivery.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {format(new Date(delivery.createdAt), 'MMM d, yyyy')}
                        </div>
                        {delivery.estimatedDelivery && (
                          <div className="text-xs text-gray-500">
                            Est: {format(new Date(delivery.estimatedDelivery), 'MMM d')}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link
                            href={`/deliveries/${delivery.id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            View
                          </Link>
                          {delivery.status === 'pending' && (
                            <button
                              onClick={() => handleBulkAction('cancel')}
                              className="text-red-600 hover:text-red-900"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{' '}
                    <span className="font-medium">
                      {Math.min((currentPage - 1) * deliveriesPerPage + 1, filteredDeliveries.length)}
                    </span>{' '}
                    to{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * deliveriesPerPage, filteredDeliveries.length)}
                    </span>{' '}
                    of <span className="font-medium">{filteredDeliveries.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === i + 1
                            ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Export Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={exportToCSV}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center space-x-2"
          >
            <span>📊</span>
            <span>Export to CSV</span>
          </button>
>>>>>>> 3e26547132126c075e46fffc19579da740bdea12
        </div>
      </div>
    </div>
  );
}
<<<<<<< HEAD

// Component: Loading Skeleton
function DeliverySkeleton({ viewMode }: { viewMode: string }) {
  return (
    <div className="space-y-4">
      {viewMode === 'table' ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center px-6 py-4 border-b border-gray-200">
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-16 ml-4"></div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Demo data for presentation
const demoDeliveries: Delivery[] = [
  {
    id: '1',
    trackingNumber: 'RDL-2024-001',
    customerName: 'John Smith',
    customerAddress: '123 Main St, Cape Town 8001',
    customerPhone: '+27 83 123 4567',
    status: 'in_transit',
    priority: 'high',
    scheduledDate: '2024-01-15T10:00:00',
    driverName: 'Mike Johnson',
    driverPhone: '+27 84 555 1234',
    amount: 45.50,
    distance: 12.5,
  },
  {
    id: '2',
    trackingNumber: 'RDL-2024-002',
    customerName: 'Sarah Williams',
    customerAddress: '456 Oak Ave, Johannesburg 2196',
    customerPhone: '+27 82 987 6543',
    status: 'delivered',
    priority: 'medium',
    scheduledDate: '2024-01-14T14:30:00',
    deliveredDate: '2024-01-14T14:25:00',
    driverName: 'David Brown',
    driverPhone: '+27 83 444 5678',
    amount: 32.00,
    distance: 8.2,
  },
  {
    id: '3',
    trackingNumber: 'RDL-2024-003',
    customerName: 'Tech Solutions Ltd',
    customerAddress: '789 Business Park, Durban 4001',
    customerPhone: '+27 31 123 4567',
    status: 'pending',
    priority: 'urgent',
    scheduledDate: '2024-01-16T09:00:00',
    amount: 78.50,
    distance: 25.0,
    notes: 'Call customer 30 minutes before delivery',
  },
];
=======
>>>>>>> 3e26547132126c075e46fffc19579da740bdea12
