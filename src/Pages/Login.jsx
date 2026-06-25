import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Eye, EyeOff, MessageSquareText } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // عشان ننقله لصفحة الهوم بعد ما يسجل دخول
import { login } from '../Api/authService';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
const {name, value}=e.target;
   setFormData({...formData, [name]: value});

   };

  const  handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // هون بتنادي الـ API الفعلي ولما يرجع الـ Token بنجاح بتعمل التوجيه
    console.log("Connecting to Chat Server...", formData);
     try {
      const userData = await login(formData);
      // axios بيمسك status 200 تلقائياً
      if (userData && (userData.status === 200 || userData.token)) {
        if (userData.token) localStorage.setItem('token', userData.token);
        navigate('/home');
      }
    } catch (error) {
      console.error("Login Error:", error.response);
      const serverMessage = error.response?.data?.message || "البريد الإلكتروني أو كلمة المرور غير صحيحة";
      setErrors({ server: serverMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 selection:bg-emerald-500 selection:text-slate-950 relative overflow-hidden">
      
      {/* تأثير الإضاءة المودرن المتناثرة في الخلفية (Chat App Neon Glow) */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* الكارد الرئيسي الزجاجي */}
      <div className="w-full max-w-md bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 p-8 rounded-2xl shadow-2xl relative z-10">
        
        {/* اللوجو والهيدر الخاص بالشات */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3.5 bg-gradient-to-br from-emerald-500/20 to-teal-500/5 border border-emerald-500/30 rounded-2xl text-emerald-400 mb-4 shadow-inner shadow-emerald-500/10">
            <MessageSquareText size={32} className="animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Sync Into Your Chats</h2>
          <p className="text-xs text-slate-400 mt-2">Connect instantly with your friends and technical peers</p>
        </div>

        {/* فورم تسجيل الدخول */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* حقل الإيميل */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <Mail size={18} />
              </span>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="suhib@example.com"
                className="w-full bg-slate-950/40 border border-slate-800/80 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all duration-200"
              />
            </div>
          </div>

          {/* حقل الباسورد */}
          <div>
            <div className="flex justify-between items-baseline mb-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
              <a href="#" className="text-[11px] text-slate-500 hover:text-emerald-400 transition-colors">Forgot password?</a>
            </div>
            
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <Lock size={18} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-slate-950/40 border border-slate-800/80 rounded-xl pl-10 pr-10 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* زر تسجيل الدخول المباشر */}
          <button
            type="submit"
            className={`w-full mt-2 ${loading ? 'bg-emerald-100' : 'bg-emerald-500'} hover:bg-emerald-400 text-slate-950 font-bold py-3 px-4 rounded-xl shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 group transition-all duration-200 active:scale-[0.98]`}
          >
            Launch Messenger
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
          </button>
        </form>

        {/* فوتر إنشاء حساب جديد */}
        <div className="mt-8 pt-6 border-t border-slate-800/60 text-center">
          <p className="text-xs text-slate-500">
            New to the platform? <a href="#" className="text-slate-300 hover:text-emerald-400 font-medium transition-colors">Create an account</a>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;