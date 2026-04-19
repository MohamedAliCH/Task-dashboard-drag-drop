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

const COLUMNS = [
  {
    id: "todo",
    label: "To Do",
    icon: <Circle className="w-3.5 h-3.5" />,
    dotColor: "bg-slate-400 shadow-[0_0_8px_rgba(148,163,184,0.5)]",
    emptyText: "No tasks here.",
  },
  {
    id: "inProgress",
    label: "In Progress",
    icon: <Zap className="w-3.5 h-3.5" />,
    dotColor: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]",
    emptyText: "Drag a task here to start.",
  },
  {
    id: "done",
    label: "Done",
    icon: <CheckCheck className="w-3.5 h-3.5" />,
    dotColor: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]",
    emptyText: "Completed tasks appear here.",
  },
];

const FILTER_CHIPS = [
  { id: "high",     label: "High priority" },
  { id: "medium",   label: "Medium priority" },
  { id: "low",      label: "Low priority" },
  { id: "dueToday", label: "Due today" },
  { id: "overdue",  label: "Overdue" },
];

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTask, setActiveTask] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("manual");
  const [activeFilters, setActiveFilters] = useState([]);
  const [tasks, setTasks] = useState({ todo: [], inProgress: [], done: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get("/tasks");
        const grouped = { todo: [], inProgress: [], done: [] };
        res.data.forEach((task) => {
          if (grouped[task.status] !== undefined) grouped[task.status].push(task);
        });
        setTasks(grouped);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          const msg = err.response?.data?.msg || "Failed to load tasks.";
          setError(msg);
          toast.error(msg);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [navigate]);

  useEffect(() => {
    const h = setTimeout(() => setDebouncedSearchQuery(searchQuery), 300);
    return () => clearTimeout(h);
  }, [searchQuery]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleAddTask = (newTask) => {
    setTasks((prev) => ({ ...prev, todo: [{ ...newTask, id: Date.now() }, ...prev.todo] }));
    toast.success("Task created!");
  };

  const handleOpenEdit = (task) => { setEditingTask(task); setIsModalOpen(true); };
  const handleCloseModal = () => { setIsModalOpen(false); setEditingTask(null); };
  const toggleFilter = (id) => setActiveFilters((prev) => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);

  const handleUpdateTask = async (updatedData) => {
    const taskId = updatedData._id || updatedData.id;
    try {
      if (updatedData._id) {
        const res = await api.put(`/tasks/${taskId}`, {
          title: updatedData.title, priority: updatedData.priority,
          due: updatedData.due, description: updatedData.description,
        });
        setTasks((prev) => {
          const updated = { ...prev };
          for (const col in updated) updated[col] = updated[col].map(t => t._id === taskId ? res.data : t);
          return updated;
        });
      } else {
        setTasks((prev) => {
          const updated = { ...prev };
          for (const col in updated) updated[col] = updated[col].map(t => t.id === taskId ? { ...t, ...updatedData } : t);
          return updated;
        });
      }
      toast.success("Task updated!");
    } catch {
      toast.error("Failed to update task.");
    }
  };

  const handleOpenDeleteConfirm = (column, taskId) => setTaskToDelete({ column, taskId });

  const confirmDelete = async () => {
    if (!taskToDelete) return;
    const { column, taskId } = taskToDelete;
    setIsDeleting(true);
    try {
      if (typeof taskId === "string") await api.delete(`/tasks/${taskId}`);
      setTasks((prev) => ({ ...prev, [column]: prev[column].filter(t => (t._id || t.id) !== taskId) }));
      toast.success("Task deleted.");
    } catch {
      toast.error("Failed to delete task.");
    } finally {
      setIsDeleting(false);
      setTaskToDelete(null);
    }
  };

  const handleDragStart = (event) => {
    for (const col in tasks) {
      const found = tasks[col].find(t => (t._id || t.id) === event.active.id);
      if (found) { setActiveTask(found); break; }
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over || active.id === over.id) return;
    const activeId = active.id;
    const overId = over.id;
    let sourceColumn = null, draggedTask = null, sourceIndex = -1;
    for (const col in tasks) {
      const index = tasks[col].findIndex(t => (t._id || t.id) === activeId);
      if (index !== -1) { sourceColumn = col; draggedTask = tasks[col][index]; sourceIndex = index; break; }
    }
    if (!sourceColumn) return;
    let destinationColumn = null, destinationIndex = -1;
    for (const col in tasks) {
      const index = tasks[col].findIndex(t => (t._id || t.id) === overId);
      if (index !== -1) { destinationColumn = col; destinationIndex = index; break; }
    }
    if (!destinationColumn) {
      if (["todo","inProgress","done"].includes(overId)) { destinationColumn = overId; destinationIndex = tasks[overId].length; }
      else return;
    }
    setTasks((prev) => {
      if (sourceColumn === destinationColumn) return { ...prev, [sourceColumn]: arrayMove(prev[sourceColumn], sourceIndex, destinationIndex) };
      const updated = { ...prev };
      updated[sourceColumn] = updated[sourceColumn].filter(t => (t._id || t.id) !== activeId);
      const movedTask = { ...draggedTask, status: destinationColumn };
      updated[destinationColumn] = [...updated[destinationColumn].slice(0, destinationIndex), movedTask, ...updated[destinationColumn].slice(destinationIndex)];
      return updated;
    });
    if (sourceColumn !== destinationColumn && typeof activeId === "string") {
      try {
        await api.put(`/tasks/${activeId}`, { title: draggedTask.title, priority: draggedTask.priority, due: draggedTask.due, status: destinationColumn });
        toast.success(`Moved to "${COLUMNS.find(c => c.id === destinationColumn)?.label}"`);
      } catch {
        toast.error("Failed to move task. Reverting...");
        setTasks((prev) => {
          const reverted = { ...prev };
          reverted[destinationColumn] = reverted[destinationColumn].filter(t => (t._id || t.id) !== activeId);
          reverted[sourceColumn] = [draggedTask, ...reverted[sourceColumn]];
          return reverted;
        });
      }
    }
  };

  const totalTasks = tasks.todo.length + tasks.inProgress.length + tasks.done.length;
  const dueTodayCount = [...tasks.todo, ...tasks.inProgress].filter(t => {
    if (!t.due || t.due === "No due date") return false;
    return new Date(t.due).toDateString() === new Date().toDateString();
  }).length;
  const completionRate = totalTasks > 0 ? Math.round((tasks.done.length / totalTasks) * 100) : 0;

  const applyFilters = (list) => list.filter(task => {
    if (debouncedSearchQuery.trim() && !task.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase().trim())) return false;
    if (activeFilters.length === 0) return true;
    return activeFilters.some(f => {
      if (f === "high") return task.priority === "high";
      if (f === "medium") return task.priority === "medium";
      if (f === "low") return task.priority === "low";
      if (f === "dueToday") { if (!task.due || task.due === "No due date") return false; return new Date(task.due).toDateString() === new Date().toDateString(); }
      if (f === "overdue") { if (!task.due || task.due === "No due date") return false; return new Date(task.due) < new Date(new Date().toDateString()); }
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

  const filteredTasks = {
    todo: sortTasks(applyFilters(tasks.todo)),
    inProgress: sortTasks(applyFilters(tasks.inProgress)),
    done: sortTasks(applyFilters(tasks.done)),
  };

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-center animate-page-in">
        <div className="glass-panel p-8 max-w-sm">
          <p className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">System Error</p>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-6">{error}</p>
          <button onClick={() => window.location.reload()} className="glass-button w-full px-4 py-2.5 text-sm">
            Reload Interface
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 animate-page-in">
      <div className="page-container py-8 flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-aurora-1 to-aurora-3 bg-clip-text text-transparent tracking-tight">
              Welcome, {user?.name || "User"}
            </h1>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
              You have <span className="font-bold text-slate-700 dark:text-slate-200">{totalTasks}</span> tasks total
            </p>
          </div>
          <button
            onClick={() => { setEditingTask(null); setIsModalOpen(true); }}
             className="self-start sm:self-auto glass-button flex items-center gap-2 px-5 py-2.5 shadow-md shadow-aurora-1/20"
          >
            <Plus className="w-4 h-4" />
            New Task
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {[
            { label: "Total", value: totalTasks, icon: <ClipboardList className="w-5 h-5 text-slate-700 dark:text-slate-200" />, color: "bg-slate-100 dark:bg-slate-800" },
            { label: "In Progress", value: tasks.inProgress.length, icon: <ListTodo className="w-5 h-5 text-amber-600 dark:text-amber-400" />, color: "bg-amber-100 dark:bg-amber-900/40" },
            { label: "Due Today", value: dueTodayCount, icon: <Clock className="w-5 h-5 text-aurora-1" />, color: "bg-sky-100 dark:bg-sky-900/40" },
            { label: "Completed", value: tasks.done.length, icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />, color: "bg-emerald-100 dark:bg-emerald-900/40" },
          ].map((stat) => (
            <div key={stat.label} className="glass-panel p-4 flex items-center gap-4 hover:bg-white/60 dark:hover:bg-slate-800/60 transition-colors">
               <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${stat.color}`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 leading-tight">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        {totalTasks > 0 && (
          <div className="glass-panel px-5 py-4">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Completion</span>
              <span className="text-sm font-bold text-aurora-1">{completionRate}%</span>
            </div>
            <div className="w-full h-2 bg-slate-200/50 dark:bg-slate-800/50 rounded-full overflow-hidden border border-slate-300/30 dark:border-white/10">
              <div
                className="h-full bg-gradient-to-r from-aurora-1 to-aurora-2 transition-all duration-500 ease-out"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-2 text-right">{tasks.done.length} of {totalTasks} finished</p>
          </div>
        )}

        {/* Search & Filters */}
        <div className="glass-panel p-4 flex flex-col gap-4">
          {/* Search */}
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200/50 dark:border-white/10 focus-within:ring-2 focus-within:ring-aurora-1/50 transition-all">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="flex-1 text-sm font-medium bg-transparent outline-none text-slate-700 dark:text-slate-200 placeholder-slate-400"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="text-slate-400 hover:text-aurora-1 transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filters row */}
          <div className="flex flex-wrap items-center gap-2">
            {FILTER_CHIPS.map((chip) => {
              const active = activeFilters.includes(chip.id);
              return (
                <button
                  key={chip.id}
                  onClick={() => toggleFilter(chip.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all duration-300 ${
                    active
                      ? "bg-slate-800 border-slate-800 text-white dark:bg-white dark:border-white dark:text-slate-900 shadow-md transform scale-[0.98]"
                      : "bg-white/50 dark:bg-slate-900/50 border-slate-200/50 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800"
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
                  <X className="w-3 h-3" />Clear
                </button>
              )}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs font-semibold border border-slate-200/50 dark:border-white/10 rounded-lg bg-white/50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 py-1.5 pl-3 pr-8 outline-none focus:ring-2 focus:ring-aurora-1/50 cursor-pointer transition-all appearance-none shadow-sm"
              >
                <option value="manual">Manual order</option>
                <option value="priority">Priority</option>
                <option value="dueDate">Due date</option>
              </select>
            </div>
          </div>
        </div>

        {/* Kanban Board */}
        {totalTasks === 0 && !loading && !debouncedSearchQuery && activeFilters.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center glass-panel border-dashed border-2">
            <div className="w-16 h-16 bg-gradient-to-br from-aurora-1 to-aurora-2 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-aurora-1/20">
              <ClipboardList className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">No Tasks Yet</h2>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-6">Create your first task to get started.</p>
            <button
              onClick={() => { setEditingTask(null); setIsModalOpen(true); }}
              className="glass-button flex items-center gap-2 px-6 py-3 shadow-md shadow-aurora-1/20"
            >
              <Plus className="w-4 h-4" />
              Create Task
            </button>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={pointerWithin} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
              {COLUMNS.map((col) => (
                <DroppableColumn key={col.id} id={col.id}>
                  <div className="glass-panel bg-white/40 dark:bg-slate-900/40 flex flex-col min-h-[480px]">
                    {/* Column header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/50 dark:border-white/10 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-t-2xl">
                      <div className="flex items-center gap-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                        <span className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`} />
                        {col.label}
                      </div>
                      <span className="text-xs font-bold bg-slate-200/50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-full border border-slate-300/30 dark:border-white/10">
                        {tasks[col.id].length}
                      </span>
                    </div>

                    {/* Tasks */}
                    <SortableContext items={filteredTasks[col.id].map(t => t._id || t.id)} strategy={verticalListSortingStrategy}>
                      <div className="flex flex-col gap-2.5 p-3 flex-1">
                        {loading ? (
                          <><SkeletonCard /><SkeletonCard /><SkeletonCard /></>
                        ) : filteredTasks[col.id].length === 0 ? (
                          <div className="flex-1 flex items-center justify-center py-12">
                            <p className="text-xs text-slate-400 dark:text-slate-600">{col.emptyText}</p>
                          </div>
                        ) : (
                          filteredTasks[col.id].map((task) => (
                            <SortableItem key={task._id || task.id} id={task._id || task.id}>
                              <TaskCard
                                task={task}
                                onEdit={() => handleOpenEdit(task)}
                                onDelete={() => handleOpenDeleteConfirm(col.id, task._id || task.id)}
                              />
                            </SortableItem>
                          ))
                        )}
                      </div>
                    </SortableContext>
                  </div>
                </DroppableColumn>
              ))}
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

      <TaskFormModal isOpen={isModalOpen} onClose={handleCloseModal} onAddTask={handleAddTask} onEditTask={handleUpdateTask} editTask={editingTask} />
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
