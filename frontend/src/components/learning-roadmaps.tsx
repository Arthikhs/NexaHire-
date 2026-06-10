"use client";
import { utils_service } from "@/context/AppContext";
import axios from "axios";
import { BookOpen, ArrowRight, Loader2, CheckCircle2, Code2, Trophy, Sparkles } from "lucide-react";
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import toast from "react-hot-toast";

const LEVELS = ["Beginner", "Intermediate", "Advanced"];
const POPULAR = ["React", "Node.js", "Python", "Machine Learning", "System Design", "Docker", "AWS", "TypeScript", "DSA", "SQL"];

const LearningRoadmaps = () => {
  const [open, setOpen] = useState(false);
  const [skill, setSkill] = useState("");
  const [level, setLevel] = useState("Beginner");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);

  const generate = async () => {
    if (!skill) { toast.error("Enter a skill"); return; }
    setLoading(true);
    try {
      const { data } = await axios.post(`${utils_service}/api/utils/learning-roadmap`, { skill, level });
      setResponse(data); toast.success("Roadmap generated!");
    } catch (e: any) { toast.error("Failed to generate roadmap"); }
    finally { setLoading(false); }
  };

  const phaseColors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500"];

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-cyan-50 dark:bg-cyan-950/30 mb-4">
          <BookOpen size={16} className="text-cyan-600" />
          <span className="text-sm font-medium">AI Learning Path</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Learning Roadmaps</h2>
        <p className="text-lg opacity-70 max-w-2xl mx-auto mb-8">Get a personalized step-by-step learning plan for any skill.</p>

        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setResponse(null); setSkill(""); } }}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2 h-12 px-8 bg-cyan-600 hover:bg-cyan-700">
              <BookOpen size={18} /> Generate Roadmap <ArrowRight size={18} />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {!response ? (
              <>
                <DialogHeader><DialogTitle className="flex items-center gap-2"><BookOpen className="text-cyan-600" /> Learning Roadmap Generator</DialogTitle></DialogHeader>
                <div className="space-y-5 py-4">
                  <div className="space-y-2">
                    <Label>Skill to Learn <span className="text-red-500">*</span></Label>
                    <Input placeholder="e.g., React, Machine Learning, Docker..." value={skill} onChange={(e) => setSkill(e.target.value)} className="h-11" />
                    <div className="flex flex-wrap gap-2 pt-1">
                      {POPULAR.map((s) => (
                        <button key={s} onClick={() => setSkill(s)} className="text-xs px-3 py-1 rounded-full border hover:border-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-950/30 transition-all">{s}</button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Current Level</Label>
                    <div className="flex gap-3">
                      {LEVELS.map((l) => (
                        <button key={l} onClick={() => setLevel(l)}
                          className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-all ${level === l ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-950/30 text-cyan-700" : "border-gray-200 hover:border-cyan-300"}`}>
                          {l === "Beginner" ? "🟢" : l === "Intermediate" ? "🟡" : "🔴"} {l}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button onClick={generate} disabled={loading || !skill} className="w-full h-11 gap-2 bg-cyan-600 hover:bg-cyan-700">
                    {loading ? <><Loader2 size={18} className="animate-spin" /> Generating...</> : <><Sparkles size={18} /> Generate Roadmap</>}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <DialogHeader><DialogTitle className="flex items-center gap-2"><BookOpen className="text-cyan-600" /> {response.skill} Roadmap</DialogTitle></DialogHeader>
                <div className="space-y-5 py-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-lg bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 text-center">
                      <p className="text-xs opacity-60">Total Duration</p>
                      <p className="text-xl font-bold text-cyan-600">{response.totalDuration}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 text-center">
                      <p className="text-xs opacity-60">Career Outcome</p>
                      <p className="text-sm font-bold text-green-600">{response.careerOutcome}</p>
                    </div>
                  </div>

                  {/* Phases */}
                  <div className="space-y-3">
                    {response.phases?.map((phase: any, i: number) => (
                      <div key={i} className="rounded-lg border overflow-hidden">
                        <div className={`px-4 py-3 ${phaseColors[i]} text-white flex items-center justify-between`}>
                          <span className="font-bold">{phase.phase}: {phase.title}</span>
                          <span className="text-sm opacity-80">{phase.duration}</span>
                        </div>
                        <div className="p-4 space-y-3">
                          <div>
                            <p className="text-xs font-semibold opacity-60 mb-2">TOPICS</p>
                            <div className="flex flex-wrap gap-2">
                              {phase.topics?.map((t: string, j: number) => (
                                <span key={j} className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 border">{t}</span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-semibold opacity-60 mb-2">RESOURCES</p>
                            <ul className="space-y-1">
                              {phase.resources?.map((r: string, j: number) => (
                                <li key={j} className="text-xs flex items-center gap-2"><CheckCircle2 size={12} className="text-green-500 shrink-0" />{r}</li>
                              ))}
                            </ul>
                          </div>
                          {phase.project && (
                            <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200">
                              <p className="text-xs font-semibold text-yellow-700">🔨 Project: {phase.project}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Final Project */}
                  <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200">
                    <h3 className="font-semibold mb-1 flex items-center gap-2"><Trophy size={15} className="text-purple-600" /> Capstone Project</h3>
                    <p className="text-sm opacity-80">{response.finalProject}</p>
                  </div>

                  <Button onClick={() => setResponse(null)} variant="outline" className="w-full">Generate Another Roadmap</Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default LearningRoadmaps;
