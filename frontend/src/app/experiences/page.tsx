"use client";
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { job_service } from "@/context/AppContext";
import { InterviewExperience } from "@/type";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Loading from "@/components/loading";
import {
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  Filter,
  MessageSquarePlus,
  Search,
  Star,
  X,
  XCircle,
} from "lucide-react";

const difficultyColor = {
  Easy: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  Hard: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const ExperiencesPage = () => {
  const [experiences, setExperiences] = useState<InterviewExperience[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const filterRef = useRef<HTMLButtonElement>(null);

  async function fetchExperiences() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (company) params.set("company", company);
      if (role) params.set("role", role);
      if (difficulty) params.set("difficulty", difficulty);
      const { data } = await axios.get(
        `${job_service}/api/experience?${params.toString()}`
      );
      setExperiences(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchExperiences();
  }, [search, company, role, difficulty]);

  const clearFilters = () => {
    setCompany("");
    setRole("");
    setDifficulty("");
    filterRef.current?.click();
  };

  const hasFilters = company || role || difficulty;

  return (
    <div className="min-h-screen bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Interview <span className="text-red-500">Experiences</span>
              </h1>
              <p className="text-base opacity-70">
                {experiences.length} community experience
                {experiences.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button className="gap-2 h-11" onClick={() => filterRef.current?.click()}>
                <Filter size={18} /> Filters
                {hasFilters && (
                  <span className="ml-1 px-2 py-0.5 rounded-full bg-red-500 text-white text-xs">
                    Active
                  </span>
                )}
              </Button>
              <Link href="/experiences/post">
                <Button variant="outline" className="gap-2 h-11">
                  <MessageSquarePlus size={18} /> Share Yours
                </Button>
              </Link>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50"
            />
            <Input
              placeholder="Search by company name..."
              className="pl-10 h-11"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Active Filters */}
          {hasFilters && (
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <span className="text-sm opacity-70">Active Filters:</span>
              {company && (
                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 text-sm">
                  <Building2 size={13} /> {company}
                  <button onClick={() => setCompany("")}>
                    <X size={13} />
                  </button>
                </span>
              )}
              {role && (
                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 text-sm">
                  <Briefcase size={13} /> {role}
                  <button onClick={() => setRole("")}>
                    <X size={13} />
                  </button>
                </span>
              )}
              {difficulty && (
                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 text-sm">
                  {difficulty}
                  <button onClick={() => setDifficulty("")}>
                    <X size={13} />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <Loading />
        ) : experiences.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {experiences.map((exp) => (
              <ExperienceCard key={exp.experience_id} exp={exp} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
              <MessageSquarePlus size={40} className="opacity-40" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No experiences found</h3>
            <p className="opacity-60 mb-6">Be the first to share your experience!</p>
            <Link href="/experiences/post">
              <Button className="gap-2">
                <MessageSquarePlus size={16} /> Share Experience
              </Button>
            </Link>
          </div>
        )}

        {/* Filter Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Button ref={filterRef} className="hidden" />
          </DialogTrigger>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Filter className="text-blue-600" /> Filter Experiences
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-5 py-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Building2 size={15} /> Company
                </Label>
                <Input
                  placeholder="e.g., Google, Amazon..."
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Briefcase size={15} /> Role
                </Label>
                <Input
                  placeholder="e.g., Software Engineer..."
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full h-11 px-3 border-2 border-gray-300 rounded-md bg-transparent focus:outline-none"
                >
                  <option value="">All Difficulties</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={clearFilters} className="flex-1">
                Clear All
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

const ExperienceCard = ({ exp }: { exp: InterviewExperience }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-background rounded-xl border p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      {/* Top Row */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-bold text-base">{exp.company_name}</h3>
          <p className="text-sm opacity-70">{exp.role}</p>
        </div>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${difficultyColor[exp.difficulty]}`}
        >
          {exp.difficulty}
        </span>
      </div>

      {/* Stars + Offer */}
      <div className="flex items-center gap-3">
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={14}
              className={i < exp.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
            />
          ))}
        </div>
        {exp.got_offer ? (
          <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
            <CheckCircle2 size={13} /> Got Offer
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs text-red-500 font-medium">
            <XCircle size={13} /> No Offer
          </span>
        )}
      </div>

      {/* Rounds */}
      <div>
        <p className="text-xs font-semibold opacity-50 uppercase mb-1">Rounds</p>
        <p className={`text-sm ${!expanded ? "line-clamp-3" : ""}`}>{exp.rounds}</p>
      </div>

      {/* Questions */}
      {exp.questions_asked && (
        <div>
          <p className="text-xs font-semibold opacity-50 uppercase mb-1">Questions Asked</p>
          <p className={`text-sm ${!expanded ? "line-clamp-2" : ""}`}>{exp.questions_asked}</p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t">
        <div className="flex items-center gap-1 text-xs opacity-50">
          <Calendar size={12} />
          {new Date(exp.interview_date).toLocaleDateString("en-IN", {
            month: "short",
            year: "numeric",
          })}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs opacity-50">by {exp.user_name}</span>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-blue-600 hover:underline"
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExperiencesPage;
