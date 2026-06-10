"use client";
import React, { useState } from "react";
import axios from "axios";
import { utils_service, useAppData } from "@/context/AppContext";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Target, Zap, CheckCircle2, XCircle, Clock,
  TrendingUp, BookOpen, AlertTriangle, Plus, X,
} from "lucide-react";
import toast from "react-hot-toast";

interface MatchedSkill {
  skill: string;
  proficiencyNeeded: string;
  userLevel: string;
  gap: "low" | "medium" | "high" | "none";
}

interface MissingSkill {
  skill: string;
  importance: "high" | "medium" | "low";
  timeToLearn: string;
  resources: string[];
}

interface RoadmapStep {
  week: string;
  focus: string;
  action: string;
}

interface SkillGapResult {
  overallMatch: number;
  summary: string;
  matchedSkills: MatchedSkill[];
  missingSkills: MissingSkill[];
  roadmap: RoadmapStep[];
  estimatedReadyIn: string;
  topPriority: string;
}

const gapColor: Record<string, string> = {
  none: "text-green-600",
  low: "text-blue-600",
  medium: "text-yellow-600",
  high: "text-red-600",
};

const importanceColor: Record<string, string> = {
  high: "bg-red-100 dark:bg-red-900/30 text-red-600",
  medium: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600",
  low: "bg-green-100 dark:bg-green-900/30 text-green-600",
};

