"use client";
import { job_service } from "@/context/AppContext";
import { useAppData } from "@/context/AppContext";
import axios from "axios";
import {
  Bell, BellOff, Plus, Trash2, Loader2, Briefcase,
  MapPin, Building2, Clock, ArrowRight, Settings, CheckCircle2,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import Link from "next/link";
import toast from "react-hot-toast";
import Cookies from "js-cookie";

interface JobAlert {
  alert_id: number;
  keywords: string | null;
  location: string | null;
  job_type: string | null;
  work_location: string | null;
  min_salary: number | null;
  is_active: boolean;
}

const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Internship"];
const WORK_MODES = ["On-site", "Remote", "Hybrid"];

const JobAlerts = () => {
  const { isAuth, user } = useAppData();
  const token = Cookies.get("token");
  const [alert, setAlert] = useState<JobAlert | null>(null);
  const [matchedJobs, setMatchedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    keywords: "", location: "", job_type: "", work_location: "", min_salary: "",
  });

  const fetchAlert = async () => {
    if (!token) { setLoading(false); return; }
    try {
      const { data } = await axios.get(`${job_service}/api/job/alerts/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlert(data);
      if (data) setForm({
        keywords: data.keywords ?? "",
        location: data.location ?? "",
        job_type: data.job_type ?? "",
        work_location: data.work_location ?? "",
        min_salary: data.min_salary ?? "",
      });
    } catch { } finally { setLoading(false); }
  };

  const fetchMatched = async () => {
    if (!token) return;
    try {
      const { data } = await axios.get(`${job_service}/api/job/alerts/matched`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMatchedJobs(data);
    } catch { }
  };

  useEffect(() => {
    if (isAuth) { fetchAlert(); fetchMatched(); }
    else setLoading(false);
  }, [isAuth]);

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await axios.post(`${job_service}/api/job/alerts`, {
        keywords: form.keywords || null,
        location: form.location || null,
        job_type: form.job_type || null,
        work_location: form.work_location || null,
        min_salary: form.min_salary ? Number(form.min_salary) : null,
      }, { headers: { Authorization: `Bearer ${token}` } });
      setAlert(data.alert);
      toast.success("Job alert saved!");
      setOpen(false);
      fetchMatched();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to save");
    } finally { setSaving(false); }
  };

  const toggle = async () => {
    try {
      const { data } = await axios.put(`${job_service}/api/job/alerts/toggle`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlert(data.alert);
      toast.success(data.message);
    } catch { toast.error("Failed"); }
  };

  const remove = async () => {
    if (!confirm("Remove job alert?")) return;
    try {
      await axios.delete(`${job_service}/api/job/alerts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlert(null);
      setMatchedJobs([]);
      setForm({ keywords: "", location: "", job_type: "", work_location: "", min_salary: "" });
      toast.success("Alert removed");
    } catch { toast.error("Failed"); }
  };

  if (!isAuth) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-orange-50 dark:bg-orange-950/30 mb-4">
          <Bell size={16} className="text-orange-600" />
          <span className="text-sm font-medium">Job Alerts</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-3">Job Alert Notifications</h2>
        <p className="text-lg opacity-70 max-w-2xl mx-auto mb-6">
          Set your preferences and get notified when matching jobs are posted.
        </p>
        <Link href="/login"><Button className="gap-2 bg-orange-600 hover:bg-orange-700"><Bell size={16} /> Sign In to Set Alerts</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-orange-50 dark:bg-orange-950/30 mb-4">
          <Bell size={16} className="text-orange-600" />
          <span className="text-sm font-medium">Job Alerts</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-3">Job Alert Notifications</h2>
        <p className="text-lg opacity-70 max-w-2xl mx-auto">
          Set your preferences and get matched with relevant jobs instantly.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={32} className="animate-spin opacity-40" /></div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Alert status card */}
          <div className={`p-6 rounded-2xl border-2 transition-all ${alert?.is_active ? "border-orange-400 bg-orange-50 dark:bg-orange-950/20" : "border-gray-200"}`}>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${alert?.is_active ? "bg-orange-600" : "bg-gray-200 dark:bg-gray-700"}`}>
                  {alert?.is_active ? <Bell size={22} className="text-white" /> : <BellOff size={22} className="opacity-60" />}
                </div>
                <div>
                  <h3 className="font-bold text-lg">
                    {alert ? (alert.is_active ? "Alert Active" : "Alert Paused") : "No Alert Set"}
                  </h3>
                  {alert ? (
                    <p className="text-sm opacity-60">
                      {[alert.keywords, alert.location, alert.job_type, alert.work_location].filter(Boolean).join(" · ") || "All jobs"}
                      {alert.min_salary ? ` · Min ₹${Number(alert.min_salary).toLocaleString("en-IN")}` : ""}
                    </p>
                  ) : (
                    <p className="text-sm opacity-60">Set preferences to get matched jobs</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {alert && (
                  <>
                    <Button onClick={toggle} variant="outline" size="sm" className="gap-2">
                      {alert.is_active ? <><BellOff size={14} /> Pause</> : <><Bell size={14} /> Resume</>}
                    </Button>
                    <Button onClick={remove} variant="outline" size="sm" className="gap-2 text-red-600 hover:text-red-600">
                      <Trash2 size={14} /> Remove
                    </Button>
                  </>
                )}
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2 bg-orange-600 hover:bg-orange-700">
                      {alert ? <><Settings size={14} /> Edit Alert</> : <><Plus size={14} /> Create Alert</>}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Bell className="text-orange-600" size={18} />
                        {alert ? "Edit Job Alert" : "Create Job Alert"}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-3">
                      <div className="space-y-1">
                        <label className="text-sm font-medium">Keywords</label>
                        <Input value={form.keywords} onChange={(e) => setForm((f) => ({ ...f, keywords: e.target.value }))}
                          placeholder="e.g. React Developer, Python Engineer" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium">Location</label>
                        <Input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                          placeholder="e.g. Bangalore, Mumbai" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium">Job Type</label>
                        <div className="flex flex-wrap gap-2">
                          {["", ...JOB_TYPES].map((t) => (
                            <button key={t} onClick={() => setForm((f) => ({ ...f, job_type: t }))}
                              className={`px-3 py-1 rounded-full border text-xs font-medium transition-all ${form.job_type === t ? "border-orange-500 bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300" : "border-gray-200 hover:border-orange-300"}`}>
                              {t || "Any"}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium">Work Mode</label>
                        <div className="flex gap-2">
                          {["", ...WORK_MODES].map((m) => (
                            <button key={m} onClick={() => setForm((f) => ({ ...f, work_location: m }))}
                              className={`flex-1 py-1.5 rounded-lg border text-xs font-medium transition-all ${form.work_location === m ? "border-orange-500 bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300" : "border-gray-200 hover:border-orange-300"}`}>
                              {m || "Any"}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium">Minimum Salary (LPA)</label>
                        <Input type="number" value={form.min_salary} onChange={(e) => setForm((f) => ({ ...f, min_salary: e.target.value }))}
                          placeholder="e.g. 5" />
                      </div>
                      <Button onClick={save} disabled={saving} className="w-full gap-2 bg-orange-600 hover:bg-orange-700">
                        {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><CheckCircle2 size={16} /> Save Alert</>}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          {/* Matched Jobs */}
          {matchedJobs.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-bold flex items-center gap-2">
                <Briefcase size={16} className="text-orange-600" /> Matched Jobs
                <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/30 text-orange-600 font-semibold">{matchedJobs.length}</span>
              </h3>
              <div className="grid md:grid-cols-2 gap-3">
                {matchedJobs.slice(0, 6).map((job) => (
                  <Link key={job.job_id} href={`/jobs/${job.job_id}`}>
                    <div className="p-4 rounded-xl border-2 hover:border-orange-400 transition-all bg-background cursor-pointer">
                      <div className="flex items-start gap-3 mb-2">
                        <img src={job.company_logo || "/user.png"} className="h-9 w-9 rounded-lg border object-cover shrink-0" alt="" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm truncate">{job.title}</h4>
                          <p className="text-xs opacity-60 flex items-center gap-1"><Building2 size={10} />{job.company_name}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/30 text-orange-700">{job.job_type}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/30 text-blue-700">{job.work_location}</span>
                        {job.location && <span className="text-xs opacity-50 flex items-center gap-1"><MapPin size={10} />{job.location}</span>}
                        {job.salary && <span className="text-xs text-green-600 font-medium">₹{job.salary} LPA</span>}
                      </div>
                      <p className="text-xs opacity-40 mt-1.5 flex items-center gap-1"><Clock size={10} />{new Date(job.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                    </div>
                  </Link>
                ))}
              </div>
              {matchedJobs.length > 6 && (
                <div className="text-center pt-2">
                  <Link href="/jobs"><Button variant="outline" className="gap-2">View all {matchedJobs.length} matches <ArrowRight size={14} /></Button></Link>
                </div>
              )}
            </div>
          )}

          {alert?.is_active && matchedJobs.length === 0 && (
            <div className="text-center py-12 opacity-50">
              <Bell size={40} className="mx-auto mb-3" />
              <p className="text-sm">No matching jobs right now. We'll notify you when new ones are posted!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JobAlerts;
