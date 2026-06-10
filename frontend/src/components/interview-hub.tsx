"use client";
import { utils_service } from "@/context/AppContext";
import axios from "axios";
import React, { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import {
  Brain, Mic, MicOff, Camera, CameraOff, Code2, Users,
  ArrowRight, Loader2, CheckCircle2, Play, SkipForward,
  Trophy, AlertTriangle, Sparkles, Timer, X,
} from "lucide-react";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

type MockRound = "menu" | "aptitude" | "coding" | "face" | "hr" | "results";
interface MCQ { question: string; options: string[]; correct: number; }
interface CodingQ { title: string; description: string; examples: string; starterCode: string; testCases: { input: string; expected: string }[]; }
interface FaceQ { question: string; idealPoints: string[]; }
interface HRQ { question: string; idealPoints: string[]; }
interface RoundResult { round: string; score: number; total: number; feedback: string; }

const experienceLevels = ["Fresher (0 years)", "1 year", "2 years", "3 years", "4 years", "5 years", "6-8 years", "9-10 years", "10+ years"];

const ROUNDS = [
  { id: "aptitude", label: "Aptitude", icon: Brain, color: "bg-blue-500", desc: "10 MCQ — logical & verbal reasoning" },
  { id: "coding", label: "Coding", icon: Code2, color: "bg-green-500", desc: "3 problems with live code execution" },
  { id: "face", label: "Face to Face", icon: Camera, color: "bg-purple-500", desc: "5 technical questions with camera & voice" },
  { id: "hr", label: "HR Round", icon: Users, color: "bg-orange-500", desc: "5 HR questions — voice or text answer" },
];

// ─── Main ─────────────────────────────────────────────────────────────────────
const InterviewHub = () => {
  const [open, setOpen] = useState(false);
  const [mockRound, setMockRound] = useState<MockRound>("menu");
  const [mockResults, setMockResults] = useState<RoundResult[]>([]);
  const [mockRole, setMockRole] = useState("");
  const [experience, setExperience] = useState("");
  const [currentCompany, setCurrentCompany] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [currentSkill, setCurrentSkill] = useState("");

  const resetAll = () => {
    setMockRound("menu"); setMockResults([]); setMockRole("");
    setExperience(""); setCurrentCompany(""); setSkills([]); setCurrentSkill("");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-indigo-50 dark:bg-indigo-950/30 mb-4">
          <Brain size={16} className="text-indigo-600" />
          <span className="text-sm font-medium">AI Mock Interview</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Ace Your Next Interview</h2>
        <p className="text-lg opacity-70 max-w-2xl mx-auto mb-8">
          Full 4-round mock interview — Aptitude, Coding, Face to Face & HR with AI evaluation and final report.
        </p>

        <Button size="lg" className="gap-2 h-12 px-8 mb-8" onClick={() => setOpen(true)}>
          <Play size={18} /> Start Mock Interview <ArrowRight size={18} />
        </Button>

        <div className="flex flex-wrap justify-center gap-3">
          {ROUNDS.map((r) => (
            <div key={r.id} className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm">
              <div className={`h-2 w-2 rounded-full ${r.color}`} />
              {r.label}
            </div>
          ))}
        </div>

        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetAll(); }}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {mockRound === "menu" && (
              <MockMenu
                mockRole={mockRole} setMockRole={setMockRole}
                experience={experience} setExperience={setExperience}
                currentCompany={currentCompany} setCurrentCompany={setCurrentCompany}
                skills={skills} setSkills={setSkills}
                currentSkill={currentSkill} setCurrentSkill={setCurrentSkill}
                setMockRound={setMockRound}
              />
            )}
            {mockRound === "aptitude" && <AptitudeRound jobRole={mockRole} onComplete={(r) => { setMockResults((p) => [...p, r]); setMockRound("coding"); }} />}
            {mockRound === "coding" && <CodingRound jobRole={mockRole} onComplete={(r) => { setMockResults((p) => [...p, r]); setMockRound("face"); }} />}
            {mockRound === "face" && <FaceRound jobRole={mockRole} onComplete={(r) => { setMockResults((p) => [...p, r]); setMockRound("hr"); }} />}
            {mockRound === "hr" && <HRRound jobRole={mockRole} onComplete={(r) => { setMockResults((p) => [...p, r]); setMockRound("results"); }} />}
            {mockRound === "results" && (
              <ResultsScreen results={mockResults} jobRole={mockRole} experience={experience}
                onReset={() => { setMockRound("menu"); setMockResults([]); }} />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

// ─── Mock Menu (Setup) ────────────────────────────────────────────────────────
const MockMenu = ({ mockRole, setMockRole, experience, setExperience, currentCompany, setCurrentCompany, skills, setSkills, currentSkill, setCurrentSkill, setMockRound }: any) => {
  const addSkill = () => {
    if (currentSkill.trim() && !skills.includes(currentSkill.trim())) {
      setSkills([...skills, currentSkill.trim()]); setCurrentSkill("");
    }
  };
  const removeSkill = (s: string) => setSkills(skills.filter((sk: string) => sk !== s));

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-2xl flex items-center gap-2">
          <Brain className="text-indigo-600" /> Mock Interview Setup
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-5 py-4">
        {/* Job Role */}
        <div className="space-y-2">
          <Label>Target Job Role <span className="text-red-500">*</span></Label>
          <Input placeholder="e.g., Frontend Developer, Data Scientist..." value={mockRole}
            onChange={(e) => setMockRole(e.target.value)} className="h-11" />
        </div>

        {/* Experience & Company */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Years of Experience</Label>
            <select value={experience} onChange={(e) => setExperience(e.target.value)}
              className="w-full h-11 px-3 border-2 border-gray-300 rounded-md bg-transparent text-sm">
              <option value="">Select experience</option>
              {experienceLevels.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Current/Last Company</Label>
            <Input placeholder="e.g., TCS, Google... (optional)" value={currentCompany}
              onChange={(e) => setCurrentCompany(e.target.value)} className="h-11" />
          </div>
        </div>

        {/* Skills */}
        <div className="space-y-2">
          <Label>Your Skills</Label>
          <div className="flex gap-2">
            <Input placeholder="e.g., React, Node.js, Python..." value={currentSkill}
              onChange={(e) => setCurrentSkill(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addSkill()} className="h-11" />
            <Button onClick={addSkill}>Add</Button>
          </div>
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {skills.map((s: string) => (
                <div key={s} className="inline-flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200">
                  <span className="text-sm">{s}</span>
                  <button onClick={() => removeSkill(s)} className="h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center">
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Round preview */}
        <div className="grid grid-cols-2 gap-3">
          {ROUNDS.map((r) => (
            <div key={r.id} className="p-3 rounded-lg border flex items-center gap-3">
              <div className={`h-8 w-8 rounded-lg ${r.color} flex items-center justify-center shrink-0`}>
                <r.icon size={16} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-sm">{r.label}</p>
                <p className="text-xs opacity-60">{r.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <Button onClick={() => { if (!mockRole.trim()) { toast.error("Enter a job role"); return; } setMockRound("aptitude"); }}
          className="w-full h-11 gap-2">
          <Play size={18} /> Start Interview <ArrowRight size={16} />
        </Button>
      </div>
    </>
  );
};

// ─── Aptitude Round ───────────────────────────────────────────────────────────
const AptitudeRound = ({ jobRole, onComplete }: { jobRole: string; onComplete: (r: RoundResult) => void }) => {
  const [questions] = useState<MCQ[]>(getStaticAptitude(jobRole));
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const timerRef = useRef<any>(null);

  const handleNext = (sel: number) => {
    clearInterval(timerRef.current);
    const newAnswers = [...answers, sel];
    setAnswers(newAnswers); setSelected(null);
    if (current + 1 >= questions.length) {
      const correct = newAnswers.filter((a, i) => a === questions[i]?.correct).length;
      onComplete({ round: "Aptitude", score: correct, total: questions.length, feedback: correct >= 7 ? "Excellent aptitude!" : correct >= 5 ? "Good, practice more." : "Need improvement in reasoning." });
    } else { setCurrent((c) => c + 1); }
  };

  useEffect(() => {
    setTimeLeft(30);
    timerRef.current = setInterval(() => setTimeLeft((t) => { if (t <= 1) { handleNext(-1); return 30; } return t - 1; }), 1000);
    return () => clearInterval(timerRef.current);
  }, [current]);

  const q = questions[current];
  return (
    <div className="space-y-4 py-4">
      <DialogHeader><DialogTitle className="flex items-center gap-2"><Brain className="text-blue-600" /> Aptitude — Q{current + 1}/{questions.length}</DialogTitle></DialogHeader>
      <div className="flex items-center justify-between">
        <div className="flex gap-1">{questions.map((_, i) => <div key={i} className={`h-2 w-5 rounded-full ${i < current ? "bg-blue-500" : i === current ? "bg-blue-300" : "bg-gray-200"}`} />)}</div>
        <div className={`flex items-center gap-1 font-bold text-sm ${timeLeft <= 10 ? "text-red-500" : "text-blue-600"}`}><Timer size={14} /> {timeLeft}s</div>
      </div>
      <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200"><p className="font-medium text-sm">{q?.question}</p></div>
      <div className="space-y-2">
        {q?.options.map((opt, i) => (
          <button key={i} onClick={() => setSelected(i)}
            className={`w-full text-left p-3 rounded-lg border-2 transition-all text-sm ${selected === i ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30" : "border-gray-200 hover:border-blue-300"}`}>
            <span className="font-bold mr-2">{["A", "B", "C", "D"][i]}.</span>{opt}
          </button>
        ))}
      </div>
      <Button onClick={() => handleNext(selected ?? -1)} disabled={selected === null} className="w-full gap-2">
        {current + 1 === questions.length ? "Submit" : "Next"} <ArrowRight size={16} />
      </Button>
    </div>
  );
};

// ─── Coding Round ─────────────────────────────────────────────────────────────
const CodingRound = ({ jobRole, onComplete }: { jobRole: string; onComplete: (r: RoundResult) => void }) => {
  const questions = getStaticCoding(jobRole);
  const [current, setCurrent] = useState(0);
  const [code, setCode] = useState(questions[0]?.starterCode || "");
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [scores, setScores] = useState<number[]>([]);

  const runCode = async () => {
    setRunning(true); setOutput("Running...");
    try {
      const res = await fetch("https://ce.judge0.com/submissions?base64_encoded=false&wait=true", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source_code: code, language_id: 63, stdin: questions[current]?.testCases[0]?.input || "" }),
      });
      const data = await res.json();
      setOutput(data.stdout || data.stderr || data.compile_output || "No output");
    } catch { setOutput("Execution failed. Check connection."); }
    finally { setRunning(false); }
  };

  const handleNext = (score: number) => {
    const newScores = [...scores, score];
    setScores(newScores);
    if (current + 1 >= questions.length) {
      const total = newScores.reduce((a, b) => a + b, 0);
      onComplete({ round: "Coding", score: total, total: questions.length * 10, feedback: total >= 20 ? "Strong coding skills!" : total >= 10 ? "Good approach, keep practicing." : "Practice DSA more." });
    } else { setCurrent((c) => c + 1); setCode(questions[current + 1]?.starterCode || ""); setOutput(""); }
  };

  const q = questions[current];
  return (
    <div className="space-y-4 py-4">
      <DialogHeader><DialogTitle className="flex items-center gap-2"><Code2 className="text-green-600" /> Coding — Problem {current + 1}/{questions.length}</DialogTitle></DialogHeader>
      <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200">
        <h3 className="font-bold mb-1 text-sm">{q?.title}</h3>
        <p className="text-sm opacity-80 mb-1">{q?.description}</p>
        <p className="text-xs font-mono opacity-60">{q?.examples}</p>
      </div>
      <div className="border rounded-lg overflow-hidden">
        <MonacoEditor height="220px" language="javascript" value={code} onChange={(v) => setCode(v || "")} theme="vs-dark" options={{ fontSize: 13, minimap: { enabled: false } }} />
      </div>
      {output && <div className="p-3 rounded-lg bg-gray-900 text-green-400 font-mono text-xs"><pre>{output}</pre></div>}
      <div className="flex gap-2">
        <Button onClick={runCode} disabled={running} variant="outline" className="gap-2 flex-1">
          {running ? <Loader2 size={15} className="animate-spin" /> : <Play size={15} />} Run Code
        </Button>
        <Button onClick={() => handleNext(output && !output.toLowerCase().includes("error") ? 8 : 3)} className="gap-2 flex-1">
          <SkipForward size={15} /> {current + 1 === questions.length ? "Submit" : "Next"}
        </Button>
      </div>
    </div>
  );
};

// ─── Face Round ───────────────────────────────────────────────────────────────
const FaceRound = ({ jobRole, onComplete }: { jobRole: string; onComplete: (r: RoundResult) => void }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const recognitionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const questions = getFaceQuestions(jobRole);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraOn(true);
    } catch { toast.error("Camera access denied!"); }
  };
  const stopCamera = () => { streamRef.current?.getTracks().forEach((t) => t.stop()); setCameraOn(false); };
  const startMic = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { toast.error("Use Chrome for voice!"); return; }
    const r = new SR(); r.continuous = true; r.interimResults = true;
    r.onresult = (e: any) => setTranscript(Array.from(e.results).map((r: any) => r[0].transcript).join(" "));
    r.start(); recognitionRef.current = r; setMicOn(true);
  };
  const stopMic = () => { recognitionRef.current?.stop(); setMicOn(false); };
  useEffect(() => () => { stopCamera(); stopMic(); }, []);

  const handleNext = () => {
    const newAnswers = [...answers, transcript || "No answer"]; setAnswers(newAnswers); setTranscript("");
    if (current + 1 >= questions.length) {
      stopCamera(); stopMic();
      const score = newAnswers.filter((a) => a.length > 20).length;
      onComplete({ round: "Face to Face", score, total: questions.length, feedback: score >= 4 ? "Excellent communication!" : score >= 3 ? "Good, improve articulation." : "Practice speaking confidently." });
    } else { setCurrent((c) => c + 1); }
  };

  const q = questions[current];
  return (
    <div className="space-y-4 py-4">
      <DialogHeader><DialogTitle className="flex items-center gap-2"><Camera className="text-purple-600" /> Face to Face — Q{current + 1}/{questions.length}</DialogTitle></DialogHeader>
      <div className="grid grid-cols-2 gap-3">
        <div className="relative rounded-lg overflow-hidden bg-gray-900 aspect-video flex items-center justify-center">
          <video ref={videoRef} autoPlay muted className={`w-full h-full object-cover ${cameraOn ? "" : "hidden"}`} />
          {!cameraOn && <CameraOff size={28} className="text-gray-500" />}
          {cameraOn && <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-green-500 text-white"><CheckCircle2 size={11} /> Face Detected</div>}
        </div>
        <div className="space-y-2">
          <Button onClick={cameraOn ? stopCamera : startCamera} variant={cameraOn ? "destructive" : "outline"} className="w-full gap-2 text-sm">
            {cameraOn ? <><CameraOff size={15} /> Stop Camera</> : <><Camera size={15} /> Start Camera</>}
          </Button>
          <Button onClick={micOn ? stopMic : startMic} variant={micOn ? "destructive" : "outline"} className="w-full gap-2 text-sm">
            {micOn ? <><MicOff size={15} /> Stop Mic</> : <><Mic size={15} /> Start Mic</>}
          </Button>
          {micOn && <div className="flex items-center gap-2 text-green-600 text-xs"><div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" /> Recording...</div>}
        </div>
      </div>
      <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200">
        <p className="font-medium text-sm">{q?.question}</p>
        <ul className="mt-2 space-y-1">{q?.idealPoints.map((p, i) => <li key={i} className="text-xs opacity-60">• {p}</li>)}</ul>
      </div>
      {transcript && <div className="p-3 rounded-lg border bg-secondary text-sm"><p className="text-xs opacity-60 mb-1">Voice Answer:</p>{transcript}</div>}
      <Button onClick={handleNext} className="w-full gap-2">
        {current + 1 === questions.length ? "Submit Round" : "Next Question"} <ArrowRight size={16} />
      </Button>
    </div>
  );
};

// ─── HR Round ─────────────────────────────────────────────────────────────────
const HRRound = ({ jobRole, onComplete }: { jobRole: string; onComplete: (r: RoundResult) => void }) => {
  const [current, setCurrent] = useState(0);
  const [answer, setAnswer] = useState("");
  const [micOn, setMicOn] = useState(false);
  const [answers, setAnswers] = useState<string[]>([]);
  const recognitionRef = useRef<any>(null);
  const questions = getHRQuestions(jobRole);

  const startMic = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { toast.error("Use Chrome!"); return; }
    const r = new SR(); r.continuous = true; r.interimResults = true;
    r.onresult = (e: any) => { const t = Array.from(e.results).map((r: any) => r[0].transcript).join(" "); setAnswer(t); };
    r.start(); recognitionRef.current = r; setMicOn(true);
  };
  const stopMic = () => { recognitionRef.current?.stop(); setMicOn(false); };
  useEffect(() => () => stopMic(), []);

  const handleNext = () => {
    const newAnswers = [...answers, answer || "No answer"]; setAnswers(newAnswers); setAnswer("");
    if (current + 1 >= questions.length) {
      stopMic();
      const score = newAnswers.filter((a) => a.length > 15).length;
      onComplete({ round: "HR Round", score, total: questions.length, feedback: score >= 4 ? "Excellent HR answers!" : score >= 3 ? "Good communication." : "Work on HR communication." });
    } else { setCurrent((c) => c + 1); }
  };

  const q = questions[current];
  return (
    <div className="space-y-4 py-4">
      <DialogHeader><DialogTitle className="flex items-center gap-2"><Users className="text-orange-600" /> HR Round — Q{current + 1}/{questions.length}</DialogTitle></DialogHeader>
      <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-950/30 border border-orange-200">
        <p className="font-medium text-sm">{q?.question}</p>
        <ul className="mt-2 space-y-1">{q?.idealPoints.map((p, i) => <li key={i} className="text-xs opacity-60">• {p}</li>)}</ul>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Your Answer</Label>
          <Button onClick={micOn ? stopMic : startMic} size="sm" variant={micOn ? "destructive" : "outline"} className="gap-1 h-7 text-xs">
            {micOn ? <><MicOff size={12} /> Stop</> : <><Mic size={12} /> Voice</>}
          </Button>
        </div>
        <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Type or use voice..."
          className="w-full h-24 px-3 py-2 border-2 border-gray-300 rounded-md bg-transparent text-sm resize-none focus:outline-none focus:border-orange-500" />
      </div>
      {micOn && <div className="flex items-center gap-2 text-orange-600 text-xs"><div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" /> Listening...</div>}
      <Button onClick={handleNext} disabled={!answer.trim()} className="w-full gap-2">
        {current + 1 === questions.length ? "Submit Round" : "Next Question"} <ArrowRight size={16} />
      </Button>
    </div>
  );
};

// ─── Results ──────────────────────────────────────────────────────────────────
const ResultsScreen = ({ results, jobRole, experience, onReset }: { results: RoundResult[]; jobRole: string; experience: string; onReset: () => void }) => {
  const avg = Math.round(results.reduce((acc, r) => acc + (r.score / r.total) * 100, 0) / results.length);
  const grade = avg >= 80 ? "Excellent 🏆" : avg >= 60 ? "Good 👍" : avg >= 40 ? "Average 📈" : "Needs Improvement 💪";
  const gradeColor = avg >= 80 ? "text-green-600" : avg >= 60 ? "text-blue-600" : avg >= 40 ? "text-yellow-600" : "text-red-600";
  const barColors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500"];

  return (
    <div className="space-y-5 py-4">
      <DialogHeader>
        <DialogTitle className="text-2xl flex items-center gap-2"><Trophy className="text-yellow-500" /> Results — {jobRole}</DialogTitle>
        {experience && <span className="text-xs px-3 py-1 rounded-full bg-indigo-100 text-indigo-600 border border-indigo-200 w-fit">{experience}</span>}
      </DialogHeader>
      <div className="p-6 rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-2 text-center">
        <p className="text-sm opacity-70 mb-1">Overall Score</p>
        <div className={`text-5xl font-bold ${gradeColor}`}>{avg}%</div>
        <p className={`text-base font-semibold mt-2 ${gradeColor}`}>{grade}</p>
      </div>
      <div className="space-y-3">
        {results.map((r, i) => {
          const pct = Math.round((r.score / r.total) * 100);
          return (
            <div key={i} className="p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm">{r.round}</h3>
                <span className={`font-bold ${pct >= 70 ? "text-green-600" : pct >= 50 ? "text-yellow-600" : "text-red-600"}`}>{r.score}/{r.total}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div className={`h-2 rounded-full ${barColors[i]}`} style={{ width: `${pct}%` }} />
              </div>
              <p className="text-xs opacity-70">{r.feedback}</p>
            </div>
          );
        })}
      </div>
      <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200">
        <h3 className="font-semibold mb-2 flex items-center gap-2"><Sparkles size={15} className="text-blue-600" /> Next Steps</h3>
        <ul className="space-y-1 text-sm">
          {avg < 60 && <li className="flex gap-2"><AlertTriangle size={13} className="text-yellow-500 mt-0.5 shrink-0" /> Practice weak areas before applying</li>}
          <li className="flex gap-2"><CheckCircle2 size={13} className="text-green-500 mt-0.5 shrink-0" /> Review answers and improve on missed questions</li>
          <li className="flex gap-2"><CheckCircle2 size={13} className="text-green-500 mt-0.5 shrink-0" /> Retake the mock interview to improve your score</li>
        </ul>
      </div>
      <Button onClick={onReset} variant="outline" className="w-full">Try Again</Button>
    </div>
  );
};

// ─── Static Data ──────────────────────────────────────────────────────────────
function getStaticAptitude(role: string): MCQ[] {
  return [
    { question: "If a train travels 60 km in 1 hour, how far in 2.5 hours?", options: ["120 km", "150 km", "180 km", "90 km"], correct: 1 },
    { question: "Next number: 2, 4, 8, 16, ?", options: ["24", "32", "28", "20"], correct: 1 },
    { question: "Opposite of 'Abundant'?", options: ["Plentiful", "Scarce", "Rich", "Ample"], correct: 1 },
    { question: "5 workers finish in 10 days. 10 workers finish in?", options: ["20 days", "10 days", "5 days", "2 days"], correct: 2 },
    { question: "Odd one out: Apple, Mango, Carrot, Banana", options: ["Apple", "Mango", "Carrot", "Banana"], correct: 2 },
    { question: "15% of 200?", options: ["25", "30", "35", "20"], correct: 1 },
    { question: "A is B's sister, B is C's brother. How is A related to C?", options: ["Brother", "Sister", "Cousin", "Can't determine"], correct: 1 },
    { question: "Best data structure for FIFO?", options: ["Stack", "Queue", "Tree", "Graph"], correct: 1 },
    { question: "Today is Monday. After 100 days it will be?", options: ["Monday", "Tuesday", "Wednesday", "Thursday"], correct: 2 },
    { question: `Which is a key skill for ${role}?`, options: ["Problem Solving", "Cooking", "Painting", "Singing"], correct: 0 },
  ];
}

function getStaticCoding(role: string): CodingQ[] {
  return [
    { title: "Two Sum", description: "Return indices of two numbers that add up to target.", examples: "Input: [2,7,11,15], target=9 → Output: [0,1]", starterCode: `function twoSum(nums, target) {\n  // Write solution here\n}`, testCases: [{ input: "[2,7,11,15]\n9", expected: "[0,1]" }] },
    { title: "Reverse String", description: "Reverse the input string.", examples: "Input: 'hello' → Output: 'olleh'", starterCode: `function reverseString(s) {\n  // Write solution here\n}`, testCases: [{ input: "hello", expected: "olleh" }] },
    { title: "FizzBuzz", description: "Return Fizz/Buzz/FizzBuzz or number.", examples: "Input: 15 → Output: 'FizzBuzz'", starterCode: `function fizzBuzz(n) {\n  // Write solution here\n}`, testCases: [{ input: "15", expected: "FizzBuzz" }] },
  ];
}

function getFaceQuestions(role: string): FaceQ[] {
  return [
    { question: `Tell me about yourself and your ${role} experience.`, idealPoints: ["Brief intro", "Relevant experience", "Key skills"] },
    { question: `What is your greatest strength as a ${role}?`, idealPoints: ["Specific strength", "Real example", "Impact"] },
    { question: "Describe a challenging project and how you solved it.", idealPoints: ["Situation", "Action", "Result"] },
    { question: "Where do you see yourself in 5 years?", idealPoints: ["Growth mindset", "Realistic goals"] },
    { question: "Why do you want to work with us?", idealPoints: ["Company research", "Value alignment"] },
  ];
}

function getHRQuestions(role: string): HRQ[] {
  return [
    { question: "Tell me about a time you handled conflict in a team.", idealPoints: ["Situation", "Resolution", "Learning"] },
    { question: "What are your salary expectations?", idealPoints: ["Research-based", "Flexible"] },
    { question: "How do you handle pressure and tight deadlines?", idealPoints: ["Real example", "Coping strategy"] },
    { question: "Why are you leaving your current job?", idealPoints: ["Positive framing", "Growth-focused"] },
    { question: "Do you have any questions for us?", idealPoints: ["Show curiosity", "Ask about growth"] },
  ];
}

export default InterviewHub;
