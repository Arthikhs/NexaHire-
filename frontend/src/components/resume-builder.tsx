"use client";
import { utils_service } from "@/context/AppContext";
import axios from "axios";
import {
  ArrowRight,
  Loader2,
  FileText,
  CheckCircle2,
  Copy,
  Sparkles,
  AlertTriangle,
  Target,
} from "lucide-react";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import toast from "react-hot-toast";

interface ResumeBuilderResponse {
  atsScore: number;
  summary: string;
  keywords: string[];
  missingKeywords: string[];
  sections: {
    objective: string;
    experience: string[];
    skills: string[];
    education: string;
    projects: string[];
  };
  tips: string[];
}

const ResumeBuilder = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ResumeBuilderResponse | null>(null);

  const [jobDescription, setJobDescription] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [experience, setExperience] = useState("");
  const [skills, setSkills] = useState("");
  const [education, setEducation] = useState("");
  const [projects, setProjects] = useState("");

  const handleGenerate = async () => {
    if (!jobDescription || !name || !skills || !experience || !education) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(`${utils_service}/api/utils/resume-builder`, {
        jobDescription,
        userInfo: { name, email, phone, experience, skills, education, projects },
      });
      setResponse(data);
      toast.success("Resume content generated!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to generate resume");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const resetDialog = () => {
    setResponse(null);
    setJobDescription("");
    setName(""); setEmail(""); setPhone("");
    setExperience(""); setSkills(""); setEducation(""); setProjects("");
    setOpen(false);
  };

  const getScoreColor = (score: number) =>
    score >= 80 ? "text-green-600" : score >= 60 ? "text-yellow-600" : "text-red-600";

  const getScoreBg = (score: number) =>
    score >= 80 ? "bg-green-100 dark:bg-green-900/30" : score >= 60 ? "bg-yellow-100 dark:bg-yellow-900/30" : "bg-red-100 dark:bg-red-900/30";

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 bg-secondary/30">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-orange-50 dark:bg-orange-950/30 mb-4">
          <FileText size={16} className="text-orange-500" />
          <span className="text-sm font-medium">AI Resume Builder</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Build ATS-Optimized Resume
        </h2>
        <p className="text-lg opacity-70 max-w-2xl mx-auto mb-8">
          Paste the job description and your details — AI will generate a
          tailored resume optimized for ATS systems.
        </p>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2 h-12 px-8">
              <Sparkles size={18} />
              Create ATS Resume
              <ArrowRight size={18} />
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {!response ? (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl flex items-center gap-2">
                    <FileText className="text-orange-500" />
                    ATS Resume Builder
                  </DialogTitle>
                  <DialogDescription>
                    Paste the job description and your info to get an ATS-optimized resume
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  {/* Job Description */}
                  <div className="space-y-2">
                    <Label>Job Description <span className="text-red-500">*</span></Label>
                    <textarea
                      placeholder="Paste the full job description here..."
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      className="w-full h-32 px-3 py-2 border-2 border-gray-300 rounded-md bg-transparent text-sm resize-none focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-sm font-semibold mb-3 opacity-70">Your Information</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label>Full Name <span className="text-red-500">*</span></Label>
                        <Input placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} className="h-10" />
                      </div>
                      <div className="space-y-1">
                        <Label>Email</Label>
                        <Input placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-10" />
                      </div>
                      <div className="space-y-1">
                        <Label>Phone</Label>
                        <Input placeholder="9876543210" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-10" />
                      </div>
                      <div className="space-y-1">
                        <Label>Experience <span className="text-red-500">*</span></Label>
                        <Input placeholder="2 years at TCS as React Developer" value={experience} onChange={(e) => setExperience(e.target.value)} className="h-10" />
                      </div>
                    </div>

                    <div className="space-y-1 mt-3">
                      <Label>Skills <span className="text-red-500">*</span></Label>
                      <Input placeholder="React, Node.js, TypeScript, PostgreSQL..." value={skills} onChange={(e) => setSkills(e.target.value)} className="h-10" />
                    </div>

                    <div className="space-y-1 mt-3">
                      <Label>Education <span className="text-red-500">*</span></Label>
                      <Input placeholder="B.Tech Computer Science, VTU, 2022" value={education} onChange={(e) => setEducation(e.target.value)} className="h-10" />
                    </div>

                    <div className="space-y-1 mt-3">
                      <Label>Projects (optional)</Label>
                      <Input placeholder="E-commerce app using React & Node.js..." value={projects} onChange={(e) => setProjects(e.target.value)} className="h-10" />
                    </div>
                  </div>

                  <Button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="w-full h-11 gap-2"
                  >
                    {loading ? (
                      <><Loader2 size={18} className="animate-spin" /> Generating Resume...</>
                    ) : (
                      <><Sparkles size={18} /> Generate ATS Resume</>
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl flex items-center gap-2">
                    <Target className="text-orange-500" />
                    Your ATS-Optimized Resume
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  {/* ATS Score */}
                  <div className={`p-6 rounded-lg ${getScoreBg(response.atsScore)} border-2 text-center`}>
                    <p className="text-sm font-medium opacity-70 mb-2">Predicted ATS Score</p>
                    <div className={`text-6xl font-bold ${getScoreColor(response.atsScore)}`}>
                      {response.atsScore}
                    </div>
                    <p className="text-sm opacity-70 mt-2">out of 100</p>
                  </div>

                  {/* Summary */}
                  <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800">
                    <p className="text-sm leading-relaxed">{response.summary}</p>
                  </div>

                  {/* Objective */}
                  <div className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">Professional Objective</h3>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(response.sections.objective)} className="gap-1 h-7 text-xs">
                        <Copy size={12} /> Copy
                      </Button>
                    </div>
                    <p className="text-sm opacity-80">{response.sections.objective}</p>
                  </div>

                  {/* Experience Bullets */}
                  <div className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">Experience Bullet Points</h3>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(response.sections.experience.join("\n"))} className="gap-1 h-7 text-xs">
                        <Copy size={12} /> Copy All
                      </Button>
                    </div>
                    <ul className="space-y-2">
                      {response.sections.experience.map((point, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <span className="text-orange-500 mt-0.5">•</span>
                          <span className="opacity-80">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Skills */}
                  <div className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">ATS-Optimized Skills</h3>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(response.sections.skills.join(", "))} className="gap-1 h-7 text-xs">
                        <Copy size={12} /> Copy
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {response.sections.skills.map((skill, i) => (
                        <span key={i} className="text-xs px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 border border-orange-200 text-orange-700 dark:text-orange-300">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Keywords Found & Missing */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200">
                      <h3 className="font-semibold text-sm mb-2 flex items-center gap-1">
                        <CheckCircle2 size={14} className="text-green-600" /> Keywords Matched
                      </h3>
                      <div className="flex flex-wrap gap-1">
                        {response.keywords.map((kw, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">{kw}</span>
                        ))}
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200">
                      <h3 className="font-semibold text-sm mb-2 flex items-center gap-1">
                        <AlertTriangle size={14} className="text-red-600" /> Missing Keywords
                      </h3>
                      <div className="flex flex-wrap gap-1">
                        {response.missingKeywords.map((kw, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">{kw}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Projects */}
                  {response.sections.projects.length > 0 && (
                    <div className="p-4 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">Project Descriptions</h3>
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(response.sections.projects.join("\n"))} className="gap-1 h-7 text-xs">
                          <Copy size={12} /> Copy All
                        </Button>
                      </div>
                      <ul className="space-y-2">
                        {response.sections.projects.map((p, i) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <span className="text-orange-500 mt-0.5">•</span>
                            <span className="opacity-80">{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Tips */}
                  <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Sparkles size={16} className="text-blue-600" /> ATS Tips for This Job
                    </h3>
                    <ul className="space-y-2">
                      {response.tips.map((tip, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <span className="text-blue-600 mt-0.5">✓</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button onClick={resetDialog} variant="outline" className="w-full">
                    Build Another Resume
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ResumeBuilder;
