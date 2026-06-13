import React, { useState, useEffect } from 'react';
import { Search, LogOut, ArrowLeft } from 'lucide-react'; // ضفنا سهم الرجوع للموبايل
import { getAllConversions } from '../Api/conversionService.js';
import ChatWindow from '../component/ChatWindow.jsx';

const Home = () => {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false); // للتحكم بظهور الشات عالموبايل

  useEffect(() => {
    const fetchChats = async () => {
      try {
        setLoading(true);
        const data = await getAllConversions();
        if (data && data.length > 0) {
          setChats(data);
          // نحدد أول محادثة تلقائياً فقط على شاشات الديسكتوب
          if (window.innerWidth >= 768) {
            setActiveChat(data[0]);
          }
        }
      } catch (error) {
        console.error("Failed to load chats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchChats();

    // عشان نرجع الترتيب صح لو المستخدم كبّر المتصفح فجأة
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsMobileChatOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // دالة اختيار المحادثة
  const handleChatSelect = (chat) => {
    setActiveChat(chat);
    setIsMobileChatOpen(true); // نفتح نافذة الشات فوراً عالموبايل
  };

  return (
    // min-w-[320px] بتمنع الشاشة تضرب على أصغر تلفون موجود
    <div className="flex h-screen w-screen bg-[#070a12] text-slate-100 overflow-hidden font-sans antialiased select-none min-w-[320px]">
      
      {/* 🟢 السايدبار: ثابت عالديسكتوب، ومخفي عالموبايل إذا الشات مفتوح */}
      <div className={`h-full w-full md:w-80 lg:w-96 bg-slate-900 border-r border-slate-800/60 flex-col shrink-0 z-20 transition-all ${
        isMobileChatOpen ? 'hidden md:flex' : 'flex'
      }`}>
        
        {/* هيدر السايدبار (flex-none لثبات الارتفاع) */}
        <div className="flex-none h-16 px-4 border-b border-slate-800/60 flex items-center justify-between bg-slate-900/40">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/5 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-lg shrink-0">
              S
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-white truncate tracking-wide">Sohaib Mohammad</h3>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span> HQ Node
              </span>
            </div>
          </div>
          <button className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors shrink-0">
            <LogOut size={18} />
          </button>
        </div>

        {/* خانة البحث (flex-none) */}
        <div className="flex-none h-16 p-3 bg-slate-900 border-b border-slate-800/30 flex items-center">
          <div className="relative w-full">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Filter channels..." 
              className="w-full h-10 bg-[#070a12] border border-slate-800 rounded-xl pl-9 pr-4 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-all"
            />
          </div>
        </div>

        {/* قائمة المحادثات (flex-1 min-h-0 عشان السكرول يظل محكوم داخلها) */}
        <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1 bg-slate-900/50 scroll-smooth">
          {loading ? (
            <div className="text-center text-xs text-slate-500 mt-12 animate-pulse font-medium">Fetching active channels...</div>
          ) : chats.length === 0 ? (
            <div className="text-center text-xs text-slate-600 mt-12 font-medium">No secure tunnels established.</div>
          ) : (
            chats.map((chat) => {
              const chatName = chat.conversationName || chat.groupName || 'Unnamed Chat';
              const isSelected = activeChat && activeChat.id === chat.id;

              return (
                <div
                  key={chat.id}
                  onClick={() => handleChatSelect(chat)}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-all duration-150 relative ${
                    isSelected 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-white' 
                      : 'hover:bg-slate-800/30 border-transparent text-slate-400'
                  }`}
                >
                  {/* خط التحديد يظهر فقط عالديسكتوب عشان ما يزعج العين عالموبايل */}
                  {isSelected && (
                    <div className="absolute left-0 top-2 bottom-2 w-1 bg-emerald-500 rounded-r-md hidden md:block" />
                  )}

                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border ${
                    isSelected ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-[#070a12] text-slate-400 border-slate-800'
                  }`}>
                    {chatName.charAt(0)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h4 className={`text-xs font-bold truncate tracking-wide ${isSelected ? 'text-emerald-400' : 'text-slate-200'}`}>
                        {chatName}
                      </h4>
                      <span className="text-[9px] text-slate-500 shrink-0 font-medium">{chat.time || 'Now'}</span>
                    </div>
                    <p className={`text-xs truncate ${isSelected ? 'text-slate-200' : 'text-slate-400'}`}>
                      {chat.lastMessage || 'Open communication window...'}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 🔵 ساحة الشات: flex-1 min-w-0 ضرورية جداً لمنع الشات من دحش السايدبار */}
      <div className={`flex-1 min-w-0 h-full flex-col bg-[#070a12] overflow-hidden relative ${
        !isMobileChatOpen ? 'hidden md:flex' : 'flex'
      }`}>
        
        {/* زر رجوع أنيق يظهر فقط عالموبايل */}
        {isMobileChatOpen && (
          <div className="md:hidden absolute top-3 right-4 z-50">
            <button 
              onClick={() => setIsMobileChatOpen(false)} 
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/90 backdrop-blur border border-slate-700 rounded-lg text-emerald-400 text-[11px] font-bold shadow-xl hover:bg-slate-700 transition-colors"
            >
              <ArrowLeft size={14} />
              Back
            </button>
          </div>
        )}

        <ChatWindow activeChat={activeChat} />
      </div>

    </div>
  );
};

export default Home;