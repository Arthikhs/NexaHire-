"use client";
import { utils_service } from "@/context/AppContext";
import axios from "axios";
import { Target, X, Loader2, ArrowRight, CheckCircle2, AlertTriangle, Clock, Sparkles, TrendingUp } from "lucide-react";
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import toast from "react-hot-toast";

const SkillGapAnalyzer = () => {
  const [open, setOpen] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [currentSkill, setCurrentSkill] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);

  const addSkill = () => {
    if (currentSkill.trim() && !skills.includes(currentSkill.trim())) { setSkills([...skills, currentSkill.trim()]); setCurrentSkill(""); }
  };

  const analyze = async () => {
    if (!targetRole || skills.length === 0) { toast.error("Add skills and target role"); return; }
    setLoading(true);
    try {
      const { data } = await axios.post(`${utils_service}/api/utils/skill-gap`, { userSkills: skills, targetRole });
      setResponse(data);
      toast.success("Skill gap analyzed!");
    } catch (e: any) { toast.error(e.response?.data?.message || "Failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 bg-secondary/30">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-orange-50 dark:bg-orange-950/30 mb-4">
          <Target size={16} className="text-orange-600" />
          <span className="text-sm font-medium">AI Skill Analysis</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Skill Gap Analyzer</h2>
        <p className="text-lg opacity-70 max-w-2xl mx-auto mb-8">Find exactly what skills you need to land your dream role.</p>

        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setResponse(null); setSkills([]); setTargetRole(""); } }}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2 h-12 px-8 bg-orange-600 hover:bg-orange-700">
              <Target size={18} /> Analyze Skill Gap <ArrowRight size={18} />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {!response ? (
              <>
                <DialogHeader><DialogTitle className="flex items-center gap-2"><Target className="text-orange-600" /> Skill Gap Analysis</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Target Job Role <span className="text-red-500">*</span></Label>
                    <Input placeholder="e.g., Full Stack Developer, Data Scientist..." value={targetRole} onChange={(e) => setTargetRole(e.target.value)} className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label>Your Current Skills <span className="text-red-500">*</span></Label>
                    <div className="flex gap-2">
                      <Input placeholder="e.g., React, Python..." value={currentSkill} onChange={(e) => setCurrentSkill(e.target.value)} onKeyPress={(e) => e.key === "Enter" && addSkill()} className="h-11" />
                      <Button onClick={addSkill} className="bg-orange-600 hover:bg-orange-700">Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((s) => (
                        <div key={s} className="inline-flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full bg-orange-100 dark:bg-orange-900/30 border border-orange-200">
                          <span className="text-sm">{s}</span>
                          <button onClick={() => setSkills(skills.filter((sk) => sk !== s))} className="h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center"><X size={12} /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button onClick={analyze} disabled={loading || !targetRole || skills.length === 0} className="w-full h-11 gap-2 bg-orange-600 hover:bg-orange-700">
                    {loading ? <><Loader2 size={18} className="animate-spin" /> Analyzing...</> : <><Sparkles size={18} /> Analyze Gap</>}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <DialogHeader><DialogTitle className="flex items-center gap-2"><Target className="text-orange-600" /> Gap Analysis for {targetRole}</DialogTitle></DialogHeader>
                <div className="space-y-5 py-4">
                  {/* Overall match */}
                  <div className={`p-5 rounded-lg border-2 text-center ${response.overallMatch >= 70 ? "bg-green-50 border-green-200" : response.overallMatch >= 50 ? "bg-yellow-50 border-yellow-200" : "bg-red-50 border-red-200"}`}>
                    <p className="text-sm opacity-70 mb-1">Overall Match</p>
                    <div className={`text-5xl font-bold ${response.overallMatch >= 70 ? "text-green-600" : response.overallMatch >= 50 ? "text-yellow-600" : "text-red-500"}`}>{response.overallMatch}%</div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
                      <div className="h-3 rounded-full bg-orange-500" style={{ width: `${response.overallMatch}%` }} />
                    </div>
                    <p className="text-sm opacity-70 mt-2">{response.summary}</p>
                  </div>

                  {/* Matched & Missing */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200">
                      <h3 className="font-semibold text-sm mb-2 flex items-center gap-1"><CheckCircle2 size={14} className="text-green-600" /> Matched Skills</h3>
                      <div className="space-y-1">
                        {response.matchedSkills?.map((s: any, i: number) => (
                          <div key={i} className="text-xs flex justify-between"><span>{s.skill}</span><span className={`font-medium ${s.gap === "low" ? "text-green-600" : "text-yellow-600"}`}>{s.userLevel}</span></div>
                        ))}
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200">
                      <h3 className="font-semibold text-sm mb-2 flex items-center gap-1"><AlertTriangle size={14} className="text-red-500" /> Missing Skills</h3>
                      <div className="space-y-1">
                        {response.missingSkills?.map((s: any, i: number) => (
                          <div key={i} className="text-xs flex justify-between"><span>{s.skill}</span><span className="flex items-center gap-1 text-orange-600"><Clock size={10} />{s.timeToLearn}</span></div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Roadmap */}
                  <div className="space-y-2">
                    <h3 className="font-semibold flex items-center gap-2"><TrendingUp size={16} className="text-orange-600" /> Learning Roadmap</h3>
                    {response.roadmap?.map((r: any, i: number) => (
                      <div key={i} className="p-3 rounded-lg border flex items-start gap-3">
                        <span className="h-6 w-6 rounded-full bg-orange-100 text-orange-600 text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                        <div><p className="text-xs font-bold text-orange-600">{r.week}</p><p className="text-sm font-medium">{r.focus}</p><p className="text-xs opacity-60">{r.action}</p></div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200">
                    <p className="text-sm font-semibold">🎯 Top Priority: <span className="text-blue-600">{response.topPriority}</span></p>
                    <p className="text-xs opacity-70 mt-1">Ready in: <span className="font-bold">{response.estimatedReadyIn}</span></p>
                  </div>

                  <Button onClick={() => setResponse(null)} variant="outline" className="w-full">Analyze Another Role</Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default SkillGapAnalyzer;
