import React, { useState } from 'react';
import { Search, Filter, Plus, Calendar, DollarSign, Users, FolderOpen, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { StatCard } from './ui/StatCard';

interface Project {
  id: number;
  name: string;
  client: string;
  status: 'active' | 'completed' | 'pending' | 'on-hold';
  progress: number;
  dueDate: string;
  budget: number;
  description: string;
}

export const ProjectsPage: React.FC<{ isMobile: boolean }> = ({ isMobile }) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const projects: Project[] = [
    { 
      id: 1, 
      name: 'Website Redesign', 
      client: 'Tech Corp', 
      status: 'active', 
      progress: 75, 
      dueDate: '2024-02-15', 
      budget: 15000,
      description: 'Complete redesign of company website with modern UI/UX'
    },
    { 
      id: 2, 
      name: 'Mobile App', 
      client: 'StartupXYZ', 
      status: 'active', 
      progress: 45, 
      dueDate: '2024-03-01', 
      budget: 25000,
      description: 'Native mobile application for iOS and Android platforms'
    },
    { 
      id: 3, 
      name: 'Brand Identity', 
      client: 'Design Co', 
      status: 'completed', 
      progress: 100, 
      dueDate: '2024-01-30', 
      budget: 8000,
      description: 'Complete brand identity package including logo and guidelines'
    },
    { 
      id: 4, 
      name: 'E-commerce Platform', 
      client: 'Retail Inc', 
      status: 'pending', 
      progress: 20, 
      dueDate: '2024-04-15', 
      budget: 35000,
      description: 'Full-featured e-commerce solution with payment integration'
    },
    { 
      id: 5, 
      name: 'Marketing Campaign', 
      client: 'Ad Agency', 
      status: 'on-hold', 
      progress: 30, 
      dueDate: '2024-02-28', 
      budget: 12000,
      description: 'Digital marketing campaign with social media integration'
    },
    { 
      id: 6, 
      name: 'API Development', 
      client: 'Tech Solutions', 
      status: 'active', 
      progress: 60, 
      dueDate: '2024-03-10', 
      budget: 18000,
      description: 'RESTful API development for mobile app backend'
    },
  ];

  const filteredProjects = projects.filter(project => {
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.client.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const statusOptions = [
    { value: 'all', label: 'All Projects', count: projects.length },
    { value: 'active', label: 'Active', count: projects.filter(p => p.status === 'active').length },
    { value: 'completed', label: 'Completed', count: projects.filter(p => p.status === 'completed').length },
    { value: 'pending', label: 'Pending', count: projects.filter(p => p.status === 'pending').length },
    { value: 'on-hold', label: 'On Hold', count: projects.filter(p => p.status === 'on-hold').length },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'on-hold': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isMobile) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <Button size="sm">
            <Plus size={16} className="mr-1" />
            New
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search projects..."
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
          {filteredProjects.map((project) => (
            <Card key={project.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{project.name}</h3>
                    <p className="text-sm text-gray-600">{project.client}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">{project.description}</p>
                
                <div className="mb-3">
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
                  <div className="flex items-center text-gray-600">
                    <Calendar size={16} className="mr-1" />
                    {project.dueDate}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <DollarSign size={16} className="mr-1" />
                    ${project.budget.toLocaleString()}
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
        <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
        <Button>
          <Plus size={20} className="mr-2" />
          New Project
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard 
          title="Total Projects" 
          value={projects.length} 
          icon={<FolderOpen size={24} />} 
          color="orange" 
        />
        <StatCard 
          title="Active Projects" 
          value={projects.filter(p => p.status === 'active').length} 
          icon={<Users size={24} />} 
          color="blue" 
        />
        <StatCard 
          title="Completed" 
          value={projects.filter(p => p.status === 'completed').length} 
          icon={<CheckCircle size={24} />} 
          color="green" 
        />
        <StatCard 
          title="Total Budget" 
          value={`$${projects.reduce((sum, p) => sum + p.budget, 0).toLocaleString()}`} 
          icon={<DollarSign size={24} />} 
          color="purple" 
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Project Management</CardTitle>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search projects..."
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
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Project</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Client</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Progress</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Due Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Budget</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((project) => (
                  <tr key={project.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{project.name}</div>
                        <div className="text-sm text-gray-600">{project.description}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{project.client}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
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
                    <td className="py-3 px-4 font-medium text-gray-900">${project.budget.toLocaleString()}</td>
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
