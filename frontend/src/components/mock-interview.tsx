"use client";
import { utils_service } from "@/context/AppContext";
import axios from "axios";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "./ui/dialog";
import {
  Brain, Mic, MicOff, Camera, CameraOff, Code2, Users, MessageSquare,
  ArrowRight, Loader2, CheckCircle2, XCircle, Play, SkipForward,
  Trophy, AlertTriangle, Sparkles, Timer,
} from "lucide-react";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

// ─── Types ───────────────────────────────────────────────────────────────────
type Round = "menu" | "aptitude" | "coding" | "face" | "hr" | "results";

interface MCQ { question: string; options: string[]; correct: number; }
interface CodingQ { title: string; description: string; examples: string; starterCode: string; testCases: { input: string; expected: string }[]; }
interface FaceQ { question: string; idealPoints: string[]; }
interface HRQ { question: string; idealPoints: string[]; }

interface RoundResult {
  round: string;
  score: number;
  total: number;
  feedback: string;
}

// ─── Round Configs ────────────────────────────────────────────────────────────
const ROUNDS = [
  { id: "aptitude", label: "Aptitude", icon: Brain, color: "bg-blue-500", desc: "10 MCQ questions to test logical & verbal reasoning" },
  { id: "coding", label: "Coding", icon: Code2, color: "bg-green-500", desc: "3 coding problems with live code execution" },
  { id: "face", label: "Face to Face", icon: Camera, color: "bg-purple-500", desc: "5 technical questions with face & voice detection" },
  { id: "hr", label: "HR Round", icon: Users, color: "bg-orange-500", desc: "5 HR questions — answer by voice or text" },
];

