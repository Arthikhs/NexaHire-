"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { utils_service, useAppData } from "@/context/AppContext";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FileText,
  Sparkles,
  Copy,
  CheckCircle2,
  Loader2,
  RotateCcw,
} from "lucide-react";

const CoverLetterGenerator = () => {
  const { user } = useAppData();

  const [form, setForm] = useState({
    jobTitle: "",
    companyName: "",
    jobDescription: "",
    candidateName: user?.name || "",
    candidateSkills: user?.skills?.join(", ") || "",
    candidateExperience: "",
  });

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const generate = async () => {
    if (!form.jobTitle || !form.jobDescription || !form.candidateName) {
      toast.error("Job title, description and your name are required");
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.post(`${utils_service}/api/utils/cover-letter`, form);
      setResult(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to generate cover letter");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result?.coverLetter) return;
    navigator.clipboard.writeText(result.coverLetter);
    setCopied(true);
    toast.success("Cover letter copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setResult(null);
    setForm((prev) => ({ ...prev, jobTitle: "", companyName: "", jobDescription: "" }));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-purple-50 dark:bg-purple-950/30 mb-4">
          <Sparkles size={16} className="text-purple-500" />
          <span className="text-sm font-medium">AI-Powered</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Cover Letter Generator</h1>
        <p className="opacity-60 max-w-xl mx-auto">
          Generate a personalized, ATS-optimized cover letter tailored to any job in seconds.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <Card className="p-6 border-2 space-y-4">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <FileText size={18} className="text-purple-500" /> Job Details
          </h2>

          {[
            { name: "jobTitle", label: "Job Title *", placeholder: "e.g. Frontend Developer" },
            { name: "companyName", label: "Company Name", placeholder: "e.g. Google" },
            { name: "candidateName", label: "Your Name *", placeholder: "e.g. John Doe" },
            { name: "candidateExperience", label: "Your Experience", placeholder: "e.g. 2 years in React, Node.js" },
            { name: "candidateSkills", label: "Your Skills", placeholder: "e.g. React, TypeScript, Node.js" },
          ].map(({ name, label, placeholder }) => (
            <div key={name}>
              <label className="text-sm font-medium opacity-70 mb-1 block">{label}</label>
              <input
                name={name}
                value={(form as any)[name]}
                onChange={handleChange}
                placeholder={placeholder}
                className="w-full px-3 py-2 rounded-lg border-2 bg-background text-sm focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          ))}

          <div>
            <label className="text-sm font-medium opacity-70 mb-1 block">Job Description *</label>
            <textarea
              name="jobDescription"
              value={form.jobDescription}
              onChange={handleChange}
              placeholder="Paste the job description here..."
              rows={5}
              className="w-full px-3 py-2 rounded-lg border-2 bg-background text-sm focus:outline-none focus:border-purple-500 transition-colors resize-none"
            />
          </div>

          <Button onClick={generate} disabled={loading} className="w-full gap-2 bg-purple-600 hover:bg-purple-700">
            {loading ? <><Loader2 size={16} className="animate-spin" /> Generating...</> : <><Sparkles size={16} /> Generate Cover Letter</>}
          </Button>
        </Card>

        {/* Result */}
        <Card className="p-6 border-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <FileText size={18} className="text-purple-500" /> Your Cover Letter
            </h2>
            {result && (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleCopy} className="gap-1.5 text-xs">
                  {copied ? <CheckCircle2 size={13} className="text-green-500" /> : <Copy size={13} />}
                  {copied ? "Copied!" : "Copy"}
                </Button>
                <Button size="sm" variant="outline" onClick={reset} className="gap-1.5 text-xs">
                  <RotateCcw size={13} /> Reset
                </Button>
              </div>
            )}
          </div>

          {!result ? (
            <div className="flex flex-col items-center justify-center h-64 opacity-40 space-y-3">
              <Sparkles size={40} />
              <p className="text-sm">Your cover letter will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Subject */}
              <div className="px-4 py-3 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
                <p className="text-xs font-semibold opacity-60 mb-1">EMAIL SUBJECT</p>
                <p className="text-sm font-medium">{result.subject}</p>
              </div>

              {/* Tone & word count */}
              <div className="flex gap-3">
                <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 text-xs font-medium">
                  {result.tone}
                </span>
                <span className="px-3 py-1 rounded-full bg-secondary text-xs font-medium opacity-70">
                  ~{result.wordCount} words
                </span>
              </div>

              {/* Cover letter body */}
              <div className="p-4 rounded-lg border-2 bg-background text-sm leading-relaxed whitespace-pre-line max-h-72 overflow-y-auto">
                {result.coverLetter}
              </div>

              {/* Key highlights */}
              {result.keyHighlights?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold opacity-60 mb-2">KEY HIGHLIGHTS</p>
                  <ul className="space-y-1">
                    {result.keyHighlights.map((h: string, i: number) => (
                      <li key={i} className="text-xs flex items-start gap-2">
                        <span className="text-purple-500 mt-0.5">✦</span>
                        <span className="opacity-80">{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default CoverLetterGenerator;
