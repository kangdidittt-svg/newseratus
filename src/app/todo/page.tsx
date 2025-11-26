'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { CheckSquare, Edit, Trash2, Undo2, Plus } from 'lucide-react';

interface ProjectOption {
  _id: string;
  title: string;
  client?: string;
}

interface TodoItem {
  _id: string;
  title: string;
  projectId?: string;
  notes?: string;
  dueDateStr: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'done';
}

type FilterTab = 'today' | 'tomorrow' | 'upcoming' | 'all';

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function addDaysStr(base: string, days: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function TodoPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [filter, setFilter] = useState<FilterTab>('today');
  const [quickInput, setQuickInput] = useState('');
  const [form, setForm] = useState<{ title: string; projectId?: string; notes?: string; dueDateStr: string; priority: 'low'|'medium'|'high'; }>({
    title: '',
    projectId: undefined,
    notes: '',
    dueDateStr: todayStr(),
    priority: 'medium'
  });
  const [editing, setEditing] = useState<TodoItem | null>(null);
  const [undo, setUndo] = useState<{ item: TodoItem; timeoutId: number } | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    fetchTodos(filter);
  }, [filter]);

  useEffect(() => {
    const handler = () => fetchTodos('today');
    window.addEventListener('todos:updated', handler);
    const interval = setInterval(() => handler(), 5 * 60 * 1000);
    return () => {
      window.removeEventListener('todos:updated', handler);
      clearInterval(interval);
    };
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects?limit=100', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
      }
    } catch (e) {
      console.error('Load projects error', e);
    }
  };

  const fetchTodos = async (flt: FilterTab) => {
    try {
      const res = await fetch(`/api/todos?filter=${flt}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setTodos(data.todos || []);
      }
    } catch (e) {
      console.error('Load todos error', e);
    }
  };

  const projectName = useMemo(() => {
    const map = new Map(projects.map(p => [p._id, p.title]));
    return (id?: string) => (id && map.get(id)) || '';
  }, [projects]);

  const submitQuickAdd = async () => {
    const title = quickInput.trim();
    if (!title) return;
    try {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title, dueDateStr: todayStr(), priority: 'medium' })
      });
      if (res.ok) {
        setQuickInput('');
        fetchTodos(filter);
        window.dispatchEvent(new Event('todos:updated'));
      }
    } catch (e) {
      console.error('Quick add error', e);
    }
  };

  const submitForm = async () => {
    if (!form.title.trim()) return;
    try {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setForm({ title: '', projectId: undefined, notes: '', dueDateStr: todayStr(), priority: 'medium' });
        fetchTodos(filter);
        window.dispatchEvent(new Event('todos:updated'));
      }
    } catch (e) {
      console.error('Add task error', e);
    }
  };

  const addTomorrow = async () => {
    const tomorrow = addDaysStr(todayStr(), 1);
    if (!form.title.trim()) return;
    try {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...form, dueDateStr: tomorrow })
      });
      if (res.ok) {
        setForm({ title: '', projectId: undefined, notes: '', dueDateStr: todayStr(), priority: 'medium' });
        fetchTodos(filter);
        window.dispatchEvent(new Event('todos:updated'));
      }
    } catch (e) {
      console.error('Add tomorrow error', e);
    }
  };

  const toggleDone = async (todo: TodoItem) => {
    try {
      const res = await fetch(`/api/todos/${todo._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: todo.status === 'done' ? 'pending' : 'done' })
      });
      if (res.ok) {
        setTodos(prev => prev.map(t => t._id === todo._id ? { ...t, status: t.status === 'done' ? 'pending' : 'done' } : t));
        window.dispatchEvent(new Event('todos:updated'));
      }
    } catch (e) {
      console.error('Toggle error', e);
    }
  };

  const deleteTodo = async (todo: TodoItem) => {
    try {
      const res = await fetch(`/api/todos/${todo._id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) {
        setTodos(prev => prev.filter(t => t._id !== todo._id));
        const timeoutId = window.setTimeout(() => setUndo(null), 5000);
        setUndo({ item: todo, timeoutId });
        window.dispatchEvent(new Event('todos:updated'));
      }
    } catch (e) {
      console.error('Delete error', e);
    }
  };

  const undoDelete = async () => {
    if (!undo) return;
    window.clearTimeout(undo.timeoutId);
    try {
      const { item } = undo;
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: item.title,
          notes: item.notes,
          projectId: item.projectId,
          dueDateStr: item.dueDateStr,
          priority: item.priority
        })
      });
      if (res.ok) {
        setUndo(null);
        fetchTodos(filter);
        window.dispatchEvent(new Event('todos:updated'));
      }
    } catch (e) {
      console.error('Undo error', e);
    }
  };

  const startEdit = (todo: TodoItem) => {
    setEditing(todo);
    setForm({ title: todo.title, projectId: todo.projectId, notes: todo.notes, dueDateStr: todo.dueDateStr, priority: todo.priority });
  };

  const saveEdit = async () => {
    if (!editing) return;
    try {
      const res = await fetch(`/api/todos/${editing._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setEditing(null);
        setForm({ title: '', projectId: undefined, notes: '', dueDateStr: todayStr(), priority: 'medium' });
        fetchTodos(filter);
        window.dispatchEvent(new Event('todos:updated'));
      }
    } catch (e) {
      console.error('Save edit error', e);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--neuro-bg)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left/Main */}
          <div className="flex-1 space-y-6">
            {/* Quick Add */}
            <div className="app-card p-4 flex items-center gap-3">
              <Plus className="h-5 w-5" />
              <input
                value={quickInput}
                onChange={e => setQuickInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') submitQuickAdd(); }}
                placeholder="+ Add a task..."
                className="app-input flex-1"
              />
              <button className="app-btn-primary" onClick={submitQuickAdd}>Add</button>
            </div>

            {/* Form Add/Edit */}
            <div className="app-card p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="app-muted text-sm">Title</label>
                  <input className="app-input w-full" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                </div>
                <div>
                  <label className="app-muted text-sm">Project</label>
                  <select className="app-select w-full" value={form.projectId || ''} onChange={e => setForm({ ...form, projectId: e.target.value || undefined })}>
                    <option value="">None</option>
                    {projects.map(p => (
                      <option key={p._id} value={p._id}>{p.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="app-muted text-sm">Due Date</label>
                  <input type="date" className="app-input w-full" value={form.dueDateStr} onChange={e => setForm({ ...form, dueDateStr: e.target.value })} />
                </div>
                <div>
                  <label className="app-muted text-sm">Priority</label>
                  <select className="app-select w-full" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as 'low'|'medium'|'high' })}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="app-muted text-sm">Notes</label>
                  <textarea className="app-input w-full" value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} />
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button className="app-btn-primary" onClick={editing ? saveEdit : submitForm}>{editing ? 'Save Changes' : 'Add Task'}</button>
                <button className="app-btn-secondary" onClick={addTomorrow}>Add for Tomorrow</button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2">
              {(['today', 'tomorrow', 'upcoming', 'all'] as FilterTab[]).map(t => (
                <button key={t} className={`app-btn-secondary ${filter === t ? 'neuro-card-pressed' : ''}`} onClick={() => setFilter(t)}>
                  {t[0].toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="app-card p-0 overflow-hidden">
              <div className="divide-y" style={{ borderColor: 'var(--neuro-border)' }}>
                {todos.map(todo => (
                  <div key={todo._id} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <input type="checkbox" checked={todo.status === 'done'} onChange={() => toggleDone(todo)} />
                      <div>
                        <div className="font-medium" style={{ color: 'var(--neuro-text-primary)' }}>{todo.title}</div>
                        <div className="text-sm app-muted">
                          {projectName(todo.projectId)}
                          {projectName(todo.projectId) ? ' • ' : ''}
                          <span>{todo.dueDateStr}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${todo.priority === 'high' ? 'bg-red-100 text-red-700' : todo.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>{todo.priority.toUpperCase()}</span>
                      <button className="app-btn-secondary" onClick={() => startEdit(todo)} title="Edit"><Edit className="h-4 w-4" /></button>
                      <button className="app-btn-secondary" onClick={() => deleteTodo(todo)} title="Delete"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                ))}
                {todos.length === 0 && (
                  <div className="p-6 text-center app-muted">No tasks</div>
                )}
              </div>
            </div>
          </div>

          {/* Right/Stats */}
          <div className="w-full md:w-80 space-y-6">
            <div className="app-card p-6">
              <div className="flex items-center gap-2 mb-2">
                <CheckSquare className="h-4 w-4" style={{ color: 'var(--neuro-text-secondary)' }} />
                <span className="font-semibold" style={{ color: 'var(--neuro-text-primary)' }}>Quick Stats</span>
              </div>
              <div className="text-sm app-muted">Today: {todos.filter(t => t.dueDateStr === todayStr()).length}</div>
              <div className="text-sm app-muted">Pending: {todos.filter(t => t.status === 'pending').length}</div>
              <div className="text-sm app-muted">Completed: {todos.filter(t => t.status === 'done').length}</div>
            </div>

            {undo && (
              <div className="app-card p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 app-muted text-sm"><Undo2 className="h-4 w-4" />Task deleted</div>
                <button className="app-btn-secondary" onClick={undoDelete}>Undo</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
