import { useState, useEffect, useRef } from 'react';
import * as signalR from "@microsoft/signalr";
import { getMessages, sendMessage } from "../Api/messageService";

export const useChat = (activeChat) => {
    const [messages, setMessages] = useState([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [isPartnerTyping, setIsPartnerTyping] = useState(false);
    const connectionRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const getMyUserId = () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return null;
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(window.atob(base64));
            return payload.nameid || payload.UserId || payload.id;
        } catch (e) {
            console.error("Error parsing token:", e);
            return null;
        }
    };

    // جلب الرسائل التاريخية
    useEffect(() => {
        const fetchChatMessages = async () => {
            if (!activeChat) return;
            setLoadingMessages(true);
            try {
                const data = await getMessages({ conversationId: activeChat.id, cursor: null, limit: 30 });
                const myId = getMyUserId();
                let rawMessages = [];
                if (data && Array.isArray(data)) rawMessages = data;
                else if (data && data.messages && Array.isArray(data.messages)) rawMessages = data.messages;
                else if (data && data.data && Array.isArray(data.data)) rawMessages = data.data;

                const normalizedMessages = rawMessages.map((msg) => {
                    const serverIsMine = msg.isMine !== undefined ? msg.isMine : msg.IsMine;
                    const isMine = serverIsMine !== undefined ? serverIsMine : (myId && String(msg.senderId || msg.SenderId) === String(myId));
                    return {
                        id: msg.id || msg.Id,
                        text: msg.messageText || msg.text || msg.content || msg.Content || "",
                        isMine: !!isMine,
                        createdAt: new Date(msg.createdAt || msg.CreatedAt || new Date()).toISOString(),
                        status: msg.status || msg.Status || "Delivered"
                    };
                });
                setMessages(normalizedMessages);
            } catch (error) {
                console.error("Failed to fetch messages:", error);
                setMessages([]);
            } finally {
                setLoadingMessages(false);
            }
        };
        fetchChatMessages();
    }, [activeChat]);

    // إدارة اتصال SignalR
    useEffect(() => {
        if (!activeChat) return;

        const connection = new signalR.HubConnectionBuilder()
            .withUrl("https://localhost:7143/chathub", { accessTokenFactory: () => localStorage.getItem("token") })
            .withAutomaticReconnect()
            .build();

        connectionRef.current = connection;

        const handleIncomingMessage = (incomingMessage) => {
            setMessages((prev) => {
                const incomingId = incomingMessage.id || incomingMessage.Id;
                const incomingText = (incomingMessage.messageText || incomingMessage.text || "").trim();
                const myId = getMyUserId();
                const isMessageMine = String(incomingMessage.senderId || incomingMessage.SenderId) === String(myId);

                if (isMessageMine) {
                    const localIndex = prev.findIndex(m => m.isMine === true && m.status === "Sent" && m.text.trim() === incomingText);
                    if (localIndex !== -1) {
                        return prev.map((m, i) => i === localIndex ? { ...m, id: incomingId, status: "Delivered" } : m);
                    }
                }
                if (prev.some((m) => String(m.id) === String(incomingId))) return prev;
                return [...prev, { id: incomingId, text: incomingText, isMine: isMessageMine, createdAt: incomingMessage.createdAt || new Date().toISOString(), status: "Delivered" }];
            });
        };

        const handleTypingStatus = (_, isTyping) => setIsPartnerTyping(isTyping);

        connection.on("ReceiveMessage", handleIncomingMessage);
        connection.on("ReceiveTypingStatus", handleTypingStatus);

        connection.start().then(() => connection.invoke("JoinConversation", activeChat.id));

        return () => {
            connection.off("ReceiveMessage", handleIncomingMessage);
            connection.off("ReceiveTypingStatus", handleTypingStatus);
            connection.stop();
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        };
    }, [activeChat]);

    return { messages, setMessages, loadingMessages, isPartnerTyping, connectionRef, typingTimeoutRef, getMyUserId };
};