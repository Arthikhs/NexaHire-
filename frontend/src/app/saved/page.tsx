"use client";
import React from "react";
import Link from "next/link";
import { useAppData } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import JobCard from "@/components/job-card";
import { Bookmark, Briefcase } from "lucide-react";
import Loading from "@/components/loading";

const SavedJobsPage = () => {
  const { savedJobs, loading, isAuth } = useAppData();

  if (loading) return <Loading />;

  if (!isAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Bookmark size={48} className="opacity-30" />
        <h2 className="text-xl font-semibold">Login to view saved jobs</h2>
        <Link href="/login">
          <Button className="gap-2">Sign In</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Saved <span className="text-red-500">Jobs</span>
          </h1>
          <p className="text-base opacity-70">
            {savedJobs.length} saved job{savedJobs.length !== 1 ? "s" : ""}
          </p>
        </div>

        {savedJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedJobs.map((job) => (
              <JobCard key={job.job_id} job={job} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
              <Briefcase size={40} className="opacity-40" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No saved jobs yet</h3>
            <p className="opacity-60 mb-6">
              Bookmark jobs you like and find them here
            </p>
            <Link href="/jobs">
              <Button className="gap-2">
                <Briefcase size={16} /> Browse Jobs
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedJobsPage;
