"use client";
import { Job } from "@/type";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { job_service } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Briefcase, Clock, DollarSign, Filter,
  Laptop, MapPin, Search, SlidersHorizontal, X,
} from "lucide-react";
import Loading from "@/components/loading";
import JobCard from "@/components/job-card";

const locations = ["Delhi", "Mumbai", "Bangalore", "Hyderabad", "Pune", "Kolkata", "Chennai", "Remote"];
const jobTypes = ["Full-time", "Part-time", "Contract", "Internship"];
const workLocations = ["On-site", "Remote", "Hybrid"];

const JobsPage = () => {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("");
  const [workLocation, setWorkLocation] = useState("");
  const [minSalary, setMinSalary] = useState("");
  const [maxSalary, setMaxSalary] = useState("");

  async function fetchJobs() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (title) params.set("title", title);
      if (location) params.set("location", location);
      if (jobType) params.set("job_type", jobType);
      if (workLocation) params.set("work_location", workLocation);
      if (minSalary) params.set("min_salary", minSalary);
      if (maxSalary) params.set("max_salary", maxSalary);
      const { data } = await axios.get(`${job_service}/api/job/all?${params.toString()}`);
      setJobs(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchJobs();
  }, [title, location, jobType, workLocation, minSalary, maxSalary]);

  const clearAll = () => {
    setTitle(""); setLocation(""); setJobType("");
    setWorkLocation(""); setMinSalary(""); setMaxSalary("");
  };

  const activeFilters = [
    title && { key: "title", label: title, clear: () => setTitle("") },
    location && { key: "location", label: location, clear: () => setLocation("") },
    jobType && { key: "jobType", label: jobType, clear: () => setJobType("") },
    workLocation && { key: "workLocation", label: workLocation, clear: () => setWorkLocation("") },
    minSalary && { key: "minSalary", label: `Min ₹${Number(minSalary).toLocaleString()}`, clear: () => setMinSalary("") },
    maxSalary && { key: "maxSalary", label: `Max ₹${Number(maxSalary).toLocaleString()}`, clear: () => setMaxSalary("") },
  ].filter(Boolean) as { key: string; label: string; clear: () => void }[];

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Search */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sm font-semibold">
          <Search size={14} /> Job Title
        </Label>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
          <Input
            placeholder="e.g. React Developer"
            className="pl-9 h-10"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
      </div>

      {/* Location */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sm font-semibold">
          <MapPin size={14} /> Location
        </Label>
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full h-10 px-3 border-2 border-gray-300 rounded-lg bg-transparent text-sm focus:outline-none focus:border-blue-500"
        >
          <option value="">All Locations</option>
          {locations.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>

      {/* Job Type */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sm font-semibold">
          <Clock size={14} /> Job Type
        </Label>
        <div className="flex flex-wrap gap-2">
          {jobTypes.map((t) => (
            <button
              key={t}
              onClick={() => setJobType(jobType === t ? "" : t)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border-2 transition-all ${
                jobType === t
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-600"
                  : "border-gray-200 hover:border-blue-300"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Work Location */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sm font-semibold">
          <Laptop size={14} /> Work Mode
        </Label>
        <div className="flex flex-wrap gap-2">
          {workLocations.map((w) => (
            <button
              key={w}
              onClick={() => setWorkLocation(workLocation === w ? "" : w)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border-2 transition-all ${
                workLocation === w
                  ? "border-purple-500 bg-purple-50 dark:bg-purple-950/30 text-purple-600"
                  : "border-gray-200 hover:border-purple-300"
              }`}
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      {/* Salary Range */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sm font-semibold">
          <DollarSign size={14} /> Salary Range (₹ P.A)
        </Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            placeholder="Min"
            className="h-10"
            value={minSalary}
            onChange={(e) => setMinSalary(e.target.value)}
          />
          <Input
            type="number"
            placeholder="Max"
            className="h-10"
            value={maxSalary}
            onChange={(e) => setMaxSalary(e.target.value)}
          />
        </div>
      </div>

      {activeFilters.length > 0 && (
        <Button variant="outline" onClick={clearAll} className="w-full gap-2">
          <X size={14} /> Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-1">
              Explore <span className="text-red-500">Opportunities</span>
            </h1>
            <p className="text-sm opacity-60">{jobs.length} jobs found</p>
          </div>
          {/* Mobile filter toggle */}
          <Button
            className="lg:hidden gap-2 h-11"
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal size={16} />
            Filters
            {activeFilters.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-blue-600 text-white text-xs">{activeFilters.length}</span>
            )}
          </Button>
        </div>

        {/* Active filter chips */}
        {activeFilters.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap mb-5">
            <span className="text-xs opacity-50 font-medium">Active:</span>
            {activeFilters.map((f) => (
              <span key={f.key} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 text-xs font-medium">
                {f.label}
                <button onClick={f.clear} className="hover:opacity-70"><X size={12} /></button>
              </span>
            ))}
            <button onClick={clearAll} className="text-xs text-red-500 hover:underline">Clear all</button>
          </div>
        )}

        <div className="flex gap-6">
          {/* Sidebar — desktop */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="bg-background rounded-xl border-2 p-5 sticky top-24">
              <h2 className="font-bold text-base flex items-center gap-2 mb-5">
                <Filter size={16} className="text-blue-600" /> Filters
                {activeFilters.length > 0 && (
                  <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-blue-600 text-white">{activeFilters.length}</span>
                )}
              </h2>
              <FilterPanel />
            </div>
          </aside>

          {/* Mobile filter panel */}
          {showFilters && (
            <div className="lg:hidden fixed inset-0 z-50 bg-background overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-lg flex items-center gap-2"><Filter size={18} className="text-blue-600" /> Filters</h2>
                <button onClick={() => setShowFilters(false)}><X size={22} /></button>
              </div>
              <FilterPanel />
              <Button className="w-full mt-6 h-12" onClick={() => setShowFilters(false)}>
                Show {jobs.length} Jobs
              </Button>
            </div>
          )}

          {/* Jobs grid */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <Loading />
            ) : jobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {jobs.map((job) => (
                  <JobCard job={job} key={job.job_id} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-background rounded-xl border-2">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                  <Briefcase size={36} className="opacity-30" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No jobs found</h3>
                <p className="opacity-60 text-sm mb-4">Try adjusting your filters</p>
                <Button variant="outline" onClick={clearAll} className="gap-2">
                  <X size={14} /> Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobsPage;
