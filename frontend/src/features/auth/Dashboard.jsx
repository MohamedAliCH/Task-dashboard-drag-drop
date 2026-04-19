import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthContext } from "../../contexts/AuthContext";
import TaskFormModal from "../../components/TaskFormModal";
import ConfirmModal from "../../components/ConfirmModal";
import SkeletonCard from "../../components/SkeletonCard";
import SortableItem from "../../components/SortableItem";
import DroppableColumn from "../../components/DroppableColumn";
import TaskCard from "../../components/TaskCard";
import api from "../../lib/api.js";

import {
  DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, pointerWithin, DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import {
  Plus, Circle, Zap, CheckCheck, Search, X, ClipboardList, Clock, CheckCircle2, ListTodo,
} from "lucide-react";

/* ── Column definitions ─────────────────────────────────── */
const COLUMNS = [
  { id: "todo",       label: "To Do",        icon: Circle,     dot: "bg-slate-400",    empty: "No tasks yet" },
  { id: "inProgress", label: "In Progress",   icon: Zap,        dot: "bg-amber-400",    empty: "Drag a task here" },
  { id: "done",       label: "Done",          icon: CheckCheck,  dot: "bg-emerald-500",  empty: "Completed tasks" },
];

const FILTER_CHIPS = [
  { id: "high",     label: "High" },
  { id: "medium",   label: "Medium" },
  { id: "low",      label: "Low" },
  { id: "dueToday", label: "Due today" },
  { id: "overdue",  label: "Overdue" },
];

/* ── Component ──────────────────────────────────────────── */
export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen]   = useState(false);
  const [activeTask, setActiveTask]     = useState(null);
  const [editingTask, setEditingTask]   = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isDeleting, setIsDeleting]     = useState(false);
  const [searchQuery, setSearchQuery]   = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy]             = useState("manual");
  const [activeFilters, setActiveFilters] = useState([]);
  const [tasks, setTasks]               = useState({ todo: [], inProgress: [], done: [] });
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  /* fetch tasks */
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get("/tasks");
        const g = { todo: [], inProgress: [], done: [] };
        res.data.forEach((t) => { if (g[t.status] !== undefined) g[t.status].push(t); });
        setTasks(g);
      } catch (err) {
        if (err.response?.status === 401) { localStorage.removeItem("token"); navigate("/login"); }
        else { const m = err.response?.data?.msg || "Failed to load tasks."; setError(m); toast.error(m); }
      } finally { setLoading(false); }
    })();
  }, [navigate]);

  /* debounced search */
  useEffect(() => {
    const h = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(h);
  }, [searchQuery]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  /* handlers */
  const handleAddTask = (t) => {
    setTasks((p) => ({ ...p, todo: [{ ...t, id: Date.now() }, ...p.todo] }));
    toast.success("Task created!");
  };

  const openEdit = (t) => { setEditingTask(t); setIsModalOpen(true); };
  const closeModal = () => { setIsModalOpen(false); setEditingTask(null); };
  const toggleFilter = (id) => setActiveFilters((p) => p.includes(id) ? p.filter(f => f !== id) : [...p, id]);

  const handleUpdateTask = async (updated) => {
    const tid = updated._id || updated.id;
    try {
      if (updated._id) {
        const res = await api.put(`/tasks/${tid}`, { title: updated.title, priority: updated.priority, due: updated.due, description: updated.description });
        setTasks((p) => { const u = { ...p }; for (const c in u) u[c] = u[c].map(t => t._id === tid ? res.data : t); return u; });
      } else {
        setTasks((p) => { const u = { ...p }; for (const c in u) u[c] = u[c].map(t => t.id === tid ? { ...t, ...updated } : t); return u; });
      }
      toast.success("Task updated!");
    } catch { toast.error("Failed to update task."); }
  };

  const openDeleteConfirm = (col, id) => setTaskToDelete({ column: col, taskId: id });
  const confirmDelete = async () => {
    if (!taskToDelete) return;
    setIsDeleting(true);
    try {
      if (typeof taskToDelete.taskId === "string") await api.delete(`/tasks/${taskToDelete.taskId}`);
      setTasks((p) => ({ ...p, [taskToDelete.column]: p[taskToDelete.column].filter(t => (t._id || t.id) !== taskToDelete.taskId) }));
      toast.success("Task deleted.");
    } catch { toast.error("Failed to delete task."); }
    finally { setIsDeleting(false); setTaskToDelete(null); }
  };

  /* drag */
  const handleDragStart = (e) => {
    for (const c in tasks) { const f = tasks[c].find(t => (t._id || t.id) === e.active.id); if (f) { setActiveTask(f); break; } }
  };

  const handleDragEnd = async (e) => {
    const { active, over } = e;
    setActiveTask(null);
    if (!over || active.id === over.id) return;

    let srcCol = null, dragged = null, srcIdx = -1;
    for (const c in tasks) { const i = tasks[c].findIndex(t => (t._id || t.id) === active.id); if (i !== -1) { srcCol = c; dragged = tasks[c][i]; srcIdx = i; break; } }
    if (!srcCol) return;

    let dstCol = null, dstIdx = -1;
    for (const c in tasks) { const i = tasks[c].findIndex(t => (t._id || t.id) === over.id); if (i !== -1) { dstCol = c; dstIdx = i; break; } }
    if (!dstCol) { if (["todo","inProgress","done"].includes(over.id)) { dstCol = over.id; dstIdx = tasks[over.id].length; } else return; }

    setTasks((p) => {
      if (srcCol === dstCol) return { ...p, [srcCol]: arrayMove(p[srcCol], srcIdx, dstIdx) };
      const u = { ...p };
      u[srcCol] = u[srcCol].filter(t => (t._id || t.id) !== active.id);
      const moved = { ...dragged, status: dstCol };
      u[dstCol] = [...u[dstCol].slice(0, dstIdx), moved, ...u[dstCol].slice(dstIdx)];
      return u;
    });

    if (srcCol !== dstCol && typeof active.id === "string") {
      try {
        await api.put(`/tasks/${active.id}`, { title: dragged.title, priority: dragged.priority, due: dragged.due, status: dstCol });
        toast.success(`Moved to "${COLUMNS.find(c => c.id === dstCol)?.label}"`);
      } catch {
        toast.error("Failed to move task.");
        setTasks((p) => { const r = { ...p }; r[dstCol] = r[dstCol].filter(t => (t._id || t.id) !== active.id); r[srcCol] = [dragged, ...r[srcCol]]; return r; });
      }
    }
  };

  /* computed */
  const total = tasks.todo.length + tasks.inProgress.length + tasks.done.length;
  const dueToday = [...tasks.todo, ...tasks.inProgress].filter(t => {
    if (!t.due || t.due === "No due date") return false;
    return new Date(t.due).toDateString() === new Date().toDateString();
  }).length;
  const rate = total > 0 ? Math.round((tasks.done.length / total) * 100) : 0;

  /* filters */
  const applyFilters = (list) => list.filter(t => {
    if (debouncedSearch.trim() && !t.title.toLowerCase().includes(debouncedSearch.toLowerCase().trim())) return false;
    if (activeFilters.length === 0) return true;
    return activeFilters.some(f => {
      if (f === "high" || f === "medium" || f === "low") return t.priority === f;
      if (f === "dueToday") { if (!t.due || t.due === "No due date") return false; return new Date(t.due).toDateString() === new Date().toDateString(); }
      if (f === "overdue") { if (!t.due || t.due === "No due date") return false; return new Date(t.due) < new Date(new Date().toDateString()); }
      return false;
    });
  });

  const sortTasks = (list) => {
    if (sortBy === "manual") return list;
    return [...list].sort((a, b) => {
      if (sortBy === "priority") { const p = { high: 3, medium: 2, low: 1 }; return (p[b.priority] || 0) - (p[a.priority] || 0); }
      if (sortBy === "dueDate") { if (!a.due || a.due === "No due date") return 1; if (!b.due || b.due === "No due date") return -1; return new Date(a.due) - new Date(b.due); }
      return 0;
    });
  };

  const filtered = {
    todo:       sortTasks(applyFilters(tasks.todo)),
    inProgress: sortTasks(applyFilters(tasks.inProgress)),
    done:       sortTasks(applyFilters(tasks.done)),
  };

  /* ── Error state ──────────────────────────────────────── */
  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="glass-panel p-8 max-w-sm text-center">
          <p className="text-base font-bold text-slate-800 dark:text-slate-200 mb-2">Something went wrong</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{error}</p>
          <button onClick={() => window.location.reload()} className="glass-button w-full px-4 py-2.5">Reload</button>
        </div>
      </div>
    );
  }

  /* ── Main render ──────────────────────────────────────── */
  return (
    <div className="flex-1">
      <div className="page-container py-6 flex flex-col gap-6">

        {/* ─ Header ───────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Welcome, {user?.name || "User"}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              <span className="font-semibold text-slate-700 dark:text-slate-300">{total}</span> tasks total
            </p>
          </div>
          <button
            onClick={() => { setEditingTask(null); setIsModalOpen(true); }}
            className="self-start sm:self-auto glass-button flex items-center gap-2 px-5 py-2.5"
          >
            <Plus className="w-4 h-4" /> New Task
          </button>
        </div>

        {/* ─ Stat cards ───────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Total",       value: total,                icon: ClipboardList, accent: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300" },
            { label: "In Progress", value: tasks.inProgress.length, icon: ListTodo,    accent: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400" },
            { label: "Due Today",   value: dueToday,              icon: Clock,        accent: "bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400" },
            { label: "Completed",   value: tasks.done.length,     icon: CheckCircle2, accent: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" },
          ].map((s) => (
            <div key={s.label} className="glass-card p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.accent}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{s.label}</p>
                <p className="text-xl font-bold text-slate-800 dark:text-white leading-tight">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ─ Progress bar ─────────────────────────────── */}
        {total > 0 && (
          <div className="glass-card px-5 py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Completion</span>
              <span className="text-sm font-bold text-aurora-1">{rate}%</span>
            </div>
            <div className="w-full h-2 bg-slate-200/50 dark:bg-slate-800/50 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-aurora-1 to-aurora-2 rounded-full transition-all duration-500" style={{ width: `${rate}%` }} />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-right">{tasks.done.length} of {total}</p>
          </div>
        )}

        {/* ─ Search & filters ─────────────────────────── */}
        <div className="glass-card p-4 flex flex-col gap-3">
          {/* Search */}
          <div className="flex items-center gap-2.5 glass-input">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks…"
              className="flex-1 text-sm bg-transparent outline-none text-slate-700 dark:text-slate-200 placeholder-slate-400"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="text-slate-400 hover:text-aurora-1 transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Chips + sort */}
          <div className="flex flex-wrap items-center gap-2">
            {FILTER_CHIPS.map((chip) => {
              const active = activeFilters.includes(chip.id);
              return (
                <button
                  key={chip.id}
                  onClick={() => toggleFilter(chip.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all duration-200 ${
                    active
                      ? "bg-slate-800 border-slate-800 text-white dark:bg-white dark:border-white dark:text-slate-900 shadow-sm"
                      : "bg-white/40 dark:bg-slate-900/40 border-slate-200/50 dark:border-white/[0.06] text-slate-500 dark:text-slate-400 hover:bg-white/70 dark:hover:bg-slate-800/60"
                  }`}
                >
                  {chip.label}
                  {active && <X className="w-3 h-3" />}
                </button>
              );
            })}

            <div className="ml-auto flex items-center gap-3">
              {(activeFilters.length > 0 || searchQuery) && (
                <button
                  onClick={() => { setActiveFilters([]); setSearchQuery(""); }}
                  className="text-xs font-semibold text-slate-500 hover:text-aurora-1 transition-colors flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Clear
                </button>
              )}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs font-semibold border border-slate-200/50 dark:border-white/[0.06] rounded-lg bg-white/40 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 py-1.5 pl-3 pr-7 outline-none focus:ring-2 focus:ring-aurora-1/40 cursor-pointer appearance-none"
              >
                <option value="manual">Manual order</option>
                <option value="priority">Priority</option>
                <option value="dueDate">Due date</option>
              </select>
            </div>
          </div>
        </div>

        {/* ─ Kanban Board ─────────────────────────────── */}
        {total === 0 && !loading && !debouncedSearch && activeFilters.length === 0 ? (
          <div className="glass-panel border-dashed flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 bg-gradient-to-br from-aurora-1 to-aurora-2 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-aurora-1/20">
              <ClipboardList className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1.5">No tasks yet</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Create your first task to get started.</p>
            <button onClick={() => { setEditingTask(null); setIsModalOpen(true); }} className="glass-button flex items-center gap-2 px-5 py-2.5">
              <Plus className="w-4 h-4" /> Create Task
            </button>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={pointerWithin} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {COLUMNS.map((col) => {
                const ColIcon = col.icon;
                return (
                  <DroppableColumn key={col.id} id={col.id}>
                    <div className="glass-panel flex flex-col min-h-[480px] overflow-hidden">
                      {/* Column header */}
                      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/40 dark:border-white/[0.06] bg-white/30 dark:bg-white/[0.03]">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                          <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                          {col.label}
                        </div>
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100/60 dark:bg-slate-800/60 px-2.5 py-0.5 rounded-md">
                          {tasks[col.id].length}
                        </span>
                      </div>

                      {/* Cards list */}
                      <SortableContext items={filtered[col.id].map(t => t._id || t.id)} strategy={verticalListSortingStrategy}>
                        <div className="flex-1 flex flex-col gap-2 p-3">
                          {loading ? (
                            <><SkeletonCard /><SkeletonCard /><SkeletonCard /></>
                          ) : filtered[col.id].length === 0 ? (
                            <div className="flex-1 flex items-center justify-center py-12">
                              <p className="text-xs text-slate-400 dark:text-slate-600">{col.empty}</p>
                            </div>
                          ) : (
                            filtered[col.id].map((t) => (
                              <SortableItem key={t._id || t.id} id={t._id || t.id}>
                                <TaskCard
                                  task={t}
                                  onEdit={() => openEdit(t)}
                                  onDelete={() => openDeleteConfirm(col.id, t._id || t.id)}
                                />
                              </SortableItem>
                            ))
                          )}
                        </div>
                      </SortableContext>
                    </div>
                  </DroppableColumn>
                );
              })}
            </div>

            <DragOverlay>
              {activeTask ? (
                <div className="rotate-1 scale-105 opacity-90 shadow-xl">
                  <TaskCard task={activeTask} />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      <TaskFormModal isOpen={isModalOpen} onClose={closeModal} onAddTask={handleAddTask} onEditTask={handleUpdateTask} editTask={editingTask} />
      <ConfirmModal
        isOpen={!!taskToDelete}
        onCancel={() => setTaskToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete task"
        message="This action cannot be undone. The task will be permanently removed."
      />
    </div>
  );
}
