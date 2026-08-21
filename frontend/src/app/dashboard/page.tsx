"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { Link, useNavigate } from "react-router-dom";
import { job_service, useAppData } from "@/context/AppContext";
import Loading from "@/components/loading";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Briefcase, Building2, CheckCircle2, Clock, FileText,
  TrendingUp, Users, XCircle, BarChart3, ArrowRight, ExternalLink,
} from "lucide-react";

interface Stats {
  total_companies: number; total_jobs: number; active_jobs: number;
  total_applications: number; total_hired: number; total_rejected: number; total_pending: number;
}
interface RecentApp {
  application_id: number; status: string; applied_at: string;
  applicant_id: number; resume: string; job_title: string; company_name: string;
}
interface TopJob {
  job_id: number; title: string; is_active: boolean; company_name: string; application_count: number;
}

const statusStyle: Record<string, string> = {
  Hired: "bg-green-100 dark:bg-green-900/30 text-green-600",
  Rejected: "bg-red-100 dark:bg-red-900/30 text-red-600",
  Submitted: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600",
};

const DashboardPage = () => {
  const { user, loading: authLoading, isAuth } = useAppData();
  const navigate = useNavigate();
  const token = Cookies.get("token");

  const [stats, setStats] = useState<Stats | null>(null);
  const [recentApplications, setRecentApplications] = useState<RecentApp[]>([]);
  const [topJobs, setTopJobs] = useState<TopJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!isAuth || user?.role !== "recruiter")) navigate("/");
  }, [authLoading, isAuth, user]);

  useEffect(() => {
    if (!token) return;
    async function fetchStats() {
      try {
        const { data } = await axios.get(`${job_service}/api/job/recruiter/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(data.stats);
        setRecentApplications(data.recentApplications);
        setTopJobs(data.topJobs);
      } catch (error) { console.log(error); }
      finally { setLoading(false); }
    }
    fetchStats();
  }, [token]);

  if (authLoading || loading) return <Loading />;
  if (!stats) return null;

  const hireRate = stats.total_applications > 0
    ? Math.round((stats.total_hired / stats.total_applications) * 100) : 0;

  return (
    <div className="min-h-screen bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">Welcome back, <span className="text-blue-600">{user?.name}</span> 👋</h1>
            <p className="opacity-60 text-sm">Here's what's happening with your jobs today</p>
          </div>
          <Link to="/account"><Button variant="outline" className="gap-2"><Users size={16} /> My Profile</Button></Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Companies", value: stats.total_companies, icon: Building2, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/20", border: "border-blue-200 dark:border-blue-900" },
            { label: "Total Jobs", value: stats.total_jobs, icon: Briefcase, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-950/20", border: "border-purple-200 dark:border-purple-900" },
            { label: "Active Jobs", value: stats.active_jobs, icon: TrendingUp, color: "text-green-600", bg: "bg-green-50 dark:bg-green-950/20", border: "border-green-200 dark:border-green-900" },
            { label: "Total Applications", value: stats.total_applications, icon: Users, color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-950/20", border: "border-orange-200 dark:border-orange-900" },
          ].map(({ label, value, icon: Icon, color, bg, border }) => (
            <Card key={label} className={`p-5 border-2 ${border} ${bg}`}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium opacity-60">{label}</p>
                <div className="h-9 w-9 rounded-xl bg-background flex items-center justify-center">
                  <Icon size={18} className={color} />
                </div>
              </div>
              <p className={`text-3xl font-bold ${color}`}>{value}</p>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Pending Review", value: stats.total_pending, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-950/20" },
            { label: "Hired", value: stats.total_hired, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50 dark:bg-green-950/20" },
            { label: "Rejected", value: stats.total_rejected, icon: XCircle, color: "text-red-600", bg: "bg-red-50 dark:bg-red-950/20" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <Card key={label} className={`p-5 border-2 ${bg} flex items-center gap-4`}>
              <div className="h-12 w-12 rounded-xl bg-background flex items-center justify-center shrink-0">
                <Icon size={22} className={color} />
              </div>
              <div>
                <p className="text-xs opacity-60 font-medium">{label}</p>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
              </div>
            </Card>
          ))}
        </div>

        <Card className="border-2 p-6 mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold flex items-center gap-2"><BarChart3 size={18} className="text-blue-600" /> Hire Rate</h2>
            <span className="text-2xl font-bold text-blue-600">{hireRate}%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-3">
            <div className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-700" style={{ width: `${hireRate}%` }} />
          </div>
          <p className="text-xs opacity-50 mt-2">{stats.total_hired} hired out of {stats.total_applications} total applications</p>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-2 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-5 flex items-center justify-between">
              <h2 className="text-white font-semibold flex items-center gap-2"><FileText size={18} /> Recent Applications</h2>
              <span className="text-xs text-gray-400">Last 5</span>
            </div>
            <div className="divide-y">
              {recentApplications.length > 0 ? recentApplications.map((a) => (
                <div key={a.application_id} className="p-4 flex items-center justify-between gap-3 hover:bg-accent transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{a.job_title}</p>
                    <p className="text-xs opacity-50">{a.company_name} · {new Date(a.applied_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusStyle[a.status] || statusStyle.Submitted}`}>{a.status}</span>
                    <Link to={`/account/${a.applicant_id}`} target="_blank"><ExternalLink size={13} className="opacity-40 hover:opacity-100" /></Link>
                  </div>
                </div>
              )) : <div className="text-center py-10 opacity-50 text-sm">No applications yet</div>}
            </div>
          </Card>

          <Card className="border-2 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-5 flex items-center justify-between">
              <h2 className="text-white font-semibold flex items-center gap-2"><TrendingUp size={18} /> Top Jobs by Applications</h2>
              <span className="text-xs text-blue-200">Top 5</span>
            </div>
            <div className="divide-y">
              {topJobs.length > 0 ? topJobs.map((j, i) => (
                <div key={j.job_id} className="p-4 flex items-center gap-3 hover:bg-accent transition-colors">
                  <span className="text-lg font-bold opacity-20 w-6 shrink-0">#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{j.title}</p>
                    <p className="text-xs opacity-50">{j.company_name}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-bold text-blue-600">{j.application_count}</span>
                    <span className="text-xs opacity-40">apps</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${j.is_active ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"}`}>{j.is_active ? "Active" : "Closed"}</span>
                    <Link to={`/jobs/${j.job_id}`}><ArrowRight size={14} className="opacity-40 hover:opacity-100" /></Link>
                  </div>
                </div>
              )) : <div className="text-center py-10 opacity-50 text-sm">No jobs posted yet</div>}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
