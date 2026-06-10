"use client";
import { job_service, useAppData } from "@/context/AppContext";
import axios from "axios";
import { Briefcase, MapPin, Building2, ArrowRight, Filter, Search, Clock } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import Link from "next/link";

const JOB_TYPES = ["All", "Full-time", "Part-time", "Contract", "Internship"];
const WORK_MODES = ["All", "Remote", "On-site", "Hybrid"];

const PersonalizedFeed = () => {
  const { user } = useAppData();
  const [jobs, setJobs] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [jobType, setJobType] = useState("All");
  const [workMode, setWorkMode] = useState("All");

  useEffect(() => {
    axios.get(`${job_service}/api/job/all`).then(({ data }) => {
      setJobs(data); setFiltered(data);
    }).catch(() => setJobs([])).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = [...jobs];
    // Personalize by user skills
    if (user?.skills?.length) {
      result.sort((a, b) => {
        const aMatch = user.skills.filter((s: string) => a.description?.toLowerCase().includes(s.toLowerCase())).length;
        const bMatch = user.skills.filter((s: string) => b.description?.toLowerCase().includes(s.toLowerCase())).length;
        return bMatch - aMatch;
      });
    }
    if (search) result = result.filter((j) => j.title?.toLowerCase().includes(search.toLowerCase()) || j.company_name?.toLowerCase().includes(search.toLowerCase()));
    if (jobType !== "All") result = result.filter((j) => j.job_type === jobType);
    if (workMode !== "All") result = result.filter((j) => j.work_location === workMode);
    setFiltered(result);
  }, [search, jobType, workMode, jobs, user]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 bg-secondary/30">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-blue-50 dark:bg-blue-950/30 mb-4">
          <Briefcase size={16} className="text-blue-600" />
          <span className="text-sm font-medium">Personalized For You</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Your Job Feed</h2>
        <p className="text-lg opacity-70 max-w-2xl mx-auto">
          {user?.skills?.length ? `Jobs matched to your skills: ${user.skills.slice(0, 3).join(", ")}` : "Browse all available jobs"}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6 justify-center">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-3 opacity-50" />
          <Input placeholder="Search jobs..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-10 w-64" />
        </div>
        <div className="flex gap-2">
          {JOB_TYPES.map((t) => (
            <button key={t} onClick={() => setJobType(t)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${jobType === t ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-700" : "border-gray-200 hover:border-blue-300"}`}>
              {t}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {WORK_MODES.map((m) => (
            <button key={m} onClick={() => setWorkMode(m)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${workMode === m ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-700" : "border-gray-200 hover:border-blue-300"}`}>
              {m}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 opacity-60">Loading jobs...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <Briefcase size={40} className="mx-auto opacity-30 mb-3" />
          <p className="opacity-60">No jobs found. Try different filters.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.slice(0, 9).map((job) => (
            <Link href={`/jobs/${job.job_id}`} key={job.job_id}>
              <div className="p-5 rounded-xl border-2 hover:border-blue-500 transition-all bg-background cursor-pointer h-full">
                <div className="flex items-start gap-3 mb-3">
                  <div className="h-10 w-10 rounded-lg border overflow-hidden bg-white shrink-0">
                    <img src={job.company_logo || "/user.png"} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm truncate">{job.title}</h3>
                    <p className="text-xs opacity-60 flex items-center gap-1"><Building2 size={11} />{job.company_name}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700">{job.job_type}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700">{job.work_location}</span>
                  {job.salary && <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">₹{job.salary} LPA</span>}
                </div>
                <div className="flex items-center justify-between text-xs opacity-50">
                  <span className="flex items-center gap-1"><MapPin size={11} />{job.location || "India"}</span>
                  <span className="flex items-center gap-1"><Clock size={11} />{new Date(job.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {filtered.length > 9 && (
        <div className="text-center mt-6">
          <Link href="/jobs"><Button className="gap-2">View All {filtered.length} Jobs <ArrowRight size={16} /></Button></Link>
        </div>
      )}
    </div>
  );
};

export default PersonalizedFeed;
