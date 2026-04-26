/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import axios from 'axios';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, { email });
      Swal.fire("สำเร็จ", "ตรวจสอบอีเมลของคุณเพื่อดำเนินการต่อ", "success");
    } catch (err) {
      Swal.fire("Error", "ไม่สามารถส่งอีเมลได้ กรุณาลองใหม่", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 items-center justify-center p-6">
      <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl shadow-slate-200 border border-slate-100">
        <button className="flex items-center gap-2 text-slate-400 hover:text-slate-600 mb-8 transition-colors text-sm font-medium cursor-pointer"
          onClick={() => window.history.back()}
        >
          <ArrowLeft size={16} /> กลับไปหน้าเข้าสู่ระบบ
          
        </button>
        
        <h2 className="text-3xl font-bold text-slate-800 mb-2">ลืมรหัสผ่าน</h2>
        <p className="text-slate-500 mb-8 text-sm">ระบุอีเมลที่ใช้ลงทะเบียน ระบบจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปให้ครับ</p>

        <form onSubmit={handleRequest} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-slate-400" size={18} />
              <input 
                type="email" 
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="name@yudong.co.th"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <button 
            disabled={loading}
            className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "ส่งอีเมลรีเซ็ตรหัสผ่าน"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword; // <--- ต้องมีบรรทัดนี้อยู่ที่ล่างสุดของไฟล์