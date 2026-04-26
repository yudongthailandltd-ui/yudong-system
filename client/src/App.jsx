import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDocuments } from "./features/documents/hooks/useDocuments";
import MainLayout from "./layouts/MainLayout";
import StatsGrid from "./features/documents/components/StatsGrid";
import DocumentTable from "./features/documents/components/DocumentTable";
import DocumentModal from "./features/documents/components/DocumentModal";
import Login from "./features/auth/Login";
import ForgotPassword from "./features/auth/ForgotPassword";
import ResetPassword from "./features/auth/ResetPassword";
import { supabase } from "./services/supabaseClient";

// --- Sub-Components ---
const EmailConfigForm = () => {
  const [targetEmail, setTargetEmail] = useState("");

  React.useEffect(() => {
    async function loadEmail() {
      const { data } = await supabase
        .from("email_configs")
        .select("recipients")
        .eq("id", 1)
        .maybeSingle();

      if (data && data.recipients) {
        setTargetEmail(data.recipients.join(", ")); 
      }
    }
    loadEmail();
  }, []);

  const handleSaveEmail = async () => {
    const emailArray = targetEmail.split(",").map(e => e.trim()).filter(e => e !== "");
    const { error } = await supabase
      .from("email_configs")
      .upsert({ 
        id: 1, 
        group_name: "Admin Team", 
        recipients: emailArray 
      });

    if (!error) {
      alert("บันทึกรายชื่ออีเมลแจ้งเตือนสำเร็จ");
    } else {
      console.error(error);
      alert("เกิดข้อผิดพลาด: " + error.message);
    }
  };

  return (
    <div className="space-y-4">
      <label className="text-sm font-bold text-slate-600">รายชื่ออีเมลผู้รับ (คั่นด้วยเครื่องหมาย , )</label>
      <div className="flex gap-4">
        <input
          type="text"
          value={targetEmail}
          onChange={(e) => setTargetEmail(e.target.value)}
          placeholder="admin@mail.com, manager@mail.com"
          className="flex-1 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
        />
        <button
          onClick={handleSaveEmail}
          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-100"
        >
          บันทึก
        </button>
      </div>
    </div>
  );
};

const UserProfileSettings = ({ displayName, onUpdate }) => {
  const [newName, setNewName] = useState(displayName || "");
  React.useEffect(() => { setNewName(displayName); }, [displayName]);

  return (
    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
      <h3 className="font-bold text-slate-800 mb-4">แก้ไขชื่อผู้ใช้</h3>
      <div className="flex gap-4">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="ระบุชื่อใหม่ของคุณ"
          className="border border-slate-200 rounded-xl px-4 py-2 flex-1 focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <button
          onClick={() => onUpdate?.(newName)}
          className="bg-slate-800 text-white px-6 py-2 rounded-xl font-bold hover:bg-slate-700 transition-colors"
        >
          บันทึกชื่อ
        </button>
      </div>
    </div>
  );
};

// --- Main App Component ---
function App() {
  const {
    session,
    documents,
    stats,
    displayName,
    handleSave,
    handleImport,
    handleDelete,
    fetchDocuments,
    updateProfile,
  } = useDocuments();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Dashboard");

  return (
    <BrowserRouter>
      <Routes>
        {/* 1. Public Routes: เข้าได้ตลอดเวลา หรือ Redirect ถ้า Login แล้ว */}
        <Route path="/login" element={!session ? <Login /> : <Navigate to="/" />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* 2. Private Routes: ต้องมี Session เท่านั้น */}
        <Route 
          path="/" 
          element={
            session ? (
              <MainLayout
                user={session.user}
                displayName={displayName}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              >
                {activeTab === "Dashboard" && (
                  <div className="space-y-8">
                    <header className="flex justify-between items-center">
                      <div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Dashboard</h1>
                        <p className="text-slate-500">ยินดีต้อนรับ, {displayName}</p>
                      </div>
                      <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-bold shadow-xl shadow-blue-200 transition-all active:scale-95 flex items-center gap-2"
                      >
                        + เพิ่มเอกสารใหม่
                      </button>
                    </header>

                    <StatsGrid stats={stats} />

                    <div className="bg-white rounded-2xl overflow-hidden shadow-2xl shadow-slate-200 border border-slate-100">
                      <div className="p-2 h-[750px]">
                        <DocumentTable
                          data={documents}
                          onRefresh={fetchDocuments}
                          onImport={handleImport}
                          onDelete={handleDelete}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "Email Config" && (
                  <div className="max-w-4xl space-y-6">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                      <UserProfileSettings displayName={displayName} onUpdate={updateProfile} />
                    </div>
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                      <h3 className="font-bold text-slate-800 mb-2">Email Notification</h3>
                      <EmailConfigForm />
                    </div>
                  </div>
                )}

                <DocumentModal
                  isOpen={isModalOpen}
                  onClose={() => setIsModalOpen(false)}
                  onSubmit={handleSave}
                />
              </MainLayout>
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        
        {/* 3. Fallback: ถ้าไปมั่วๆ ให้กลับไปหน้าหลัก */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;