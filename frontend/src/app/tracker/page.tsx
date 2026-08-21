"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { tracker_service } from "@/context/AppContext";
import { useAppData } from "@/context/AppContext";
import Loading from "@/components/loading";
import { Card } from "@/components/ui/card";
import {
  Briefcase, CheckCircle2, XCircle, Clock, Bookmark,
  GripVertical, Bell, BarChart3, X,
} from "lucide-react";

interface Stats {
  total_applied: number;
  pending: number;
  hired: number;
  rejected: number;
  saved_jobs: number;
  recentActivity: {
    application_id: number;
    status: string;
    applied_at: string;
    job_title: string;
    company_name: string;
    company_logo: string;
  }[];
}

interface KanbanCard {
  card_id: number;
  column_id: number;
  position: number;
  application_id: number;
  status: string;
  applied_at: string;
  job_title: string;
  location: string;
  job_type: string;
  company_name: string;
  company_logo: string;
}

interface KanbanColumn {
  column_id: number;
  title: string;
  color: string;
  position: number;
  cards: KanbanCard[];
}

interface Reminder {
  reminder_id: number;
  remind_at: string;
  note: string;
  job_title: string;
  company_name: string;
}

const statusStyle: Record<string, string> = {
  Hired: "bg-green-100 dark:bg-green-900/30 text-green-600",
  Rejected: "bg-red-100 dark:bg-red-900/30 text-red-600",
  Submitted: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600",
};