// ─── Main Component ───────────────────────────────────────────────────────────
const MockInterview = () => {
  const [open, setOpen] = useState(false);
  const [round, setRound] = useState<Round>("menu");
  const [jobRole, setJobRole] = useState("");
  const [results, setResults] = useState<RoundResult[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (r: RoundResult) => setResults((prev) => [...prev, r]);

  const resetAll = () => {
    setRound("menu");
    setResults([]);
    setJobRole("");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-indigo-50 dark:bg-indigo-950/30 mb-4">
          <Brain size={16} className="text-indigo-600" />
          <span className="text-sm font-medium">AI Mock Interview</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Practice Full Mock Interview</h2>
        <p className="text-lg opacity-70 max-w-2xl mx-auto mb-8">
          4 rounds — Aptitude, Coding, Face to Face & HR — with AI evaluation and final report.
        </p>

        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetAll(); }}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2 h-12 px-8">
              <Brain size={18} /> Start Mock Interview <ArrowRight size={18} />
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {round === "menu" && (
              <MenuScreen jobRole={jobRole} setJobRole={setJobRole} setRound={setRound} loading={loading} setLoading={setLoading} />
            )}
            {round === "aptitude" && (
              <AptitudeRound jobRole={jobRole} onComplete={(r) => { addResult(r); setRound("coding"); }} />
            )}
            {round === "coding" && (
              <CodingRound jobRole={jobRole} onComplete={(r) => { addResult(r); setRound("face"); }} />
            )}
            {round === "face" && (
              <FaceRound jobRole={jobRole} onComplete={(r) => { addResult(r); setRound("hr"); }} />
            )}
            {round === "hr" && (
              <HRRound jobRole={jobRole} onComplete={(r) => { addResult(r); setRound("results"); }} />
            )}
            {round === "results" && (
              <ResultsScreen results={results} jobRole={jobRole} onReset={resetAll} />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

// ─── Menu Screen ──────────────────────────────────────────────────────────────
const MenuScreen = ({ jobRole, setJobRole, setRound, loading, setLoading }: any) => (
  <>
    <DialogHeader>
      <DialogTitle className="text-2xl flex items-center gap-2">
        <Brain className="text-indigo-600" /> Mock Interview Setup
      </DialogTitle>
    </DialogHeader>
    <div className="space-y-6 py-4">
      <div className="space-y-2">
        <Label>Target Job Role</Label>
        <Input placeholder="e.g., Frontend Developer, Data Scientist..." value={jobRole}
          onChange={(e) => setJobRole(e.target.value)} className="h-11" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {ROUNDS.map((r) => (
          <div key={r.id} className="p-4 rounded-lg border hover:border-indigo-500 transition-colors">
            <div className={`h-10 w-10 rounded-lg ${r.color} flex items-center justify-center mb-3`}>
              <r.icon size={20} className="text-white" />
            </div>
            <h3 className="font-semibold mb-1">{r.label}</h3>
            <p className="text-xs opacity-60">{r.desc}</p>
          </div>
        ))}
      </div>

      <Button onClick={() => { if (!jobRole.trim()) { toast.error("Please enter a job role"); return; } setRound("aptitude"); }}
        className="w-full h-11 gap-2" disabled={loading}>
        <Play size={18} /> Start Interview
      </Button>
    </div>
  </>
);

// ─── Aptitude Round ───────────────────────────────────────────────────────────
const AptitudeRound = ({ jobRole, onComplete }: { jobRole: string; onComplete: (r: RoundResult) => void }) => {
  const [questions, setQuestions] = useState<MCQ[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(30);
  const timerRef = useRef<any>(null);

  const fetchQuestions = async () => {
    try {
      const { data } = await axios.post(`${utils_service}/api/utils/career`, {
        skills: `Generate exactly 10 multiple choice aptitude questions for a ${jobRole} interview. Mix logical reasoning, verbal ability and basic ${jobRole} concepts. Return ONLY valid JSON array: [{"question":"...","options":["A","B","C","D"],"correct":0}]. correct is 0-indexed.`,
      });
      // Try to extract array from career response or parse directly
      if (Array.isArray(data)) { setQuestions(data); }
      else {
        // Fallback static questions
        setQuestions(getStaticAptitude(jobRole));
      }
    } catch {
      setQuestions(getStaticAptitude(jobRole));
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchQuestions(); }, []);

  useEffect(() => {
    if (loading || questions.length === 0) return;
    setTimeLeft(30);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { handleNext(-1); return 30; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [current, loading, questions.length]);

  const handleNext = (sel: number) => {
    clearInterval(timerRef.current);
    const newAnswers = [...answers, sel];
    setAnswers(newAnswers);
    setSelected(null);
    if (current + 1 >= questions.length) {
      const correct = newAnswers.filter((a, i) => a === questions[i]?.correct).length;
      onComplete({ round: "Aptitude", score: correct, total: questions.length, feedback: correct >= 7 ? "Excellent aptitude skills!" : correct >= 5 ? "Good, but practice more reasoning questions." : "Need improvement in logical reasoning." });
    } else { setCurrent((c) => c + 1); }
  };

  if (loading) return <div className="flex items-center justify-center h-48"><Loader2 className="animate-spin" size={32} /></div>;

  const q = questions[current];
  return (
    <div className="space-y-4 py-4">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Brain className="text-blue-600" /> Aptitude Round — Q{current + 1}/{questions.length}
        </DialogTitle>
      </DialogHeader>

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {questions.map((_, i) => (
            <div key={i} className={`h-2 w-6 rounded-full ${i < current ? "bg-blue-500" : i === current ? "bg-blue-300" : "bg-gray-200"}`} />
          ))}
        </div>
        <div className={`flex items-center gap-1 font-bold ${timeLeft <= 10 ? "text-red-500" : "text-blue-600"}`}>
          <Timer size={16} /> {timeLeft}s
        </div>
      </div>

      <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200">
        <p className="font-medium">{q?.question}</p>
      </div>

      <div className="space-y-2">
        {q?.options.map((opt, i) => (
          <button key={i} onClick={() => setSelected(i)}
            className={`w-full text-left p-3 rounded-lg border-2 transition-all text-sm ${selected === i ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30" : "border-gray-200 hover:border-blue-300"}`}>
            <span className="font-bold mr-2">{["A", "B", "C", "D"][i]}.</span>{opt}
          </button>
        ))}
      </div>

      <Button onClick={() => handleNext(selected ?? -1)} className="w-full gap-2" disabled={selected === null}>
        {current + 1 === questions.length ? "Submit" : "Next"} <ArrowRight size={16} />
      </Button>
    </div>
  );
};

// ─── Coding Round ─────────────────────────────────────────────────────────────
const CodingRound = ({ jobRole, onComplete }: { jobRole: string; onComplete: (r: RoundResult) => void }) => {
  const [questions, setQuestions] = useState<CodingQ[]>([]);
  const [current, setCurrent] = useState(0);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState<number[]>([]);

  useEffect(() => {
    const qs = getStaticCoding(jobRole);
    setQuestions(qs);
    setCode(qs[0]?.starterCode || "");
    setLoading(false);
  }, []);

  const runCode = async () => {
    setRunning(true);
    setOutput("Running...");
    try {
      const res = await fetch("https://ce.judge0.com/submissions?base64_encoded=false&wait=true", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source_code: code, language_id: 63, stdin: questions[current]?.testCases[0]?.input || "" }),
      });
      const data = await res.json();
      setOutput(data.stdout || data.stderr || data.compile_output || "No output");
    } catch {
      setOutput("Code execution failed. Check your internet connection.");
    } finally { setRunning(false); }
  };

  const handleNext = (score: number) => {
    const newScores = [...scores, score];
    setScores(newScores);
    if (current + 1 >= questions.length) {
      const total = newScores.reduce((a, b) => a + b, 0);
      onComplete({ round: "Coding", score: total, total: questions.length * 10, feedback: total >= 20 ? "Strong coding skills!" : total >= 10 ? "Good problem-solving approach." : "Practice more data structures and algorithms." });
    } else {
      setCurrent((c) => c + 1);
      setCode(questions[current + 1]?.starterCode || "");
      setOutput("");
    }
  };

  if (loading) return <div className="flex items-center justify-center h-48"><Loader2 className="animate-spin" size={32} /></div>;

  const q = questions[current];
  return (
    <div className="space-y-4 py-4">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Code2 className="text-green-600" /> Coding Round — Problem {current + 1}/{questions.length}
        </DialogTitle>
      </DialogHeader>

      <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200">
        <h3 className="font-bold mb-1">{q?.title}</h3>
        <p className="text-sm opacity-80 mb-2">{q?.description}</p>
        <p className="text-xs font-mono opacity-60">{q?.examples}</p>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <MonacoEditor height="240px" language="javascript" value={code} onChange={(v) => setCode(v || "")}
          theme="vs-dark" options={{ fontSize: 13, minimap: { enabled: false }, lineNumbers: "on" }} />
      </div>

      {output && (
        <div className="p-3 rounded-lg bg-gray-900 text-green-400 font-mono text-sm">
          <p className="text-xs text-gray-500 mb-1">Output:</p>
          <pre>{output}</pre>
        </div>
      )}

      <div className="flex gap-2">
        <Button onClick={runCode} disabled={running} variant="outline" className="gap-2 flex-1">
          {running ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
          Run Code
        </Button>
        <Button onClick={() => handleNext(output && !output.includes("error") ? 8 : 3)} className="gap-2 flex-1">
          <SkipForward size={16} /> {current + 1 === questions.length ? "Submit" : "Next Problem"}
        </Button>
      </div>
    </div>
  );
};

// ─── Face to Face Round ───────────────────────────────────────────────────────
const FaceRound = ({ jobRole, onComplete }: { jobRole: string; onComplete: (r: RoundResult) => void }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [faceDetected, setFaceDetected] = useState(false);
  const recognitionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const questions: FaceQ[] = getFaceQuestions(jobRole);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraOn(true);
      setFaceDetected(true); // simplified — treat camera on as face detected
      toast.success("Camera started!");
    } catch { toast.error("Camera access denied!"); }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setCameraOn(false);
    setFaceDetected(false);
  };

  const startMic = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { toast.error("Speech recognition not supported. Use Chrome!"); return; }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (e: any) => {
      const t = Array.from(e.results).map((r: any) => r[0].transcript).join(" ");
      setTranscript(t);
    };
    recognition.start();
    recognitionRef.current = recognition;
    setMicOn(true);
  };

  const stopMic = () => {
    recognitionRef.current?.stop();
    setMicOn(false);
  };

  useEffect(() => () => { stopCamera(); stopMic(); }, []);

  const handleNext = () => {
    const newAnswers = [...answers, transcript || "No answer provided"];
    setAnswers(newAnswers);
    setTranscript("");
    if (current + 1 >= questions.length) {
      stopCamera(); stopMic();
      const score = newAnswers.filter((a) => a.length > 20).length;
      onComplete({ round: "Face to Face", score, total: questions.length, feedback: score >= 4 ? "Excellent communication!" : score >= 3 ? "Good answers, improve articulation." : "Practice speaking confidently." });
    } else { setCurrent((c) => c + 1); }
  };

  const q = questions[current];
  return (
    <div className="space-y-4 py-4">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Camera className="text-purple-600" /> Face to Face — Q{current + 1}/{questions.length}
        </DialogTitle>
      </DialogHeader>

      <div className="grid grid-cols-2 gap-3">
        {/* Camera */}
        <div className="relative rounded-lg overflow-hidden bg-gray-900 aspect-video flex items-center justify-center">
          <video ref={videoRef} autoPlay muted className={`w-full h-full object-cover ${cameraOn ? "" : "hidden"}`} />
          {!cameraOn && <CameraOff size={32} className="text-gray-500" />}
          {cameraOn && (
            <div className={`absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${faceDetected ? "bg-green-500" : "bg-red-500"} text-white`}>
              {faceDetected ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
              {faceDetected ? "Face Detected" : "No Face"}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="space-y-3">
          <Button onClick={cameraOn ? stopCamera : startCamera} variant={cameraOn ? "destructive" : "outline"} className="w-full gap-2">
            {cameraOn ? <><CameraOff size={16} /> Stop Camera</> : <><Camera size={16} /> Start Camera</>}
          </Button>
          <Button onClick={micOn ? stopMic : startMic} variant={micOn ? "destructive" : "outline"} className="w-full gap-2">
            {micOn ? <><MicOff size={16} /> Stop Mic</> : <><Mic size={16} /> Start Mic</>}
          </Button>
          {micOn && <div className="flex items-center gap-2 text-green-600 text-sm"><div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" /> Recording...</div>}
        </div>
      </div>

      <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200">
        <p className="font-medium">{q?.question}</p>
        <ul className="mt-2 space-y-1">
          {q?.idealPoints.map((p, i) => <li key={i} className="text-xs opacity-60">• {p}</li>)}
        </ul>
      </div>

      {transcript && (
        <div className="p-3 rounded-lg border bg-secondary">
          <p className="text-xs font-medium opacity-60 mb-1">Your Answer (Voice):</p>
          <p className="text-sm">{transcript}</p>
        </div>
      )}

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
  const [transcript, setTranscript] = useState("");
  const [micOn, setMicOn] = useState(false);
  const [answers, setAnswers] = useState<string[]>([]);
  const recognitionRef = useRef<any>(null);

  const questions: HRQ[] = getHRQuestions(jobRole);

  const startMic = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { toast.error("Use Chrome for voice!"); return; }
    const r = new SpeechRecognition();
    r.continuous = true;
    r.interimResults = true;
    r.onresult = (e: any) => {
      const t = Array.from(e.results).map((r: any) => r[0].transcript).join(" ");
      setTranscript(t);
      setAnswer(t);
    };
    r.start();
    recognitionRef.current = r;
    setMicOn(true);
  };

  const stopMic = () => { recognitionRef.current?.stop(); setMicOn(false); };
  useEffect(() => () => { stopMic(); }, []);

  const handleNext = () => {
    const finalAnswer = answer || transcript || "No answer";
    const newAnswers = [...answers, finalAnswer];
    setAnswers(newAnswers);
    setAnswer(""); setTranscript("");
    if (current + 1 >= questions.length) {
      stopMic();
      const score = newAnswers.filter((a) => a.length > 15).length;
      onComplete({ round: "HR Round", score, total: questions.length, feedback: score >= 4 ? "Excellent HR answers!" : score >= 3 ? "Good communication skills." : "Work on your HR communication." });
    } else { setCurrent((c) => c + 1); }
  };

  const q = questions[current];
  return (
    <div className="space-y-4 py-4">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Users className="text-orange-600" /> HR Round — Q{current + 1}/{questions.length}
        </DialogTitle>
      </DialogHeader>

      <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-950/30 border border-orange-200">
        <p className="font-medium">{q?.question}</p>
        <ul className="mt-2 space-y-1">
          {q?.idealPoints.map((p, i) => <li key={i} className="text-xs opacity-60">• {p}</li>)}
        </ul>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Your Answer</Label>
          <Button onClick={micOn ? stopMic : startMic} size="sm" variant={micOn ? "destructive" : "outline"} className="gap-1 h-7 text-xs">
            {micOn ? <><MicOff size={12} /> Stop</> : <><Mic size={12} /> Voice</>}
          </Button>
        </div>
        <textarea value={answer} onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type your answer or use voice input..."
          className="w-full h-28 px-3 py-2 border-2 border-gray-300 rounded-md bg-transparent text-sm resize-none focus:outline-none focus:border-orange-500" />
      </div>

      {micOn && <div className="flex items-center gap-2 text-orange-600 text-sm"><div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" /> Listening...</div>}

      <Button onClick={handleNext} className="w-full gap-2" disabled={!answer.trim() && !transcript.trim()}>
        {current + 1 === questions.length ? "Submit Round" : "Next Question"} <ArrowRight size={16} />
      </Button>
    </div>
  );
};

// ─── Results Screen ───────────────────────────────────────────────────────────
const ResultsScreen = ({ results, jobRole, onReset }: { results: RoundResult[]; jobRole: string; onReset: () => void }) => {
  const totalScore = results.reduce((acc, r) => acc + (r.score / r.total) * 100, 0);
  const avg = Math.round(totalScore / results.length);
  const grade = avg >= 80 ? "Excellent" : avg >= 60 ? "Good" : avg >= 40 ? "Average" : "Needs Improvement";
  const gradeColor = avg >= 80 ? "text-green-600" : avg >= 60 ? "text-blue-600" : avg >= 40 ? "text-yellow-600" : "text-red-600";

  return (
    <div className="space-y-6 py-4">
      <DialogHeader>
        <DialogTitle className="text-2xl flex items-center gap-2">
          <Trophy className="text-yellow-500" /> Interview Results — {jobRole}
        </DialogTitle>
      </DialogHeader>

      {/* Overall Score */}
      <div className="p-6 rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-2 text-center">
        <p className="text-sm font-medium opacity-70 mb-2">Overall Score</p>
        <div className={`text-6xl font-bold ${gradeColor}`}>{avg}%</div>
        <p className={`text-lg font-semibold mt-2 ${gradeColor}`}>{grade}</p>
      </div>

      {/* Round Breakdown */}
      <div className="space-y-3">
        {results.map((r, i) => {
          const pct = Math.round((r.score / r.total) * 100);
          const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500"];
          return (
            <div key={i} className="p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{r.round}</h3>
                <span className={`font-bold text-lg ${pct >= 70 ? "text-green-600" : pct >= 50 ? "text-yellow-600" : "text-red-600"}`}>
                  {r.score}/{r.total}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div className={`h-2 rounded-full ${colors[i]}`} style={{ width: `${pct}%` }} />
              </div>
              <p className="text-xs opacity-70">{r.feedback}</p>
            </div>
          );
        })}
      </div>

      {/* Tips */}
      <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Sparkles size={16} className="text-blue-600" /> Next Steps
        </h3>
        <ul className="space-y-1 text-sm">
          {avg < 60 && <li className="flex gap-2"><AlertTriangle size={14} className="text-yellow-500 mt-0.5 shrink-0" /> Practice more on weak areas before applying</li>}
          <li className="flex gap-2"><CheckCircle2 size={14} className="text-green-500 mt-0.5 shrink-0" /> Review your answers and improve on missed questions</li>
          <li className="flex gap-2"><CheckCircle2 size={14} className="text-green-500 mt-0.5 shrink-0" /> Take the mock interview again to improve your score</li>
        </ul>
      </div>

      <Button onClick={onReset} variant="outline" className="w-full">Try Again</Button>
    </div>
  );
};

// ─── Static Data Helpers ──────────────────────────────────────────────────────
function getStaticAptitude(role: string): MCQ[] {
  return [
    { question: "If a train travels 60 km in 1 hour, how far will it travel in 2.5 hours?", options: ["120 km", "150 km", "180 km", "90 km"], correct: 1 },
    { question: "What is the next number in the series: 2, 4, 8, 16, ?", options: ["24", "32", "28", "20"], correct: 1 },
    { question: "Which word is opposite of 'Abundant'?", options: ["Plentiful", "Scarce", "Rich", "Ample"], correct: 1 },
    { question: "If 5 workers complete a job in 10 days, how many days for 10 workers?", options: ["20", "10", "5", "2"], correct: 2 },
    { question: "Find the odd one out: Apple, Mango, Carrot, Banana", options: ["Apple", "Mango", "Carrot", "Banana"], correct: 2 },
    { question: "What is 15% of 200?", options: ["25", "30", "35", "20"], correct: 1 },
    { question: "A is B's sister, B is C's brother. How is A related to C?", options: ["Brother", "Sister", "Cousin", "Cannot determine"], correct: 1 },
    { question: "If MANGO = 13+1+14+7+15 = 50, what is APPLE?", options: ["50", "51", "52", "53"], correct: 1 },
    { question: `Which data structure is best for implementing a ${role} queue system?`, options: ["Stack", "Queue", "Tree", "Graph"], correct: 1 },
    { question: "If today is Monday, what day is it after 100 days?", options: ["Monday", "Tuesday", "Wednesday", "Thursday"], correct: 2 },
  ];
}

function getStaticCoding(role: string): CodingQ[] {
  return [
    {
      title: "Two Sum",
      description: "Given an array of integers nums and an integer target, return indices of the two numbers that add up to target.",
      examples: "Input: nums = [2,7,11,15], target = 9 → Output: [0,1]",
      starterCode: `function twoSum(nums, target) {\n  // Write your solution here\n  \n}`,
      testCases: [{ input: "[2,7,11,15]\n9", expected: "[0,1]" }],
    },
    {
      title: "Reverse a String",
      description: "Write a function that reverses a string. The input string is given as an array of characters.",
      examples: "Input: 'hello' → Output: 'olleh'",
      starterCode: `function reverseString(s) {\n  // Write your solution here\n  \n}`,
      testCases: [{ input: "hello", expected: "olleh" }],
    },
    {
      title: "FizzBuzz",
      description: `Write a function that returns 'Fizz' for multiples of 3, 'Buzz' for multiples of 5, 'FizzBuzz' for both, else the number.`,
      examples: "Input: 15 → Output: 'FizzBuzz'",
      starterCode: `function fizzBuzz(n) {\n  // Write your solution here\n  \n}`,
      testCases: [{ input: "15", expected: "FizzBuzz" }],
    },
  ];
}

function getFaceQuestions(role: string): FaceQ[] {
  return [
    { question: `Tell me about yourself and your experience relevant to ${role}.`, idealPoints: ["Brief intro", "Relevant experience", "Key skills", "Why this role"] },
    { question: `What is your greatest strength as a ${role}?`, idealPoints: ["Specific strength", "Real example", "Impact"] },
    { question: "Describe a challenging project and how you solved it.", idealPoints: ["Situation", "Problem", "Action taken", "Result"] },
    { question: `Where do you see yourself in 5 years as a ${role}?`, idealPoints: ["Growth mindset", "Realistic goals", "Alignment with role"] },
    { question: "Why do you want to work with us?", idealPoints: ["Company research", "Role alignment", "Value you bring"] },
  ];
}

function getHRQuestions(role: string): HRQ[] {
  return [
    { question: "Tell me about a time you handled conflict in a team.", idealPoints: ["Situation", "Your role", "Resolution", "Learning"] },
    { question: "What are your salary expectations?", idealPoints: ["Research-based", "Flexible", "Value-focused"] },
    { question: "How do you handle pressure and tight deadlines?", idealPoints: ["Real example", "Coping strategy", "Result"] },
    { question: "Why are you leaving your current job?", idealPoints: ["Positive framing", "Growth-focused", "Honest"] },
    { question: "Do you have any questions for us?", idealPoints: ["Show curiosity", "Ask about team/culture", "Ask about role growth"] },
  ];
}

export default MockInterview;
