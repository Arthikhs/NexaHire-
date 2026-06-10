"use client";
import { useAppData } from "@/context/AppContext";
import { CheckCircle2, Clock, Trophy, Briefcase, Star, TrendingUp, User, FileText } from "lucide-react";
import React from "react";
import Link from "next/link";
import { Button } from "./ui/button";

const CareerDashboard = () => {
  const { user, applications } = useAppData();
  if (!user) return null;

  const hired = applications.filter((a) => a.status === "Hired").length;
  const submitted = applications.filter((a) => a.status === "Submitted").length;
  const rejected = applications.filter((a) => a.status === "Rejected").length;
  const profileComplete = [user.name, user.email, user.phone_number, user.bio, user.profile_pic, user.resume, user.skills?.length > 0].filter(Boolean).length;
  const profilePct = Math.round((profileComplete / 7) * 100);

  const stats = [
    { label: "Applications", value: applications.length, icon: Briefcase, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" },
    { label: "Interviews", value: hired, icon: Trophy, color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/30" },
    { label: "Pending", value: submitted, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-100 dark:bg-yellow-900/30" },
    { label: "Rejected", value: rejected, icon: Star, color: "text-red-500", bg: "bg-red-100 dark:bg-red-900/30" },
  ];

  const milestones = [
    { label: "Profile Created", done: true },
    { label: "Resume Uploaded", done: !!user.resume },
    { label: "Skills Added", done: user.skills?.length > 0 },
    { label: "First Application", done: applications.length > 0 },
    { label: "Got Hired", done: hired > 0 },
    { label: "Profile Picture", done: !!user.profile_pic },
    { label: "Subscribed", done: !!user.subscription },
  ];

  const completedMilestones = milestones.filter((m) => m.done).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-teal-50 dark:bg-teal-950/30 mb-4">
          <TrendingUp size={16} className="text-teal-600" />
          <span className="text-sm font-medium">Your Career Journey</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-2">Career Dashboard</h2>
        <p className="opacity-70">Welcome back, <span className="font-bold">{user.name}</span> 👋</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left — Profile */}
        <div className="space-y-4">
          <div className="p-5 rounded-xl border-2">
            <div className="flex items-center gap-3 mb-4">
              <img src={user.profile_pic || "/user.png"} className="h-14 w-14 rounded-full object-cover border-2" alt="" />
              <div>
                <p className="font-bold">{user.name}</p>
                <p className="text-xs opacity-60 capitalize">{user.role}</p>
              </div>
            </div>
            <div className="space-y-1 mb-3">
              <div className="flex justify-between text-xs"><span>Profile Complete</span><span className="font-bold text-teal-600">{profilePct}%</span></div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="h-2 rounded-full bg-teal-500" style={{ width: `${profilePct}%` }} />
              </div>
            </div>
            <Link href="/account"><Button size="sm" variant="outline" className="w-full gap-2"><User size={14} /> View Profile</Button></Link>
          </div>

          {/* Milestones */}
          <div className="p-5 rounded-xl border-2">
            <h3 className="font-bold mb-3 flex items-center gap-2"><Trophy size={16} className="text-yellow-500" /> Milestones ({completedMilestones}/{milestones.length})</h3>
            <div className="space-y-2">
              {milestones.map((m, i) => (
                <div key={i} className={`flex items-center gap-2 text-sm ${m.done ? "opacity-100" : "opacity-40"}`}>
                  <CheckCircle2 size={15} className={m.done ? "text-green-600" : "text-gray-400"} />
                  <span>{m.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Stats & Activity */}
        <div className="md:col-span-2 space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stats.map((s, i) => (
              <div key={i} className="p-4 rounded-xl border-2 text-center">
                <div className={`h-10 w-10 rounded-full ${s.bg} flex items-center justify-center mx-auto mb-2`}>
                  <s.icon size={20} className={s.color} />
                </div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs opacity-60">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Recent Applications */}
          <div className="p-5 rounded-xl border-2">
            <h3 className="font-bold mb-3 flex items-center gap-2"><FileText size={16} className="text-blue-600" /> Recent Applications</h3>
            {applications.length === 0 ? (
              <div className="text-center py-6 opacity-50">
                <Briefcase size={32} className="mx-auto mb-2" />
                <p className="text-sm">No applications yet</p>
                <Link href="/jobs"><Button size="sm" className="mt-2 gap-2">Browse Jobs <TrendingUp size={14} /></Button></Link>
              </div>
            ) : (
              <div className="space-y-2">
                {applications.slice(0, 5).map((app, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border hover:border-blue-300 transition-colors">
                    <div>
                      <p className="font-medium text-sm">{app.job_title}</p>
                      <p className="text-xs opacity-60">{new Date(app.applied_at).toLocaleDateString()}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${app.status === "Hired" ? "bg-green-100 text-green-700" : app.status === "Rejected" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-3">
            <Link href="/jobs"><div className="p-4 rounded-xl border-2 hover:border-blue-500 transition-all text-center cursor-pointer"><Briefcase size={24} className="text-blue-600 mx-auto mb-2" /><p className="text-sm font-medium">Find Jobs</p></div></Link>
            <Link href="/account"><div className="p-4 rounded-xl border-2 hover:border-teal-500 transition-all text-center cursor-pointer"><User size={24} className="text-teal-600 mx-auto mb-2" /><p className="text-sm font-medium">My Profile</p></div></Link>
            <Link href="/subscribe"><div className="p-4 rounded-xl border-2 hover:border-yellow-500 transition-all text-center cursor-pointer"><Trophy size={24} className="text-yellow-500 mx-auto mb-2" /><p className="text-sm font-medium">Subscribe</p></div></Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareerDashboard;
