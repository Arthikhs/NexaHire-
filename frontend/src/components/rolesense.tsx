"use client";
import { utils_service } from "@/context/AppContext";
import axios from "axios";
import {
  ArrowRight, Loader2, X, Sparkles, Target, TrendingUp,
  Building2, CheckCircle2, AlertTriangle, Lightbulb, Star,
} from "lucide-react";
import React, { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import toast from "react-hot-toast";

const experienceLevels = [
  "Fresher (0 years)", "1 year", "2 years", "3 years",
  "4 years", "5 years", "6-8 years", "9-10 years", "10+ years",
];

interface Role {
  title: string;
  matchScore: number;
  whySuited: string;
  salaryRange: string;
  requiredSkills: string[];
  missingSkills: string[];
  topCompanies: string[];
  growthPath: string;
}

interface RolesenseResponse {
  summary: string;
  roles: Role[];
  topSkill: string;
  industryFit: string[];
  quickTip: string;
}

const Rolesense = () => {
  const [open, setOpen] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [currentSkill, setCurrentSkill] = useState("");
  const [experience, setExperience] = useState("");
  const [interests, setInterests] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<RolesenseResponse | null>(null);
  const [activeRole, setActiveRole] = useState(0);

  const addSkill = () => {
    if (currentSkill.trim() && !skills.includes(currentSkill.trim())) {
      setSkills([...skills, currentSkill.trim()]);
      setCurrentSkill("");
    }
  };

  const removeSkill = (s: string) => setSkills(skills.filter((sk) => sk !== s));

  const analyze = async () => {
    if (skills.length === 0) { toast.error("Add at least one skill"); return; }
    setLoading(true);
    try {
      const { data } = await axios.post(`${utils_service}/api/utils/rolesense`, {
        skills: skills.join(", "),
        experience,
        interests,
      });
      setResponse(data);
      setActiveRole(0);
      toast.success("Role analysis complete!");
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Analysis failed");
    } finally { setLoading(false); }
  };

  const reset = () => {
    setResponse(null); setSkills([]); setCurrentSkill("");
    setExperience(""); setInterests(""); setOpen(false);
  };

  const getScoreColor = (score: number) =>
    score >= 80 ? "text-green-600" : score >= 60 ? "text-yellow-600" : "text-red-500";

  const getScoreBg = (score: number) =>
    score >= 80 ? "bg-green-100 dark:bg-green-900/30 border-green-200" :
    score >= 60 ? "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200" :
    "bg-red-100 dark:bg-red-900/30 border-red-200";

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-emerald-50 dark:bg-emerald-950/30 mb-4">
          <Target size={16} className="text-emerald-600" />
          <span className="text-sm font-medium">AI Role Intelligence</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Role<span className="text-emerald-600">Sense</span>
        </h2>
        <p className="text-lg opacity-70 max-w-2xl mx-auto mb-8">
          Discover your best-fit job roles with AI-powered skill matching, salary insights and growth paths.
        </p>

        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2 h-12 px-8 bg-emerald-600 hover:bg-emerald-700">
              <Target size={18} /> Analyze My Role Fit <ArrowRight size={18} />
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {!response ? (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl flex items-center gap-2">
                    <Target className="text-emerald-600" /> RoleSense Analysis
                  </DialogTitle>
                  <DialogDescription>
                    Add your skills and experience to discover your best-fit roles
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 py-4">
                  {/* Skills */}
                  <div className="space-y-2">
                    <Label>Your Skills <span className="text-red-500">*</span></Label>
                    <div className="flex gap-2">
                      <Input placeholder="e.g., React, Python, SQL..."
                        value={currentSkill} onChange={(e) => setCurrentSkill(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && addSkill()} className="h-11" />
                      <Button onClick={addSkill} className="bg-emerald-600 hover:bg-emerald-700">Add</Button>
                    </div>
                    {skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {skills.map((s) => (
                          <div key={s} className="inline-flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200">
                            <span className="text-sm font-medium">{s}</span>
                            <button onClick={() => removeSkill(s)} className="h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center">
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Experience */}
                  <div className="space-y-2">
                    <Label>Years of Experience</Label>
                    <select value={experience} onChange={(e) => setExperience(e.target.value)}
                      className="w-full h-11 px-3 border-2 border-gray-300 rounded-md bg-transparent text-sm">
                      <option value="">Select experience level</option>
                      {experienceLevels.map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>

                  {/* Interests */}
                  <div className="space-y-2">
                    <Label>Interests / Preferred Domain (optional)</Label>
                    <Input placeholder="e.g., Web Development, AI/ML, DevOps, Finance..."
                      value={interests} onChange={(e) => setInterests(e.target.value)} className="h-11" />
                  </div>

                  <Button onClick={analyze} disabled={loading || skills.length === 0} className="w-full h-11 gap-2 bg-emerald-600 hover:bg-emerald-700">
                    {loading ? <><Loader2 size={18} className="animate-spin" /> Analyzing Your Profile...</> : <><Sparkles size={18} /> Find My Best Roles</>}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl flex items-center gap-2">
                    <Target className="text-emerald-600" /> Your Role Matches
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-5 py-4">
                  {/* Summary */}
                  <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200">
                    <div className="flex items-start gap-3">
                      <Lightbulb size={18} className="text-emerald-600 mt-0.5 shrink-0" />
                      <p className="text-sm leading-relaxed">{response.summary}</p>
                    </div>
                  </div>

                  {/* Quick stats */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg border text-center">
                      <Star size={16} className="text-yellow-500 mx-auto mb-1" />
                      <p className="text-xs opacity-60">Top Skill</p>
                      <p className="text-sm font-bold">{response.topSkill}</p>
                    </div>
                    <div className="p-3 rounded-lg border text-center">
                      <Target size={16} className="text-emerald-600 mx-auto mb-1" />
                      <p className="text-xs opacity-60">Role Matches</p>
                      <p className="text-sm font-bold">{response.roles?.length || 0}</p>
                    </div>
                    <div className="p-3 rounded-lg border text-center">
                      <Building2 size={16} className="text-blue-600 mx-auto mb-1" />
                      <p className="text-xs opacity-60">Industry Fit</p>
                      <p className="text-sm font-bold">{response.industryFit?.[0] || "Tech"}</p>
                    </div>
                  </div>

                  {/* Role tabs */}
                  <div className="flex gap-2 flex-wrap">
                    {response.roles?.map((role, i) => (
                      <button key={i} onClick={() => setActiveRole(i)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-all ${activeRole === i ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700" : "border-gray-200 hover:border-emerald-300"}`}>
                        {role.title}
                        <span className={`ml-2 text-xs font-bold ${getScoreColor(role.matchScore)}`}>{role.matchScore}%</span>
                      </button>
                    ))}
                  </div>

                  {/* Active role details */}
                  {response.roles?.[activeRole] && (() => {
                    const role = response.roles[activeRole];
                    return (
                      <div className="space-y-4">
                        {/* Score card */}
                        <div className={`p-5 rounded-lg border-2 ${getScoreBg(role.matchScore)}`}>
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-xl font-bold">{role.title}</h3>
                            <div className={`text-3xl font-bold ${getScoreColor(role.matchScore)}`}>{role.matchScore}%</div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                            <div className="h-3 rounded-full bg-emerald-500 transition-all" style={{ width: `${role.matchScore}%` }} />
                          </div>
                          <p className="text-sm opacity-80">{role.whySuited}</p>
                        </div>

                        {/* Salary & Growth */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-4 rounded-lg border">
                            <p className="text-xs opacity-60 mb-1 flex items-center gap-1"><TrendingUp size={12} /> Salary Range</p>
                            <p className="font-bold text-emerald-600">{role.salaryRange}</p>
                          </div>
                          <div className="p-4 rounded-lg border">
                            <p className="text-xs opacity-60 mb-1">Growth Path</p>
                            <p className="text-sm font-medium">{role.growthPath}</p>
                          </div>
                        </div>

                        {/* Skills match */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200">
                            <h4 className="font-semibold text-sm mb-2 flex items-center gap-1">
                              <CheckCircle2 size={14} className="text-green-600" /> Skills You Have
                            </h4>
                            <div className="flex flex-wrap gap-1">
                              {role.requiredSkills?.map((s, i) => (
                                <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">{s}</span>
                              ))}
                            </div>
                          </div>
                          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200">
                            <h4 className="font-semibold text-sm mb-2 flex items-center gap-1">
                              <AlertTriangle size={14} className="text-red-500" /> Skills to Learn
                            </h4>
                            <div className="flex flex-wrap gap-1">
                              {role.missingSkills?.map((s, i) => (
                                <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">{s}</span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Top Companies */}
                        <div className="p-4 rounded-lg border">
                          <h4 className="font-semibold text-sm mb-2 flex items-center gap-1">
                            <Building2 size={14} className="text-blue-600" /> Top Companies Hiring
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {role.topCompanies?.map((c, i) => (
                              <span key={i} className="text-xs px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/30 border border-blue-200 text-blue-700">{c}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Quick Tip */}
                  <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200">
                    <h4 className="font-semibold text-sm mb-1 flex items-center gap-2">
                      <Lightbulb size={15} className="text-yellow-600" /> Quick Tip
                    </h4>
                    <p className="text-sm opacity-80">{response.quickTip}</p>
                  </div>

                  <Button onClick={reset} variant="outline" className="w-full">Analyze Again</Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Rolesense;
