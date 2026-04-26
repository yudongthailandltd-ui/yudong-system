/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient';
import { Lock, Loader2, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import Swal from 'sweetalert2';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // ตรวจสอบว่า User มี Session จากการคลิกลิงก์อีเมลหรือไม่
  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        console.log("🛠️ [DEBUG] เข้าสู่โหมดกู้คืนรหัสผ่านเรียบร้อย");
      }
    });
  }, []);

  const handleReset = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return Swal.fire("Error", "รหัสผ่านไม่ตรงกัน", "error");
    }

    if (password.length < 6) {
      return Swal.fire("Error", "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร", "error");
    }

    setLoading(true);

    try {
      // อัปเดตรหัสผ่านใหม่ผ่าน Supabase Client โดยตรง
      // (Supabase จะใช้ Session จาก URL ที่ User คลิกมาจัดการให้เอง)
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      await Swal.fire({
        title: "สำเร็จ!",
        text: "เปลี่ยนรหัสผ่านใหม่เรียบร้อยแล้ว กรุณาเข้าสู่ระบบอีกครั้ง",
        icon: "success",
        confirmButtonColor: "#1e293b",
      });

      navigate('/login');
    } catch (error) {
      Swal.fire("Error", error.message || "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 items-center justify-center p-6">
      <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl shadow-slate-200 border border-slate-100">
        <div className="flex justify-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <ShieldCheck size={28} />
          </div>
        </div>

        <h2 className="text-3xl font-bold text-slate-800 text-center mb-2">ตั้งรหัสผ่านใหม่</h2>
        <p className="text-slate-500 text-center mb-8 text-sm px-4">
          กรุณากำหนดรหัสผ่านใหม่ที่คาดเดาได้ยากเพื่อความปลอดภัยของบัญชี
        </p>

        <form onSubmit={handleReset} className="space-y-5">
          {/* New Password */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">รหัสผ่านใหม่</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-slate-400" size={18} />
              <input 
                type={showPassword ? "text" : "password"}
                className="w-full pl-10 pr-12 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">ยืนยันรหัสผ่านใหม่</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-slate-400" size={18} />
              <input 
                type={showPassword ? "text" : "password"}
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            disabled={loading}
            className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 active:scale-[0.98] mt-4"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "ยืนยันการเปลี่ยนรหัสผ่าน"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;