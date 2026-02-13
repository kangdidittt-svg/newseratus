import React, { useState } from 'react';
import { Search, Filter, Plus, Calendar, CheckCircle, Clock, AlertCircle, Edit3, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { StatCard } from './ui/StatCard';

interface Task {
  id: number;
  title: string;
  description: string;
  project: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed';
  dueDate: string;
  assignee: string;
  createdAt: string;
}

export const TasksPage: React.FC<{ isMobile: boolean }> = ({ isMobile }) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);

  const [tasks, setTasks] = useState<Task[]>([
    { 
      id: 1, 
      title: 'Review design mockups', 
      description: 'Review and provide feedback on the latest design mockups for the website',
      project: 'Website Redesign', 
      priority: 'high', 
      status: 'pending', 
      dueDate: '2024-02-10', 
      assignee: 'John Doe',
      createdAt: '2024-02-01'
    },
    { 
      id: 2, 
      title: 'Update project timeline', 
      description: 'Update the project timeline based on recent client feedback',
      project: 'Mobile App', 
      priority: 'medium', 
      status: 'in-progress', 
      dueDate: '2024-02-12', 
      assignee: 'Jane Smith',
      createdAt: '2024-02-02'
    },
    { 
      id: 3, 
      title: 'Client meeting preparation', 
      description: 'Prepare presentation materials for upcoming client meeting',
      project: 'Brand Identity', 
      priority: 'low', 
      status: 'completed', 
      dueDate: '2024-02-08', 
      assignee: 'Mike Johnson',
      createdAt: '2024-02-03'
    },
    { 
      id: 4, 
      title: 'Code review', 
      description: 'Review code changes for the new API endpoints',
      project: 'API Development', 
      priority: 'high', 
      status: 'pending', 
      dueDate: '2024-02-14', 
      assignee: 'Sarah Wilson',
      createdAt: '2024-02-04'
    },
    { 
      id: 5, 
      title: 'Database optimization', 
      description: 'Optimize database queries for better performance',
      project: 'E-commerce Platform', 
      priority: 'medium', 
      status: 'in-progress', 
      dueDate: '2024-02-16', 
      assignee: 'David Brown',
      createdAt: '2024-02-05'
    },
    { 
      id: 6, 
      title: 'Testing documentation', 
      description: 'Create comprehensive testing documentation for the project',
      project: 'Mobile App', 
      priority: 'low', 
      status: 'pending', 
      dueDate: '2024-02-18', 
      assignee: 'Lisa Davis',
      createdAt: '2024-02-06'
    },
  ]);

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.assignee.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesPriority && matchesSearch;
  });

  const toggleTaskStatus = (taskId: number) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const newStatus = task.status === 'completed' ? 'pending' : 'completed';
        return { ...task, status: newStatus };
      }
      return task;
    }));
  };

  const deleteTask = (taskId: number) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityDot = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (isMobile) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <Button size="sm" onClick={() => setShowAddTask(true)}>
            <Plus size={16} className="mr-1" />
            New
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
          />
        </div>

        <div className="flex space-x-2 overflow-x-auto pb-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
              statusFilter === 'all' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({tasks.length})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
              statusFilter === 'pending' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pending ({tasks.filter(t => t.status === 'pending').length})
          </button>
          <button
            onClick={() => setStatusFilter('in-progress')}
            className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
              statusFilter === 'in-progress' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            In Progress ({tasks.filter(t => t.status === 'in-progress').length})
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
              statusFilter === 'completed' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Completed ({tasks.filter(t => t.status === 'completed').length})
          </button>
        </div>

        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <Card key={task.id}>
              <CardContent className="p-4">
                <div className="flex items-start space-x-3 mb-3">
                  <button
                    onClick={() => toggleTaskStatus(task.id)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 ${
                      task.status === 'completed' 
                        ? 'bg-orange-500 border-orange-500 text-white' 
                        : 'border-gray-300 hover:border-orange-500'
                    }`}
                  >
                    {task.status === 'completed' && <CheckCircle size={12} />}
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`font-semibold ${
                        task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'
                      }`}>
                        {task.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <p className={`text-sm mb-2 ${
                      task.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-600'
                    }`}>
                      {task.description}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <span className="text-gray-600">{task.project}</span>
                        <span className="text-gray-600">{task.assignee}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Calendar size={14} className="mr-1" />
                        {task.dueDate}
                      </div>
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
        <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
        <Button onClick={() => setShowAddTask(true)}>
          <Plus size={20} className="mr-2" />
          New Task
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard 
          title="Total Tasks" 
          value={tasks.length} 
          icon={<CheckCircle size={24} />} 
          color="orange" 
        />
        <StatCard 
          title="Pending" 
          value={tasks.filter(t => t.status === 'pending').length} 
          icon={<Clock size={24} />} 
          color="orange" 
        />
        <StatCard 
          title="In Progress" 
          value={tasks.filter(t => t.status === 'in-progress').length} 
          icon={<AlertCircle size={24} />} 
          color="blue" 
        />
        <StatCard 
          title="Completed" 
          value={tasks.filter(t => t.status === 'completed').length} 
          icon={<CheckCircle size={24} />} 
          color="green" 
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Task Management</CardTitle>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search tasks..."
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
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="all">All Priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => toggleTaskStatus(task.id)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      task.status === 'completed' 
                        ? 'bg-orange-500 border-orange-500 text-white' 
                        : 'border-gray-300 hover:border-orange-500'
                    }`}
                  >
                    {task.status === 'completed' && <CheckCircle size={12} />}
                  </button>
                  <div className={`w-3 h-3 rounded-full ${getPriorityDot(task.priority)}`}></div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-1">
                      <h3 className={`font-medium ${
                        task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'
                      }`}>
                        {task.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </div>
                    <p className={`text-sm mb-2 ${
                      task.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-600'
                    }`}>
                      {task.description}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{task.project}</span>
                      <span>•</span>
                      <span>{task.assignee}</span>
                      <span>•</span>
                      <div className="flex items-center">
                        <Calendar size={14} className="mr-1" />
                        {task.dueDate}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="text-gray-400 hover:text-blue-500">
                    <Edit3 size={16} />
                  </button>
                  <button 
                    onClick={() => deleteTask(task.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
