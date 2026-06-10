"use client";
import { utils_service } from "@/context/AppContext";
import axios from "axios";
import {
  ArrowRight, Loader2, Timer, Trophy, CheckCircle2,
  XCircle, Brain, RotateCcw, BookOpen, Target, Sparkles,
} from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import toast from "react-hot-toast";

interface NCATQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  difficulty: string;
}

type Screen = "setup" | "test" | "results";

const CATEGORIES = [
  { id: "Quantitative Aptitude", label: "Quantitative Aptitude", icon: "🔢", desc: "Numbers, algebra, geometry" },
  { id: "Logical Reasoning", label: "Logical Reasoning", icon: "🧠", desc: "Patterns, sequences, puzzles" },
  { id: "Verbal Ability", label: "Verbal Ability", icon: "📝", desc: "Grammar, vocabulary, comprehension" },
  { id: "Data Interpretation", label: "Data Interpretation", icon: "📊", desc: "Charts, tables, graphs" },
  { id: "General Knowledge", label: "General Knowledge", icon: "🌍", desc: "Current affairs, static GK" },
  { id: "Computer Science", label: "Computer Science", icon: "💻", desc: "DS, Algorithms, OS, DBMS" },
];

const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const TIME_PER_Q = 60; // seconds

const NCAT = () => {
  const [open, setOpen] = useState(false);
  const [screen, setScreen] = useState<Screen>("setup");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [questions, setQuestions] = useState<NCATQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_Q);
  const [totalTime, setTotalTime] = useState(0);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<any>(null);
  const totalTimerRef = useRef<any>(null);

  const startTest = async () => {
    if (!category) { toast.error("Select a category"); return; }
    setLoading(true);
    try {
      const { data } = await axios.post(`${utils_service}/api/utils/ncat`, { category, difficulty });
      if (Array.isArray(data) && data.length > 0) {
        setQuestions(data);
        setScreen("test");
        setCurrent(0); setAnswers([]); setSelected(null);
        setTimeLeft(TIME_PER_Q); setTotalTime(0);
        toast.success("Test started!");
      } else {
        // fallback to static
        setQuestions(getStaticQuestions(category));
        setScreen("test");
      }
    } catch {
      setQuestions(getStaticQuestions(category));
      setScreen("test");
    } finally { setLoading(false); }
  };

  // Per question timer
  useEffect(() => {
    if (screen !== "test") return;
    setTimeLeft(TIME_PER_Q);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { handleNext(-1); return TIME_PER_Q; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [current, screen]);

  // Total time tracker
  useEffect(() => {
    if (screen !== "test") return;
    totalTimerRef.current = setInterval(() => setTotalTime((t) => t + 1), 1000);
    return () => clearInterval(totalTimerRef.current);
  }, [screen]);

  const handleNext = (sel: number) => {
    clearInterval(timerRef.current);
    const newAnswers = [...answers, sel];
    setAnswers(newAnswers);
    setSelected(null); setShowExplanation(false);

    if (current + 1 >= questions.length) {
      clearInterval(totalTimerRef.current);
      setScreen("results");
    } else {
      setCurrent((c) => c + 1);
    }
  };

  const resetAll = () => {
    setScreen("setup"); setCategory(""); setDifficulty("Medium");
    setQuestions([]); setCurrent(0); setAnswers([]);
    setSelected(null); setShowExplanation(false);
    setTimeLeft(TIME_PER_Q); setTotalTime(0);
    clearInterval(timerRef.current); clearInterval(totalTimerRef.current);
  };

  const score = answers.filter((a, i) => a === questions[i]?.correct).length;
  const pct = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 bg-secondary/30">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-violet-50 dark:bg-violet-950/30 mb-4">
          <Brain size={16} className="text-violet-600" />
          <span className="text-sm font-medium">Competitive Exam Practice</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          N<span className="text-violet-600">CAT</span> Practice Test
        </h2>
        <p className="text-lg opacity-70 max-w-2xl mx-auto mb-8">
          Practice CAT, GATE & competitive aptitude with AI-generated questions, timer and detailed explanations.
        </p>

        {/* Category preview */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 max-w-3xl mx-auto mb-8">
          {CATEGORIES.map((c) => (
            <div key={c.id} className="p-3 rounded-lg border text-center hover:border-violet-400 transition-colors">
              <div className="text-2xl mb-1">{c.icon}</div>
              <p className="text-xs font-medium">{c.label.split(" ")[0]}</p>
            </div>
          ))}
        </div>

        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetAll(); }}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2 h-12 px-8 bg-violet-600 hover:bg-violet-700">
              <Brain size={18} /> Start NCAT Practice <ArrowRight size={18} />
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">

            {/* ── Setup Screen ── */}
            {screen === "setup" && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl flex items-center gap-2">
                    <Brain className="text-violet-600" /> NCAT Practice Setup
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-5 py-4">
                  <div className="space-y-2">
                    <p className="font-semibold text-sm">Select Category <span className="text-red-500">*</span></p>
                    <div className="grid grid-cols-2 gap-3">
                      {CATEGORIES.map((c) => (
                        <button key={c.id} onClick={() => setCategory(c.id)}
                          className={`p-3 rounded-lg border-2 text-left transition-all ${category === c.id ? "border-violet-500 bg-violet-50 dark:bg-violet-950/30" : "border-gray-200 hover:border-violet-300"}`}>
                          <span className="text-xl mr-2">{c.icon}</span>
                          <span className="font-semibold text-sm">{c.label}</span>
                          <p className="text-xs opacity-60 mt-1">{c.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="font-semibold text-sm">Difficulty Level</p>
                    <div className="flex gap-3">
                      {DIFFICULTIES.map((d) => (
                        <button key={d} onClick={() => setDifficulty(d)}
                          className={`flex-1 py-2 rounded-lg border-2 font-medium text-sm transition-all ${difficulty === d ? "border-violet-500 bg-violet-50 dark:bg-violet-950/30 text-violet-700" : "border-gray-200 hover:border-violet-300"}`}>
                          {d === "Easy" ? "🟢" : d === "Medium" ? "🟡" : "🔴"} {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-violet-50 dark:bg-violet-950/30 border border-violet-200 text-sm space-y-1">
                    <p className="font-semibold">Test Format:</p>
                    <p className="opacity-70">• 10 questions • 60 seconds per question • Instant explanation after each answer</p>
                  </div>

                  <Button onClick={startTest} disabled={loading || !category} className="w-full h-11 gap-2 bg-violet-600 hover:bg-violet-700">
                    {loading ? <><Loader2 size={18} className="animate-spin" /> Generating Questions...</> : <><Sparkles size={18} /> Start Test</>}
                  </Button>
                </div>
              </>
            )}

            {/* ── Test Screen ── */}
            {screen === "test" && questions[current] && (
              <div className="space-y-4 py-2">
                <DialogHeader>
                  <DialogTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2"><BookOpen className="text-violet-600" size={20} /> {category}</span>
                    <span className="text-sm font-normal opacity-60">{difficulty}</span>
                  </DialogTitle>
                </DialogHeader>

                {/* Progress & Timer */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-bold text-violet-600">Q{current + 1}</span>
                    <span className="opacity-50">/ {questions.length}</span>
                    <div className="flex gap-1 ml-2">
                      {questions.map((_, i) => (
                        <div key={i} className={`h-1.5 w-5 rounded-full ${i < current ? "bg-violet-500" : i === current ? "bg-violet-300" : "bg-gray-200"}`} />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs opacity-60">Total: {formatTime(totalTime)}</span>
                    <div className={`flex items-center gap-1 font-bold text-sm px-3 py-1 rounded-full ${timeLeft <= 10 ? "bg-red-100 text-red-600" : "bg-violet-100 text-violet-600"}`}>
                      <Timer size={14} /> {timeLeft}s
                    </div>
                  </div>
                </div>

                {/* Question */}
                <div className="p-4 rounded-lg bg-violet-50 dark:bg-violet-950/30 border border-violet-200">
                  <div className="flex items-start gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 mt-0.5 ${questions[current].difficulty === "Hard" ? "bg-red-100 text-red-600" : questions[current].difficulty === "Medium" ? "bg-yellow-100 text-yellow-600" : "bg-green-100 text-green-600"}`}>
                      {questions[current].difficulty}
                    </span>
                    <p className="font-medium text-sm leading-relaxed">{questions[current].question}</p>
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-2">
                  {questions[current].options.map((opt, i) => {
                    let className = "w-full text-left p-3 rounded-lg border-2 transition-all text-sm ";
                    if (selected !== null) {
                      if (i === questions[current].correct) className += "border-green-500 bg-green-50 dark:bg-green-950/30";
                      else if (i === selected) className += "border-red-500 bg-red-50 dark:bg-red-950/30";
                      else className += "border-gray-200 opacity-50";
                    } else {
                      className += selected === i ? "border-violet-500 bg-violet-50" : "border-gray-200 hover:border-violet-300 cursor-pointer";
                    }
                    return (
                      <button key={i} disabled={selected !== null} onClick={() => setSelected(i)} className={className}>
                        <span className="font-bold mr-2 text-violet-600">{["A", "B", "C", "D"][i]}.</span>
                        {opt}
                        {selected !== null && i === questions[current].correct && <CheckCircle2 size={16} className="inline ml-2 text-green-600" />}
                        {selected !== null && i === selected && i !== questions[current].correct && <XCircle size={16} className="inline ml-2 text-red-500" />}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation */}
                {selected !== null && (
                  <div className={`p-4 rounded-lg border text-sm ${selected === questions[current].correct ? "bg-green-50 dark:bg-green-950/30 border-green-200" : "bg-red-50 dark:bg-red-950/30 border-red-200"}`}>
                    <p className="font-semibold mb-1">{selected === questions[current].correct ? "✅ Correct!" : "❌ Incorrect!"}</p>
                    <p className="opacity-80">{questions[current].explanation}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  {selected === null ? (
                    <Button onClick={() => handleNext(-1)} variant="outline" className="flex-1 gap-2 text-sm">
                      Skip <ArrowRight size={15} />
                    </Button>
                  ) : (
                    <Button onClick={() => handleNext(selected)} className="w-full gap-2 bg-violet-600 hover:bg-violet-700">
                      {current + 1 === questions.length ? "See Results" : "Next Question"} <ArrowRight size={16} />
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* ── Results Screen ── */}
            {screen === "results" && (
              <div className="space-y-5 py-4">
                <DialogHeader>
                  <DialogTitle className="text-2xl flex items-center gap-2">
                    <Trophy className="text-yellow-500" /> NCAT Results
                  </DialogTitle>
                </DialogHeader>

                {/* Score card */}
                <div className={`p-6 rounded-lg border-2 text-center ${pct >= 80 ? "bg-green-50 dark:bg-green-950/30 border-green-200" : pct >= 60 ? "bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200" : "bg-red-50 dark:bg-red-950/30 border-red-200"}`}>
                  <div className={`text-5xl font-bold ${pct >= 80 ? "text-green-600" : pct >= 60 ? "text-yellow-600" : "text-red-500"}`}>{pct}%</div>
                  <p className="text-lg font-semibold mt-2 opacity-80">
                    {pct >= 80 ? "Excellent! 🏆" : pct >= 60 ? "Good! 👍" : pct >= 40 ? "Average 📈" : "Keep Practicing 💪"}
                  </p>
                  <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                    <span className="text-green-600 font-bold">✅ {score} Correct</span>
                    <span className="text-red-500 font-bold">❌ {questions.length - score} Wrong</span>
                    <span className="text-blue-600 font-bold">⏱ {formatTime(totalTime)}</span>
                  </div>
                </div>

                {/* Question review */}
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2"><BookOpen size={16} className="text-violet-600" /> Question Review</h3>
                  {questions.map((q, i) => (
                    <div key={i} className={`p-4 rounded-lg border text-sm ${answers[i] === q.correct ? "border-green-200 bg-green-50 dark:bg-green-950/20" : "border-red-200 bg-red-50 dark:bg-red-950/20"}`}>
                      <div className="flex items-start gap-2 mb-2">
                        {answers[i] === q.correct ? <CheckCircle2 size={15} className="text-green-600 shrink-0 mt-0.5" /> : <XCircle size={15} className="text-red-500 shrink-0 mt-0.5" />}
                        <p className="font-medium">{q.question}</p>
                      </div>
                      <p className="text-xs opacity-70 ml-5">
                        <span className="font-medium">Correct: </span>{q.options[q.correct]}
                        {answers[i] !== q.correct && answers[i] !== -1 && <span className="ml-2 text-red-500">| Your answer: {q.options[answers[i]]}</span>}
                        {answers[i] === -1 && <span className="ml-2 text-yellow-600">| Skipped</span>}
                      </p>
                      <p className="text-xs opacity-60 ml-5 mt-1">{q.explanation}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button onClick={() => { setScreen("setup"); setCategory(""); }} variant="outline" className="flex-1">
                    <RotateCcw size={15} className="mr-2" /> Change Category
                  </Button>
                  <Button onClick={() => { resetAll(); startTest(); }} className="flex-1 bg-violet-600 hover:bg-violet-700 gap-2">
                    <Sparkles size={15} /> Retry Same
                  </Button>
                </div>
              </div>
            )}

          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

// ─── Static Fallback Questions ────────────────────────────────────────────────
function getStaticQuestions(category: string): NCATQuestion[] {
  return [
    { question: "If 6 workers finish a job in 8 days, how many days for 4 workers?", options: ["10", "12", "14", "16"], correct: 1, explanation: "6×8=48 total work. 48÷4=12 days.", difficulty: "Medium" },
    { question: "What is 25% of 480?", options: ["100", "110", "120", "130"], correct: 2, explanation: "25% = 1/4. 480÷4 = 120.", difficulty: "Easy" },
    { question: "Next in series: 3, 6, 11, 18, 27, ?", options: ["36", "38", "40", "38"], correct: 2, explanation: "Differences: 3,5,7,9,11. Next = 27+13=40.", difficulty: "Medium" },
    { question: "A train 150m long passes a pole in 15s. Speed in km/h?", options: ["32", "36", "40", "45"], correct: 1, explanation: "Speed = 150/15 = 10 m/s = 36 km/h.", difficulty: "Medium" },
    { question: "Odd one out: 8, 27, 64, 100, 125", options: ["8", "27", "100", "125"], correct: 2, explanation: "100 is not a perfect cube. Others are 2³,3³,4³,5³.", difficulty: "Easy" },
    { question: "If A=1, B=2... Z=26, what is VALUE of 'CAT'?", options: ["22", "24", "26", "28"], correct: 1, explanation: "C=3, A=1, T=20. Sum=24.", difficulty: "Easy" },
    { question: "A can do a job in 12 days, B in 15 days. Together in?", options: ["6", "6.67", "7", "7.5"], correct: 1, explanation: "1/12+1/15 = 9/60 = 3/20. So 20/3 ≈ 6.67 days.", difficulty: "Hard" },
    { question: "Find the missing: 2, 6, 12, 20, 30, ?", options: ["40", "42", "44", "46"], correct: 1, explanation: "Pattern: n(n+1). Next: 6×7=42.", difficulty: "Medium" },
    { question: "Simple interest on ₹1000 at 5% for 3 years?", options: ["₹100", "₹150", "₹200", "₹250"], correct: 1, explanation: "SI = P×R×T/100 = 1000×5×3/100 = 150.", difficulty: "Easy" },
    { question: "Which is largest? 2/3, 3/4, 4/5, 5/6", options: ["2/3", "3/4", "4/5", "5/6"], correct: 3, explanation: "Convert to decimals: 0.67, 0.75, 0.80, 0.833. 5/6 is largest.", difficulty: "Easy" },
  ];
}

export default NCAT;
