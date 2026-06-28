"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { utils_service } from "@/context/AppContext";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Mic,
  Sparkles,
  Plus,
  Trash2,
  Loader2,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface QA {
  question: string;
  answer: string;
}

interface QuestionFeedback {
  question: string;
  score: number;
  feedback: string;
  whatWasGood: string;
  improvement: string;
  idealAnswer: string;
}

interface FeedbackResult {
  overallScore: number;
  overallFeedback: string;
  questionFeedback: QuestionFeedback[];
  strengths: string[];
  areasToImprove: string[];
  nextSteps: string[];
  verdict: string;
}

const verdictColor: Record<string, string> = {
  "Strong Pass": "bg-green-100 dark:bg-green-900/30 text-green-600",
  Pass: "bg-blue-100 dark:bg-blue-900/30 text-blue-600",
  Borderline: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600",
  Fail: "bg-red-100 dark:bg-red-900/30 text-red-600",
};

const scoreColor = (s: number) =>
  s >= 75 ? "text-green-500" : s >= 50 ? "text-yellow-500" : "text-red-500";

const scoreBg = (s: number) =>
  s >= 75
    ? "bg-green-500"
    : s >= 50
    ? "bg-yellow-500"
    : "bg-red-500";

const InterviewFeedback = () => {
  const [role, setRole] = useState("");
  const [round, setRound] = useState("Technical");
  const [questions, setQuestions] = useState<QA[]>([{ question: "", answer: "" }]);
  const [result, setResult] = useState<FeedbackResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);

  const updateQA = (i: number, field: keyof QA, value: string) => {
    setQuestions((prev) => prev.map((q, idx) => idx === i ? { ...q, [field]: value } : q));
  };

  const addQA = () => setQuestions((prev) => [...prev, { question: "", answer: "" }]);

  const removeQA = (i: number) => {
    if (questions.length === 1) return;
    setQuestions((prev) => prev.filter((_, idx) => idx !== i));
  };

  const analyze = async () => {
    const valid = questions.every((q) => q.question.trim() && q.answer.trim());
    if (!valid) {
      toast.error("Fill in all questions and answers");
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.post(`${utils_service}/api/utils/interview-feedback`, {
        role,
        round,
        questions,
      });
      setResult(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to analyze interview");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setQuestions([{ question: "", answer: "" }]);
    setExpanded(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-orange-50 dark:bg-orange-950/30 mb-4">
          <Mic size={16} className="text-orange-500" />
          <span className="text-sm font-medium">AI Interview Coach</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Interview Feedback Analyzer</h1>
        <p className="opacity-60 max-w-xl mx-auto">
          Paste your interview Q&A and get detailed AI feedback, scores, and improvement tips.
        </p>
      </div>

      {!result ? (
        <div className="space-y-6">
          {/* Config */}
          <Card className="p-6 border-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium opacity-70 mb-1 block">Target Role</label>
                <input
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Backend Engineer"
                  className="w-full px-3 py-2 rounded-lg border-2 bg-background text-sm focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-sm font-medium opacity-70 mb-1 block">Interview Round</label>
                <select
                  value={round}
                  onChange={(e) => setRound(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border-2 bg-background text-sm focus:outline-none focus:border-orange-500 transition-colors"
                >
                  {["Technical", "HR", "Managerial", "System Design", "Aptitude", "Behavioural"].map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          {/* Q&A inputs */}
          <div className="space-y-4">
            {questions.map((qa, i) => (
              <Card key={i} className="p-5 border-2 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold opacity-60">Question {i + 1}</span>
                  {questions.length > 1 && (
                    <button onClick={() => removeQA(i)} className="text-red-400 hover:text-red-600 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
                <input
                  value={qa.question}
                  onChange={(e) => updateQA(i, "question", e.target.value)}
                  placeholder="e.g. Explain the difference between REST and GraphQL"
                  className="w-full px-3 py-2 rounded-lg border-2 bg-background text-sm focus:outline-none focus:border-orange-500 transition-colors"
                />
                <textarea
                  value={qa.answer}
                  onChange={(e) => updateQA(i, "answer", e.target.value)}
                  placeholder="Your answer here..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border-2 bg-background text-sm focus:outline-none focus:border-orange-500 transition-colors resize-none"
                />
              </Card>
            ))}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={addQA} className="gap-2">
              <Plus size={15} /> Add Question
            </Button>
            <Button onClick={analyze} disabled={loading} className="flex-1 gap-2 bg-orange-500 hover:bg-orange-600">
              {loading ? <><Loader2 size={16} className="animate-spin" /> Analyzing...</> : <><Sparkles size={16} /> Analyze My Interview</>}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Overall score */}
          <Card className="p-6 border-2">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="text-center shrink-0">
                <p className="text-xs font-semibold opacity-50 mb-1">OVERALL SCORE</p>
                <p className={`text-6xl font-bold ${scoreColor(result.overallScore)}`}>
                  {result.overallScore}
                </p>
                <p className="text-xs opacity-50">/ 100</p>
                <div className="w-24 bg-secondary rounded-full h-2 mt-2 mx-auto">
                  <div className={`h-2 rounded-full ${scoreBg(result.overallScore)}`} style={{ width: `${result.overallScore}%` }} />
                </div>
              </div>

              <div className="flex-1 space-y-3">
                <div className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold ${verdictColor[result.verdict] || "bg-secondary"}`}>
                  {result.verdict}
                </div>
                <p className="text-sm opacity-75 leading-relaxed">{result.overallFeedback}</p>
              </div>
            </div>
          </Card>

          {/* Strengths & Areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-5 border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20">
              <h3 className="font-semibold text-sm text-green-700 dark:text-green-400 mb-3 flex items-center gap-2">
                <CheckCircle2 size={16} /> Strengths
              </h3>
              <ul className="space-y-1.5">
                {result.strengths.map((s, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span className="opacity-80">{s}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-5 border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20">
              <h3 className="font-semibold text-sm text-red-600 mb-3 flex items-center gap-2">
                <XCircle size={16} /> Areas to Improve
              </h3>
              <ul className="space-y-1.5">
                {result.areasToImprove.map((a, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="text-red-400 mt-0.5">✗</span>
                    <span className="opacity-80">{a}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Per-question feedback */}
          <div className="space-y-3">
            <h2 className="font-bold text-lg">Question-by-Question Feedback</h2>
            {result.questionFeedback.map((qf, i) => (
              <Card key={i} className="border-2 overflow-hidden">
                <button
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-accent transition-colors"
                  onClick={() => setExpanded(expanded === i ? null : i)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className={`text-lg font-bold shrink-0 ${scoreColor(qf.score)}`}>{qf.score}</span>
                    <p className="text-sm font-medium truncate">{qf.question}</p>
                  </div>
                  {expanded === i ? <ChevronUp size={16} className="shrink-0" /> : <ChevronDown size={16} className="shrink-0" />}
                </button>

                {expanded === i && (
                  <div className="px-5 pb-5 space-y-3 border-t pt-4">
                    <div className="w-full bg-secondary rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${scoreBg(qf.score)}`} style={{ width: `${qf.score}%` }} />
                    </div>
                    <p className="text-sm opacity-75">{qf.feedback}</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {[
                        { label: "✓ What was good", value: qf.whatWasGood, color: "border-green-200 dark:border-green-800" },
                        { label: "↑ Improvement", value: qf.improvement, color: "border-yellow-200 dark:border-yellow-800" },
                        { label: "★ Ideal answer", value: qf.idealAnswer, color: "border-blue-200 dark:border-blue-800" },
                      ].map(({ label, value, color }) => (
                        <div key={label} className={`p-3 rounded-lg border-2 ${color} bg-background`}>
                          <p className="text-xs font-semibold opacity-60 mb-1">{label}</p>
                          <p className="text-xs opacity-80 leading-relaxed">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>

          {/* Next steps */}
          {result.nextSteps?.length > 0 && (
            <Card className="p-5 border-2">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Sparkles size={16} className="text-orange-500" /> Next Steps
              </h3>
              <ol className="space-y-2">
                {result.nextSteps.map((step, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="font-bold text-orange-500 shrink-0">{i + 1}.</span>
                    <span className="opacity-80">{step}</span>
                  </li>
                ))}
              </ol>
            </Card>
          )}

          <Button variant="outline" onClick={reset} className="w-full gap-2">
            <Mic size={15} /> Analyze Another Interview
          </Button>
        </div>
      )}
    </div>
  );
};

export default InterviewFeedback;
