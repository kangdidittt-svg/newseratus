'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { CheckSquare, Edit, Trash2, Undo2, Plus, Check } from 'lucide-react';

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

type FilterTab = 'today' | 'tomorrow' | 'upcoming' | 'completed' | 'all';

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

  const addToday = async () => {
    const today = todayStr();
    if (!form.title.trim()) return;
    try {
      if (editing) {
        const res = await fetch(`/api/todos/${editing._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ ...form, dueDateStr: today })
        });
        if (res.ok) {
          setEditing(null);
        }
      } else {
        const res = await fetch('/api/todos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ ...form, dueDateStr: today })
        });
        if (!res.ok) return;
      }
      setForm({ title: '', projectId: undefined, notes: '', dueDateStr: todayStr(), priority: 'medium' });
      fetchTodos(filter);
      window.dispatchEvent(new Event('todos:updated'));
    } catch (e) {
      console.error('Add today error', e);
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

  const markDone = async (id: string) => {
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'done' })
      });
      if (res.ok) {
        setTodos(prev => prev.map(t => t._id === id ? { ...t, status: 'done' } : t));
        window.dispatchEvent(new Event('todos:updated'));
      }
    } catch (e) {
      console.error('Mark done error', e);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--neuro-bg)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left/Main */}
          <div className="flex-1 space-y-6">
            {/* Quick Add */}
            <div className="bg-[#121418] border border-white/5 rounded-2xl p-4 flex items-center gap-3">
              <Plus className="h-5 w-5 text-[#8B5CF6]" />
              <input
                value={quickInput}
                onChange={e => setQuickInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') submitQuickAdd(); }}
                placeholder="+ Add a task..."
                className="flex-1 bg-[#181A20] border border-white/5 rounded-xl px-3 py-2 text-xs text-[#F5F5F5] placeholder-[#6B7280] outline-none focus:border-[#8B5CF6]"
              />
              <button className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white transition-all" onClick={submitQuickAdd}>Add</button>
            </div>

            {/* Form Add/Edit */}
            <div className="bg-[#121418] border border-white/5 rounded-2xl p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-semibold text-[#9CA3AF] uppercase block mb-1">Title</label>
                  <input className="w-full bg-[#181A20] border border-white/5 rounded-xl px-3 py-2 text-xs text-[#F5F5F5] outline-none focus:border-[#8B5CF6]" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#9CA3AF] uppercase block mb-1">Project</label>
                  <select className="w-full bg-[#181A20] border border-white/5 rounded-xl px-3 py-2 text-xs text-[#F5F5F5] outline-none focus:border-[#8B5CF6]" value={form.projectId || ''} onChange={e => setForm({ ...form, projectId: e.target.value || undefined })}>
                    <option value="">None</option>
                    {projects.map(p => (
                      <option key={p._id} value={p._id}>{p.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#9CA3AF] uppercase block mb-1">Due Date</label>
                  <input type="date" className="w-full bg-[#181A20] border border-white/5 rounded-xl px-3 py-2 text-xs text-[#F5F5F5] outline-none focus:border-[#8B5CF6]" value={form.dueDateStr} onChange={e => setForm({ ...form, dueDateStr: e.target.value })} />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#9CA3AF] uppercase block mb-1">Priority</label>
                  <select className="w-full bg-[#181A20] border border-white/5 rounded-xl px-3 py-2 text-xs text-[#F5F5F5] outline-none focus:border-[#8B5CF6]" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as 'low'|'medium'|'high' })}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-[11px] font-semibold text-[#9CA3AF] uppercase block mb-1">Notes</label>
                  <textarea className="w-full bg-[#181A20] border border-white/5 rounded-xl px-3 py-2 text-xs text-[#F5F5F5] outline-none focus:border-[#8B5CF6] resize-none" rows={2} value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} />
                </div>
              </div>
              <div className="pt-2 flex flex-wrap gap-2">
                <button className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white transition-all" onClick={editing ? saveEdit : submitForm}>{editing ? 'Save Changes' : 'Add Task'}</button>
                <button className="px-4 py-2 rounded-xl bg-[#181A20] border border-white/5 hover:bg-white/10 text-xs text-[#F5F5F5] font-semibold transition-all" onClick={addToday}>{editing ? 'Save for Today' : 'Add for Today'}</button>
                <button className="px-4 py-2 rounded-xl bg-[#181A20] border border-white/5 hover:bg-white/10 text-xs text-[#F5F5F5] font-semibold transition-all" onClick={addTomorrow}>Add for Tomorrow</button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2">
              {(['today', 'tomorrow', 'upcoming', 'all'] as FilterTab[]).map(t => {
                const isActive = filter === t;
                return (
                  <button key={t} className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${isActive ? 'bg-[#8B5CF6]/20 text-[#A78BFA] border border-[#8B5CF6]/30' : 'bg-[#121418] text-[#9CA3AF] border border-white/5 hover:bg-white/5'}`} onClick={() => setFilter(t)}>
                    {t[0].toUpperCase() + t.slice(1)}
                  </button>
                );
              })}
            </div>

            {/* Task List */}
            <div className="bg-[#121418] border border-white/5 rounded-2xl overflow-hidden">
              <div className="divide-y divide-white/5">
                {todos.map(todo => (
                  <div key={todo._id} className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-3">
                      <input type="checkbox" checked={todo.status === 'done'} onChange={() => toggleDone(todo)} className="rounded border-white/20 bg-[#181A20] text-purple-600" />
                      <div>
                        <div className="text-xs font-semibold text-[#F5F5F5]">{todo.title}</div>
                        <div className="text-[11px] text-[#6B7280]">
                          {projectName(todo.projectId)}
                          {projectName(todo.projectId) ? ' • ' : ''}
                          <span className="font-mono">{todo.dueDateStr}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {filter === 'all' && todo.status !== 'done' && (
                        <button className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" onClick={() => markDone(todo._id)} title="Mark done"><Check className="h-3.5 w-3.5" /></button>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${todo.priority === 'high' ? 'bg-rose-500/15 text-rose-400 border-rose-500/30' : todo.priority === 'medium' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' : 'bg-blue-500/15 text-blue-400 border-blue-500/30'}`}>{todo.priority}</span>
                      <button className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#9CA3AF]" onClick={() => startEdit(todo)} title="Edit"><Edit className="h-3.5 w-3.5" /></button>
                      <button className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400" onClick={() => deleteTodo(todo)} title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                ))}
                {todos.length === 0 && (
                  <div className="p-8 text-center text-xs text-[#6B7280]">No tasks found</div>
                )}
              </div>
            </div>
          </div>

          {/* Right/Stats */}
          <div className="w-full md:w-72 space-y-4">
            <div className="bg-[#121418] border border-white/5 rounded-2xl p-5 space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <CheckSquare className="h-4 w-4 text-[#8B5CF6]" />
                <span className="font-bold text-xs text-[#F5F5F5]">Quick Stats</span>
              </div>
              <div className="text-xs text-[#9CA3AF] flex justify-between"><span>Today:</span> <span className="font-mono text-[#F5F5F5]">{todos.filter(t => t.dueDateStr === todayStr()).length}</span></div>
              <div className="text-xs text-[#9CA3AF] flex justify-between"><span>Pending:</span> <span className="font-mono text-amber-400">{todos.filter(t => t.status === 'pending').length}</span></div>
              <div className="text-xs text-[#9CA3AF] flex justify-between"><span>Completed:</span> <span className="font-mono text-emerald-400">{todos.filter(t => t.status === 'done').length}</span></div>
            </div>

            {undo && (
              <div className="bg-[#121418] border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-[#9CA3AF]"><Undo2 className="h-3.5 w-3.5 text-amber-400" />Task deleted</div>
                <button className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-[#F5F5F5]" onClick={undoDelete}>Undo</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
