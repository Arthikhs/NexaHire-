"use client";
import { utils_service } from "@/context/AppContext";
import axios from "axios";
import { Code2, ArrowRight, Loader2, Play, Trophy, Timer, SkipForward } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const TOPICS = ["Arrays", "Strings", "Math", "Recursion", "Mixed"];
const LANGUAGES = [
  { id: 63, label: "JavaScript" },
  { id: 71, label: "Python" },
  { id: 62, label: "Java" },
  { id: 54, label: "C++" },
];

const CodingContest = () => {
  const [open, setOpen] = useState(false);
  const [difficulty, setDifficulty] = useState("Medium");
  const [topic, setTopic] = useState("Mixed");
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [problems, setProblems] = useState<any[]>([]);
  const [current, setCurrent] = useState(0);
  const [code, setCode] = useState("// Write your solution here\n");
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scores, setScores] = useState<number[]>([]);
  const [screen, setScreen] = useState<"setup" | "contest" | "results">("setup");
  const [timeLeft, setTimeLeft] = useState(600);
  const timerRef = useRef<any>(null);

  const startContest = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post(`${utils_service}/api/utils/coding-contest`, { difficulty, topic });
      setProblems(Array.isArray(data) ? data : getStaticProblems());
    } catch {
      setProblems(getStaticProblems());
    } finally {
      setLoading(false);
      setScreen("contest");
      setCurrent(0); setCode("// Write your solution here\n");
      setOutput(""); setScores([]); setTimeLeft(600);
    }
  };

  useEffect(() => {
    if (screen !== "contest") return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(timerRef.current); setScreen("results"); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [screen]);

  const runCode = async () => {
    setRunning(true); setOutput("Running...");
    try {
      const res = await fetch("https://ce.judge0.com/submissions?base64_encoded=false&wait=true", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source_code: code, language_id: language.id, stdin: problems[current]?.examples?.[0]?.input || "" }),
      });
      const data = await res.json();
      setOutput(data.stdout || data.stderr || data.compile_output || "No output");
    } catch { setOutput("Execution failed."); }
    finally { setRunning(false); }
  };

  const handleNext = (score: number) => {
    const newScores = [...scores, score]; setScores(newScores);
    if (current + 1 >= problems.length) { clearInterval(timerRef.current); setScreen("results"); }
    else { setCurrent((c) => c + 1); setCode("// Write your solution here\n"); setOutput(""); }
  };

  const totalScore = scores.reduce((a, b) => a + b, 0);
  const maxScore = problems.length * 10;
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-green-50 dark:bg-green-950/30 mb-4">
          <Code2 size={16} className="text-green-600" />
          <span className="text-sm font-medium">Competitive Programming</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Coding Contest</h2>
        <p className="text-lg opacity-70 max-w-2xl mx-auto mb-8">
          Solve AI-generated problems with live code execution. Beat the timer!
        </p>

        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setScreen("setup"); clearInterval(timerRef.current); } }}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2 h-12 px-8 bg-green-600 hover:bg-green-700">
              <Code2 size={18} /> Start Contest <ArrowRight size={18} />
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">

            {/* Setup */}
            {screen === "setup" && (
              <>
                <DialogHeader><DialogTitle className="flex items-center gap-2"><Code2 className="text-green-600" /> Contest Setup</DialogTitle></DialogHeader>
                <div className="space-y-5 py-4">
                  <div className="space-y-2">
                    <p className="font-semibold text-sm">Difficulty</p>
                    <div className="flex gap-3">
                      {DIFFICULTIES.map((d) => (
                        <button key={d} onClick={() => setDifficulty(d)}
                          className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-all ${difficulty === d ? "border-green-500 bg-green-50 dark:bg-green-950/30" : "border-gray-200 hover:border-green-300"}`}>
                          {d === "Easy" ? "🟢" : d === "Medium" ? "🟡" : "🔴"} {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="font-semibold text-sm">Topic</p>
                    <div className="flex flex-wrap gap-2">
                      {TOPICS.map((t) => (
                        <button key={t} onClick={() => setTopic(t)}
                          className={`px-3 py-1.5 rounded-full border-2 text-sm transition-all ${topic === t ? "border-green-500 bg-green-50 dark:bg-green-950/30" : "border-gray-200 hover:border-green-300"}`}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="font-semibold text-sm">Language</p>
                    <div className="flex gap-2">
                      {LANGUAGES.map((l) => (
                        <button key={l.id} onClick={() => setLanguage(l)}
                          className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-all ${language.id === l.id ? "border-green-500 bg-green-50 dark:bg-green-950/30" : "border-gray-200 hover:border-green-300"}`}>
                          {l.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 text-sm opacity-70">
                    5 problems • 10 minute timer • Live code execution via Judge0
                  </div>

                  <Button onClick={startContest} disabled={loading} className="w-full h-11 gap-2 bg-green-600 hover:bg-green-700">
                    {loading ? <><Loader2 size={18} className="animate-spin" /> Loading problems...</> : <><Play size={18} /> Start Contest</>}
                  </Button>
                </div>
              </>
            )}

            {/* Contest */}
            {screen === "contest" && problems[current] && (
              <div className="space-y-4 py-2">
                <DialogHeader>
                  <DialogTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2"><Code2 className="text-green-600" size={18} /> Problem {current + 1}/{problems.length}</span>
                    <span className={`flex items-center gap-1 font-bold text-sm px-3 py-1 rounded-full ${timeLeft <= 60 ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
                      <Timer size={14} /> {formatTime(timeLeft)}
                    </span>
                  </DialogTitle>
                </DialogHeader>

                {/* Progress */}
                <div className="flex gap-1">
                  {problems.map((_, i) => <div key={i} className={`h-1.5 flex-1 rounded-full ${i < current ? "bg-green-500" : i === current ? "bg-green-300" : "bg-gray-200"}`} />)}
                </div>

                {/* Problem */}
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold">{problems[current].title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${problems[current].difficulty === "Hard" ? "bg-red-100 text-red-600" : problems[current].difficulty === "Medium" ? "bg-yellow-100 text-yellow-600" : "bg-green-100 text-green-600"}`}>
                      {problems[current].difficulty}
                    </span>
                  </div>
                  <p className="text-sm opacity-80 mb-2">{problems[current].description}</p>
                  {problems[current].examples?.[0] && (
                    <div className="bg-gray-900 text-green-400 rounded p-2 text-xs font-mono">
                      Input: {problems[current].examples[0].input} → Output: {problems[current].examples[0].output}
                    </div>
                  )}
                  {problems[current].constraints && <p className="text-xs opacity-50 mt-1">Constraints: {problems[current].constraints}</p>}
                </div>

                {/* Editor */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="px-3 py-1.5 bg-gray-800 text-xs text-gray-400">{language.label}</div>
                  <MonacoEditor height="200px" language={language.label.toLowerCase()} value={code}
                    onChange={(v) => setCode(v || "")} theme="vs-dark" options={{ fontSize: 13, minimap: { enabled: false } }} />
                </div>

                {output && <div className="p-3 rounded-lg bg-gray-900 text-green-400 font-mono text-xs"><pre>{output}</pre></div>}

                <div className="flex gap-2">
                  <Button onClick={runCode} disabled={running} variant="outline" className="flex-1 gap-2">
                    {running ? <Loader2 size={15} className="animate-spin" /> : <Play size={15} />} Run
                  </Button>
                  <Button onClick={() => handleNext(output && !output.toLowerCase().includes("error") ? 8 : 2)}
                    className="flex-1 gap-2 bg-green-600 hover:bg-green-700">
                    <SkipForward size={15} /> {current + 1 === problems.length ? "Submit" : "Next"}
                  </Button>
                </div>
              </div>
            )}

            {/* Results */}
            {screen === "results" && (
              <div className="space-y-5 py-4">
                <DialogHeader><DialogTitle className="flex items-center gap-2"><Trophy className="text-yellow-500" /> Contest Results</DialogTitle></DialogHeader>
                <div className={`p-6 rounded-lg border-2 text-center ${totalScore >= maxScore * 0.7 ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"}`}>
                  <div className={`text-5xl font-bold ${totalScore >= maxScore * 0.7 ? "text-green-600" : "text-yellow-600"}`}>{totalScore}/{maxScore}</div>
                  <p className="mt-2 font-semibold">{totalScore >= maxScore * 0.8 ? "🏆 Excellent!" : totalScore >= maxScore * 0.6 ? "👍 Good!" : "💪 Keep Practicing!"}</p>
                </div>
                <div className="space-y-2">
                  {problems.map((p, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                      <span className="text-sm">{p.title}</span>
                      <span className={`text-sm font-bold ${(scores[i] || 0) >= 7 ? "text-green-600" : "text-red-500"}`}>{scores[i] || 0}/10</span>
                    </div>
                  ))}
                </div>
                <Button onClick={() => setScreen("setup")} variant="outline" className="w-full">Try Again</Button>
              </div>
            )}

          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

function getStaticProblems() {
  return [
    { title: "Two Sum", difficulty: "Easy", description: "Find two numbers that add up to target.", examples: [{ input: "[2,7,11], 9", output: "[0,1]" }], constraints: "2 <= nums.length <= 10^4" },
    { title: "Palindrome Check", difficulty: "Easy", description: "Check if a string is a palindrome.", examples: [{ input: "racecar", output: "true" }], constraints: "1 <= s.length <= 1000" },
    { title: "Fibonacci", difficulty: "Medium", description: "Return nth Fibonacci number.", examples: [{ input: "10", output: "55" }], constraints: "0 <= n <= 30" },
    { title: "Max Subarray", difficulty: "Medium", description: "Find the contiguous subarray with the largest sum.", examples: [{ input: "[-2,1,-3,4,-1,2,1,-5,4]", output: "6" }], constraints: "1 <= nums.length <= 10^5" },
    { title: "Valid Parentheses", difficulty: "Medium", description: "Check if brackets are balanced.", examples: [{ input: "()[]{}", output: "true" }], constraints: "1 <= s.length <= 10^4" },
  ];
}

export default CodingContest;
