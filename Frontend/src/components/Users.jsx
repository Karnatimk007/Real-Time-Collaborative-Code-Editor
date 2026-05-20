import { motion, AnimatePresence } from "framer-motion";
import { Circle } from "lucide-react";
import { useAuth } from "../store/authStore";

function Users({ users = [] }) {
  const { currentUser } = useAuth();
  return (
    <div className="flex flex-col h-full bg-cyber-900">
      <div className="p-4 border-b border-cyber-700 flex justify-between items-center bg-cyber-800/50 backdrop-blur-sm z-10">
        <h3 className="font-semibold text-gray-200 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-neon-green shadow-[0_0_8px_rgba(152,195,121,0.8)] animate-pulse"></span>
          Active Participants ({users.length})
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        <AnimatePresence>
          {users.map((user, index) => (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              key={user + index}
              className="flex items-center gap-3 p-3 bg-cyber-800 border border-cyber-700 rounded-lg shadow-sm hover:border-cyber-600 transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-blue to-blue-600 flex items-center justify-center text-white font-bold shrink-0 shadow-md">
                {user.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-200 text-sm font-medium truncate">
                  {user === currentUser?.username ? "You" : user}
                </p>
                <p className="text-[10px] text-cyber-500 flex items-center gap-1 mt-0.5">
                  <Circle size={8} fill="currentColor" className="text-neon-green" />
                  Online
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {users.length === 0 && (
          <div className="text-center text-cyber-500 text-sm mt-10">
            No active users found.
          </div>
        )}
      </div>
    </div>
  );
}

export default Users;