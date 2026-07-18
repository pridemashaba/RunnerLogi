'use client';

import { useState, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import {
  CreditCard,
  Download,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Printer,
  Mail,
  ChevronDown,
  Settings,
} from 'lucide-react';

interface Invoice {
  id: string;
  invoice_number: string;
  date: string;
  due_date: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  description: string;
  delivery_count: number;
  pdf_url?: string;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank';
  last4: string;
  expiry_date?: string;
  brand?: string;
  is_default: boolean;
}

interface BillingSummary {
  current_balance: number;
  total_deliveries_this_month: number;
  monthly_spend: number;
  average_delivery_cost: number;
  next_billing_date: string;
}

const invoices: Invoice[] = [
  {
    id: 'inv_001',
    invoice_number: 'INV-2026-001',
    date: '2026-06-01',
    due_date: '2026-06-15',
    amount: 128.5,
    status: 'paid',
    description: 'Delivery fees for May',
    delivery_count: 18,
  },
  {
    id: 'inv_002',
    invoice_number: 'INV-2026-002',
    date: '2026-06-08',
    due_date: '2026-06-22',
    amount: 74.25,
    status: 'pending',
    description: 'Delivery fees for current month',
    delivery_count: 9,
  },
  {
    id: 'inv_003',
    invoice_number: 'INV-2026-003',
    date: '2026-05-01',
    due_date: '2026-05-15',
    amount: 42.0,
    status: 'overdue',
    description: 'Late delivery fee adjustment',
    delivery_count: 4,
  },
];

const paymentMethods: PaymentMethod[] = [
  {
    id: 'pm_001',
    type: 'card',
    last4: '4242',
    expiry_date: '12/28',
    brand: 'Visa',
    is_default: true,
  },
];

const summaries: Record<'month' | 'quarter' | 'year', BillingSummary> = {
  month: {
    current_balance: 74.25,
    total_deliveries_this_month: 9,
    monthly_spend: 202.75,
    average_delivery_cost: 22.53,
    next_billing_date: '2026-07-01',
  },
  quarter: {
    current_balance: 74.25,
    total_deliveries_this_month: 31,
    monthly_spend: 612.4,
    average_delivery_cost: 19.75,
    next_billing_date: '2026-07-01',
  },
  year: {
    current_balance: 74.25,
    total_deliveries_this_month: 126,
    monthly_spend: 2488.9,
    average_delivery_cost: 19.75,
    next_billing_date: '2026-07-01',
  },
};

export default function BillingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);

  const summary = useMemo(() => summaries[billingPeriod], [billingPeriod]);

  const downloadInvoicePdf = (invoice: Invoice) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(22);
    doc.text('RunnerLogi Invoice', 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(90, 90, 90);
    doc.text('Billing & Invoices', 14, 28);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`Invoice #: ${invoice.invoice_number}`, 14, 46);
    doc.text(`Date: ${new Date(invoice.date).toLocaleDateString()}`, 14, 56);
    doc.text(`Due Date: ${new Date(invoice.due_date).toLocaleDateString()}`, 14, 66);
    doc.text(`Status: ${invoice.status}`, 14, 76);

    doc.setDrawColor(220, 220, 220);
    doc.line(14, 84, pageWidth - 14, 84);

    doc.setFontSize(11);
    doc.text('Description', 14, 104);
    doc.text(invoice.description, 14, 114);

    doc.text('Delivery Count', 14, 140);
    doc.text(String(invoice.delivery_count), 14, 150);

    doc.setFontSize(16);
    doc.text(`Total Due: $${invoice.amount.toFixed(2)}`, 14, 180);

    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text('Thank you for using RunnerLogi.', 14, 220);

    doc.save(`${invoice.invoice_number}.pdf`);
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    if (invoice.pdf_url) {
      window.open(invoice.pdf_url, '_blank');
      return;
    }

    downloadInvoicePdf(invoice);
  };

  const handleExportInvoices = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(20);
    doc.text('RunnerLogi Invoice History', 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(90, 90, 90);
    doc.text(`Exported: ${new Date().toLocaleString()}`, 14, 30);

    let y = 50;
    doc.setTextColor(0, 0, 0);
    invoices.forEach((invoice) => {
      if (y > 260) {
        doc.addPage();
        y = 30;
      }

      doc.setFontSize(10);
      doc.text(invoice.invoice_number, 14, y);
      doc.text(new Date(invoice.date).toLocaleDateString(), 55, y);
      doc.text(new Date(invoice.due_date).toLocaleDateString(), 100, y);
      doc.text(String(invoice.delivery_count), 145, y);
      doc.text(`$${invoice.amount.toFixed(2)}`, 175, y);
      doc.text(invoice.status, pageWidth - 34, y, { align: 'right' });
      y += 12;
    });

    doc.save('invoice-history.pdf');
  };

  const handlePayInvoice = (invoiceId: string) => {
    window.location.href = `/billing/pay/${invoiceId}`;
  };

  const getStatusBadge = (status: Invoice['status']) => {
    const config = {
      paid: { icon: CheckCircle, color: 'text-green-600 bg-green-50', text: 'Paid' },
      pending: { icon: Clock, color: 'text-yellow-600 bg-yellow-50', text: 'Pending' },
      overdue: { icon: AlertCircle, color: 'text-red-600 bg-red-50', text: 'Overdue' },
      cancelled: { icon: XCircle, color: 'text-gray-600 bg-gray-50', text: 'Cancelled' },
    };
    const { icon: Icon, color, text } = config[status];

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${color}`}>
        <Icon className="w-3 h-3" />
        {text}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Billing & Invoices</h1>
          <p className="text-gray-600 mt-2">Manage your payments, view invoices, and update billing information</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Current Balance</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">${summary.current_balance.toFixed(2)}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            {summary.current_balance > 0 && (
              <button className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium">Pay Now →</button>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Spend</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">${summary.monthly_spend.toFixed(2)}</p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <CreditCard className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">{summary.total_deliveries_this_month} deliveries this month</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Delivery Cost</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">${summary.average_delivery_cost.toFixed(2)}</p>
              </div>
              <div className="bg-purple-100 rounded-full p-3">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Next Billing Date</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {new Date(summary.next_billing_date).toLocaleDateString()}
                </p>
              </div>
              <div className="bg-orange-100 rounded-full p-3">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <h2 className="text-lg font-semibold text-gray-900">Invoice History</h2>
                  <div className="flex items-center gap-2">
                    <select
                      value={billingPeriod}
                      onChange={(e) => setBillingPeriod(e.target.value as 'month' | 'quarter' | 'year')}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="month">Last 30 days</option>
                      <option value="quarter">Last 3 months</option>
                      <option value="year">Last 12 months</option>
                    </select>
                    <button
                      onClick={handleExportInvoices}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                    >
                      <Download className="w-4 h-4 inline mr-1" />
                      Export
                    </button>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Invoice #
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Due Date
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Deliveries
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {invoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setSelectedInvoice(invoice)}
                            className="font-mono text-sm font-medium text-blue-600 hover:text-blue-700"
                          >
                            {invoice.invoice_number}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(invoice.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(invoice.due_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{invoice.delivery_count}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">${invoice.amount.toFixed(2)}</td>
                        <td className="px-6 py-4">{getStatusBadge(invoice.status)}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleDownloadInvoice(invoice)}
                              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                              title="Download invoice"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            {invoice.status === 'pending' && (
                              <button
                                onClick={() => handlePayInvoice(invoice.id)}
                                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                Pay Now
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Payment Methods</h2>
                  <button
                    onClick={() => setShowAddPaymentModal(true)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    + Add New
                  </button>
                </div>
                <div className="space-y-3">
                  {paymentMethods.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No payment methods added yet</p>
                  ) : (
                    paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <CreditCard className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {method.brand || 'Card'} •••• {method.last4}
                            </p>
                            {method.expiry_date && <p className="text-xs text-gray-500">Expires {method.expiry_date}</p>}
                          </div>
                        </div>
                        {method.is_default && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Default</span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Billing Settings</h2>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Settings className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-700">Auto-pay Settings</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>
                  <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-700">Email Invoices to</span>
                    </div>
                    <span className="text-sm text-gray-600">user@example.com</span>
                  </button>
                  <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Printer className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-700">Billing Address</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-2">Need help with billing?</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Our support team is here to help you with any billing questions.
                </p>
                <button className="w-full bg-white text-blue-600 font-medium px-4 py-2 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors">
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-lg w-full mx-4 p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{selectedInvoice.invoice_number}</h3>
                <p className="text-sm text-gray-500">{selectedInvoice.description}</p>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close invoice details"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Date</span>
                <span>{new Date(selectedInvoice.date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Due date</span>
                <span>{new Date(selectedInvoice.due_date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Deliveries</span>
                <span>{selectedInvoice.delivery_count}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-gray-900">Total</span>
                <span>${selectedInvoice.amount.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex gap-3 pt-6">
              <button
                onClick={() => handleDownloadInvoice(selectedInvoice)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Download
              </button>
              {selectedInvoice.status === 'pending' && (
                <button
                  onClick={() => handlePayInvoice(selectedInvoice.id)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Pay Now
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showAddPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Add Payment Method</h3>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                setShowAddPaymentModal(false);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                  <input
                    type="text"
                    placeholder="123"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="default-payment" className="rounded border-gray-300" />
                <label htmlFor="default-payment" className="text-sm text-gray-700">
                  Set as default payment method
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddPaymentModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Add Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
