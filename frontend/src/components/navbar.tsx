"use client";
import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Bell, Bookmark, BarChart3, Briefcase, CheckCheck, Home, Info, LogOut, Menu, MessageSquarePlus, User, X, KanbanSquare, Building2, BookOpen, Target, FileEdit, Mic, BrainCircuit, FileSearch } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ModeToggle } from "./mode-toggle";
import { useAppData } from "@/context/AppContext";
import axios from "axios";
import { job_service } from "@/context/AppContext";
import Cookies from "js-cookie";

interface Notification {
  notification_id: number;
  user_id: number;
  message: string;
  is_read: boolean;
  created_at: string;
}

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuth, user, loading, logoutUser } = useAppData();
  const token = Cookies.get("token");

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);

  async function fetchNotifications() {
    if (!token) return;
    try {
      const { data } = await axios.get(`${job_service}/api/job/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.log(error);
    }
  }

  async function markAllRead() {
    if (!token) return;
    try {
      await axios.put(`${job_service}/api/job/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (error) {
      console.log(error);
    }
  }

  async function markOneRead(id: number) {
    if (!token) return;
    try {
      await axios.put(`${job_service}/api/job/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) =>
        prev.map((n) => n.notification_id === id ? { ...n, is_read: true } : n)
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    if (isAuth) {
      fetchNotifications();
      const ws = new WebSocket(`ws://localhost:5003/ws?token=${token}`);
      ws.onmessage = (e) => {
        const data = JSON.parse(e.data);
        if (data.type === "notification") {
          setUnreadCount((c) => c + 1);
          setNotifications((prev) => [{
            notification_id: Date.now(),
            user_id: 0,
            message: data.message,
            is_read: false,
            created_at: new Date().toISOString(),
          }, ...prev]);
        }
      };
      return () => ws.close();
    }
  }, [isAuth]);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="z-50 sticky top-0 bg-background/80 border-b backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-1 group">
              <div className="text-2xl font-bold tracking-tight">
                <span className="bg-linear-to-r from bg-blue-600 to-blue-800 bg-clip-text text-transparent">Nexa</span>
                <span className="text-red-500">Hire</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link to="/"><Button variant="ghost" className="flex items-center gap-2 font-medium"><Home size={16} /> Home</Button></Link>
            <Link to="/jobs"><Button variant="ghost" className="flex items-center gap-2 font-medium"><Briefcase size={16} /> Jobs</Button></Link>
            <Link to="/insights"><Button variant="ghost" className="flex items-center gap-2 font-medium"><Building2 size={16} /> Insights</Button></Link>
            <Link to="/questions"><Button variant="ghost" className="flex items-center gap-2 font-medium"><BookOpen size={16} /> Questions</Button></Link>
            <Link to="/about"><Button variant="ghost" className="flex items-center gap-2 font-medium"><Info size={16} /> About</Button></Link>
          </div>

          {/* Right side Actions */}
          <div className="hidden md:flex items-center gap-3">
            {!loading && (
              <>
                {isAuth ? (
                  <div className="flex items-center gap-2">
                    <Popover open={notifOpen} onOpenChange={(v) => { setNotifOpen(v); if (v) fetchNotifications(); }}>
                      <PopoverTrigger asChild>
                        <button className="relative p-2 rounded-lg hover:bg-accent transition-colors">
                          <Bell size={20} />
                          {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                              {unreadCount > 9 ? "9+" : unreadCount}
                            </span>
                          )}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-0" align="end">
                        <div className="flex items-center justify-between px-4 py-3 border-b">
                          <p className="font-semibold text-sm">Notifications</p>
                          {unreadCount > 0 && (
                            <button onClick={markAllRead} className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                              <CheckCheck size={13} /> Mark all read
                            </button>
                          )}
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                          {notifications.length > 0 ? (
                            notifications.map((n) => (
                              <div
                                key={n.notification_id}
                                onClick={() => !n.is_read && markOneRead(n.notification_id)}
                                className={`px-4 py-3 border-b cursor-pointer hover:bg-accent transition-colors ${!n.is_read ? "bg-blue-50 dark:bg-blue-950/20" : ""}`}
                              >
                                <p className="text-sm">{n.message}</p>
                                <p className="text-xs opacity-50 mt-1">
                                  {new Date(n.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                                </p>
                                {!n.is_read && <span className="inline-block mt-1 h-2 w-2 rounded-full bg-blue-500" />}
                              </div>
                            ))
                          ) : (
                            <div className="px-4 py-8 text-center text-sm opacity-50">No notifications yet</div>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>

                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                          <Avatar className="h-9 w-9 ring-2 ring-offset-2 ring-offset-background ring-blue-500/20 cursor-pointer hover:ring-blue-500/40 transition-all">
                            <AvatarImage src={user ? (user.profile_pic as string) : ""} alt={user ? user.name : ""} />
                            <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600">
                              {user?.name?.charAt(0).toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-56 p-2" align="end">
                        <div className="px-3 py-2 mb-2 border-b">
                          <p className="text-sm font-semibold">{user && user.name}</p>
                          <p className="text-xs opacity-60 truncate">{user && user.email}</p>
                        </div>
                        <Link to="/account"><Button className="w-full justify-start gap-2" variant="ghost"><User size={16} /> My Profile</Button></Link>
                        {user?.role === "recruiter" && (
                          <Link to="/dashboard"><Button className="w-full justify-start gap-2" variant="ghost"><BarChart3 size={16} /> Dashboard</Button></Link>
                        )}
                        <Link to="/tracker"><Button className="w-full justify-start gap-2" variant="ghost"><KanbanSquare size={16} /> App Tracker</Button></Link>
                        <Link to="/skill-gap"><Button className="w-full justify-start gap-2" variant="ghost"><Target size={16} /> Skill Gap</Button></Link>
                        <Link to="/cover-letter"><Button className="w-full justify-start gap-2" variant="ghost"><FileEdit size={16} /> Cover Letter</Button></Link>
                        <Link to="/interview-feedback"><Button className="w-full justify-start gap-2" variant="ghost"><Mic size={16} /> Interview Feedback</Button></Link>
                        <Link to="/salary-predictor"><Button className="w-full justify-start gap-2" variant="ghost"><BrainCircuit size={16} /> Salary Predictor</Button></Link>
                        <Link to="/resume-score"><Button className="w-full justify-start gap-2" variant="ghost"><FileSearch size={16} /> Resume Score</Button></Link>
                        <Link to="/saved"><Button className="w-full justify-start gap-2" variant="ghost"><Bookmark size={16} /> Saved Jobs</Button></Link>
                        <Button className="w-full justify-start gap-2 mt-1" variant="ghost" onClick={logoutUser}>
                          <LogOut size={16} /> Logout
                        </Button>
                      </PopoverContent>
                    </Popover>
                  </div>
                ) : (
                  <Link to="/login">
                    <Button className="gap-2"><User size={16} /> Sign In</Button>
                  </Link>
                )}
              </>
            )}
            <ModeToggle />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-3">
            <ModeToggle />
            <button onClick={toggleMenu} className="p-2 rounded-lg hover:bg-accent transition-colors" aria-label="Toggle menu">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile view */}
      <div className={`md:hidden border-t overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-96 opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="px-3 py-3 space-y-1 bg-background/95 backdrop-blur-md">
          <Link to="/" onClick={toggleMenu}><Button variant="ghost" className="w-full justify-start gap-3 h-11"><Home size={18} /> Home</Button></Link>
          <Link to="/jobs" onClick={toggleMenu}><Button variant="ghost" className="w-full justify-start gap-3 h-11"><Briefcase size={18} /> Jobs</Button></Link>
          <Link to="/insights" onClick={toggleMenu}><Button variant="ghost" className="w-full justify-start gap-3 h-11"><Building2 size={18} /> Insights</Button></Link>
          <Link to="/questions" onClick={toggleMenu}><Button variant="ghost" className="w-full justify-start gap-3 h-11"><BookOpen size={18} /> Questions</Button></Link>
          <Link to="/skill-gap" onClick={toggleMenu}><Button variant="ghost" className="w-full justify-start gap-3 h-11"><Target size={18} /> Skill Gap</Button></Link>
          <Link to="/about" onClick={toggleMenu}><Button variant="ghost" className="w-full justify-start gap-3 h-11"><Info size={18} /> About</Button></Link>
          <Link to="/experiences" onClick={toggleMenu}><Button variant="ghost" className="w-full justify-start gap-3 h-11"><MessageSquarePlus size={18} /> Experiences</Button></Link>
          {isAuth ? (
            <>
              <Link to="/account" onClick={toggleMenu}><Button variant="ghost" className="w-full justify-start gap-3 h-11"><User size={18} /> My Profile</Button></Link>
              <Link to="/tracker" onClick={toggleMenu}><Button variant="ghost" className="w-full justify-start gap-3 h-11"><KanbanSquare size={18} /> App Tracker</Button></Link>
              <Link to="/saved" onClick={toggleMenu}><Button variant="ghost" className="w-full justify-start gap-3 h-11"><Bookmark size={18} /> Saved Jobs</Button></Link>
              <Button variant="ghost" className="w-full justify-start gap-3 h-11 relative" onClick={toggleMenu}>
                <Bell size={18} /> Notifications
                {unreadCount > 0 && <span className="ml-auto h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">{unreadCount}</span>}
              </Button>
              <Button variant="destructive" className="w-full justify-start gap-3 h-11" onClick={() => { logoutUser(); toggleMenu(); }}>
                <LogOut size={18} /> Logout
              </Button>
            </>
          ) : (
            <Link to="/login" onClick={toggleMenu}><Button className="w-full justify-start gap-3 h-11 mt-2"><User size={18} /> SignIn</Button></Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
