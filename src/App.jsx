import React, { useState } from "react";
import { useDocuments } from "./features/documents/hooks/useDocuments";
import MainLayout from "./layouts/MainLayout";
import StatsGrid from "./features/documents/components/StatsGrid";
import DocumentTable from "./features/documents/components/DocumentTable";
import DocumentModal from "./features/documents/components/DocumentModal";
import Login from "./features/auth/Login";

import { supabase } from "./services/supabaseClient"; // <--- เพิ่มบรรทัดนี้ (เช็ค Path ให้ตรงกับโปรเจกต์คุณ)
// ... import อื่นๆ
const EmailConfigForm = () => {
  const [targetEmail, setTargetEmail] = useState("");

  // ดึงค่าอีเมลปัจจุบันจากฐานข้อมูลมาโชว์ในช่องกรอก
  React.useEffect(() => {
    async function loadEmail() {
      const { data, error } = await supabase
        .from("configs")
        .select("value")
        .eq("key", "notification_email")
        .maybeSingle(); // ใช้ maybeSingle เพื่อไม่ให้ error ถ้ายังไม่มีข้อมูล

      if (data) setTargetEmail(data.value);
    }
    loadEmail();
  }, []);

  const handleSaveEmail = async () => {
    const { error } = await supabase
      .from("configs")
      .upsert(
        { key: "notification_email", value: targetEmail },
        { onConflict: "key" },
      );

    if (!error) {
      alert("บันทึกอีเมลสำเร็จ");
    }
  };

  return (
    <div className="flex gap-4">
      <input
        type="email"
        value={targetEmail} // ผูกค่ากับ State ทำให้โชว์ค่าปัจจุบัน
        onChange={(e) => setTargetEmail(e.target.value)} // ทำให้พิมพ์แก้ไขได้
        placeholder="ระบุอีเมลผู้รับแจ้งเตือน"
        className="flex-1 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        onClick={handleSaveEmail}
        className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold"
      >
        บันทึก
      </button>
    </div>
  );
};

// ✅ 1. ย้ายมาไว้ด้านบน และเช็คค่าเริ่มต้นของ newName ให้ดี
const UserProfileSettings = ({ displayName, onUpdate }) => {
  const [newName, setNewName] = useState(displayName || "");

  // ป้องกันกรณีที่ displayName เปลี่ยนแปลงจากภายนอก (เช่นตอนโหลดเสร็จ)
  React.useEffect(() => {
    setNewName(displayName);
  }, [displayName]);

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
          onClick={() => {
            if (typeof onUpdate === "function") {
              onUpdate(newName);
            } else {
              console.error("onUpdate is not a function");
            }
          }}
          className="bg-slate-800 text-white px-6 py-2 rounded-xl font-bold hover:bg-slate-700 transition-colors"
        >
          บันทึกชื่อ
        </button>
      </div>
    </div>
  );
};

function App() {
  // ✅ 2. ตรวจสอบว่าใน useDocuments มีการ return updateProfile ออกมาแล้ว
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

  if (!session) return <Login />;

  return (
    <MainLayout
      user={session.user}
      displayName={displayName}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      {/* --- หน้า Dashboard (รวม Documents ไว้ที่นี่แล้ว) --- */}
      {activeTab === "Dashboard" && (
        <div className="space-y-8">
          <header className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                Dashboard
              </h1>
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

          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl shadow-slate-200 border border-slate-100">
            <div className="p-1 h-[600px]">
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

      {/* --- หน้า Settings (จัดการโปรไฟล์และอีเมล) --- */}
      {activeTab === "Email Config" && (
        <div className="max-w-4xl space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            {/* ส่ง displayName และ updateProfile เข้าไป */}
            <UserProfileSettings
              displayName={displayName}
              onUpdate={updateProfile}
            />
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-2">
              Email Notification
            </h3>
            <EmailConfigForm /> {/* ใช้ Component ที่เราสร้างไว้ข้างบน */}
          </div>
        </div>
      )}

      <DocumentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSave}
      />
    </MainLayout>
  );
}

export default App;
