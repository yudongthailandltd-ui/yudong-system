import { useState, useEffect, useMemo } from "react";
import { supabase } from "../../../services/supabaseClient";
import Swal from "sweetalert2";

export const useDocuments = () => {
  const [session, setSession] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(true);

  // 1. จัดการ Session และ Auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      // const name = session?.user?.user_metadata?.display_name || session?.user?.email?.split("@")[0];
      // ✅ วิธีดึงชื่อที่ถูกต้องจาก Metadata
const displayName = session?.user?.user_metadata?.display_name || session?.user?.email;
      setDisplayName(name);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. ดึงข้อมูล Documents (Logic เดิมที่ปรับให้สะอาดขึ้น)
  const fetchDocuments = async () => {
    setLoading(true);
    let allData = [];
    let from = 0;
    let to = 999;
    let hasMore = true;

    try {
      while (hasMore) {
        const { data, error } = await supabase
          .from("documents")
          .select("*")
          .range(from, to)
          .order("date_record", { ascending: false });

        if (error) throw error;
        if (data.length > 0) {
          allData = [...allData, ...data];
          from += 1000;
          to += 1000;
        }
        if (data.length < 1000) hasMore = false;
      }
      setDocuments(allData);
    } catch (err) {
      console.error("Fetch Error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) fetchDocuments();
  }, [session]);

  // 3. คำนวณ Stats (ใช้ useMemo เพื่อ Performance)
  const stats = useMemo(() => {
    const now = new Date();
    const next7Days = new Date();
    next7Days.setDate(now.getDate() + 7);

    return documents.reduce(
      (acc, doc) => {
        acc.totalNetPay += Number(doc.net_pay_amt) || 0;
        acc.totalWHT += Number(doc.wht_1_amt) || 0;
        
        const dueDate = new Date(doc.due_date);
        if (dueDate >= now && dueDate <= next7Days) acc.upcomingDue += 1;
        
        return acc;
      },
      { totalNetPay: 0, totalWHT: 0, upcomingDue: 0, count: documents.length }
    );
  }, [documents]);

  // 4. ฟังก์ชันจัดการข้อมูล (CRUD)
  const handleSave = async (newData) => {
    const currentUserName = session?.user?.user_metadata?.display_name || "Unknown";
    const { data, error } = await supabase
      .from("documents")
      .insert([{ ...newData, user_id: session.user.id, recorder_name: currentUserName }])
      .select();

    if (!error) {
      setDocuments((prev) => [data[0], ...prev]);
      Swal.fire("สำเร็จ", "บันทึกข้อมูลเรียบร้อย", "success");
      return true;
    } else {
      Swal.fire("ผิดพลาด", error.message, "error");
      return false;
    }
  };

// ฟังก์ชันสำหรับการนำเข้าข้อมูลจำนวนมาก (Bulk Insert)
  const handleImport = async (formattedData) => {
    try {
      const { error } = await supabase
        .from("documents")
        .insert(formattedData);

      if (error) throw error;

      Swal.fire("สำเร็จ", `นำเข้าข้อมูล ${formattedData.length} รายการเรียบร้อย`, "success");
      fetchDocuments(); // ดึงข้อมูลใหม่มาโชว์
      return true;
    } catch (err) {
      Swal.fire("ผิดพลาด", `ไม่สามารถนำเข้าได้: ${err.message}`, "error");
      return false;
    }
  };

  // ฟังก์ชันลบข้อมูล
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "ยืนยันการลบ?",
      text: "ข้อมูลนี้จะถูกลบออกจากระบบอย่างถาวร!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "ใช่, ลบเลย",
    });

    if (result.isConfirmed) {
      const { error } = await supabase.from("documents").delete().eq("id", id);
      if (!error) {
        setDocuments((prev) => prev.filter(doc => doc.id !== id));
        Swal.fire("ลบแล้ว!", "ข้อมูลถูกลบเรียบร้อย", "success");
      } else {
        Swal.fire("ผิดพลาด", error.message, "error");
      }
    }
  };
// ใน features/documents/hooks/useDocuments.js

// 1. ดึงชื่อจาก Metadata (ถ้าไม่มีให้ใช้ Email แทน)

// 2. ฟังก์ชันอัปเดตชื่อที่ถูกต้อง
const updateProfile = async (newName) => {
  try {
    const { error } = await supabase.auth.updateUser({
      data: { display_name: newName } // บันทึกลง Metadata
    });
    if (error) throw error;
    
    // สำคัญ: ต้องแจ้งให้ App ทราบว่าข้อมูลเปลี่ยน หรือใช้การ reload
    window.location.reload(); 
  } catch (error) {
    Swal.fire("Error", error.message, "error");
  }
};
  return {
    session,
    documents,
    stats,
    displayName,
    loading,
    fetchDocuments,
    handleSave,
    handleImport,
    handleDelete,
    updateProfile,
  };
};
