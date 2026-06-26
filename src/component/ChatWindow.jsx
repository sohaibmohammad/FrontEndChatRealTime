import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Phone,
  Video,
  MoreVertical,
  MessageSquare,
  Check,
  CheckCheck,
  X
} from "lucide-react";
import { getMessages, sendMessage } from "../Api/messageService";
import * as signalR from "@microsoft/signalr";
import { useChat } from "../hooks/useChat";

const ChatWindow = ({ activeChat }) => {
  const { messages, setMessages, loadingMessages, isPartnerTyping, connectionRef, typingTimeoutRef } = useChat(activeChat);
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef(null);
  const [activeMenuId, setActiveMenuId] = useState(null);

  useEffect(() => {
    const chatContainer = messagesEndRef.current?.parentElement;
    if (chatContainer) {
      const isAtBottom = chatContainer.scrollHeight - chatContainer.scrollTop <= chatContainer.clientHeight + 150;
      if (isAtBottom) {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [messages, isPartnerTyping]);

  const handleInputChange = (e) => {
    setMessageText(e.target.value);
    const connection = connectionRef.current;
    if (connection && connection.state === signalR.HubConnectionState.Connected) {
      connection.invoke("SendTypingStatus", activeChat.id, true).catch(err => console.error(err));
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        if (connection && connection.state === signalR.HubConnectionState.Connected) {
          connection.invoke("SendTypingStatus", activeChat.id, false).catch(err => console.error(err));
        }
      }, 2000);
    }
  };

  const handleDelete = async (msgId) => {
    const connection = connectionRef.current;
    try {
      if (connection) {
        await connection.invoke("DeleteMessage", msgId);
        setActiveMenuId(null);
      }
    } catch (err) {
      console.error("Error deleting message: ", err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    const timestamp = Date.now().toString();
    const newMsg = {
      id: timestamp,
      isMine: true,
      text: messageText,
      createdAt: new Date().toISOString(),
      status: "Sent",
    };

    setMessages((prev) => [...prev, newMsg]);
    const currentText = messageText;
    setMessageText("");

    try {
      await sendMessage({ conversationId: activeChat.id, content: currentText });
    } catch (error) {
      setMessages((prev) => prev.map((m) => m.id === timestamp ? { ...m, status: "Failed" } : m));
    }
  };

  const renderMessageStatus = (status) => {
    if (status === "Sent") return <Check size={13} className="text-slate-400" />;
    if (status === "Delivered") return <CheckCheck size={13} className="text-slate-400" />;
    if (status === "Read") return <CheckCheck size={13} className="text-emerald-400" />;
    return null;
  };

  if (!activeChat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-500 bg-slate-950">
        <div className="p-6 rounded-full bg-slate-900/50 mb-4">
            <MessageSquare size={48} className="text-emerald-500/50" />
        </div>
        <p className="text-sm font-medium text-slate-400">Select a conversation to start chatting</p>
      </div>
    );
  }

  const chatName = activeChat.conversationName || activeChat.groupName || "Unnamed Chat";

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden relative">
      
      {/* Header */}
      <div className="flex-none p-4 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-900/20">
            {chatName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">{chatName}</h3>
            <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${isPartnerTyping ? "bg-emerald-400 animate-pulse" : "bg-emerald-500"}`}></div>
                <p className="text-[11px] text-slate-400">
                    {isPartnerTyping ? "typing..." : "Active"}
                </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <button className="p-2 hover:bg-slate-800 rounded-full transition-all"><Phone size={18} /></button>
          <button className="p-2 hover:bg-slate-800 rounded-full transition-all"><Video size={18} /></button>
          <button className="p-2 hover:bg-slate-800 rounded-full transition-all"><MoreVertical size={18} /></button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
        {loadingMessages ? (
          <div className="text-center text-xs text-slate-500 animate-pulse my-auto">Loading...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-xs text-slate-600 my-auto">No messages yet. Start the conversation!</div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.isMine === true;
            const time = msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
            
            return (
              <div key={msg.id} className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}>
                <div className={`group flex items-end gap-2 max-w-[75%] ${isMine ? "flex-row-reverse" : "flex-row"}`}>
                    
                    {/* Menu Button */}
                    {isMine && (
                        <button onClick={() => setActiveMenuId(activeMenuId === msg.id ? null : msg.id)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-800 rounded-full text-slate-500 transition-opacity">
                            <MoreVertical size={14} />
                        </button>
                    )}

                    {/* Bubble */}
                    <div className={`relative px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                        isMine 
                        ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-br-none" 
                        : "bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700/50"
                    }`}>
                        {msg.text}
                        
                        {/* Dropdown Menu */}
                        {activeMenuId === msg.id && (
                            <div className="absolute top-8 right-0 z-50 w-28 bg-slate-900 border border-slate-700 shadow-2xl rounded-xl py-1 animate-in fade-in zoom-in-95 duration-100">
                                <button onClick={() => handleDelete(msg.id)} className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-slate-800 transition-colors">Delete</button>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Time & Status */}
                <div className={`flex items-center gap-1 mt-1 px-1 ${isMine ? "justify-end" : "justify-start"}`}>
                    <span className="text-[10px] text-slate-600">{time}</span>
                    {isMine && renderMessageStatus(msg.status)}
                </div>
              </div>
            );
          })
        )}
        
        {isPartnerTyping && (
           <div className="flex items-center gap-2 text-slate-500 text-xs">
              <div className="flex gap-1 bg-slate-800 px-3 py-2 rounded-2xl rounded-tl-none">
                 <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></span>
                 <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                 <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Field */}
      <div className="p-4 bg-slate-950">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto relative flex items-center gap-2">
          <input
            type="text"
            value={messageText}
            onChange={handleInputChange}
            placeholder={`Message ${chatName}...`}
            className="w-full bg-slate-900 border border-slate-800 text-slate-200 placeholder:text-slate-600 rounded-2xl py-3.5 pl-5 pr-14 outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-inner"
          />
          <button type="submit" className="absolute right-2 p-2 bg-emerald-500 text-slate-950 rounded-xl hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 active:scale-95">
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;