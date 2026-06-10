"use client";
import Loading from "@/components/loading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { job_service, useAppData } from "@/context/AppContext";
import { Application, Job } from "@/type";
import axios from "axios";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  ExternalLink,
  Eye,
  FileText,
  Laptop,
  MapPin,
  Share2,
  Users,
  XCircle,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import Link from "next/link";

const JobPage = () => {
  const { id } = useParams();
  const { user, applyJob, applications, btnLoading, savedJobIds, toggleSaveJob } = useAppData();
  const router = useRouter();
  const token = Cookies.get("token");

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState(false);
  const [jobApplications, setJobApplications] = useState<Application[]>([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [value, setValue] = useState("");

  const isSaved = job ? savedJobIds?.has(job.job_id) : false;

  useEffect(() => {
    if (applications && id) {
      applications.forEach((item: any) => {
        if (item.job_id.toString() === id) setApplied(true);
      });
    }
  }, [applications, id]);

  async function fetchSingleJob() {
    try {
      const { data } = await axios.get(`${job_service}/api/job/${id}`);
      setJob(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchJobApplications() {
    try {
      const { data } = await axios.get(`${job_service}/api/job/application/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJobApplications(data);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => { fetchSingleJob(); }, [id]);
  useEffect(() => {
    if (user && job && user.user_id === job.posted_by_recuriter_id) fetchJobApplications();
  }, [user, job]);

  const filteredApplications = filterStatus === "All"
    ? jobApplications
    : jobApplications.filter((app) => app.status === filterStatus);

  const updateApplicationHandler = async (appId: number) => {
    if (!value) return toast.error("Please select a status");
    try {
      const { data } = await axios.put(
        `${job_service}/api/job/application/update/${appId}`,
        { status: value },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(data.message);
      fetchJobApplications();
    } catch (error: any) {
      toast.error(error.response.data.message);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-secondary/30">
      {job && (
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Back button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm opacity-60 hover:opacity-100 mb-6 transition-opacity"
          >
            <ArrowLeft size={16} /> Back to Jobs
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main content — left 2/3 */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header card */}
              <Card className="overflow-hidden shadow-lg border-2">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8">
                  <div className="flex items-start gap-4 flex-wrap">
                    {/* Company logo */}
                    <Link href={`/company/${job.company_id}`}>
                      <div className="w-16 h-16 rounded-xl border-2 border-white/30 overflow-hidden bg-white shrink-0 hover:scale-105 transition-transform">
                        <img src={job.company_logo} alt={job.company_name} className="w-full h-full object-cover" />
                      </div>
                    </Link>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${job.is_active ? "bg-green-400/20 text-green-200 border border-green-400/30" : "bg-red-400/20 text-red-200 border border-red-400/30"}`}>
                          {job.is_active ? "● Actively Hiring" : "● Position Closed"}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/20">
                          {job.job_type}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/20">
                          {job.work_location}
                        </span>
                      </div>
                      <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">{job.title}</h1>
                      <Link href={`/company/${job.company_id}`} className="flex items-center gap-1.5 text-blue-200 hover:text-white transition-colors text-sm">
                        <Building2 size={15} /> {job.company_name} <ExternalLink size={12} />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Quick stats row */}
                <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 border-b">
                  {[
                    { icon: MapPin, label: "Location", value: job.location || "Not specified", color: "text-red-500" },
                    { icon: DollarSign, label: "Salary", value: job.salary ? `₹${Number(job.salary).toLocaleString()} P.A` : "Not disclosed", color: "text-green-600" },
                    { icon: Users, label: "Openings", value: `${job.openings} positions`, color: "text-blue-600" },
                    { icon: Briefcase, label: "Role", value: job.role, color: "text-purple-600" },
                  ].map(({ icon: Icon, label, value, color }) => (
                    <div key={label} className="flex items-center gap-3 p-4 bg-background">
                      <Icon size={18} className={color} />
                      <div>
                        <p className="text-xs opacity-50 font-medium">{label}</p>
                        <p className="text-sm font-semibold">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Description */}
                <div className="p-6 md:p-8">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                    <FileText size={20} className="text-blue-600" /> Job Description
                  </h2>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-base leading-relaxed whitespace-pre-line opacity-85">{job.description}</p>
                  </div>
                </div>
              </Card>

              {/* Recruiter: Applications panel */}
              {user && job && user.user_id === job.posted_by_recuriter_id && (
                <Card className="border-2 shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Users size={20} /> Applications
                      </h2>
                      <p className="text-sm text-gray-400">{jobApplications.length} total applicants</p>
                    </div>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-3 py-2 rounded-lg border bg-gray-700 text-white text-sm focus:outline-none"
                    >
                      <option value="All">All Status</option>
                      <option value="Submitted">Submitted</option>
                      <option value="Hired">Hired</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>

                  <div className="p-6 space-y-4">
                    {filteredApplications.length > 0 ? (
                      filteredApplications.map((e) => (
                        <div key={e.application_id} className="p-4 rounded-xl border-2 hover:border-blue-300 transition-colors bg-background">
                          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              e.status === "Hired" ? "bg-green-100 dark:bg-green-900/30 text-green-600"
                              : e.status === "Rejected" ? "bg-red-100 dark:bg-red-900/30 text-red-600"
                              : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600"
                            }`}>
                              {e.status === "Hired" ? "✓ Hired" : e.status === "Rejected" ? "✗ Rejected" : "⏳ Submitted"}
                            </span>
                            <span className="text-xs opacity-50">{new Date(e.applied_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                          </div>

                          <div className="flex gap-3 mb-3">
                            <Link target="_blank" href={e.resume} className="flex items-center gap-1.5 text-blue-500 hover:underline text-sm">
                              <FileText size={14} /> View Resume
                            </Link>
                            <Link target="_blank" href={`/account/${e.applicant_id}`} className="flex items-center gap-1.5 text-blue-500 hover:underline text-sm">
                              <Users size={14} /> View Profile
                            </Link>
                          </div>

                          <div className="flex gap-2 pt-3 border-t">
                            <select
                              value={value}
                              onChange={(e) => setValue(e.target.value)}
                              className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg bg-background text-sm focus:outline-none focus:border-blue-500"
                            >
                              <option value="">Update status...</option>
                              <option value="Submitted">Submitted</option>
                              <option value="Hired">Hired</option>
                              <option value="Rejected">Rejected</option>
                            </select>
                            <Button disabled={btnLoading} onClick={() => updateApplicationHandler(e.application_id)} size="sm" className="px-4">
                              Update
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10">
                        <Users size={36} className="opacity-20 mx-auto mb-3" />
                        <p className="opacity-60">No applications {filterStatus !== "All" ? `with status "${filterStatus}"` : "yet"}</p>
                      </div>
                    )}
                  </div>
                </Card>
              )}
            </div>

            {/* Sidebar — right 1/3 */}
            <div className="space-y-4">
              {/* Apply card */}
              <Card className="border-2 shadow-lg p-6 space-y-4">
                {user && user.role === "jobseeker" ? (
                  <>
                    {applied ? (
                      <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-600 font-semibold">
                        <CheckCircle2 size={20} /> Already Applied
                      </div>
                    ) : job.is_active ? (
                      <Button onClick={() => applyJob(job.job_id)} disabled={btnLoading} className="w-full h-12 gap-2 text-base shadow-lg shadow-blue-500/20">
                        <Briefcase size={18} /> {btnLoading ? "Applying..." : "Easy Apply"}
                      </Button>
                    ) : (
                      <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 font-semibold">
                        <XCircle size={18} /> Position Closed
                      </div>
                    )}

                    <button
                      onClick={() => toggleSaveJob(job.job_id)}
                      className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border-2 transition-all text-sm font-medium ${isSaved ? "border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-950/20" : "hover:border-blue-300"}`}
                    >
                      {isSaved ? <><BookmarkCheck size={16} /> Saved</> : <><Bookmark size={16} /> Save Job</>}
                    </button>

                    <button onClick={handleShare} className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-sm opacity-60 hover:opacity-100 transition-opacity">
                      <Share2 size={15} /> Share Job
                    </button>
                  </>
                ) : !user ? (
                  <Link href="/login">
                    <Button className="w-full h-12 gap-2">
                      <Briefcase size={18} /> Login to Apply
                    </Button>
                  </Link>
                ) : null}
              </Card>

              {/* Job overview card */}
              <Card className="border-2 p-6 space-y-4">
                <h3 className="font-bold text-base">Job Overview</h3>
                {[
                  { icon: Clock, label: "Job Type", value: job.job_type },
                  { icon: Laptop, label: "Work Mode", value: job.work_location },
                  { icon: MapPin, label: "Location", value: job.location || "Not specified" },
                  { icon: DollarSign, label: "Salary", value: job.salary ? `₹${Number(job.salary).toLocaleString()} P.A` : "Not disclosed" },
                  { icon: Users, label: "Openings", value: `${job.openings} positions` },
                  { icon: Calendar, label: "Posted", value: new Date(job.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) },
                  { icon: Eye, label: "Views", value: job.views !== undefined ? `${job.views} views` : "—" },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center shrink-0">
                      <Icon size={15} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs opacity-50">{label}</p>
                      <p className="text-sm font-medium">{value}</p>
                    </div>
                  </div>
                ))}
              </Card>

              {/* Company card */}
              <Card className="border-2 p-6">
                <h3 className="font-bold text-base mb-4">About the Company</h3>
                <Link href={`/company/${job.company_id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                  <div className="w-12 h-12 rounded-xl border overflow-hidden bg-background shrink-0">
                    <img src={job.company_logo} alt={job.company_name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{job.company_name}</p>
                    <p className="text-xs text-blue-600 flex items-center gap-1">View Company <ExternalLink size={11} /></p>
                  </div>
                </Link>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobPage;
