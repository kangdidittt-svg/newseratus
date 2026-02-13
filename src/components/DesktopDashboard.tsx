import React, { useState } from 'react';
import { Search, Bell, Calendar, DollarSign, Users, Clock, CheckCircle, Plus, Filter, FolderOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { StatCard } from './ui/StatCard';
import { Sidebar } from './ui/Sidebar';

interface Project {
  id: number;
  name: string;
  client: string;
  status: 'active' | 'completed' | 'pending' | 'on-hold';
  progress: number;
  dueDate: string;
  budget: number;
}

interface Task {
  id: number;
  title: string;
  project: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed';
  dueDate: string;
}

export const DesktopDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);

  const projects: Project[] = [
    { id: 1, name: 'Website Redesign', client: 'Tech Corp', status: 'active', progress: 75, dueDate: '2024-02-15', budget: 15000 },
    { id: 2, name: 'Mobile App', client: 'StartupXYZ', status: 'active', progress: 45, dueDate: '2024-03-01', budget: 25000 },
    { id: 3, name: 'Brand Identity', client: 'Design Co', status: 'completed', progress: 100, dueDate: '2024-01-30', budget: 8000 },
    { id: 4, name: 'E-commerce Platform', client: 'Retail Inc', status: 'pending', progress: 20, dueDate: '2024-04-15', budget: 35000 },
  ];

  const tasks: Task[] = [
    { id: 1, title: 'Review design mockups', project: 'Website Redesign', priority: 'high', status: 'pending', dueDate: '2024-02-10' },
    { id: 2, title: 'Update project timeline', project: 'Mobile App', priority: 'medium', status: 'in-progress', dueDate: '2024-02-12' },
    { id: 3, title: 'Client meeting preparation', project: 'Brand Identity', priority: 'low', status: 'completed', dueDate: '2024-02-08' },
    { id: 4, title: 'Code review', project: 'E-commerce Platform', priority: 'high', status: 'pending', dueDate: '2024-02-14' },
  ];

  const notifications = [
    { id: 1, message: 'Project deadline approaching', time: '2 hours ago' },
    { id: 2, message: 'New task assigned to you', time: '4 hours ago' },
    { id: 3, message: 'Invoice payment received', time: '1 day ago' },
  ];

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Projects" 
          value={12} 
          icon={<FolderOpen size={24} />} 
          color="orange" 
          change="+2 this month"
          changeType="increase"
        />
        <StatCard 
          title="Active Tasks" 
          value={24} 
          icon={<CheckCircle size={24} />} 
          color="blue" 
          change="-3 today"
          changeType="decrease"
        />
        <StatCard 
          title="Revenue" 
          value="$89,500" 
          icon={<DollarSign size={24} />} 
          color="green" 
          change="+12% this month"
          changeType="increase"
        />
        <StatCard 
          title="Clients" 
          value={16} 
          icon={<Users size={24} />} 
          color="purple" 
          change="+4 this quarter"
          changeType="increase"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Projects</CardTitle>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Project</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Client</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Progress</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Due Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((project) => (
                      <tr key={project.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">{project.name}</div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{project.client}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            project.status === 'active' ? 'bg-orange-100 text-orange-800' :
                            project.status === 'completed' ? 'bg-green-100 text-green-800' :
                            project.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {project.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-orange-500 h-2 rounded-full" 
                                style={{ width: `${project.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600">{project.progress}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{project.dueDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">This Month</span>
                  <span className="font-semibold text-gray-900">$24,500</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Last Month</span>
                  <span className="font-semibold text-gray-900">$18,200</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Pending</span>
                  <span className="font-semibold text-orange-600">$8,300</span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-bold text-gray-900 text-lg">$51,000</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Tasks Overview</CardTitle>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tasks.slice(0, 3).map((task) => (
                  <div key={task.id} className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      task.priority === 'high' ? 'bg-red-500' :
                      task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{task.title}</p>
                      <p className="text-xs text-gray-600">{task.project}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      task.status === 'completed' ? 'bg-green-100 text-green-800' :
                      task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'projects':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
              <Button>
                <Plus size={20} className="mr-2" />
                New Project
              </Button>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
              <Button variant="outline">
                <Filter size={20} className="mr-2" />
                Filter
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card key={project.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{project.name}</CardTitle>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        project.status === 'active' ? 'bg-orange-100 text-orange-800' :
                        project.status === 'completed' ? 'bg-green-100 text-green-800' :
                        project.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{project.client}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{project.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-orange-500 h-2 rounded-full" 
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Due Date</span>
                        <span className="font-medium">{project.dueDate}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Budget</span>
                        <span className="font-medium">${project.budget.toLocaleString()}</span>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          View Details
                        </Button>
                        <Button size="sm" className="flex-1">
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      case 'tasks':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
              <Button>
                <Plus size={20} className="mr-2" />
                New Task
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Task List</CardTitle>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">All</Button>
                        <Button variant="outline" size="sm">Pending</Button>
                        <Button variant="outline" size="sm">Completed</Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {tasks.map((task) => (
                        <div key={task.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className={`w-3 h-3 rounded-full ${
                              task.priority === 'high' ? 'bg-red-500' :
                              task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                            }`}></div>
                            <div>
                              <p className="font-medium text-gray-900">{task.title}</p>
                              <p className="text-sm text-gray-600">{task.project}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600">{task.dueDate}</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              task.status === 'completed' ? 'bg-green-100 text-green-800' :
                              task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {task.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Task Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total Tasks</span>
                        <span className="font-semibold text-gray-900">24</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Completed</span>
                        <span className="font-semibold text-green-600">16</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">In Progress</span>
                        <span className="font-semibold text-blue-600">6</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Pending</span>
                        <span className="font-semibold text-gray-900">2</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );
      case 'invoices':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
              <Button>
                <Plus size={20} className="mr-2" />
                New Invoice
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Invoice List</CardTitle>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">All</Button>
                        <Button variant="outline" size="sm">Paid</Button>
                        <Button variant="outline" size="sm">Pending</Button>
                        <Button variant="outline" size="sm">Overdue</Button>
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
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Amount</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Due Date</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[1, 2, 3, 4, 5].map((invoice) => (
                            <tr key={invoice} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-4 font-medium text-gray-900">#100{invoice}</td>
                              <td className="py-3 px-4 text-gray-600">Client {invoice}</td>
                              <td className="py-3 px-4 font-medium text-gray-900">${(2500 * invoice).toLocaleString()}</td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  invoice === 1 ? 'bg-green-100 text-green-800' :
                                  invoice === 2 ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {invoice === 1 ? 'Paid' : invoice === 2 ? 'Pending' : 'Overdue'}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-gray-600">2024-02-{10 + invoice}</td>
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
              
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total Invoiced</span>
                        <span className="font-semibold text-gray-900">$125,000</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Paid</span>
                        <span className="font-semibold text-green-600">$98,500</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Pending</span>
                        <span className="font-semibold text-orange-600">$26,500</span>
                      </div>
                      <div className="border-t border-gray-200 pt-4">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-gray-900">Outstanding</span>
                          <span className="font-bold text-gray-900 text-lg">$26,500</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );
      case 'clients':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
              <Button>
                <Plus size={20} className="mr-2" />
                New Client
              </Button>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Client List</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((client) => (
                    <div key={client} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4 mb-3">
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                          <span className="text-orange-600 font-semibold">C{client}</span>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">Client {client}</h3>
                          <p className="text-sm text-gray-600">client{client}@email.com</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Projects</span>
                          <span className="font-medium">{client + 1}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Spent</span>
                          <span className="font-medium">${((client + 1) * 5000).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2 mt-4">
                        <Button variant="outline" size="sm" className="flex-1">View</Button>
                        <Button size="sm" className="flex-1">Edit</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'settings':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                        <input 
                          type="text" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                          defaultValue="John"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                        <input 
                          type="text" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                          defaultValue="Doe"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input 
                        type="email" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                        defaultValue="john.doe@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                        defaultValue="ProjectHub Inc."
                      />
                    </div>
                    <Button>Save Changes</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Email Notifications</span>
                      <input type="checkbox" className="rounded" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Push Notifications</span>
                      <input type="checkbox" className="rounded" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">SMS Notifications</span>
                      <input type="checkbox" className="rounded" />
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Plan & Billing</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <h3 className="font-semibold text-gray-900">Pro Plan</h3>
                      <p className="text-2xl font-bold text-gray-900 mt-2">$49/month</p>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Next billing</span>
                        <span className="font-medium">March 15, 2024</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment method</span>
                        <span className="font-medium">•••• 4242</span>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">Manage Billing</Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );
      case 'create':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Create New Project</h1>
            
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                        placeholder="Enter project name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Client</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500">
                        <option>Select client</option>
                        <option>Tech Corp</option>
                        <option>StartupXYZ</option>
                        <option>Design Co</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                      rows={4}
                      placeholder="Enter project description"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                      <input 
                        type="date" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                      <input 
                        type="date" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Budget</label>
                      <input 
                        type="number" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                        placeholder="Enter budget"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-4">
                    <Button variant="outline">Cancel</Button>
                    <Button>Create Project</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-600 hover:text-gray-900"
              >
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full"></span>
              </button>
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">JD</span>
              </div>
            </div>
          </div>
          
          {showNotifications && (
            <div className="absolute top-16 right-6 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.map((notification) => (
                  <div key={notification.id} className="p-4 border-b border-gray-50 hover:bg-gray-50">
                    <p className="text-sm text-gray-900">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};
