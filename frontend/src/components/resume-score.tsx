"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { utils_service } from "@/context/AppContext";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FileText, Upload, CheckCircle2, Loader2, Sparkles, RotateCcw, FileSearch,
} from "lucide-react";

const verdictColor: Record<string, string> = {
  "Excellent Match": "bg-green-100 dark:bg-green-900/30 text-green-600 border-green-300",
  "Good Match": "bg-blue-100 dark:bg-blue-900/30 text-blue-600 border-blue-300",
  "Partial Match": "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 border-yellow-300",
  "Poor Match": "bg-red-100 dark:bg-red-900/30 text-red-600 border-red-300",
};

const priorityColor: Record<string, string> = {
  high: "bg-red-100 dark:bg-red-900/30 text-red-600",
  medium: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600",
  low: "bg-blue-100 dark:bg-blue-900/30 text-blue-600",
};

const scoreColor = (s: number) => s >= 75 ? "text-green-500" : s >= 50 ? "text-yellow-500" : "text-red-500";
const scoreBg = (s: number) => s >= 75 ? "bg-green-500" : s >= 50 ? "bg-yellow-500" : "bg-red-500";

const ResumeScoreVsJob = () => {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== "application/pdf") { toast.error("PDF files only"); return; }
    if (f.size > 5 * 1024 * 1024) { toast.error("Max 5MB"); return; }
    setFile(f);
  };

  const convertToBase64 = (f: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(f);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });

  const analyze = async () => {
    if (!file || !jobDescription.trim()) {
      toast.error("Upload a resume and paste the job description");
      return;
    }
    setLoading(true);
    try {
      const pdfBase64 = await convertToBase64(file);
      const { data } = await axios.post(`${utils_service}/api/utils/resume-score`, {
        pdfBase64,
        jobDescription,
      });
      setResult(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to analyze");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setFile(null);
    setJobDescription("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-blue-50 dark:bg-blue-950/30 mb-4">
          <FileSearch size={16} className="text-blue-500" />
          <span className="text-sm font-medium">AI-Powered</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Resume Score vs Job</h1>
        <p className="opacity-60 max-w-xl mx-auto">
          Upload your resume and paste a job description — AI scores how well you match.
        </p>
      </div>

      {!result ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload resume */}
          <Card className="p-6 border-2 space-y-4">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <FileText size={18} className="text-blue-500" /> Upload Resume
            </h2>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed rounded-xl p-10 text-center cursor-pointer hover:border-blue-500 transition-colors"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="h-14 w-14 rounded-full bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
                  <Upload size={26} className="text-blue-500" />
                </div>
                <div>
                  <p className="font-medium text-sm">{file ? file.name : "Click to upload PDF"}</p>
                  <p className="text-xs opacity-50 mt-1">PDF only, max 5MB</p>
                </div>
                {file && (
                  <div className="flex items-center gap-1.5 text-green-600 text-sm">
                    <CheckCircle2 size={15} /> File ready
                  </div>
                )}
              </div>
            </div>
            <input ref={fileInputRef} type="file" accept="application/pdf" onChange={handleFile} className="hidden" />
          </Card>

          {/* Job description */}
          <Card className="p-6 border-2 space-y-4">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <Sparkles size={18} className="text-blue-500" /> Job Description
            </h2>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here..."
              rows={10}
              className="w-full px-3 py-2 rounded-lg border-2 bg-background text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none"
            />
          </Card>

          <div className="lg:col-span-2">
            <Button onClick={analyze} disabled={loading} className="w-full h-12 gap-2 bg-blue-600 hover:bg-blue-700 text-base">
              {loading
                ? <><Loader2 size={18} className="animate-spin" /> Analyzing...</>
                : <><FileSearch size={18} /> Score My Resume</>}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Overall score */}
          <Card className="p-6 border-2">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="text-center shrink-0">
                <p className="text-xs font-semibold opacity-50 mb-1 uppercase tracking-wider">Match Score</p>
                <p className={`text-6xl font-bold ${scoreColor(result.overallScore)}`}>{result.overallScore}</p>
                <p className="text-xs opacity-50">/ 100</p>
                <div className="w-24 bg-secondary rounded-full h-2 mt-2 mx-auto">
                  <div className={`h-2 rounded-full ${scoreBg(result.overallScore)}`} style={{ width: `${result.overallScore}%` }} />
                </div>
              </div>
              <div className="flex-1 space-y-3">
                <div className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold border ${verdictColor[result.verdict] || "bg-secondary"}`}>
                  {result.verdict}
                </div>
                <p className="text-sm opacity-75 leading-relaxed">{result.summary}</p>
                <div className="px-4 py-2 rounded-lg bg-secondary text-sm font-medium">
                  💡 {result.recommendation}
                </div>
              </div>
            </div>
          </Card>

          {/* Score breakdown */}
          <Card className="p-6 border-2">
            <h3 className="font-bold mb-4">Score Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.scoreBreakdown && Object.entries(result.scoreBreakdown).map(([key, val]: any) => (
                <div key={key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="capitalize font-medium">{key.replace(/([A-Z])/g, " $1")}</span>
                    <span className={`font-bold ${scoreColor(val.score)}`}>{val.score}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${scoreBg(val.score)}`} style={{ width: `${val.score}%` }} />
                  </div>
                  <p className="text-xs opacity-60">{val.feedback}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Keywords */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.matchedKeywords?.length > 0 && (
              <Card className="p-5 border-2 border-green-200 dark:border-green-800">
                <h3 className="font-semibold text-sm text-green-600 mb-3">✓ Matched Keywords</h3>
                <div className="flex flex-wrap gap-1.5">
                  {result.matchedKeywords.map((k: string) => (
                    <span key={k} className="px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium">{k}</span>
                  ))}
                </div>
              </Card>
            )}
            {result.missingKeywords?.length > 0 && (
              <Card className="p-5 border-2 border-red-200 dark:border-red-800">
                <h3 className="font-semibold text-sm text-red-500 mb-3">✗ Missing Keywords</h3>
                <div className="flex flex-wrap gap-1.5">
                  {result.missingKeywords.map((k: string) => (
                    <span key={k} className="px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-medium">{k}</span>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Strengths */}
          {result.strengths?.length > 0 && (
            <Card className="p-5 border-2 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
              <h3 className="font-semibold text-sm text-green-700 dark:text-green-400 mb-3 flex items-center gap-2">
                <CheckCircle2 size={15} /> Strengths
              </h3>
              <ul className="space-y-1.5">
                {result.strengths.map((s: string, i: number) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span className="opacity-80">{s}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Improvements */}
          {result.improvements?.length > 0 && (
            <Card className="p-5 border-2">
              <h3 className="font-bold mb-3">Improvements Needed</h3>
              <div className="space-y-3">
                {result.improvements.map((imp: any, i: number) => (
                  <div key={i} className="p-4 rounded-lg border-2 bg-background">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <p className="text-sm font-medium">{imp.issue}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 ${priorityColor[imp.priority] || "bg-secondary"}`}>
                        {imp.priority}
                      </span>
                    </div>
                    <p className="text-xs opacity-70">💡 {imp.fix}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Button variant="outline" onClick={reset} className="w-full gap-2">
            <RotateCcw size={15} /> Analyze Another Resume
          </Button>
        </div>
      )}
    </div>
  );
};

export default ResumeScoreVsJob;
