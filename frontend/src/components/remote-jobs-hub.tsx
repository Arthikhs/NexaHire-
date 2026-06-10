"use client";
import { job_service } from "@/context/AppContext";
import axios from "axios";
import { Globe, MapPin, Building2, ArrowRight, Clock, Wifi } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import Link from "next/link";

const RemoteJobsHub = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${job_service}/api/job/all`).then(({ data }) => {
      setJobs(data.filter((j: any) => j.work_location === "Remote"));
    }).catch(() => setJobs([])).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 bg-secondary/30">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-sky-50 dark:bg-sky-950/30 mb-4">
          <Wifi size={16} className="text-sky-600" />
          <span className="text-sm font-medium">Work From Anywhere</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Remote Jobs Hub</h2>
        <p className="text-lg opacity-70 max-w-2xl mx-auto mb-4">100% remote opportunities from top companies worldwide.</p>
        <div className="flex justify-center gap-4 mb-6">
          {["Flexible Hours", "Work From Home", "Global Teams", "No Commute"].map((t) => (
            <span key={t} className="text-xs px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-900/30 border border-sky-200 text-sky-700">{t}</span>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 opacity-60">Loading remote jobs...</div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-12">
          <Globe size={40} className="mx-auto opacity-30 mb-3" />
          <p className="opacity-60 mb-4">No remote jobs posted yet.</p>
          <Link href="/jobs"><Button className="gap-2">Browse All Jobs <ArrowRight size={16} /></Button></Link>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.slice(0, 6).map((job) => (
              <Link href={`/jobs/${job.job_id}`} key={job.job_id}>
                <div className="p-5 rounded-xl border-2 hover:border-sky-500 transition-all bg-background cursor-pointer">
                  <div className="flex items-start gap-3 mb-3">
                    <img src={job.company_logo || "/user.png"} className="h-10 w-10 rounded-lg border object-cover" alt="" />
                    <div>
                      <h3 className="font-bold text-sm">{job.title}</h3>
                      <p className="text-xs opacity-60 flex items-center gap-1"><Building2 size={11} />{job.company_name}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-700 flex items-center gap-1"><Wifi size={10} /> Remote</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{job.job_type}</span>
                    {job.salary && <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">₹{job.salary} LPA</span>}
                  </div>
                  <p className="text-xs opacity-50 mt-2 flex items-center gap-1"><Clock size={10} />{new Date(job.created_at).toLocaleDateString()}</p>
                </div>
              </Link>
            ))}
          </div>
          {jobs.length > 6 && (
            <div className="text-center mt-6">
              <Link href="/jobs"><Button className="gap-2">View All {jobs.length} Remote Jobs <ArrowRight size={16} /></Button></Link>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RemoteJobsHub;
