import React, { useState } from 'react';
import { Search, Filter, Plus, Calendar, DollarSign, FileText, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { StatCard } from './ui/StatCard';

interface Invoice {
  id: number;
  invoiceNumber: string;
  client: string;
  project: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue' | 'draft';
  dueDate: string;
  issueDate: string;
  items: number;
}

export const InvoicesPage: React.FC<{ isMobile: boolean }> = ({ isMobile }) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const invoices: Invoice[] = [
    { 
      id: 1, 
      invoiceNumber: 'INV-2024-001', 
      client: 'Tech Corp', 
      project: 'Website Redesign', 
      amount: 15000, 
      status: 'paid', 
      dueDate: '2024-02-15', 
      issueDate: '2024-01-15',
      items: 8
    },
    { 
      id: 2, 
      invoiceNumber: 'INV-2024-002', 
      client: 'StartupXYZ', 
      project: 'Mobile App', 
      amount: 25000, 
      status: 'pending', 
      dueDate: '2024-03-01', 
      issueDate: '2024-02-01',
      items: 12
    },
    { 
      id: 3, 
      invoiceNumber: 'INV-2024-003', 
      client: 'Design Co', 
      project: 'Brand Identity', 
      amount: 8000, 
      status: 'overdue', 
      dueDate: '2024-01-30', 
      issueDate: '2024-01-01',
      items: 5
    },
    { 
      id: 4, 
      invoiceNumber: 'INV-2024-004', 
      client: 'Retail Inc', 
      project: 'E-commerce Platform', 
      amount: 35000, 
      status: 'draft', 
      dueDate: '2024-04-15', 
      issueDate: '2024-03-15',
      items: 15
    },
    { 
      id: 5, 
      invoiceNumber: 'INV-2024-005', 
      client: 'Ad Agency', 
      project: 'Marketing Campaign', 
      amount: 12000, 
      status: 'pending', 
      dueDate: '2024-02-28', 
      issueDate: '2024-02-01',
      items: 6
    },
    { 
      id: 6, 
      invoiceNumber: 'INV-2024-006', 
      client: 'Tech Solutions', 
      project: 'API Development', 
      amount: 18000, 
      status: 'paid', 
      dueDate: '2024-03-10', 
      issueDate: '2024-02-10',
      items: 10
    },
  ];

  const filteredInvoices = invoices.filter(invoice => {
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.project.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const statusOptions = [
    { value: 'all', label: 'All Invoices', count: invoices.length },
    { value: 'paid', label: 'Paid', count: invoices.filter(i => i.status === 'paid').length },
    { value: 'pending', label: 'Pending', count: invoices.filter(i => i.status === 'pending').length },
    { value: 'overdue', label: 'Overdue', count: invoices.filter(i => i.status === 'overdue').length },
    { value: 'draft', label: 'Draft', count: invoices.filter(i => i.status === 'draft').length },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle size={16} className="text-green-600" />;
      case 'pending': return <Clock size={16} className="text-yellow-600" />;
      case 'overdue': return <Calendar size={16} className="text-red-600" />;
      default: return <FileText size={16} className="text-gray-600" />;
    }
  };

  if (isMobile) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <Button size="sm">
            <Plus size={16} className="mr-1" />
            New
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
          />
        </div>

        <div className="flex space-x-2 overflow-x-auto pb-2">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setStatusFilter(option.value)}
              className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                statusFilter === option.value
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {option.label} ({option.count})
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredInvoices.map((invoice) => (
            <Card key={invoice.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{invoice.invoiceNumber}</h3>
                    <p className="text-sm text-gray-600">{invoice.project}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(invoice.status)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Client</span>
                    <span className="font-medium">{invoice.client}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Items</span>
                    <span className="font-medium">{invoice.items}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">${invoice.amount.toLocaleString()}</span>
                  <div className="text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar size={16} className="mr-1" />
                      Due: {invoice.dueDate}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
        <Button>
          <Plus size={20} className="mr-2" />
          New Invoice
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard 
          title="Total Invoiced" 
          value={`$${invoices.reduce((sum, i) => sum + i.amount, 0).toLocaleString()}`} 
          icon={<DollarSign size={24} />} 
          color="orange" 
        />
        <StatCard 
          title="Paid" 
          value={`$${invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0).toLocaleString()}`} 
          icon={<CheckCircle size={24} />} 
          color="green" 
        />
        <StatCard 
          title="Pending" 
          value={`$${invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.amount, 0).toLocaleString()}`} 
          icon={<Clock size={24} />} 
          color="orange" 
        />
        <StatCard 
          title="Overdue" 
          value={`$${invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.amount, 0).toLocaleString()}`} 
          icon={<Calendar size={24} />} 
          color="red" 
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Invoice Management</CardTitle>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label} ({option.count})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Invoice #</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Client</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Project</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Due Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{invoice.invoiceNumber}</td>
                    <td className="py-3 px-4 text-gray-600">{invoice.client}</td>
                    <td className="py-3 px-4 text-gray-600">{invoice.project}</td>
                    <td className="py-3 px-4 font-medium text-gray-900">${invoice.amount.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(invoice.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                          {invoice.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{invoice.dueDate}</td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">View</Button>
                        <Button size="sm">Edit</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
