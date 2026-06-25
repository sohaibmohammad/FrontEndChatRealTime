import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Phone,
  Video,
  MoreVertical,
  MessageSquare,
  Check,
  CheckCheck,
} from "lucide-react";
import { getMessages, sendMessage } from "../Api/messageService";
import * as signalR from "@microsoft/signalr";
import { useChat } from "../hooks/useChat";
const ChatWindow = ({ activeChat }) => {
const { messages, setMessages, loadingMessages, isPartnerTyping, connectionRef, typingTimeoutRef } = useChat(activeChat);
    const [messageText, setMessageText] = useState("");
    const messagesEndRef = useRef(null);

useEffect(() => {
  const chatContainer = messagesEndRef.current?.parentElement;
  
  if (chatContainer) {
    const isAtBottom = chatContainer.scrollHeight - chatContainer.scrollTop <= chatContainer.clientHeight + 150;
    
    // النزول فقط إذا كان المستخدم في القاع بالفعل (أو يقرأ آخر الرسائل)
    if (isAtBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }
}, [messages, isPartnerTyping]);// 👈 يراقب مصفوفة الرسائل باستمرار
  // 1. جلب تاريخ الرسائل الفعلي وتوحيد بنية البيانات فوراً
  

  // 2. إدارة دورة حياة اتصال الـ SignalR واستقبال البث الحي
 

const handleInputChange = (e) => {
    setMessageText(e.target.value);

    const connection = connectionRef.current;
    if (connection && connection.state === signalR.HubConnectionState.Connected) {
      // إرسال إشارة أنني أكتب الآن
      connection.invoke("SendTypingStatus", activeChat.id, true)
        .catch(err => console.error("SendTypingStatus Error:", err));

      // نظام الـ Debouncing: إلغاء المؤقت القديم وإعداد مؤقت جديد لإرسال (false) بعد ثانيتين من التوقف عن اللمس
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      typingTimeoutRef.current = setTimeout(() => {
        if (connection && connection.state === signalR.HubConnectionState.Connected) {
          connection.invoke("SendTypingStatus", activeChat.id, false)
            .catch(err => console.error("SendTypingStatus Error:", err));
        }
      }, 2000);
    }
  };

  // 3. معالجة إرسال الرسالة عبر الـ API وتحديث الحالة محلياً ببنية موحدة
const handleSendMessage = async (e) => {
  e.preventDefault();
  if (!messageText.trim()) return;

  const timestamp = Date.now().toString(); // بصمة فريدة
  const newMsg = {
    id: timestamp, // نستخدمه كمعرف مؤقت
    isMine: true,
    text: messageText,
    createdAt: new Date().toISOString(),
    status: "Sent",
  };

  setMessages((prev) => [...prev, newMsg]);
  const currentText = messageText;
  setMessageText("");

  try {
    await sendMessage({
      conversationId: activeChat.id,
      content: currentText,
    });
  } catch (error) {
    setMessages((prev) => prev.map((m) => m.id === timestamp ? { ...m, status: "Failed" } : m));
  }
};

  const renderMessageStatus = (status) => {
    if (status === "Sent") return <Check size={14} className="text-slate-500" />;
    if (status === "Delivered") return <CheckCheck size={14} className="text-slate-400" />;
    if (status === "Read") return <CheckCheck size={14} className="text-emerald-400" />;
    return null;
  };

  if (!activeChat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-500 bg-slate-950">
        <MessageSquare size={48} className="text-slate-700 mb-3 animate-bounce" />
        <p className="text-sm">Select a conversation to start syncing</p>
      </div>
    );
  }

  const chatName = activeChat.conversationName || activeChat.groupName || "Unnamed Chat";

  return (
    <div className="flex-1 flex flex-col bg-slate-950 relative">
      {/* هيدر الشات */}
     <div className="fixed p-4 bg-slate-900/60 backdrop-blur-md border-b border-slate-800 flex items-center justify-between z-10 w-[100%] md:w-[calc(100%-300px)] lg:w-[calc(100%-400px)]">
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-semibold">
      {chatName.charAt(0)}
    </div>

    {/* هذا هو الجزء المعدل ليصبح ثابتاً */}
    <div className="flex flex-col justify-center">
      <h3 className="text-sm font-semibold text-white">{chatName}</h3>
      <div className="h-4 flex items-center">
        {isPartnerTyping ? (
          <p className="text-[11px] text-emerald-400 font-medium animate-pulse">typing...</p>
        ) : (
          <p className="text-[11px] text-slate-400">Active Session</p>
        )}
      </div>
    </div>
  </div>

  <div className="flex items-center gap-4 text-slate-400">
    <button className="hover:text-emerald-400 transition-colors"><Phone size={18} /></button>
    <button className="hover:text-emerald-400 transition-colors"><Video size={18} /></button>
    <button className="hover:text-emerald-400 transition-colors"><MoreVertical size={18} /></button>
  </div>
</div>

      {/* منطقة عرض الرسائل */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col">
        {loadingMessages ? (
          <div className="text-center text-xs text-slate-500 animate-pulse my-auto">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-xs text-slate-600 my-auto">No messages yet.</div>
        ) : (
          messages.map((msg) => {
            // الاعتماد الحصري والآمن على الحقل الموحد الجاهز داخل الحالة
            const isMessageMine = msg.isMine === true;

            const messageTime = msg.createdAt
              ? new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "";

            return (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[70%] ${isMessageMine ? "self-end items-end" : "self-start items-start"}`}
              >
                <div
                  className={`p-3 rounded-2xl text-sm ${
                    isMessageMine
                      ? "bg-emerald-500 text-slate-950 font-medium rounded-tr-none"
                      : "bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-none"
                  }`}
                >
                  {msg.text}
                </div>
                <div className="flex items-center gap-1 mt-1 px-1">
                  <span className="text-[10px] text-slate-500">{messageTime}</span>
                  {isMessageMine && renderMessageStatus(msg.status)}
                </div>
              </div>
            );
          })
        )}
        {isPartnerTyping && (
          <div className="self-start items-start flex flex-col max-w-[70%] animate-fade-in">
            <div className="bg-slate-900 border border-slate-800 text-slate-400 p-3 rounded-2xl rounded-tl-none flex items-center gap-1.5 text-xs">
              <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} /> {/* 🆕 عنصر وهمي للنزول التلقائي للقاع */}
      </div>

      {/* صندوق الإدخال */}
      <div className="p-4 bg-slate-950 border-t border-slate-900">
        <form onSubmit={handleSendMessage} className="flex gap-2 max-w-4xl mx-auto">
          <input
            type="text"
            value={messageText}
            onChange={handleInputChange}
            placeholder={`Message ${chatName}...`}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
          />
          <button
            type="submit"
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 p-3 rounded-xl shadow-md transition-colors flex items-center justify-center shrink-0 active:scale-95"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;