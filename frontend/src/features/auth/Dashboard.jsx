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
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  pointerWithin,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import {
  Plus,
  ListTodo,
  Clock,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  RefreshCw,
  LogIn,
  ClipboardList,
  Zap,
  Circle,
  CheckCheck,
  BarChart3,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

// ─── Column config ───────────────────────────────────────────────────────────
const COLUMNS = [
  {
    id: "todo",
    label: "To Do",
    emptyText: "No tasks yet. Add one above!",
    icon: <Circle className="w-4 h-4" />,
    headerBg: "bg-gray-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-900/50",
    headerText: "text-indigo-700 dark:text-indigo-300",
    badgeBg: "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300",
    accentColor: "border-t-indigo-500",
  },
  {
    id: "inProgress",
    label: "In Progress",
    emptyText: "Nothing in progress. Drag a task here!",
    icon: <Zap className="w-4 h-4" />,
    headerBg: "bg-gray-100 dark:bg-orange-900/20 border-orange-100 dark:border-orange-900/50",
    headerText: "text-orange-700 dark:text-orange-300",
    badgeBg: "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300",
    accentColor: "border-t-orange-500",
  },
  {
    id: "done",
    label: "Done",
    emptyText: "No completed tasks yet. Keep going!",
    icon: <CheckCheck className="w-4 h-4" />,
    headerBg: "bg-gray-100 dark:bg-green-900/20 border-green-100 dark:border-green-900/50",
    headerText: "text-green-700 dark:text-green-300",
    badgeBg: "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300",
    accentColor: "border-t-green-500",
  },
];
const FILTER_CHIPS = [
  { id: "high", label: "High Priority", icon: "ArrowUp" },
  { id: "medium", label: "Medium Priority", icon: "ArrowRight" },
  { id: "low", label: "Low Priority", icon: "ArrowDown" },
  { id: "dueToday", label: "Due Today", icon: "Clock" },
  { id: "overdue", label: "Overdue", icon: "AlertCircle" },
];

// ─── Component ────────────────────────────────────────────────────────────────
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

  // ── Fetch tasks on mount ───────────────────────────────────────────────────
  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await api.get("/tasks");

        const grouped = { todo: [], inProgress: [], done: [] };
        res.data.forEach((task) => {
          if (grouped[task.status] !== undefined) {
            grouped[task.status].push(task);
          }
        });
        setTasks(grouped);
      } catch (err) {
        console.error("Fetch tasks error:", err);
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          const msg =
            err.response?.data?.msg ||
            "Failed to load tasks. Please try again.";
          setError(msg);
          toast.error(msg);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [navigate]);

  // ── Debounce search ───────────────────────────────────────────────────────
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // ── DnD sensors ───────────────────────────────────────────────────────────
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleAddTask = (newTask) => {
    setTasks((prev) => ({
      ...prev,
      todo: [{ ...newTask, id: Date.now() }, ...prev.todo],
    }));
    toast.success("Task created successfully!");
  };

  const handleOpenEdit = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };
  const toggleFilter = (filterId) => {
    setActiveFilters(
      (prev) =>
        prev.includes(filterId)
          ? prev.filter((id) => id !== filterId) // remove if already active
          : [...prev, filterId], // add if not active
    );
  };

  const handleUpdateTask = async (updatedData) => {
    const taskId = updatedData._id || updatedData.id;
    try {
      // Only call the API for real (persisted) tasks that have a MongoDB _id
      if (updatedData._id) {
        const res = await api.put(
          `/tasks/${taskId}`,
          {
            title: updatedData.title,
            priority: updatedData.priority,
            due: updatedData.due,
          }
        );
        // Replace with the server-returned task
        setTasks((prev) => {
          const updated = { ...prev };
          for (const col in updated) {
            updated[col] = updated[col].map((t) =>
              t._id === taskId ? res.data : t,
            );
          }
          return updated;
        });
      } else {
        // Optimistic update for locally-created tasks (no _id yet)
        setTasks((prev) => {
          const updated = { ...prev };
          for (const col in updated) {
            updated[col] = updated[col].map((t) =>
              t.id === taskId ? { ...t, ...updatedData } : t,
            );
          }
          return updated;
        });
      }
      toast.success("Task updated!");
    } catch (err) {
      console.error("Update task error:", err);
      toast.error("Failed to update task. Please try again.");
    }
  };

  const handleOpenDeleteConfirm = (column, taskId) => {
    setTaskToDelete({ column, taskId });
  };

  const confirmDelete = async () => {
    if (!taskToDelete) return;
    const { column, taskId } = taskToDelete;
    setIsDeleting(true);

    try {
      if (typeof taskId === "string") {
        await api.delete(`/tasks/${taskId}`);
      }

      setTasks((prev) => ({
        ...prev,
        [column]: prev[column].filter((t) => (t._id || t.id) !== taskId),
      }));
      toast.success("Task deleted.");
    } catch (err) {
      console.error("Delete task error:", err);
      toast.error("Failed to delete task. Please try again.");
    } finally {
      setIsDeleting(false);
      setTaskToDelete(null);
    }
  };

  const handleDragStart = (event) => {
    const activeId = event.active.id;
    for (const col in tasks) {
      const found = tasks[col].find((t) => (t._id || t.id) === activeId);
      if (found) {
        setActiveTask(found);
        break;
      }
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over || active.id === over.id) return;

    const activeId = active.id;
    const overId = over.id;

    let sourceColumn = null;
    let draggedTask = null;
    let sourceIndex = -1;

    for (const col in tasks) {
      const index = tasks[col].findIndex((t) => (t._id || t.id) === activeId);
      if (index !== -1) {
        sourceColumn = col;
        draggedTask = tasks[col][index];
        sourceIndex = index;
        break;
      }
    }

    if (!sourceColumn) return;

    let destinationColumn = null;
    let destinationIndex = -1;

    for (const col in tasks) {
      const index = tasks[col].findIndex((t) => (t._id || t.id) === overId);
      if (index !== -1) {
        destinationColumn = col;
        destinationIndex = index;
        break;
      }
    }

    if (!destinationColumn) {
      if (overId === "todo" || overId === "inProgress" || overId === "done") {
        destinationColumn = overId;
        destinationIndex = tasks[overId].length;
      } else {
        return;
      }
    }

    setTasks((prev) => {
      if (sourceColumn === destinationColumn) {
        return {
          ...prev,
          [sourceColumn]: arrayMove(
            prev[sourceColumn],
            sourceIndex,
            destinationIndex,
          ),
        };
      }
      const updated = { ...prev };
      updated[sourceColumn] = updated[sourceColumn].filter(
        (t) => (t._id || t.id) !== activeId,
      );
      const movedTask = { ...draggedTask, status: destinationColumn };
      updated[destinationColumn] = [
        ...updated[destinationColumn].slice(0, destinationIndex),
        movedTask,
        ...updated[destinationColumn].slice(destinationIndex),
      ];
      return updated;
    });

    // Persist status change to backend (only for cross-column moves of saved tasks)
    if (sourceColumn !== destinationColumn) {
      // Local tasks have a numeric id — skip the API call for those
      if (typeof activeId === "string") {
        try {
          await api.put(
            `/tasks/${activeId}`,
            {
              title: draggedTask.title,
              priority: draggedTask.priority,
              due: draggedTask.due,
              status: destinationColumn,
            }
          );
          toast.success(
            `Moved to "${COLUMNS.find((c) => c.id === destinationColumn)?.label}"`,
          );
        } catch (err) {
          console.error("Update task status error:", err);
          toast.error("Failed to move task. Reverting...");
          // Rollback: move the task back to the source column
          setTasks((prev) => {
            const reverted = { ...prev };
            reverted[destinationColumn] = reverted[destinationColumn].filter(
              (t) => (t._id || t.id) !== activeId,
            );
            reverted[sourceColumn] = [draggedTask, ...reverted[sourceColumn]];
            return reverted;
          });
        }
      }
    }
  };

  // ── Derived stats ─────────────────────────────────────────────────────────
  const totalTasks =
    tasks.todo.length + tasks.inProgress.length + tasks.done.length;

  const dueTodayCount = [...tasks.todo, ...tasks.inProgress].filter((t) => {
    if (!t.due || t.due === "No due date") return false;
    const today = new Date().toDateString();
    return new Date(t.due).toDateString() === today;
  }).length;

  const completionRate =
    totalTasks > 0 ? Math.round((tasks.done.length / totalTasks) * 100) : 0;

  const applyFilters = (taskList) => {
    return taskList.filter((task) => {
      // ── 1. Search filter ──────────────────────────────
      if (
        debouncedSearchQuery.trim() &&
        !task.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase().trim())
      ) {
        return false;
      }

      // ── 2. Chip filters ───────────────────────────────
      // If no chips active, show everything that passed search
      if (activeFilters.length === 0) return true;

      // Task must match AT LEAST ONE active chip
      return activeFilters.some((filter) => {
        if (filter === "high") return task.priority === "high";
        if (filter === "medium") return task.priority === "medium";
        if (filter === "low") return task.priority === "low";

        if (filter === "dueToday") {
          if (!task.due || task.due === "No due date") return false;
          const today = new Date().toDateString();
          return new Date(task.due).toDateString() === today;
        }

        if (filter === "overdue") {
          if (!task.due || task.due === "No due date") return false;
          return new Date(task.due) < new Date(new Date().toDateString());
        }

        return false;
      });
    });
  };

  const sortTasks = (taskList) => {
    if (sortBy === "manual") return taskList;
    return [...taskList].sort((a, b) => {
      if (sortBy === "priority") {
        const pValues = { high: 3, medium: 2, low: 1 };
        return (pValues[b.priority] || 0) - (pValues[a.priority] || 0);
      }
      if (sortBy === "dueDate") {
        if (!a.due || a.due === "No due date") return 1;
        if (!b.due || b.due === "No due date") return -1;
        return new Date(a.due) - new Date(b.due);
      }
      return 0;
    });
  };

  const filteredTasks = {
    todo: sortTasks(applyFilters(tasks.todo)),
    inProgress: sortTasks(applyFilters(tasks.inProgress)),
    done: sortTasks(applyFilters(tasks.done)),
  };

  // ─── Error state ───────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-100 dark:bg-gray-950 px-4">
        <div className="page-container flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
          <div className="flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Something went wrong
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            {error}
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center justify-center gap-2 w-full px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-md"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
            <button
              onClick={() => navigate("/login")}
              className="flex items-center justify-center gap-2 w-full px-5 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Main dashboard ────────────────────────────────────────────────────────
  return (
    <div className="w-full bg-gray-100 dark:bg-gray-950 transition-colors duration-200">
      <div className="page-container py-10 flex flex-col gap-8">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
              Good day,{" "}
              <span className="text-indigo-600 dark:text-indigo-400">
                {user?.name || "there"}
              </span>{" "}
              👋
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm sm:text-base">
              Here's an overview of your tasks today.
            </p>
          </div>

          <button
            onClick={() => {
              setEditingTask(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 self-start sm:self-auto bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            <Plus className="w-4 h-4" />
            New Task
          </button>
        </div>

        {/* ── Search & Filter ── */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-md p-5 flex flex-col gap-3">
          {/* Search bar */}
          <div className="flex items-center gap-2 px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-100 dark:bg-gray-800 focus-within:bg-gray-50 dark:focus-within:bg-gray-700 focus-within:ring-2 focus-within:ring-indigo-400 focus-within:border-indigo-400 transition-all">
            <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks by title..."
              className="flex-1 text-sm bg-transparent focus:outline-none text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter chips row */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 dark:text-gray-500 mr-1">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filter:
            </div>

            {FILTER_CHIPS.map((chip) => {
              const isActive = activeFilters.includes(chip.id);
              return (
                <button
                  key={chip.id}
                  onClick={() => toggleFilter(chip.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                    isActive
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                      : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400"
                  }`}
                >
                  {chip.label}
                  {isActive && <X className="w-3 h-3" />}
                </button>
              );
            })}

            {/* Clear all button — only shown when filters are active */}
            {(activeFilters.length > 0 || searchQuery) && (
              <button
                onClick={() => {
                  setActiveFilters([]);
                  setSearchQuery("");
                }}
                className="ml-auto text-xs text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Clear all
              </button>
            )}

            {/* Sort Dropdown */}
            <div className={`flex items-center gap-2 sm:ml-4 border-l pl-4 border-gray-200 dark:border-gray-700 ${(activeFilters.length > 0 || searchQuery) ? '' : 'ml-auto'}`}>
              <span className="text-xs text-gray-400 dark:text-gray-500 font-semibold">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs font-medium border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-1.5 pl-2 pr-6 focus:ring-2 focus:ring-indigo-400 focus:outline-none transition-all cursor-pointer"
              >
                <option value="manual">Manual Order</option>
                <option value="priority">Priority</option>
                <option value="dueDate">Due Date</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── Stats Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Tasks */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-md p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl shrink-0">
              <ClipboardList className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Total Tasks
              </p>
              <p className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 leading-tight">
                {totalTasks}
              </p>
            </div>
          </div>

          {/* In Progress */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-md p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-orange-100 dark:bg-orange-900/40 rounded-xl shrink-0">
              <ListTodo className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                In Progress
              </p>
              <p className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 leading-tight">
                {tasks.inProgress.length}
              </p>
            </div>
          </div>

          {/* Due Today */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-md p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 dark:bg-yellow-900/40 rounded-xl shrink-0">
              <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Due Today
              </p>
              <p className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 leading-tight">
                {dueTodayCount}
              </p>
            </div>
          </div>

          {/* Completed */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-md p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/40 rounded-xl shrink-0">
              <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Completed
              </p>
              <p className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 leading-tight">
                {tasks.done.length}
              </p>
            </div>
          </div>
        </div>

        {/* ── Progress bar ── */}
        {totalTasks > 0 && (
          <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-md p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Overall Progress
                </span>
              </div>
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                {completionRate}%
              </span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              {tasks.done.length} of {totalTasks} tasks completed
            </p>
          </div>
        )}

        {/* ── Kanban Board ── */}
        <div>
          <div className="flex items-center gap-2 mb-5">
            <ClipboardList className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">
              Task Board
            </h2>
          </div>

          {totalTasks === 0 && !loading && !debouncedSearchQuery && activeFilters.length === 0 ? (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-md p-12 flex flex-col items-center justify-center text-center mt-10">
              <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-900/40 rounded-full flex items-center justify-center mb-6">
                <ClipboardList className="w-12 h-12 text-indigo-500 dark:text-indigo-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Welcome to TaskFlow!</h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8">
                You don't have any tasks right now. Create your first task to get started on organizing your work.
              </p>
              <button
                onClick={() => {
                  setEditingTask(null);
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg active:scale-95"
              >
                <Plus className="w-5 h-5" />
                Create First Task
              </button>
            </div>
          ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={pointerWithin}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {COLUMNS.map((col) => (
                <DroppableColumn key={col.id} id={col.id}>
                  <div
                    className={`bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-md border-t-4 ${col.accentColor} flex flex-col min-h-[520px]`}
                  >
                    {/* Column Header */}
                    <div
                      className={`flex items-center justify-between px-5 py-4 border-b dark:border-gray-700 ${col.headerBg} rounded-t-xl`}
                    >
                      <div
                        className={`flex items-center gap-2 font-bold text-sm ${col.headerText}`}
                      >
                        {col.icon}
                        {col.label}
                      </div>
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${col.badgeBg}`}
                      >
                        {tasks[col.id].length}
                      </span>
                    </div>

                    {/* Tasks list */}
                    <SortableContext
                      items={filteredTasks[col.id].map((t) => t._id || t.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="flex flex-col gap-4 p-5 flex-1">
                        {loading ? (
                          <>
                            <SkeletonCard />
                            <SkeletonCard />
                            <SkeletonCard />
                          </>
                        ) : filteredTasks[col.id].length === 0 ? (
                          <div className="flex flex-col items-center justify-center flex-1 py-12 text-center">
                            <div
                              className={`flex items-center justify-center w-12 h-12 rounded-xl mb-3 ${col.headerBg}`}
                            >
                              <span className={col.headerText}>{col.icon}</span>
                            </div>
                            <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">
                              {searchQuery || activeFilters.length > 0
                                ? "No tasks match your search or filters"
                                : col.emptyText}
                            </p>
                          </div>
                        ) : (
                          filteredTasks[col.id].map((task) => (
                            <SortableItem
                              key={task._id || task.id}
                              id={task._id || task.id}
                            >
                              <TaskCard
                                task={task}
                                onEdit={() => handleOpenEdit(task)}
                                onDelete={() =>
                                  handleOpenDeleteConfirm(col.id, task._id || task.id)
                                }
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
                <div className="rotate-2 scale-105 opacity-90">
                  <TaskCard task={activeTask} />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
          )}
        </div>
      </div>

      <TaskFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAddTask={handleAddTask}
        onEditTask={handleUpdateTask}
        editTask={editingTask}
      />

      <ConfirmModal
        isOpen={!!taskToDelete}
        onClose={() => setTaskToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        isSubmitting={isDeleting}
      />
    </div>
  );
}
