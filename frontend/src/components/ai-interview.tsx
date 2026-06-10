"use client";
import { utils_service } from "@/context/AppContext";
import axios from "axios";
import {
  ArrowRight,
  Loader2,
  Mic,
  X,
  Brain,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
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

interface Question {
  question: string;
  tip: string;
}

interface InterviewResponse {
  jobRole: string;
  questions: Question[];
  generalTips: string[];
  summary: string;
}

const experienceLevels = [
  "Fresher (0 years)",
  "1 year",
  "2 years",
  "3 years",
  "4 years",
  "5 years",
  "6-8 years",
  "9-10 years",
  "10+ years",
];

const AiInterview = () => {
  const [open, setOpen] = useState(false);
  const [jobRole, setJobRole] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [currentSkill, setCurrentSkill] = useState("");
  const [experience, setExperience] = useState("");
  const [currentCompany, setCurrentCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<InterviewResponse | null>(null);

  const addSkill = () => {
    if (currentSkill.trim() && !skills.includes(currentSkill.trim())) {
      setSkills([...skills, currentSkill.trim()]);
      setCurrentSkill("");
    }
  };

  const removeSkill = (s: string) => setSkills(skills.filter((sk) => sk !== s));

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") addSkill();
  };

  const getInterviewQuestions = async () => {
    if (!jobRole.trim()) {
      toast.error("Please enter a job role");
      return;
    }
    if (skills.length === 0) {
      toast.error("Please add at least one skill");
      return;
    }

    setLoading(true);
    try {
      const expContext = experience ? `Experience: ${experience}.` : "";
      const companyContext = currentCompany ? `Currently working at: ${currentCompany}.` : "";
      const prompt = `You are an expert technical interviewer. Generate interview questions for a ${jobRole} role with skills: ${skills.join(", ")}. ${expContext} ${companyContext} Generate exactly 8 questions covering technical, behavioral, and situational aspects.`;

      const { data } = await axios.post(`${utils_service}/api/utils/career`, {
        skills: `Generate interview questions for ${jobRole} role. Skills: ${skills.join(", ")}. ${expContext} ${companyContext} ${prompt}`,
      });

      // Parse if it's a career guide response, otherwise use direct
      if (data.questions) {
        setResponse(data);
      } else {
        // fallback: generate structured response from career data
        const questions: Question[] = [];
        if (data.jobOptions) {
          data.jobOptions.forEach((job: any, i: number) => {
            questions.push({
              question: `Tell me about your experience with ${skills[i % skills.length] || jobRole}?`,
              tip: job.why || "Be specific with examples",
            });
          });
        }
        setResponse({
          jobRole,
          questions:
            questions.length > 0
              ? questions
              : [
                  {
                    question: `What are your key strengths for a ${jobRole} role?`,
                    tip: "Focus on technical and soft skills",
                  },
                ],
          generalTips: data.learningApproach?.points || [
            "Research the company before the interview",
            "Prepare examples using the STAR method",
            "Ask thoughtful questions at the end",
          ],
          summary: data.summary || `Prepared interview guide for ${jobRole}`,
        });
      }
      toast.success("Interview questions generated!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to generate questions");
    } finally {
      setLoading(false);
    }
  };

  const resetDialog = () => {
    setJobRole("");
    setSkills([]);
    setCurrentSkill("");
    setExperience("");
    setCurrentCompany("");
    setResponse(null);
    setOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-purple-50 dark:bg-purple-950/30 mb-4">
          <Mic size={16} className="text-purple-600" />
          <span className="text-sm font-medium">AI-Powered Interview Prep</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ace Your Next Interview
        </h2>
        <p className="text-lg opacity-70 max-w-2xl mx-auto mb-8">
          Get personalized interview questions and expert tips based on your
          target role and skills.
        </p>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2 h-12 px-8">
              <Brain size={18} />
              Prepare for Interview
              <ArrowRight size={18} />
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {!response ? (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl flex items-center gap-2">
                    <Brain className="text-purple-600" />
                    Interview Preparation
                  </DialogTitle>
                  <DialogDescription>
                    Enter your target job role and skills to get tailored
                    interview questions
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="jobRole">Target Job Role</Label>
                    <Input
                      id="jobRole"
                      placeholder="e.g., Frontend Developer, Data Scientist..."
                      value={jobRole}
                      onChange={(e) => setJobRole(e.target.value)}
                      className="h-11"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="experience">Years of Experience</Label>
                      <select
                        id="experience"
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        className="w-full h-11 px-3 border-2 border-gray-300 rounded-md bg-transparent text-sm"
                      >
                        <option value="">Select experience</option>
                        {experienceLevels.map((level) => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currentCompany">Current/Last Company</Label>
                      <Input
                        id="currentCompany"
                        placeholder="e.g., Google, TCS... (optional)"
                        value={currentCompany}
                        onChange={(e) => setCurrentCompany(e.target.value)}
                        className="h-11"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="skill">Your Skills</Label>
                    <div className="flex gap-2">
                      <Input
                        id="skill"
                        placeholder="e.g., React, Node.js, Python..."
                        value={currentSkill}
                        onChange={(e) => setCurrentSkill(e.target.value)}
                        className="h-11"
                        onKeyPress={handleKeyPress}
                      />
                      <Button onClick={addSkill}>Add</Button>
                    </div>
                  </div>

                  {skills.length > 0 && (
                    <div className="space-y-2">
                      <Label>Your Skills ({skills.length})</Label>
                      <div className="flex flex-wrap gap-2">
                        {skills.map((s) => (
                          <div
                            key={s}
                            className="inline-flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800"
                          >
                            <span className="text-sm font-medium">{s}</span>
                            <button
                              onClick={() => removeSkill(s)}
                              className="h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={getInterviewQuestions}
                    disabled={loading || !jobRole || skills.length === 0}
                    className="w-full h-11 gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Generating Questions...
                      </>
                    ) : (
                      <>
                        <Brain size={18} />
                        Generate Interview Questions
                      </>
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl flex items-center gap-2">
                    <Brain className="text-purple-600" />
                    Interview Questions for {response.jobRole}
                  </DialogTitle>
                  {(experience || currentCompany) && (
                    <div className="flex gap-3 flex-wrap mt-1">
                      {experience && (
                        <span className="text-xs px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 border border-purple-200">
                          {experience}
                        </span>
                      )}
                      {currentCompany && (
                        <span className="text-xs px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 border border-blue-200">
                          {currentCompany}
                        </span>
                      )}
                    </div>
                  )}
                </DialogHeader>

                <div className="space-y-6 py-4">
                  {/* Summary */}
                  <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
                    <p className="text-sm leading-relaxed">{response.summary}</p>
                  </div>

                  {/* Questions */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <ChevronRight size={20} className="text-purple-600" />
                      Interview Questions
                    </h3>
                    <div className="space-y-3">
                      {response.questions.map((q, index) => (
                        <div key={index} className="p-4 rounded-lg border hover:border-purple-500 transition-colors">
                          <div className="flex items-start gap-3">
                            <span className="h-7 w-7 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 text-sm font-bold flex items-center justify-center shrink-0 mt-0.5">
                              {index + 1}
                            </span>
                            <div className="space-y-2">
                              <p className="font-medium text-sm">{q.question}</p>
                              <div className="flex items-start gap-2 text-xs opacity-70">
                                <CheckCircle2 size={14} className="text-green-600 mt-0.5 shrink-0" />
                                <span><span className="font-medium">Tip: </span>{q.tip}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* General Tips */}
                  <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <AlertTriangle size={18} className="text-green-600" />
                      General Interview Tips
                    </h3>
                    <ul className="space-y-2">
                      {response.generalTips.map((tip, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <span className="text-green-600 mt-0.5">✓</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button onClick={resetDialog} variant="outline" className="w-full">
                    Prepare for Another Role
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

export default AiInterview;
