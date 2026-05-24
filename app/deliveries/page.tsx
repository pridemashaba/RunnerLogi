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
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
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
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
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
        </div>
      </div>
    </div>
  );
}
