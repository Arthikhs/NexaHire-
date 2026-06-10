"use client";
import { messaging_service } from "@/context/AppContext";
import { useAppData } from "@/context/AppContext";
import axios from "axios";
import { MessageSquare, Send, Loader2, User, Search, X, ChevronLeft } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import toast from "react-hot-toast";
import Cookies from "js-cookie";

interface Conversation {
  conversation_id: number;
  other_user_id: number;
  other_user_name: string;
  other_user_pic: string | null;
  other_user_role: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
}

interface Message {
  message_id: number;
  sender_id: number;
  content: string;
  created_at: string;
  is_read: boolean;
}

const MessagingHub = () => {
  const { isAuth, user } = useAppData();
  const token = Cookies.get("token");
  const [open, setOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [newChatUserId, setNewChatUserId] = useState("");
  const [newChatMsg, setNewChatMsg] = useState("");
  const [newChatScreen, setNewChatScreen] = useState(false);
  const [searchUser, setSearchUser] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const fetchConversations = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const { data } = await axios.get(`${messaging_service}/api/messaging/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConversations(data);
    } catch { } finally { setLoading(false); }
  };

  const fetchMessages = async (conv: Conversation) => {
    setActiveConv(conv);
    try {
      const { data } = await axios.get(`${messaging_service}/api/messaging/messages/${conv.conversation_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(data);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch { }
  };

  const connectWS = () => {
    if (!token || wsRef.current) return;
    const ws = new WebSocket(`ws://localhost:5011/ws?token=${token}`);
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === "message") {
        setMessages((prev) => [...prev, msg.data]);
        setConversations((prev) => prev.map((c) =>
          c.conversation_id === msg.data.conversation_id
            ? { ...c, last_message: msg.data.content, last_message_at: msg.data.created_at }
            : c
        ));
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      }
    };
    wsRef.current = ws;
    return () => ws.close();
  };

  useEffect(() => {
    if (open && isAuth) {
      fetchConversations();
      connectWS();
    }
    return () => { wsRef.current?.close(); wsRef.current = null; };
  }, [open, isAuth]);

  const sendMessage = async () => {
    if (!text.trim() || !activeConv) return;
    setSending(true);
    try {
      const { data } = await axios.post(`${messaging_service}/api/messaging/send`, {
        conversation_id: activeConv.conversation_id,
        content: text.trim(),
      }, { headers: { Authorization: `Bearer ${token}` } });
      setMessages((prev) => [...prev, data.message]);
      setText("");
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to send");
    } finally { setSending(false); }
  };

  const searchUsers = async (q: string) => {
    if (!q.trim()) { setSearchResults([]); return; }
    setSearchLoading(true);
    try {
      const { data } = await axios.get(`${messaging_service}/api/messaging/users/search?q=${q}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSearchResults(data);
    } catch { } finally { setSearchLoading(false); }
  };

  const startNewConversation = async () => {
    if (!newChatUserId || !newChatMsg.trim()) { toast.error("Select a user and write a message"); return; }
    setSending(true);
    try {
      const { data } = await axios.post(`${messaging_service}/api/messaging/start`, {
        recipient_id: newChatUserId,
        content: newChatMsg.trim(),
      }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Message sent!");
      setNewChatScreen(false);
      setNewChatUserId("");
      setNewChatMsg("");
      setSearchUser("");
      setSearchResults([]);
      fetchConversations();
      fetchMessages(data.conversation);
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed");
    } finally { setSending(false); }
  };

  const formatTime = (d: string) => new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

  if (!isAuth) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-blue-50 dark:bg-blue-950/30 mb-4">
          <MessageSquare size={16} className="text-blue-600" />
          <span className="text-sm font-medium">Direct Messaging</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-3">Recruiter-Candidate Messaging</h2>
        <p className="text-lg opacity-70 max-w-2xl mx-auto mb-6">Connect directly with recruiters or candidates. Sign in to start messaging.</p>
        <Button className="gap-2"><User size={16} /> Sign In to Message</Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-blue-50 dark:bg-blue-950/30 mb-4">
          <MessageSquare size={16} className="text-blue-600" />
          <span className="text-sm font-medium">Direct Messaging</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-3">Recruiter-Candidate Messaging</h2>
        <p className="text-lg opacity-70 max-w-2xl mx-auto mb-6">Connect directly with recruiters or candidates. Real-time chat powered by WebSocket.</p>

        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setActiveConv(null); setMessages([]); setNewChatScreen(false); } }}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2 h-12 px-8 bg-blue-600 hover:bg-blue-700">
              <MessageSquare size={18} /> Open Messages
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-4xl h-[80vh] p-0 overflow-hidden flex flex-col">
            <div className="flex h-full">
              {/* Sidebar */}
              <div className={`w-full md:w-72 border-r flex flex-col ${activeConv && !newChatScreen ? "hidden md:flex" : "flex"}`}>
                <div className="p-4 border-b flex items-center justify-between">
                  <p className="font-bold text-base">Messages</p>
                  <Button size="sm" onClick={() => { setNewChatScreen(true); setActiveConv(null); }} className="gap-1 h-8 px-3 bg-blue-600 hover:bg-blue-700 text-xs">
                    <MessageSquare size={13} /> New
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {loading ? (
                    <div className="flex items-center justify-center h-20"><Loader2 size={20} className="animate-spin opacity-40" /></div>
                  ) : conversations.length === 0 ? (
                    <div className="text-center py-10 px-4 opacity-50 text-sm">No conversations yet. Start a new one!</div>
                  ) : (
                    conversations.map((c) => (
                      <div key={c.conversation_id} onClick={() => { fetchMessages(c); setNewChatScreen(false); }}
                        className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-accent transition-colors border-b ${activeConv?.conversation_id === c.conversation_id ? "bg-blue-50 dark:bg-blue-950/20" : ""}`}>
                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center shrink-0 text-blue-600 font-bold">
                          {c.other_user_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-sm truncate">{c.other_user_name}</p>
                            <p className="text-xs opacity-50 shrink-0 ml-1">{formatDate(c.last_message_at)}</p>
                          </div>
                          <p className="text-xs opacity-60 truncate">{c.last_message}</p>
                        </div>
                        {c.unread_count > 0 && (
                          <span className="h-5 w-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center shrink-0">{c.unread_count}</span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Chat Area */}
              <div className={`flex-1 flex flex-col ${!activeConv && !newChatScreen ? "hidden md:flex" : "flex"}`}>
                {newChatScreen ? (
                  <div className="flex flex-col h-full">
                    <div className="p-4 border-b flex items-center gap-3">
                      <button onClick={() => setNewChatScreen(false)} className="p-1 rounded hover:bg-accent"><ChevronLeft size={18} /></button>
                      <p className="font-bold">New Conversation</p>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Search user to message</label>
                        <div className="relative">
                          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
                          <input value={searchUser}
                            onChange={(e) => { setSearchUser(e.target.value); searchUsers(e.target.value); }}
                            placeholder="Search by name or email..."
                            className="w-full pl-8 pr-4 py-2 border rounded-lg bg-transparent text-sm focus:outline-none focus:border-blue-500" />
                        </div>
                        {searchLoading && <div className="text-xs opacity-50 px-1">Searching...</div>}
                        {searchResults.length > 0 && (
                          <div className="border rounded-lg divide-y max-h-48 overflow-y-auto">
                            {searchResults.map((u) => (
                              <div key={u.user_id} onClick={() => { setNewChatUserId(u.user_id); setSearchUser(u.name); setSearchResults([]); }}
                                className={`flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-accent ${newChatUserId == u.user_id ? "bg-blue-50 dark:bg-blue-950/20" : ""}`}>
                                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 font-bold text-sm">
                                  {u.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-sm font-medium">{u.name}</p>
                                  <p className="text-xs opacity-50 capitalize">{u.role}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      {newChatUserId && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Message</label>
                          <textarea value={newChatMsg} onChange={(e) => setNewChatMsg(e.target.value)}
                            placeholder="Write your message..."
                            className="w-full h-24 px-3 py-2 border rounded-lg bg-transparent text-sm focus:outline-none focus:border-blue-500 resize-none" />
                          <Button onClick={startNewConversation} disabled={sending} className="w-full gap-2 bg-blue-600 hover:bg-blue-700">
                            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Send Message
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : activeConv ? (
                  <>
                    <div className="p-4 border-b flex items-center gap-3">
                      <button onClick={() => setActiveConv(null)} className="p-1 rounded hover:bg-accent md:hidden"><ChevronLeft size={18} /></button>
                      <div className="h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 font-bold">
                        {activeConv.other_user_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{activeConv.other_user_name}</p>
                        <p className="text-xs opacity-50 capitalize">{activeConv.other_user_role}</p>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {messages.map((m) => {
                        const isMe = m.sender_id === user?.user_id;
                        return (
                          <div key={m.message_id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${isMe ? "bg-blue-600 text-white rounded-br-sm" : "bg-accent rounded-bl-sm"}`}>
                              <p>{m.content}</p>
                              <p className={`text-xs mt-1 ${isMe ? "text-blue-200" : "opacity-50"}`}>{formatTime(m.created_at)}</p>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>

                    <div className="p-3 border-t flex gap-2">
                      <input value={text} onChange={(e) => setText(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 border rounded-full bg-transparent text-sm focus:outline-none focus:border-blue-500" />
                      <Button onClick={sendMessage} disabled={sending || !text.trim()} size="sm"
                        className="rounded-full h-9 w-9 p-0 bg-blue-600 hover:bg-blue-700 shrink-0">
                        {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center flex-col gap-3 opacity-40">
                    <MessageSquare size={48} />
                    <p className="text-sm">Select a conversation or start a new one</p>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default MessagingHub;
