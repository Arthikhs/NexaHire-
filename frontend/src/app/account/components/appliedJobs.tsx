"use client";
import { Application } from "@/type";
import {
  Briefcase, CheckCircle2, Clock,
  DollarSign, ExternalLink, XCircle,
} from "lucide-react";
import Link from "next/link";
import React from "react";

interface AppliedJobsProps {
  applications: Application[];
}

const statusConfig = {
  Hired: { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/30", border: "border-green-200 dark:border-green-800", label: "Hired" },
  Rejected: { icon: XCircle, color: "text-red-600", bg: "bg-red-100 dark:bg-red-900/30", border: "border-red-200 dark:border-red-800", label: "Rejected" },
  Submitted: { icon: Clock, color: "text-yellow-600", bg: "bg-yellow-100 dark:bg-yellow-900/30", border: "border-yellow-200 dark:border-yellow-800", label: "Under Review" },
};

const AppliedJobs: React.FC<AppliedJobsProps> = ({ applications }) => {
  const hired = applications.filter((a) => a.status === "Hired").length;
  const rejected = applications.filter((a) => a.status === "Rejected").length;
  const pending = applications.filter((a) => a.status === "Submitted").length;

  return (
    <div className="space-y-4">
      {/* Stats row */}
      {applications.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total Applied", value: applications.length, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/20" },
            { label: "Hired", value: hired, color: "text-green-600", bg: "bg-green-50 dark:bg-green-950/20" },
            { label: "Pending", value: pending, color: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-950/20" },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`rounded-xl border p-4 text-center ${bg}`}>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs opacity-60 mt-1">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Applications list */}
      {applications.length > 0 ? (
        <div className="space-y-3">
          {applications.map((a) => {
            const cfg = statusConfig[a.status] || statusConfig.Submitted;
            const StatusIcon = cfg.icon;
            return (
              <div key={a.application_id} className="p-4 rounded-xl border-2 hover:border-blue-400 transition-all bg-background">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base mb-2 truncate">{a.job_title}</h3>
                    <div className="flex flex-wrap items-center gap-2">
                      {a.job_salary && (
                        <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/30 text-blue-600 font-medium">
                          <DollarSign size={12} /> ₹{Number(a.job_salary).toLocaleString()} P.A
                        </span>
                      )}
                      {a.job_location && (
                        <span className="text-xs opacity-50">{a.job_location}</span>
                      )}
                      <span className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border font-medium ${cfg.bg} ${cfg.border} ${cfg.color}`}>
                        <StatusIcon size={12} /> {cfg.label}
                      </span>
                    </div>
                  </div>
                  <Link href={`/jobs/${a.job_id}`} className="shrink-0">
                    <span className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline font-medium">
                      View Job <ExternalLink size={12} />
                    </span>
                  </Link>
                </div>
                <p className="text-xs opacity-40 mt-2">
                  Applied {new Date(a.applied_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-background rounded-xl border-2">
          <Briefcase size={40} className="opacity-20 mx-auto mb-3" />
          <p className="font-semibold mb-1">No applications yet</p>
          <p className="text-sm opacity-60 mb-4">Start applying to jobs you like!</p>
          <Link href="/jobs" className="text-sm text-blue-600 hover:underline">Browse Jobs →</Link>
        </div>
      )}
    </div>
  );
};

export default AppliedJobs;
