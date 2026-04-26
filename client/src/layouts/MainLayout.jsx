import React from 'react';
import { LayoutDashboard, FileText, Settings, LogOut, User } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import Logo from '../assets/logo.png';
const MainLayout = ({ children, user, displayName, activeTab, setActiveTab }) => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
<aside className="w-64 bg-white text-slate-600 flex flex-col fixed h-full border-r border-slate-200 shadow-sm">
  {/* Logo Section */}
  <div className="p-8 border-b border-slate-100">
    <img src={Logo} alt="Yudong Logo" className="w-full max-w-[200px] h-auto" /><br />
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

  {/* User Profile Area */}
  <div className="p-4 border-t border-slate-100 bg-slate-50/50">
    <div className="flex items-center gap-3 mb-4 px-2">
      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-md">
        <User size={20} />
      </div>
      <div className="overflow-hidden">
        <p className="text-sm font-bold text-slate-800 truncate">{displayName}</p>
        <p className="text-[10px] text-slate-400 truncate font-medium">{user?.email}</p>
      </div>
    </div>
    <button 
      onClick={handleLogout}
      className="w-full flex items-center gap-2 p-3 rounded-xl text-red-500 hover:bg-red-50 transition-all text-sm font-bold active:scale-95"
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
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 translate-x-1' 
        : 'text-slate-500 hover:bg-slate-100 hover:text-blue-600'
    }`}
  >
    {icon}
    <span className="font-bold text-sm">{label}</span>
  </div>
);

export default MainLayout;