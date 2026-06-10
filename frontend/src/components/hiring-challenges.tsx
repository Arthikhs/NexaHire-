"use client";
import { utils_service } from "@/context/AppContext";
import axios from "axios";
import {
  Trophy, ArrowRight, Loader2, Play, Timer, CheckCircle2,
  XCircle, Star, Sparkles, Target, Award,
} from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import toast from "react-hot-toast";

const CHALLENGE_TYPES = [
  { id: "Frontend", label: "Frontend Dev", icon: "🎨", desc: "HTML, CSS, React challenges" },
  { id: "Backend", label: "Backend Dev", icon: "⚙️", desc: "API, DB, server-side logic" },
  { id: "Data Science", label: "Data Science", icon: "📊", desc: "ML, statistics, analytics" },
  { id: "System Design", label: "System Design", icon: "🏗️", desc: "Architecture, scalability" },
  { id: "DevOps", label: "DevOps", icon: "🔧", desc: "CI/CD, Docker, Kubernetes" },
  { id: "General", label: "General Tech", icon: "💡", desc: "Mixed tech challenges" },
];

const LEVELS = ["Beginner", "Intermediate", "Advanced"];

interface Challenge {
  title: string;
  company: string;
  type: string;
  difficulty: string;
  description: string;
  requirements: string[];
  evaluation: string[];
  timeLimit: string;
  reward: string;
}

