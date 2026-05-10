'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Transaction, BillingInfo } from '@/types';
import { showNotification } from '@/services/notificationService';
import { format } from 'date-fns';

export default function BillingPage() {
  const router = useRouter();
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'transactions' | 'payment-methods'>('overview');
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  const fetchBillingData = useCallback(async () => {
    try {
      const token = document.cookie.match(/token=([^;]+)/)?.[1];
      if (!token) {
        router.push('/login');
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 500));

      const mockBillingInfo: BillingInfo = {
        balance: 250.0,
        totalSpent: 1542.5,
        totalRefunds: 125.0,
        pendingPayments: 0,
        monthlySpending: [
          { month: 'Jan', amount: 245 },
          { month: 'Feb', amount: 310 },
          { month: 'Mar', amount: 280 },
          { month: 'Apr', amount: 350 },
          { month: 'May', amount: 220 },
          { month: 'Jun', amount: 137.5 },
        ],
        paymentMethods: [
          { id: 'pm_1', type: 'card', last4: '4242', isDefault: true },
          { id: 'pm_2', type: 'card', last4: '1234', isDefault: false },
        ],
      };

      const mockTransactions: Transaction[] = [
        {
          _id: '1',
          orderNumber: 'DEL-001',
          amount: 24.99,
          type: 'payment',
          status: 'completed',
          description: 'Delivery - Los Angeles to San Diego',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          paymentMethod: 'Visa ending in 4242',
        },
        {
          _id: '2',
          orderNumber: 'DEL-002',
          amount: 45.5,
          type: 'payment',
          status: 'completed',
          description: 'Delivery - San Francisco to Sacramento',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          paymentMethod: 'Visa ending in 4242',
        },
      ];

      setBillingInfo(mockBillingInfo);
      setTransactions(mockTransactions);
    } catch (error) {
      console.error('Error fetching billing data:', error);
      showNotification('Failed to load billing data', 'error');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchBillingData();
  }, [fetchBillingData]);

  const handleAddFunds = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      showNotification('Please enter a valid amount', 'error');
      return;
    }

    showNotification(`Would process R${depositAmount} deposit via Stripe`, 'success');
    setShowAddFunds(false);
    setDepositAmount('');
  };

  const handleSetDefaultPayment = async (_: string) => {
    showNotification('Default payment method updated', 'success');
    fetchBillingData();
  };

  const handleRemovePaymentMethod = async (methodId: string) => {
    if (!confirm('Are you sure you want to remove this payment method?')) return;
    showNotification('Payment method removed', 'success');
    setBillingInfo((prev) =>
      prev
        ? {
            ...prev,
            paymentMethods: prev.paymentMethods.filter((m) => m.id !== methodId),
          }
        : null
    );
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return '💳';
      case 'refund':
        return '↩️';
      case 'deposit':
        return '💰';
      default:
        return '📝';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!billingInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600">Failed to load billing information</p>
      </div>
    );
  }

  const maxAmount = Math.max(...billingInfo.monthlySpending.map((m) => m.amount));

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Billing & Payments</h2>
          <p className="text-gray-600">Manage your balance, transactions, and payment methods</p>
        </div>

        {/* Balance Card */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-lg p-6 mb-8 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-indigo-100 text-sm">Available Balance</p>
              <p className="text-4xl font-bold mt-1">${billingInfo.balance.toFixed(2)}</p>
              <p className="text-indigo-100 text-sm mt-2">Ready to use for deliveries</p>
            </div>
            <button
              onClick={() => setShowAddFunds(true)}
              className="bg-white text-indigo-600 px-4 py-2 rounded-md hover:bg-indigo-50 font-medium"
            >
              Add Funds
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {(['overview', 'transactions', 'payment-methods'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === tab
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab === 'overview' && 'Overview'}
                {tab === 'transactions' && 'Transaction History'}
                {tab === 'payment-methods' && 'Payment Methods'}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {selectedTab === 'overview' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-500 text-sm">Total Spent</p>
                 <p className="text-2xl font-bold text-gray-900">R{billingInfo.totalSpent.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-1">Lifetime</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-500 text-sm">Pending Payments</p>
                 <p className="text-2xl font-bold text-yellow-600">R{billingInfo.pendingPayments.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-1">Awaiting confirmation</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-500 text-sm">Total Refunds</p>
                 <p className="text-2xl font-bold text-green-600">R{billingInfo.totalRefunds.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-1">Processed refunds</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-500 text-sm">Active Payment Methods</p>
                <p className="text-2xl font-bold text-indigo-600">{billingInfo.paymentMethods.length}</p>
                <p className="text-xs text-gray-500 mt-1">Cards & accounts</p>
              </div>
            </div>

            {/* Monthly Spending Chart */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Monthly Spending</h3>
                <select
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value as 'week' | 'month' | 'year')}
                >
                  <option value="week">Last 7 days</option>
                  <option value="month">Last 30 days</option>
                  <option value="year">Last 12 months</option>
                </select>
              </div>
              {maxAmount > 0 ? (
                <div className="h-64 flex items-end space-x-2">
                  {billingInfo.monthlySpending.map((item, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-indigo-600 rounded-t hover:bg-indigo-700 transition-all relative"
                        style={{ height: `${(item.amount / maxAmount) * 200}px` }}
                      >
                        <div className="text-center text-xs text-white -mt-6">R{item.amount.toFixed(2)}</div>
                      </div>
                      <div className="text-xs text-gray-600 mt-2">{item.month}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No spending data available</p>
              )}
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-semibold">Recent Transactions</h3>
              </div>
              <div className="divide-y">
                {transactions.slice(0, 5).map((transaction) => (
                  <div key={transaction._id} className="px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{getTransactionIcon(transaction.type)}</div>
                      <div>
                        <p className="font-medium text-gray-900">{transaction.description}</p>
                        <p className="text-sm text-gray-500">{format(new Date(transaction.createdAt), 'MMM d, yyyy')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                        <p
                          className={`font-semibold ${
                            transaction.type === 'refund'
                              ? 'text-green-600'
                              : transaction.type === 'payment'
                              ? 'text-red-600'
                              : 'text-indigo-600'
                          }`}
                        >
                          {transaction.type === 'refund' ? '+' : transaction.type === 'payment' ? '-' : '+'}
                          R{transaction.amount.toFixed(2)}
                        </p>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Transactions Tab */}
        {selectedTab === 'transactions' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Method</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {format(new Date(transaction.createdAt), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{transaction.description}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{transaction.orderNumber || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`font-semibold ${
                            transaction.type === 'refund'
                              ? 'text-green-600'
                              : transaction.type === 'payment'
                              ? 'text-red-600'
                              : 'text-indigo-600'
                          }`}
                        >
                          {transaction.type === 'refund' ? '+' : transaction.type === 'payment' ? '-' : '+'}
                          R{transaction.amount.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{transaction.paymentMethod || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Payment Methods Tab */}
        {selectedTab === 'payment-methods' && (
          <div className="space-y-6">
            {/* Add Payment Method Button */}
            <div className="bg-white rounded-lg shadow p-6">
              <button
                onClick={() => showNotification('Stripe integration would open here', 'info')}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
              >
                <div className="text-2xl mb-2">➕</div>
                <p className="text-gray-600 font-medium">Add New Payment Method</p>
                <p className="text-sm text-gray-500">Credit card, debit card, or bank account</p>
              </button>
            </div>

            {/* Existing Payment Methods */}
            {billingInfo.paymentMethods.map((method) => (
              <div key={method.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl">{method.type === 'card' ? '💳' : '🏦'}</div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {method.type === 'card' ? 'Credit/Debit Card' : 'Bank Account'}
                      </p>
                      <p className="text-sm text-gray-600">•••• {method.last4}</p>
                      {method.isDefault && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Default</span>
                      )}
                    </div>
                  </div>
                  <div className="space-x-2">
                    {!method.isDefault && (
                      <button
                        onClick={() => handleSetDefaultPayment(method.id)}
                        className="text-indigo-600 hover:text-indigo-900 text-sm"
                      >
                        Set as Default
                      </button>
                    )}
                    <button
                      onClick={() => handleRemovePaymentMethod(method.id)}
                      className="text-red-600 hover:text-red-900 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Billing history note */}
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                💡 All transactions are securely processed through Stripe. Your payment information is never stored on our
                servers.
              </p>
            </div>
          </div>
        )}

        {/* Add Funds Modal */}
        {showAddFunds && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold mb-4">Add Funds to Balance</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (ZAR)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">R</span>
                  <input
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    min="10"
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Minimum deposit: R10.00</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleAddFunds}
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700"
                >
                  Continue to Payment
                </button>
                <button
                  onClick={() => setShowAddFunds(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
