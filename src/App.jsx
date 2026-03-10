import React, { useState } from "react";
import { useDocuments } from "./features/documents/hooks/useDocuments";
import MainLayout from "./layouts/MainLayout";
import StatsGrid from "./features/documents/components/StatsGrid";
import DocumentTable from "./features/documents/components/DocumentTable";
import DocumentModal from "./features/documents/components/DocumentModal";
import Login from "./features/auth/Login";

function App() {
 const { 
    session, 
    documents, 
    stats, 
    displayName, 
    handleSave, 
    handleImport, // <--- เพิ่มตัวนี้
    handleDelete, // <--- เพิ่มตัวนี้ด้วยสำหรับปุ่มลบ
    fetchDocuments 
  } = useDocuments();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ถ้ายังไม่ Login ให้แสดงหน้า Login สไตล์ใหม่
  if (!session) return <Login />;

  return (
    <MainLayout user={session.user} displayName={displayName}>
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Workspace</h1>
          <p className="text-slate-500">ยินดีต้อนรับกลับมา, นี่คือสรุปข้อมูลบัญชีของคุณ</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-bold shadow-xl shadow-blue-200 transition-all active:scale-95 flex items-center gap-2"
        >
          + เพิ่มเอกสารใหม่
        </button>
      </header>

      {/* 1. Dashboard สรุปตัวเลข */}
      <StatsGrid stats={stats} />

      {/* 2. ตาราง AG-Grid */}
      <div className="h-[600px] rounded-3xl overflow-hidden shadow-2xl shadow-slate-200 border border-slate-100">
        <DocumentTable 
  data={documents} 
  onRefresh={fetchDocuments}
  onImport={handleImport} // เพิ่มตัวนี้
  onDelete={handleDelete} // เพิ่มตัวนี้
  onView={(data) => { /* Logic เปิดดู Detail */ }}
/>
      </div>

      {/* 3. Modal บันทึกข้อมูล (ใช้ของเดิมที่คุณมีได้เลย แค่ปรับ Style นิดหน่อย) */}
      <DocumentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleSave} 
      />
    </MainLayout>
  );
}

export default App;