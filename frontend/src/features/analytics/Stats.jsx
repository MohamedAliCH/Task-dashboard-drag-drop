import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";
import { toast } from "react-toastify";
import {
  BarChart3,
  CheckCircle2,
  ListTodo,
  AlertCircle,
  Flag,
  Loader2,
} from "lucide-react";

export default function Stats() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const res = await api.get("/tasks");
        setTasks(res.data);
      } catch (err) {
        console.error("Stats fetch error:", err);
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          toast.error("Failed to load stats data.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex-1 min-h-[calc(100vh-4rem)] flex items-center justify-center p-10 bg-gray-100 dark:bg-gray-950">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "done").length;
  const inProgressTasks = tasks.filter((t) => t.status === "inProgress").length;
  const todoTasks = tasks.filter((t) => t.status === "todo").length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const overdueTasks = tasks.filter((t) => {
    if (!t.due || t.due === "No due date") return false;
    return new Date(t.due) < new Date(new Date().toDateString());
  }).length;

  const priorityCounts = {
    high: tasks.filter((t) => t.priority === "high").length,
    medium: tasks.filter((t) => t.priority === "medium").length,
    low: tasks.filter((t) => t.priority === "low").length,
  };

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] bg-gray-100 dark:bg-gray-950 transition-colors duration-200">
      <div className="page-container py-10 flex flex-col gap-8 mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl">
            <BarChart3 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
              Analytics Overview
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm sm:text-base">
              Your task completion metrics and priority distribution
            </p>
          </div>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-md p-6 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900/40 rounded-lg shrink-0">
                <ListTodo className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Total</p>
            </div>
            <p className="text-4xl font-extrabold text-gray-900 dark:text-gray-100">{totalTasks}</p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-md p-6 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-900/40 rounded-lg shrink-0">
                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Completed</p>
            </div>
            <p className="text-4xl font-extrabold text-gray-900 dark:text-gray-100">{completedTasks}</p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-md p-6 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg shrink-0">
                <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Done Rate</p>
            </div>
            <p className="text-4xl font-extrabold text-gray-900 dark:text-gray-100">{completionRate}%</p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-md p-6 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center justify-center w-8 h-8 bg-red-100 dark:bg-red-900/40 rounded-lg shrink-0">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
              </div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Overdue</p>
            </div>
            <p className="text-4xl font-extrabold text-gray-900 dark:text-gray-100">{overdueTasks}</p>
          </div>
        </div>

        {/* Status & Priority Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Status Breakdown */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-md p-8">
            <h3 className="flex items-center gap-2 text-lg font-bold text-gray-800 dark:text-gray-200 mb-8">
              <ListTodo className="w-5 h-5 text-indigo-500" />
              Tasks by Status
            </h3>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">To Do</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-md">{todoTasks}</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-indigo-400 h-full rounded-full transition-all duration-1000" style={{ width: `${totalTasks ? (todoTasks/totalTasks)*100 : 0}%` }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">In Progress</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-md">{inProgressTasks}</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-orange-400 h-full rounded-full transition-all duration-1000" style={{ width: `${totalTasks ? (inProgressTasks/totalTasks)*100 : 0}%` }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">Done</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-md">{completedTasks}</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-green-400 h-full rounded-full transition-all duration-1000" style={{ width: `${totalTasks ? (completedTasks/totalTasks)*100 : 0}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Priority Breakdown */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-md p-8">
            <h3 className="flex items-center gap-2 text-lg font-bold text-gray-800 dark:text-gray-200 mb-8">
              <Flag className="w-5 h-5 text-pink-500" />
              Tasks by Priority
            </h3>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-red-600 dark:text-red-400">High Priority</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-md">{priorityCounts.high}</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-red-500 h-full rounded-full transition-all duration-1000" style={{ width: `${totalTasks ? (priorityCounts.high/totalTasks)*100 : 0}%` }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">Medium Priority</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-md">{priorityCounts.medium}</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-yellow-500 h-full rounded-full transition-all duration-1000" style={{ width: `${totalTasks ? (priorityCounts.medium/totalTasks)*100 : 0}%` }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-green-600 dark:text-green-400">Low Priority</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-md">{priorityCounts.low}</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-green-500 h-full rounded-full transition-all duration-1000" style={{ width: `${totalTasks ? (priorityCounts.low/totalTasks)*100 : 0}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
