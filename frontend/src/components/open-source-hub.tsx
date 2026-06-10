"use client";
import { open_source_service } from "@/context/AppContext";
import { useAppData } from "@/context/AppContext";
import axios from "axios";
import { GitBranch, Star, GitFork, ExternalLink, Search, Filter, Plus, ArrowRight, Loader2, Github } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import toast from "react-hot-toast";
import Cookies from "js-cookie";

interface OSProject {
  project_id: number;
  title: string;
  description: string;
  github_url: string;
  tech_stack: string[];
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  stars: number;
  forks: number;
  open_issues: number;
  contributor_id: number;
  contributor_name: string;
  created_at: string;
}

const DIFFICULTIES = ["All", "Beginner", "Intermediate", "Advanced"];
const diffColor = (d: string) =>
  d === "Advanced" ? "text-red-600 bg-red-50 border-red-200 dark:bg-red-950/30" :
  d === "Intermediate" ? "text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30" :
  "text-green-600 bg-green-50 border-green-200 dark:bg-green-950/30";

const OpenSourceHub = () => {
  const { isAuth } = useAppData();
  const token = Cookies.get("token");
  const [projects, setProjects] = useState<OSProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("All");
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", github_url: "", tech_stack: "", difficulty: "Beginner" });
  const [submitting, setSubmitting] = useState(false);

  const fetchProjects = async () => {
    try {
      const params: any = {};
      if (search) params.search = search;
      if (difficulty !== "All") params.difficulty = difficulty;
      const { data } = await axios.get(`${open_source_service}/api/opensource/projects`, { params });
      setProjects(data);
    } catch { setProjects([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProjects(); }, [search, difficulty]);

  const submit = async () => {
    if (!form.title || !form.github_url) { toast.error("Title and GitHub URL are required"); return; }
    setSubmitting(true);
    try {
      await axios.post(`${open_source_service}/api/opensource/projects`, {
        ...form,
        tech_stack: form.tech_stack.split(",").map((s) => s.trim()).filter(Boolean),
      }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Project added!");
      setAddOpen(false);
      setForm({ title: "", description: "", github_url: "", tech_stack: "", difficulty: "Beginner" });
      fetchProjects();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to add project");
    } finally { setSubmitting(false); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-purple-50 dark:bg-purple-950/30 mb-4">
          <Github size={16} className="text-purple-600" />
          <span className="text-sm font-medium">Open Source</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-3">Open Source Contribution Hub</h2>
        <p className="text-lg opacity-70 max-w-2xl mx-auto">
          Discover projects to contribute to and showcase your open source work to recruiters.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects, tech stack..."
            className="w-full pl-9 pr-4 py-2.5 border rounded-lg bg-transparent text-sm focus:outline-none focus:border-purple-500" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {DIFFICULTIES.map((d) => (
            <button key={d} onClick={() => setDifficulty(d)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${difficulty === d ? "border-purple-500 bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300" : "border-gray-200 hover:border-purple-300"}`}>
              {d}
            </button>
          ))}
        </div>
        {isAuth && (
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-purple-600 hover:bg-purple-700 shrink-0"><Plus size={16} /> Add Project</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle className="flex items-center gap-2"><Github size={18} /> Add Open Source Project</DialogTitle></DialogHeader>
              <div className="space-y-3 py-3">
                {[
                  { key: "title", label: "Project Title *", placeholder: "e.g. Awesome React Library" },
                  { key: "github_url", label: "GitHub URL *", placeholder: "https://github.com/user/repo" },
                  { key: "tech_stack", label: "Tech Stack (comma separated)", placeholder: "React, TypeScript, Node.js" },
                ].map(({ key, label, placeholder }) => (
                  <div key={key} className="space-y-1">
                    <label className="text-sm font-medium">{label}</label>
                    <input value={(form as any)[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className="w-full px-3 py-2 border rounded-lg bg-transparent text-sm focus:outline-none focus:border-purple-500" />
                  </div>
                ))}
                <div className="space-y-1">
                  <label className="text-sm font-medium">Description</label>
                  <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Brief description of the project..."
                    className="w-full h-20 px-3 py-2 border rounded-lg bg-transparent text-sm focus:outline-none focus:border-purple-500 resize-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Difficulty</label>
                  <div className="flex gap-2">
                    {["Beginner", "Intermediate", "Advanced"].map((d) => (
                      <button key={d} onClick={() => setForm((f) => ({ ...f, difficulty: d }))}
                        className={`flex-1 py-1.5 rounded-lg border text-sm font-medium transition-all ${form.difficulty === d ? "border-purple-500 bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300" : "border-gray-200"}`}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
                <Button onClick={submit} disabled={submitting} className="w-full gap-2 bg-purple-600 hover:bg-purple-700">
                  {submitting ? <><Loader2 size={16} className="animate-spin" /> Adding...</> : <><Plus size={16} /> Add Project</>}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-40"><Loader2 size={32} className="animate-spin opacity-40" /></div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16 opacity-50">
          <Github size={48} className="mx-auto mb-3" />
          <p>No projects found. Be the first to add one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => (
            <div key={p.project_id} className="p-5 rounded-xl border-2 hover:border-purple-400 transition-all hover:shadow-md">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base truncate">{p.title}</h3>
                  <p className="text-xs opacity-50 mt-0.5">by {p.contributor_name}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full border ml-2 shrink-0 ${diffColor(p.difficulty)}`}>{p.difficulty}</span>
              </div>

              {p.description && <p className="text-sm opacity-70 mb-3 line-clamp-2">{p.description}</p>}

              {p.tech_stack.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {p.tech_stack.slice(0, 4).map((t) => (
                    <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 border border-purple-200">{t}</span>
                  ))}
                  {p.tech_stack.length > 4 && <span className="text-xs opacity-50">+{p.tech_stack.length - 4}</span>}
                </div>
              )}

              <div className="flex items-center gap-4 text-xs opacity-60 mb-4">
                <span className="flex items-center gap-1"><Star size={12} /> {p.stars.toLocaleString()}</span>
                <span className="flex items-center gap-1"><GitFork size={12} /> {p.forks.toLocaleString()}</span>
                <span className="flex items-center gap-1"><GitBranch size={12} /> {p.open_issues} issues</span>
              </div>

              <a href={p.github_url} target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="outline" className="w-full gap-2 hover:border-purple-500">
                  <Github size={14} /> View on GitHub <ExternalLink size={12} />
                </Button>
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OpenSourceHub;