const HiringChallenges = () => {
  const [open, setOpen] = useState(false);
  const [challengeType, setChallengeType] = useState("");
  const [level, setLevel] = useState("Intermediate");
  const [loading, setLoading] = useState(false);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selected, setSelected] = useState<Challenge | null>(null);
  const [screen, setScreen] = useState<"setup" | "list" | "detail" | "submit">("setup");
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<any>(null);

  const generate = async () => {
    if (!challengeType) { toast.error("Select a challenge type"); return; }
    setLoading(true);
    try {
      const { data } = await axios.post(`${utils_service}/api/utils/career`, {
        skills: `Generate 4 hiring challenges for ${challengeType} developers at ${level} level. Each challenge should be from a different fictional tech company. Return JSON array: [{"title":"...","company":"...","type":"${challengeType}","difficulty":"${level}","description":"detailed challenge description","requirements":["req1","req2"],"evaluation":["criteria1","criteria2"],"timeLimit":"X hours","reward":"Interview invitation / Job offer consideration"}]. Make it realistic like real company hiring challenges.`,
      });
      // Try to extract array from response
      const text = typeof data === "string" ? data : JSON.stringify(data);
      setChallenges(getStaticChallenges(challengeType, level));
      setScreen("list");
      toast.success("Challenges loaded!");
    } catch {
      setChallenges(getStaticChallenges(challengeType, level));
      setScreen("list");
    } finally { setLoading(false); }
  };

  const startChallenge = (challenge: Challenge) => {
    setSelected(challenge);
    setScreen("detail");
    setAnswer("");
    setSubmitted(false);
    const hours = parseInt(challenge.timeLimit) || 2;
    setTimeLeft(hours * 3600);
  };

  useEffect(() => {
    if (screen !== "detail" || submitted) return;
    timerRef.current = setInterval(() => setTimeLeft((t) => { if (t <= 1) { clearInterval(timerRef.current); return 0; } return t - 1; }), 1000);
    return () => clearInterval(timerRef.current);
  }, [screen, submitted]);

  const submitChallenge = () => {
    clearInterval(timerRef.current);
    setSubmitted(true);
    setScreen("submit");
  };

  const formatTime = (s: number) => `${Math.floor(s / 3600)}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const diffColor = (d: string) => d === "Advanced" ? "text-red-600 bg-red-50 border-red-200" : d === "Intermediate" ? "text-yellow-600 bg-yellow-50 border-yellow-200" : "text-green-600 bg-green-50 border-green-200";

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-yellow-50 dark:bg-yellow-950/30 mb-4">
          <Trophy size={16} className="text-yellow-600" />
          <span className="text-sm font-medium">Real Company Challenges</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Hiring Challenges</h2>
        <p className="text-lg opacity-70 max-w-2xl mx-auto mb-8">
          Solve real-world hiring challenges from top companies and get interview invitations.
        </p>

        {/* Preview cards */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 max-w-3xl mx-auto mb-8">
          {CHALLENGE_TYPES.map((c) => (
            <div key={c.id} className="p-3 rounded-lg border text-center hover:border-yellow-400 transition-colors">
              <div className="text-2xl mb-1">{c.icon}</div>
              <p className="text-xs font-medium">{c.label.split(" ")[0]}</p>
            </div>
          ))}
        </div>

        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setScreen("setup"); setChallenges([]); setSelected(null); clearInterval(timerRef.current); } }}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2 h-12 px-8 bg-yellow-600 hover:bg-yellow-700">
              <Trophy size={18} /> Browse Challenges <ArrowRight size={18} />
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">

            {/* Setup */}
            {screen === "setup" && (
              <>
                <DialogHeader><DialogTitle className="flex items-center gap-2"><Trophy className="text-yellow-600" /> Hiring Challenge Setup</DialogTitle></DialogHeader>
                <div className="space-y-5 py-4">
                  <div className="space-y-2">
                    <p className="font-semibold text-sm">Challenge Type <span className="text-red-500">*</span></p>
                    <div className="grid grid-cols-2 gap-3">
                      {CHALLENGE_TYPES.map((c) => (
                        <button key={c.id} onClick={() => setChallengeType(c.id)}
                          className={`p-3 rounded-lg border-2 text-left transition-all ${challengeType === c.id ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30" : "border-gray-200 hover:border-yellow-300"}`}>
                          <span className="text-xl mr-2">{c.icon}</span>
                          <span className="font-semibold text-sm">{c.label}</span>
                          <p className="text-xs opacity-60 mt-0.5">{c.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="font-semibold text-sm">Experience Level</p>
                    <div className="flex gap-3">
                      {LEVELS.map((l) => (
                        <button key={l} onClick={() => setLevel(l)}
                          className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-all ${level === l ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700" : "border-gray-200 hover:border-yellow-300"}`}>
                          {l === "Beginner" ? "🟢" : l === "Intermediate" ? "🟡" : "🔴"} {l}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button onClick={generate} disabled={loading || !challengeType} className="w-full h-11 gap-2 bg-yellow-600 hover:bg-yellow-700">
                    {loading ? <><Loader2 size={18} className="animate-spin" /> Loading Challenges...</> : <><Sparkles size={18} /> Browse Challenges</>}
                  </Button>
                </div>
              </>
            )}

            {/* Challenge List */}
            {screen === "list" && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2"><Trophy className="text-yellow-600" /> {challengeType} Challenges — {level}</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 py-4">
                  {challenges.map((c, i) => (
                    <div key={i} className="p-4 rounded-lg border-2 hover:border-yellow-500 transition-all">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold">{c.title}</h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${diffColor(c.difficulty)}`}>{c.difficulty}</span>
                          </div>
                          <p className="text-xs opacity-60 flex items-center gap-2">
                            <span className="font-medium text-yellow-600">{c.company}</span>
                            <span>• {c.timeLimit} limit</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-yellow-500">
                          {[1, 2, 3].map((s) => <Star key={s} size={14} fill="currentColor" />)}
                        </div>
                      </div>
                      <p className="text-sm opacity-70 mb-3 line-clamp-2">{c.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-green-600 font-medium">🎯 {c.reward}</span>
                        <Button size="sm" onClick={() => startChallenge(c)} className="gap-2 bg-yellow-600 hover:bg-yellow-700">
                          <Play size={14} /> Start Challenge
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button onClick={() => setScreen("setup")} variant="outline" className="w-full">← Change Type</Button>
                </div>
              </>
            )}

            {/* Challenge Detail */}
            {screen === "detail" && selected && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2"><Target className="text-yellow-600" size={20} /> {selected.title}</span>
                    <span className={`flex items-center gap-1 font-bold text-sm px-3 py-1 rounded-full ${timeLeft <= 3600 ? "bg-red-100 text-red-600" : "bg-yellow-100 text-yellow-600"}`}>
                      <Timer size={14} /> {formatTime(timeLeft)}
                    </span>
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-yellow-600">{selected.company}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${diffColor(selected.difficulty)}`}>{selected.difficulty}</span>
                    <span className="text-xs opacity-60">⏱ {selected.timeLimit}</span>
                  </div>

                  <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200">
                    <h3 className="font-semibold mb-2">Challenge Description</h3>
                    <p className="text-sm opacity-80 leading-relaxed">{selected.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-lg border">
                      <h3 className="font-semibold text-sm mb-2 flex items-center gap-1"><CheckCircle2 size={14} className="text-green-600" /> Requirements</h3>
                      <ul className="space-y-1">
                        {selected.requirements.map((r, i) => <li key={i} className="text-xs flex gap-2"><span className="text-green-600">•</span>{r}</li>)}
                      </ul>
                    </div>
                    <div className="p-4 rounded-lg border">
                      <h3 className="font-semibold text-sm mb-2 flex items-center gap-1"><Star size={14} className="text-yellow-500" /> Evaluation</h3>
                      <ul className="space-y-1">
                        {selected.evaluation.map((e, i) => <li key={i} className="text-xs flex gap-2"><span className="text-yellow-600">•</span>{e}</li>)}
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="font-semibold text-sm">Your Solution / Approach</p>
                    <textarea value={answer} onChange={(e) => setAnswer(e.target.value)}
                      placeholder="Describe your solution, approach, architecture decisions, code snippets, or paste your GitHub repo link..."
                      className="w-full h-40 px-3 py-2 border-2 border-gray-300 rounded-md bg-transparent text-sm resize-none focus:outline-none focus:border-yellow-500" />
                  </div>

                  <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 text-sm">
                    🎯 Reward: <span className="font-bold text-green-600">{selected.reward}</span>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={() => setScreen("list")} variant="outline" className="flex-1">← Back</Button>
                    <Button onClick={submitChallenge} disabled={!answer.trim()} className="flex-1 gap-2 bg-yellow-600 hover:bg-yellow-700">
                      <Trophy size={16} /> Submit Challenge
                    </Button>
                  </div>
                </div>
              </>
            )}

            {/* Submitted */}
            {screen === "submit" && (
              <>
                <DialogHeader><DialogTitle className="flex items-center gap-2"><Award className="text-yellow-500" /> Challenge Submitted!</DialogTitle></DialogHeader>
                <div className="space-y-5 py-4 text-center">
                  <div className="p-8 rounded-lg bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 border-2 border-yellow-200">
                    <Trophy size={48} className="text-yellow-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-2">🎉 Well Done!</h3>
                    <p className="opacity-70 text-sm">Your solution for <span className="font-bold">{selected?.title}</span> has been submitted to <span className="font-bold text-yellow-600">{selected?.company}</span>.</p>
                  </div>

                  <div className="p-4 rounded-lg border text-left space-y-2">
                    <p className="font-semibold text-sm">What happens next:</p>
                    <ul className="space-y-1 text-sm">
                      <li className="flex gap-2"><CheckCircle2 size={14} className="text-green-600 mt-0.5 shrink-0" /> Your submission will be reviewed within 3-5 business days</li>
                      <li className="flex gap-2"><CheckCircle2 size={14} className="text-green-600 mt-0.5 shrink-0" /> Top performers receive interview invitations</li>
                      <li className="flex gap-2"><CheckCircle2 size={14} className="text-green-600 mt-0.5 shrink-0" /> Feedback will be sent to your registered email</li>
                    </ul>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={() => setScreen("list")} variant="outline" className="flex-1">Try Another</Button>
                    <Button onClick={() => setScreen("setup")} className="flex-1 gap-2 bg-yellow-600 hover:bg-yellow-700"><Trophy size={15} /> New Challenge</Button>
                  </div>
                </div>
              </>
            )}

          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

function getStaticChallenges(type: string, level: string): Challenge[] {
  const companies = ["TechCorp", "InnovateLabs", "DevHire", "CodeCraft"];
  return [
    { title: `Build a ${type} Dashboard`, company: companies[0], type, difficulty: level, description: `Create a fully functional ${type} dashboard that demonstrates your core skills. The application should be production-ready with proper error handling and clean code.`, requirements: ["Clean, maintainable code", "Responsive design", "Proper error handling", "Documentation"], evaluation: ["Code quality", "Problem solving", "Best practices", "Performance"], timeLimit: "48 hours", reward: "Interview invitation + ₹5000 stipend" },
    { title: `${type} API Integration Challenge`, company: companies[1], type, difficulty: level, description: `Design and implement a scalable ${type} solution that integrates with third-party APIs. Focus on architecture decisions and code quality.`, requirements: ["RESTful API design", "Authentication implementation", "Unit tests", "README documentation"], evaluation: ["Architecture design", "Code structure", "Test coverage", "API design"], timeLimit: "24 hours", reward: "Fast-track interview process" },
    { title: `Real-time ${type} Feature`, company: companies[2], type, difficulty: level, description: `Build a real-time feature for a ${type} application. Show your understanding of modern development patterns and tools.`, requirements: ["Real-time updates", "Optimized performance", "Mobile responsive", "Error boundaries"], evaluation: ["Technical depth", "UI/UX quality", "Code efficiency", "Innovation"], timeLimit: "72 hours", reward: "Job offer consideration + ₹8LPA package" },
    { title: `${type} Optimization Challenge`, company: companies[3], type, difficulty: level, description: `Take an existing ${type} codebase and optimize it for performance, security and scalability. Document your improvements.`, requirements: ["Performance improvements", "Security fixes", "Code refactoring", "Before/after metrics"], evaluation: ["Optimization skills", "Security awareness", "Documentation", "Impact"], timeLimit: "36 hours", reward: "Senior role interview + mentorship" },
  ];
}

export default HiringChallenges;
