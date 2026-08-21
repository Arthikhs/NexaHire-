"use client";
import Loading from "@/components/loading";
import { useAppData } from "@/context/AppContext";
import React, { useEffect, useState } from "react";
import Info from "./components/info";
import Skills from "./components/skills";
import Company from "./components/company";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import AppliedJobs from "./components/appliedJobs";
import { Award, Bookmark, Briefcase } from "lucide-react";

const tabs = [
  { id: "applied", label: "Applied Jobs", icon: Briefcase },
  { id: "skills", label: "Skills", icon: Award },
  { id: "saved", label: "Saved Jobs", icon: Bookmark },
];

const AccountPage = () => {
  const { isAuth, user, loading, applications, savedJobs } = useAppData();
  const [activeTab, setActiveTab] = useState("applied");
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuth && !loading) navigate("/login");
  }, [isAuth, navigate, loading]);

  if (loading) return <Loading />;

  return (
    <>
      {user && (
        <div className="min-h-screen bg-secondary/30">
          <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
            <Info user={user} isYourAccount={true} />

            {user.role === "jobseeker" && (
              <>
                <div className="flex gap-1 p-1 rounded-xl border bg-background w-fit">
                  {tabs.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setActiveTab(id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        activeTab === id ? "bg-blue-600 text-white shadow-sm" : "opacity-60 hover:opacity-100"
                      }`}
                    >
                      <Icon size={15} /> {label}
                      {id === "applied" && applications.length > 0 && (
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === id ? "bg-white/20" : "bg-blue-100 dark:bg-blue-900/30 text-blue-600"}`}>
                          {applications.length}
                        </span>
                      )}
                      {id === "saved" && savedJobs.length > 0 && (
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === id ? "bg-white/20" : "bg-blue-100 dark:bg-blue-900/30 text-blue-600"}`}>
                          {savedJobs.length}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {activeTab === "applied" && <AppliedJobs applications={applications} />}
                {activeTab === "skills" && <Skills user={user} isYourAccount={true} />}
                {activeTab === "saved" && (
                  <div>
                    {savedJobs.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {savedJobs.map((job) => (
                          <Link
                            key={job.job_id}
                            to={`/jobs/${job.job_id}`}
                            className="flex items-center gap-3 p-4 rounded-xl border-2 bg-background hover:border-blue-500 transition-all"
                          >
                            <div className="w-12 h-12 rounded-xl border overflow-hidden shrink-0">
                              <img src={job.company_logo} alt={job.company_name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm truncate">{job.title}</p>
                              <p className="text-xs opacity-60 truncate">{job.company_name} · {job.location}</p>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${job.is_active ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                              {job.is_active ? "Open" : "Closed"}
                            </span>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-16 bg-background rounded-xl border-2">
                        <Bookmark size={40} className="opacity-20 mx-auto mb-3" />
                        <p className="opacity-60">No saved jobs yet</p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {user.role === "recruiter" && <Company />}
          </div>
        </div>
      )}
    </>
  );
};

export default AccountPage;
