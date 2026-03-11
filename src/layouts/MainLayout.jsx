import React from 'react';
import { LayoutDashboard, FileText, Settings, LogOut, User } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

const MainLayout = ({ children, user, displayName, activeTab, setActiveTab }) => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col fixed h-full">
        {/* Logo Section */}
        <div className="p-6 border-b border-slate-800">
           <h2 className="text-xl font-bold text-white tracking-tighter flex items-center gap-2 italic">
            <div className="w-8 h-8 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/50"></div>
            YUDONG
          </h2>
        </div>

        <nav className="flex-1 p-4 space-y-2 mt-4">
          <NavItem 
    icon={<LayoutDashboard size={20} />} 
    label="Dashboard" 
    active={activeTab === "Dashboard"} 
    onClick={() => setActiveTab("Dashboard")}
  />
  <NavItem 
    icon={<Settings size={20} />} 
    label="Email Config" 
    active={activeTab === "Email Config"} 
    onClick={() => setActiveTab("Email Config")}
  />
        </nav>

        {/* User Profile in Sidebar */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white">
              <User size={20} />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate">{displayName}</p>
              <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-2 p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors text-sm"
          >
            <LogOut size={18} /> ออกจากระบบ
          </button>
        </div>
      </aside>
      
      {/* Main Content Area */}
      <main className="ml-64 flex-1 p-8">
        {children}
      </main>
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick }) => (
  <div 
    onClick={onClick}
    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
      active 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40 translate-x-1' 
        : 'hover:bg-slate-800 hover:text-white'
    }`}
  >
    {icon}
    <span className="font-bold text-sm">{label}</span>
  </div>
);

export default MainLayout;