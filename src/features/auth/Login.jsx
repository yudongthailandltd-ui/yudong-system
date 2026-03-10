import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { Mail, Lock, Loader2, ShieldCheck } from 'lucide-react';
import Swal from 'sweetalert2';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      Swal.fire("Error", "อีเมลหรือรหัสผ่านไม่ถูกต้อง", "error");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* ฝั่งซ้าย: Brand & Visual */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 items-center justify-center p-12 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <div className="relative z-10 max-w-md">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl mb-8 flex items-center justify-center shadow-2xl shadow-blue-500/20">
            <ShieldCheck size={40} />
          </div>
          <h1 className="text-5xl font-bold mb-6 tracking-tighter">YUDONG<br/><span className="text-blue-500">Logistics ERP</span></h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            ระบบจัดการเอกสารบัญชีและภาษีนำเข้า-ส่งออกที่มีประสิทธิภาพสูงสุด สำหรับทีมงานมืออาชีพ
          </p>
        </div>
      </div>

      {/* ฝั่งขวา: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50">
        <div className="max-w-md w-full">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">เข้าสู่ระบบ</h2>
            <p className="text-slate-500">กรุณาระบุบัญชีพนักงานเพื่อเริ่มใช้งาน</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-slate-400" size={18} />
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
              <label className="text-sm font-semibold text-slate-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-slate-400" size={18} />
                <input 
                  type="password" 
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button 
              disabled={loading}
              className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Sign In to Workspace"}
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