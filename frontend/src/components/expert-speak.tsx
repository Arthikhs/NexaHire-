"use client";
import { utils_service } from "@/context/AppContext";
import axios from "axios";
import {
  ArrowRight, Loader2, Mic, BookOpen, Lightbulb,
  Code2, TrendingUp, Star, Users, Clock, ChevronDown, ChevronUp,
} from "lucide-react";
import React, { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import toast from "react-hot-toast";

const EXPERT_TYPES = [
  { id: "Senior Software Engineer", label: "Software Engineer", icon: "💻", company: "Google / Meta" },
  { id: "Engineering Manager", label: "Engineering Manager", icon: "👔", company: "Amazon / Microsoft" },
  { id: "Data Scientist", label: "Data Scientist", icon: "📊", company: "Netflix / Uber" },
  { id: "DevOps Engineer", label: "DevOps Expert", icon: "⚙️", company: "Stripe / Shopify" },
  { id: "Product Manager", label: "Product Manager", icon: "🎯", company: "Apple / Airbnb" },
  { id: "AI/ML Engineer", label: "AI/ML Engineer", icon: "🤖", company: "OpenAI / DeepMind" },
  { id: "Startup Founder", label: "Startup Founder", icon: "🚀", company: "YC Alumni" },
  { id: "Career Coach", label: "Career Coach", icon: "🏆", company: "LinkedIn Top Voice" },
];

const DURATIONS = ["3 minutes", "5 minutes", "10 minutes", "15 minutes"];

const SUGGESTED_TOPICS = [
  "How to crack FAANG interviews", "System Design for Beginners",
  "Building scalable microservices", "Career growth as a developer",
  "How AI is changing software development", "From Junior to Senior Engineer",
  "Building in public and personal branding", "Remote work best practices",
];

interface KeyPoint { heading: string; content: string; example: string; }
interface ExpertTalkResponse {
  title: string; expert: string; duration: string;
  introduction: string; keyPoints: KeyPoint[];
  codeSnippet: string; industryInsights: string[];
  careerAdvice: string; conclusion: string; resources: string[];
}

const ExpertSpeak = () => {
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState("");
  const [expertType, setExpertType] = useState("");
  const [duration, setDuration] = useState("5 minutes");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ExpertTalkResponse | null>(null);
  const [expandedPoint, setExpandedPoint] = useState<number | null>(0);
  const [speaking, setSpeaking] = useState(false);

  const generate = async () => {
    if (!topic.trim()) { toast.error("Enter a topic"); return; }
    if (!expertType) { toast.error("Select an expert type"); return; }
    setLoading(true);
    try {
      const { data } = await axios.post(`${utils_service}/api/utils/expert-speak`, {
        topic, expertType, duration,
      });
      setResponse(data);
      setExpandedPoint(0);
      toast.success("Expert talk generated!");
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to generate talk");
    } finally { setLoading(false); }
  };

  const speakText = (text: string) => {
    if (!window.speechSynthesis) { toast.error("Speech not supported in this browser"); return; }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; utterance.pitch = 1;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => { window.speechSynthesis.cancel(); setSpeaking(false); };

  const reset = () => {
    setResponse(null); setTopic(""); setExpertType("");
    setDuration("5 minutes"); setExpandedPoint(null);
    stopSpeaking(); setOpen(false);
  };

  const selectedExpert = EXPERT_TYPES.find((e) => e.id === expertType);

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-rose-50 dark:bg-rose-950/30 mb-4">
          <Mic size={16} className="text-rose-600" />
          <span className="text-sm font-medium">AI Expert Conference</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Expert <span className="text-rose-600">Speak</span>
        </h2>
        <p className="text-lg opacity-70 max-w-2xl mx-auto mb-8">
          Pick a topic → AI delivers a world-class expert talk just like a conference session from top tech professionals.
        </p>

        {/* Expert preview */}
        <div className="grid grid-cols-4 md:grid-cols-8 gap-2 max-w-3xl mx-auto mb-8">
          {EXPERT_TYPES.map((e) => (
            <div key={e.id} className="p-2 rounded-lg border text-center">
              <div className="text-xl mb-1">{e.icon}</div>
              <p className="text-xs opacity-60">{e.label.split(" ")[0]}</p>
            </div>
          ))}
        </div>

        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2 h-12 px-8 bg-rose-600 hover:bg-rose-700">
              <Mic size={18} /> Start Expert Talk <ArrowRight size={18} />
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {!response ? (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl flex items-center gap-2">
                    <Mic className="text-rose-600" /> Expert Speak Setup
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-5 py-4">
                  {/* Topic */}
                  <div className="space-y-2">
                    <Label>Talk Topic <span className="text-red-500">*</span></Label>
                    <Input placeholder="e.g., How to crack FAANG interviews..."
                      value={topic} onChange={(e) => setTopic(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && generate()} className="h-11" />
                    {/* Suggested topics */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {SUGGESTED_TOPICS.map((t) => (
                        <button key={t} onClick={() => setTopic(t)}
                          className="text-xs px-3 py-1 rounded-full border hover:border-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all">
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Expert Type */}
                  <div className="space-y-2">
                    <Label>Choose Expert <span className="text-red-500">*</span></Label>
                    <div className="grid grid-cols-2 gap-2">
                      {EXPERT_TYPES.map((e) => (
                        <button key={e.id} onClick={() => setExpertType(e.id)}
                          className={`p-3 rounded-lg border-2 text-left transition-all ${expertType === e.id ? "border-rose-500 bg-rose-50 dark:bg-rose-950/30" : "border-gray-200 hover:border-rose-300"}`}>
                          <span className="text-lg mr-2">{e.icon}</span>
                          <span className="font-semibold text-sm">{e.label}</span>
                          <p className="text-xs opacity-50 mt-0.5">{e.company}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="space-y-2">
                    <Label>Talk Duration</Label>
                    <div className="flex gap-2">
                      {DURATIONS.map((d) => (
                        <button key={d} onClick={() => setDuration(d)}
                          className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-all ${duration === d ? "border-rose-500 bg-rose-50 dark:bg-rose-950/30 text-rose-700" : "border-gray-200 hover:border-rose-300"}`}>
                          <Clock size={12} className="inline mr-1" />{d}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button onClick={generate} disabled={loading || !topic || !expertType} className="w-full h-11 gap-2 bg-rose-600 hover:bg-rose-700">
                    {loading ? <><Loader2 size={18} className="animate-spin" /> Generating Talk...</> : <><Mic size={18} /> Generate Expert Talk</>}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle className="text-xl flex items-center gap-2">
                    <Mic className="text-rose-600" /> {response.title}
                  </DialogTitle>
                  {/* Expert badge */}
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/30 border border-rose-200">
                      <span className="text-lg">{selectedExpert?.icon}</span>
                      <div>
                        <p className="text-xs font-bold">{response.expert}</p>
                        <p className="text-xs opacity-60">{selectedExpert?.company}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs opacity-60">
                      <Clock size={12} /> {response.duration}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-yellow-600">
                      <Star size={12} fill="currentColor" /> Expert Talk
                    </div>
                  </div>
                </DialogHeader>

                <div className="space-y-5 py-4">
                  {/* Listen button */}
                  <div className="flex gap-2">
                    <Button onClick={() => speakText(`${response.introduction}. ${response.keyPoints.map(k => `${k.heading}. ${k.content}`).join(". ")}. ${response.conclusion}`)}
                      disabled={speaking} variant="outline" className="gap-2 flex-1 border-rose-300 text-rose-600">
                      <Mic size={16} /> {speaking ? "Speaking..." : "🔊 Listen to Talk"}
                    </Button>
                    {speaking && <Button onClick={stopSpeaking} variant="destructive" className="gap-2">Stop</Button>}
                  </div>

                  {/* Introduction */}
                  <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200">
                    <h3 className="font-semibold mb-2 flex items-center gap-2 text-rose-700">
                      <Mic size={16} /> Opening
                    </h3>
                    <p className="text-sm leading-relaxed opacity-90">{response.introduction}</p>
                  </div>

                  {/* Key Points */}
                  <div className="space-y-2">
                    <h3 className="font-semibold flex items-center gap-2">
                      <BookOpen size={16} className="text-rose-600" /> Key Points
                    </h3>
                    {response.keyPoints?.map((point, i) => (
                      <div key={i} className="rounded-lg border overflow-hidden">
                        <button onClick={() => setExpandedPoint(expandedPoint === i ? null : i)}
                          className="w-full p-4 text-left flex items-center justify-between hover:bg-secondary transition-colors">
                          <div className="flex items-center gap-3">
                            <span className="h-7 w-7 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 text-sm font-bold flex items-center justify-center shrink-0">
                              {i + 1}
                            </span>
                            <span className="font-semibold text-sm">{point.heading}</span>
                          </div>
                          {expandedPoint === i ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                        {expandedPoint === i && (
                          <div className="px-4 pb-4 space-y-3 border-t">
                            <p className="text-sm leading-relaxed opacity-80 pt-3">{point.content}</p>
                            {point.example && (
                              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200">
                                <p className="text-xs font-semibold text-blue-600 mb-1">💡 Real World Example</p>
                                <p className="text-sm opacity-80">{point.example}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Code snippet */}
                  {response.codeSnippet && (
                    <div className="rounded-lg overflow-hidden border">
                      <div className="px-4 py-2 bg-gray-800 flex items-center gap-2">
                        <Code2 size={14} className="text-green-400" />
                        <span className="text-xs text-gray-400">Code Example</span>
                      </div>
                      <pre className="p-4 bg-gray-900 text-green-400 text-xs overflow-x-auto">
                        {response.codeSnippet}
                      </pre>
                    </div>
                  )}

                  {/* Industry Insights */}
                  <div className="p-4 rounded-lg border bg-purple-50 dark:bg-purple-950/30 border-purple-200">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <TrendingUp size={16} className="text-purple-600" /> Industry Insights
                    </h3>
                    <ul className="space-y-2">
                      {response.industryInsights?.map((insight, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <span className="text-purple-600 mt-0.5">→</span>
                          <span className="opacity-80">{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Career Advice */}
                  <div className="p-4 rounded-lg border bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Users size={16} className="text-yellow-600" /> Personal Career Advice
                    </h3>
                    <p className="text-sm opacity-80 leading-relaxed">{response.careerAdvice}</p>
                  </div>

                  {/* Conclusion */}
                  <div className="p-4 rounded-lg border bg-green-50 dark:bg-green-950/30 border-green-200">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Mic size={16} className="text-green-600" /> Closing Note
                    </h3>
                    <p className="text-sm opacity-80 leading-relaxed italic">"{response.conclusion}"</p>
                  </div>

                  {/* Resources */}
                  <div className="p-4 rounded-lg border">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Lightbulb size={16} className="text-rose-600" /> Recommended Resources
                    </h3>
                    <ul className="space-y-1">
                      {response.resources?.map((r, i) => (
                        <li key={i} className="text-sm flex items-center gap-2">
                          <span className="h-5 w-5 rounded-full bg-rose-100 text-rose-600 text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                          <span className="opacity-80">{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button onClick={() => { setResponse(null); stopSpeaking(); }} variant="outline" className="w-full">
                    Generate Another Talk
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

export default ExpertSpeak;