const SkillGapPage = () => {
  const { user } = useAppData();

  const [skills, setSkills] = useState<string[]>(user?.skills || []);
  const [skillInput, setSkillInput] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [result, setResult] = useState<SkillGapResult | null>(null);
  const [loading, setLoading] = useState(false);

  function addSkill() {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) setSkills([...skills, s]);
    setSkillInput("");
  }

  function removeSkill(s: string) {
    setSkills(skills.filter((x) => x !== s));
  }

  async function analyze() {
    if (skills.length === 0) { toast.error("Add at least one skill"); return; }
    if (!targetRole.trim()) { toast.error("Enter a target role"); return; }
    setLoading(true);
    setResult(null);
    try {
      const { data } = await axios.post(`${utils_service}/api/utils/skill-gap`, {
        userSkills: skills,
        targetRole: targetRole.trim(),
      });
      setResult(data);
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Analysis failed");
    } finally {
      setLoading(false);
    }
  }

  const matchColor =
    !result ? "" :
    result.overallMatch >= 75 ? "text-green-600" :
    result.overallMatch >= 50 ? "text-yellow-600" : "text-red-600";

  return (
    <div className="min-h-screen bg-secondary/30">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">
            Skill Gap <span className="text-blue-600">Analyzer</span>
          </h1>
          <p className="text-sm opacity-60">Discover what skills you need for your dream role</p>
        </div>

        {/* Input Card */}
        <Card className="border-2 p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold mb-2 block">Target Job Role *</label>
              <Input
                placeholder="e.g. Full Stack Developer, Data Scientist, DevOps Engineer"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && analyze()}
                className="max-w-md"
              />
            </div>

            <div>
              <label className="text-sm font-semibold mb-2 block">Your Current Skills *</label>
              <div className="flex gap-2 mb-3">
                <Input
                  placeholder="Add a skill (e.g. React, Python)"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addSkill()}
                  className="max-w-xs"
                />
                <Button variant="outline" onClick={addSkill} className="gap-1">
                  <Plus size={14} /> Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map((s) => (
                  <span key={s} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full text-sm font-medium">
                    {s}
                    <button onClick={() => removeSkill(s)} className="hover:opacity-70">
                      <X size={12} />
                    </button>
                  </span>
                ))}
                {skills.length === 0 && (
                  <p className="text-xs opacity-40">No skills added yet</p>
                )}
              </div>
            </div>

            <Button onClick={analyze} disabled={loading} className="gap-2 h-11 px-6">
              {loading ? (
                <><span className="animate-spin">⚙️</span> Analyzing...</>
              ) : (
                <><Target size={16} /> Analyze Skill Gap</>
              )}
            </Button>
          </div>
        </Card>

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Score + Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-2 p-6 text-center">
                <p className="text-xs opacity-60 mb-2 font-medium">Overall Match</p>
                <p className={`text-5xl font-bold ${matchColor}`}>{result.overallMatch}%</p>
                <div className="w-full bg-secondary rounded-full h-2 mt-3">
                  <div
                    className={`h-2 rounded-full transition-all duration-700 ${
                      result.overallMatch >= 75 ? "bg-green-500" :
                      result.overallMatch >= 50 ? "bg-yellow-500" : "bg-red-500"
                    }`}
                    style={{ width: `${result.overallMatch}%` }}
                  />
                </div>
              </Card>
              <Card className="border-2 p-6 text-center">
                <Clock size={20} className="mx-auto mb-2 text-blue-600" />
                <p className="text-xs opacity-60 mb-1 font-medium">Ready In</p>
                <p className="text-xl font-bold">{result.estimatedReadyIn}</p>
              </Card>
              <Card className="border-2 p-6 text-center">
                <Zap size={20} className="mx-auto mb-2 text-yellow-500" />
                <p className="text-xs opacity-60 mb-1 font-medium">Top Priority</p>
                <p className="text-sm font-bold">{result.topPriority}</p>
              </Card>
            </div>

            <Card className="border-2 p-5">
              <p className="text-sm leading-relaxed opacity-80">{result.summary}</p>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Matched Skills */}
              <Card className="border-2 overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-green-700 p-4">
                  <h2 className="text-white font-semibold flex items-center gap-2">
                    <CheckCircle2 size={16} /> Matched Skills ({result.matchedSkills.length})
                  </h2>
                </div>
                <div className="divide-y">
                  {result.matchedSkills.map((s) => (
                    <div key={s.skill} className="p-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium">{s.skill}</p>
                        <p className="text-xs opacity-50">You: {s.userLevel} · Needed: {s.proficiencyNeeded}</p>
                      </div>
                      <span className={`text-xs font-semibold capitalize ${gapColor[s.gap] || gapColor.medium}`}>
                        {s.gap === "none" ? "✓ Perfect" : `Gap: ${s.gap}`}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Missing Skills */}
              <Card className="border-2 overflow-hidden">
                <div className="bg-gradient-to-r from-red-600 to-red-700 p-4">
                  <h2 className="text-white font-semibold flex items-center gap-2">
                    <XCircle size={16} /> Missing Skills ({result.missingSkills.length})
                  </h2>
                </div>
                <div className="divide-y">
                  {result.missingSkills.map((s) => (
                    <div key={s.skill} className="p-4">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-sm font-medium">{s.skill}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${importanceColor[s.importance]}`}>
                          {s.importance}
                        </span>
                      </div>
                      <p className="text-xs opacity-50 mb-2">⏱ {s.timeToLearn}</p>
                      {s.resources.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {s.resources.map((r) => (
                            <span key={r} className="text-xs bg-secondary px-2 py-0.5 rounded-full opacity-70">{r}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Roadmap */}
            {result.roadmap.length > 0 && (
              <Card className="border-2 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-5">
                  <h2 className="text-white font-semibold flex items-center gap-2">
                    <TrendingUp size={16} /> Learning Roadmap
                  </h2>
                </div>
                <div className="p-5">
                  <div className="space-y-4">
                    {result.roadmap.map((step, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 text-xs font-bold flex items-center justify-center shrink-0">
                            {i + 1}
                          </div>
                          {i < result.roadmap.length - 1 && (
                            <div className="w-0.5 h-full bg-blue-100 dark:bg-blue-900/30 mt-1" />
                          )}
                        </div>
                        <div className="pb-4 flex-1">
                          <p className="text-xs font-semibold text-blue-600 mb-0.5">{step.week}</p>
                          <p className="text-sm font-medium">{step.focus}</p>
                          <p className="text-xs opacity-60 mt-0.5">{step.action}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillGapPage;
