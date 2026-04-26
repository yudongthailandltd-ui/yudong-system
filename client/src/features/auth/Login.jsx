import React, { useState } from "react";
import { supabase } from "../../services/supabaseClient";
import { Mail, Lock, Loader2, ShieldCheck } from "lucide-react";
import Swal from "sweetalert2";
import logo from '../../assets/logo.png';
import { useNavigate } from "react-router-dom"; // 1. Import มาก่อน
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // 2. ประกาศตัวแปรเรียกใช้
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      Swal.fire("Error", "อีเมลหรือรหัสผ่านไม่ถูกต้อง", "error");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* ฝั่งซ้าย: Brand & Visual */}
      <div className="hidden lg:flex w-1/2 bg-[url('../src/assets/bg.jpeg')] items-center justify-center p-12 text-white relative overflow-hidden">
      {/* overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/50 to-slate-900/30 z-0"></div>  
        <div className="relative z-10 max-w-md">
          <h1 className="text-5xl font-bold mb-6 tracking-tighter">
            YUDONG
            <br />
            <span className="text-blue-500">Logistics System</span>
          </h1>
          <p className="text-slate-100 text-lg leading-relaxed ">
            ระบบจัดการเอกสารบัญชีและภาษีนำเข้า-ส่งออกที่มีประสิทธิภาพสูงสุด
            สำหรับทีมงานมืออาชีพ
          </p>
        </div>
      </div>

      {/* ฝั่งขวา: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50">
        <div className="max-w-md w-full">
          <div className="mb-10  lg:text-left">
            <img src={logo} alt="Yudong Logo" className="w-60 mb-4 mx-auto" />
            <h2 className="text-3xl text-center font-bold text-slate-800 mb-2">
              เข้าสู่ระบบ
            </h2>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-3.5 text-slate-400"
                  size={18}
                />
                <input
                  type="email"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                  placeholder="name@yudong.co.th"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-3.5 text-slate-400"
                  size={18}
                />
                <input
                  type="password"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")} // 3. ใช้งานแบบนี้ครับ
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                >
                  ลืมรหัสผ่าน?
                </button>
              </div>
            </div>

            <button
              disabled={loading}
              className="cursor-pointer   w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                "Sign In to Workspace"
              )}
            </button>
          </form>

          <footer className="mt-12 text-center text-slate-400 text-xs">
            © 2026 Yudong Logistics System. All rights reserved.
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Login;
