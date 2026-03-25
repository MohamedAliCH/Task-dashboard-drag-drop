import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { User, Mail } from "lucide-react";

export default function Profile() {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] bg-gray-100 dark:bg-gray-950 transition-colors duration-200">
      <div className="page-container py-10 flex flex-col gap-8 mx-auto">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            My Profile
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm sm:text-base">
            Your account details and information.
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-md overflow-hidden">
          <div className="p-8 flex flex-col items-center border-b border-gray-200 dark:border-gray-700 bg-gray-100/50 dark:bg-gray-800/50">
            <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900/40 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{user.name || "User"}</h2>
            <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
          </div>
          
          <div className="p-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4 uppercase tracking-wider">
              Account Details
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg shrink-0 shadow-md">
                  <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Full Name</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{user.name || "Not set"}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg shrink-0 shadow-md">
                  <Mail className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Email Address</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{user.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