const TrackerPage = () => {
  const { user, loading: authLoading, isAuth } = useAppData();
  const navigate = useNavigate();
  const token = Cookies.get("token");

  const [stats, setStats] = useState<Stats | null>(null);
  const [board, setBoard] = useState<KanbanColumn[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"stats" | "kanban" | "reminders">("stats");
  const [dragging, setDragging] = useState<{ cardId: number; fromCol: number } | null>(null);

  useEffect(() => {
    if (!authLoading && (!isAuth || user?.role !== "jobseeker")) navigate("/");
  }, [authLoading, isAuth, user]);

  async function fetchAll() {
    if (!token) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [s, b, r] = await Promise.all([
        axios.get(`${tracker_service}/api/tracker/stats`, { headers }),
        axios.get(`${tracker_service}/api/tracker/kanban`, { headers }),
        axios.get(`${tracker_service}/api/tracker/reminders`, { headers }),
      ]);
      setStats(s.data);
      setBoard(b.data);
      setReminders(r.data);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchAll(); }, [token]);

  async function moveCard(cardId: number, toColumnId: number, position: number) {
    try {
      await axios.post(
        `${tracker_service}/api/tracker/kanban/move`,
        { cardId, toColumnId, position },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAll();
    } catch (e) { console.log(e); }
  }

  async function deleteReminder(id: number) {
    try {
      await axios.delete(`${tracker_service}/api/tracker/reminders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReminders((r) => r.filter((x) => x.reminder_id !== id));
    } catch (e) { console.log(e); }
  }

  if (authLoading || loading) return <Loading />;

  return (
    <div className="min-h-screen bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-1">
            Application <span className="text-blue-600">Tracker</span>
          </h1>
          <p className="text-sm opacity-60">Track your job applications in one place</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          {(["stats", "kanban", "reminders"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors -mb-px ${
                tab === t ? "border-blue-600 text-blue-600" : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              {t === "stats" && <span className="flex items-center gap-1.5"><BarChart3 size={14} /> Stats</span>}
              {t === "kanban" && <span className="flex items-center gap-1.5"><GripVertical size={14} /> Kanban Board</span>}
              {t === "reminders" && (
                <span className="flex items-center gap-1.5">
                  <Bell size={14} /> Reminders
                  {reminders.length > 0 && <span className="bg-red-500 text-white rounded-full text-xs px-1.5">{reminders.length}</span>}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Stats Tab */}
        {tab === "stats" && stats && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              {[
                { label: "Total Applied", value: stats.total_applied, icon: Briefcase, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/20" },
                { label: "Pending", value: stats.pending, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-950/20" },
                { label: "Hired", value: stats.hired, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50 dark:bg-green-950/20" },
                { label: "Rejected", value: stats.rejected, icon: XCircle, color: "text-red-600", bg: "bg-red-50 dark:bg-red-950/20" },
                { label: "Saved Jobs", value: stats.saved_jobs, icon: Bookmark, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-950/20" },
              ].map(({ label, value, icon: Icon, color, bg }) => (
                <Card key={label} className={`p-5 border-2 ${bg}`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium opacity-60">{label}</p>
                    <Icon size={16} className={color} />
                  </div>
                  <p className={`text-3xl font-bold ${color}`}>{value}</p>
                </Card>
              ))}
            </div>

            <Card className="border-2 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-5">
                <h2 className="text-white font-semibold flex items-center gap-2">
                  <Briefcase size={16} /> Recent Activity
                </h2>
              </div>
              <div className="divide-y">
                {stats.recentActivity.length > 0 ? stats.recentActivity.map((a) => (
                  <div key={a.application_id} className="p-4 flex items-center justify-between gap-3 hover:bg-accent">
                    <div className="flex items-center gap-3">
                      {a.company_logo && (
                        <img src={a.company_logo} alt={a.company_name} className="w-9 h-9 rounded-lg object-contain border" />
                      )}
                      <div>
                        <p className="text-sm font-medium">{a.job_title}</p>
                        <p className="text-xs opacity-50">{a.company_name} · {new Date(a.applied_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusStyle[a.status] || statusStyle.Submitted}`}>
                      {a.status}
                    </span>
                  </div>
                )) : (
                  <div className="py-12 text-center opacity-50 text-sm">
                    No applications yet. <Link to="/jobs" className="text-blue-600 hover:underline">Find jobs</Link>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Kanban Tab */}
        {tab === "kanban" && (
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-4 min-w-max">
              {board.map((col) => (
                <div
                  key={col.column_id}
                  className="w-72 shrink-0"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (dragging) {
                      moveCard(dragging.cardId, col.column_id, col.cards.length);
                      setDragging(null);
                    }
                  }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: col.color }} />
                    <h3 className="font-semibold text-sm">{col.title}</h3>
                    <span className="ml-auto text-xs bg-secondary px-2 py-0.5 rounded-full">{col.cards.length}</span>
                  </div>
                  <div className="space-y-2 min-h-20">
                    {col.cards.map((card) => (
                      <div
                        key={card.card_id}
                        draggable
                        onDragStart={() => setDragging({ cardId: card.card_id, fromCol: col.column_id })}
                        className="bg-background border-2 rounded-xl p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-2 mb-2">
                          <GripVertical size={14} className="opacity-30 mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{card.job_title}</p>
                            <p className="text-xs opacity-50">{card.company_name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {card.location && <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">{card.location}</span>}
                          <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">{card.job_type}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${statusStyle[card.status] || statusStyle.Submitted}`}>{card.status}</span>
                        </div>
                      </div>
                    ))}
                    {col.cards.length === 0 && (
                      <div className="border-2 border-dashed rounded-xl h-20 flex items-center justify-center opacity-30 text-xs">
                        Drop here
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs opacity-40 mt-4 flex items-center gap-1">
              <GripVertical size={12} /> Drag cards to move between columns
            </p>
          </div>
        )}

        {/* Reminders Tab */}
        {tab === "reminders" && (
          <div>
            {reminders.length === 0 ? (
              <div className="text-center py-20 opacity-50">
                <Bell size={40} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">No upcoming reminders</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reminders.map((r) => (
                  <Card key={r.reminder_id} className="border-2 p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-yellow-50 dark:bg-yellow-950/20 flex items-center justify-center shrink-0">
                        <Bell size={18} className="text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{r.job_title} — {r.company_name}</p>
                        {r.note && <p className="text-xs opacity-60">{r.note}</p>}
                        <p className="text-xs text-blue-600 font-medium mt-0.5">
                          {new Date(r.remind_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                    <button onClick={() => deleteReminder(r.reminder_id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 transition-colors">
                      <X size={16} />
                    </button>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackerPage;
