"use client";
import { useAppData } from "@/context/AppContext";
import { FileText, Download, Copy, ArrowRight, User, Mail, Phone, Briefcase, Code2, GraduationCap, FolderOpen } from "lucide-react";
import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import toast from "react-hot-toast";

const THEMES = [
  { id: "modern", label: "Modern", color: "bg-blue-600", text: "text-blue-600", border: "border-blue-600" },
  { id: "minimal", label: "Minimal", color: "bg-gray-900", text: "text-gray-900", border: "border-gray-900" },
  { id: "creative", label: "Creative", color: "bg-purple-600", text: "text-purple-600", border: "border-purple-600" },
  { id: "professional", label: "Professional", color: "bg-green-700", text: "text-green-700", border: "border-green-700" },
];

const ResumePortfolio = () => {
  const { user } = useAppData();
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState(THEMES[0]);
  const [preview, setPreview] = useState(false);
  const resumeRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone_number || "",
    role: "",
    summary: "",
    experience: [{ company: "", position: "", duration: "", points: "" }],
    education: [{ institution: "", degree: "", year: "" }],
    skills: user?.skills?.join(", ") || "",
    projects: [{ name: "", description: "", tech: "" }],
    linkedin: "", github: "", website: "",
  });

  const updateExp = (i: number, field: string, val: string) => {
    const arr = [...form.experience]; arr[i] = { ...arr[i], [field]: val }; setForm({ ...form, experience: arr });
  };
  const updateEdu = (i: number, field: string, val: string) => {
    const arr = [...form.education]; arr[i] = { ...arr[i], [field]: val }; setForm({ ...form, education: arr });
  };
  const updateProj = (i: number, field: string, val: string) => {
    const arr = [...form.projects]; arr[i] = { ...arr[i], [field]: val }; setForm({ ...form, projects: arr });
  };

  const copyHTML = () => {
    if (resumeRef.current) { navigator.clipboard.writeText(resumeRef.current.innerHTML); toast.success("HTML copied!"); }
  };

  const printResume = () => {
    if (!resumeRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>${form.name} Resume</title><style>body{font-family:Arial,sans-serif;margin:0;padding:20px} *{box-sizing:border-box}</style></head><body>${resumeRef.current.innerHTML}</body></html>`);
    w.document.close(); w.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 bg-secondary/30">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-pink-50 dark:bg-pink-950/30 mb-4">
          <FileText size={16} className="text-pink-600" />
          <span className="text-sm font-medium">Resume Builder</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Resume Portfolio Generator</h2>
        <p className="text-lg opacity-70 max-w-2xl mx-auto mb-8">
          Build a beautiful resume with multiple themes — print or download instantly.
        </p>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2 h-12 px-8 bg-pink-600 hover:bg-pink-700">
              <FileText size={18} /> Build My Resume <ArrowRight size={18} />
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="text-pink-600" /> Resume Portfolio Generator
              </DialogTitle>
            </DialogHeader>

            {!preview ? (
              <div className="space-y-6 py-4">
                {/* Theme */}
                <div className="space-y-2">
                  <Label>Choose Theme</Label>
                  <div className="flex gap-3">
                    {THEMES.map((t) => (
                      <button key={t.id} onClick={() => setTheme(t)}
                        className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-all ${theme.id === t.id ? `${t.border} ${t.text}` : "border-gray-200"}`}>
                        <span className={`inline-block h-3 w-3 rounded-full ${t.color} mr-2`} />{t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Personal Info */}
                <div className="space-y-3">
                  <p className="font-semibold flex items-center gap-2"><User size={15} /> Personal Info</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Full Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-10 mt-1" /></div>
                    <div><Label>Job Title/Role</Label><Input placeholder="e.g., Full Stack Developer" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="h-10 mt-1" /></div>
                    <div><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="h-10 mt-1" /></div>
                    <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="h-10 mt-1" /></div>
                    <div><Label>LinkedIn</Label><Input placeholder="linkedin.com/in/..." value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} className="h-10 mt-1" /></div>
                    <div><Label>GitHub</Label><Input placeholder="github.com/..." value={form.github} onChange={(e) => setForm({ ...form, github: e.target.value })} className="h-10 mt-1" /></div>
                  </div>
                  <div>
                    <Label>Professional Summary</Label>
                    <textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} placeholder="Write a 2-3 line professional summary..."
                      className="w-full h-20 px-3 py-2 border-2 border-gray-300 rounded-md bg-transparent text-sm resize-none focus:outline-none focus:border-pink-500 mt-1" />
                  </div>
                </div>

                {/* Experience */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold flex items-center gap-2"><Briefcase size={15} /> Experience</p>
                    <Button size="sm" variant="outline" onClick={() => setForm({ ...form, experience: [...form.experience, { company: "", position: "", duration: "", points: "" }] })}>+ Add</Button>
                  </div>
                  {form.experience.map((exp, i) => (
                    <div key={i} className="p-3 rounded-lg border space-y-2">
                      <div className="grid grid-cols-3 gap-2">
                        <Input placeholder="Company" value={exp.company} onChange={(e) => updateExp(i, "company", e.target.value)} className="h-9" />
                        <Input placeholder="Position" value={exp.position} onChange={(e) => updateExp(i, "position", e.target.value)} className="h-9" />
                        <Input placeholder="Duration (e.g. 2022-2024)" value={exp.duration} onChange={(e) => updateExp(i, "duration", e.target.value)} className="h-9" />
                      </div>
                      <textarea placeholder="Key achievements (one per line)" value={exp.points} onChange={(e) => updateExp(i, "points", e.target.value)}
                        className="w-full h-16 px-3 py-2 border-2 border-gray-300 rounded-md bg-transparent text-sm resize-none focus:outline-none focus:border-pink-500" />
                    </div>
                  ))}
                </div>

                {/* Education */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold flex items-center gap-2"><GraduationCap size={15} /> Education</p>
                    <Button size="sm" variant="outline" onClick={() => setForm({ ...form, education: [...form.education, { institution: "", degree: "", year: "" }] })}>+ Add</Button>
                  </div>
                  {form.education.map((edu, i) => (
                    <div key={i} className="grid grid-cols-3 gap-2">
                      <Input placeholder="Institution" value={edu.institution} onChange={(e) => updateEdu(i, "institution", e.target.value)} className="h-9" />
                      <Input placeholder="Degree" value={edu.degree} onChange={(e) => updateEdu(i, "degree", e.target.value)} className="h-9" />
                      <Input placeholder="Year" value={edu.year} onChange={(e) => updateEdu(i, "year", e.target.value)} className="h-9" />
                    </div>
                  ))}
                </div>

                {/* Skills */}
                <div className="space-y-2">
                  <p className="font-semibold flex items-center gap-2"><Code2 size={15} /> Skills</p>
                  <Input placeholder="React, Node.js, TypeScript, PostgreSQL..." value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} className="h-10" />
                </div>

                {/* Projects */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold flex items-center gap-2"><FolderOpen size={15} /> Projects</p>
                    <Button size="sm" variant="outline" onClick={() => setForm({ ...form, projects: [...form.projects, { name: "", description: "", tech: "" }] })}>+ Add</Button>
                  </div>
                  {form.projects.map((proj, i) => (
                    <div key={i} className="p-3 rounded-lg border space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <Input placeholder="Project Name" value={proj.name} onChange={(e) => updateProj(i, "name", e.target.value)} className="h-9" />
                        <Input placeholder="Tech Stack" value={proj.tech} onChange={(e) => updateProj(i, "tech", e.target.value)} className="h-9" />
                      </div>
                      <Input placeholder="Brief description" value={proj.description} onChange={(e) => updateProj(i, "description", e.target.value)} className="h-9" />
                    </div>
                  ))}
                </div>

                <Button onClick={() => setPreview(true)} className="w-full h-11 gap-2 bg-pink-600 hover:bg-pink-700">
                  <FileText size={18} /> Preview Resume
                </Button>
              </div>
            ) : (
              <div className="space-y-4 py-4">
                <div className="flex gap-2 mb-4">
                  <Button onClick={() => setPreview(false)} variant="outline" className="flex-1">← Edit</Button>
                  <Button onClick={copyHTML} variant="outline" className="flex-1 gap-2"><Copy size={15} /> Copy HTML</Button>
                  <Button onClick={printResume} className="flex-1 gap-2 bg-pink-600 hover:bg-pink-700"><Download size={15} /> Print / Save PDF</Button>
                </div>

                {/* Resume Preview */}
                <div ref={resumeRef} className="border-2 rounded-lg overflow-hidden bg-white text-gray-900 p-8 text-sm">
                  {/* Header */}
                  <div className={`pb-4 mb-4 border-b-4 ${theme.border}`}>
                    <h1 className={`text-3xl font-bold ${theme.text}`}>{form.name || "Your Name"}</h1>
                    <p className="text-lg opacity-70 mt-1">{form.role || "Your Role"}</p>
                    <div className="flex flex-wrap gap-4 mt-2 text-xs opacity-70">
                      {form.email && <span>📧 {form.email}</span>}
                      {form.phone && <span>📞 {form.phone}</span>}
                      {form.linkedin && <span>🔗 {form.linkedin}</span>}
                      {form.github && <span>💻 {form.github}</span>}
                    </div>
                  </div>

                  {/* Summary */}
                  {form.summary && (
                    <div className="mb-4">
                      <h2 className={`text-base font-bold ${theme.text} border-b mb-2`}>SUMMARY</h2>
                      <p className="text-sm opacity-80">{form.summary}</p>
                    </div>
                  )}

                  {/* Experience */}
                  {form.experience.some((e) => e.company) && (
                    <div className="mb-4">
                      <h2 className={`text-base font-bold ${theme.text} border-b mb-2`}>EXPERIENCE</h2>
                      {form.experience.filter((e) => e.company).map((exp, i) => (
                        <div key={i} className="mb-3">
                          <div className="flex justify-between"><span className="font-bold">{exp.position}</span><span className="text-xs opacity-60">{exp.duration}</span></div>
                          <p className="text-xs opacity-70 mb-1">{exp.company}</p>
                          {exp.points && <ul className="list-disc list-inside space-y-0.5">{exp.points.split("\n").filter(Boolean).map((p, j) => <li key={j} className="text-xs opacity-80">{p}</li>)}</ul>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Education */}
                  {form.education.some((e) => e.institution) && (
                    <div className="mb-4">
                      <h2 className={`text-base font-bold ${theme.text} border-b mb-2`}>EDUCATION</h2>
                      {form.education.filter((e) => e.institution).map((edu, i) => (
                        <div key={i} className="flex justify-between mb-1">
                          <div><span className="font-bold text-xs">{edu.degree}</span><p className="text-xs opacity-60">{edu.institution}</p></div>
                          <span className="text-xs opacity-60">{edu.year}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Skills */}
                  {form.skills && (
                    <div className="mb-4">
                      <h2 className={`text-base font-bold ${theme.text} border-b mb-2`}>SKILLS</h2>
                      <div className="flex flex-wrap gap-2">
                        {form.skills.split(",").map((s, i) => <span key={i} className={`text-xs px-2 py-0.5 rounded border ${theme.border} ${theme.text}`}>{s.trim()}</span>)}
                      </div>
                    </div>
                  )}

                  {/* Projects */}
                  {form.projects.some((p) => p.name) && (
                    <div className="mb-4">
                      <h2 className={`text-base font-bold ${theme.text} border-b mb-2`}>PROJECTS</h2>
                      {form.projects.filter((p) => p.name).map((proj, i) => (
                        <div key={i} className="mb-2">
                          <div className="flex justify-between"><span className="font-bold text-xs">{proj.name}</span><span className="text-xs opacity-60">{proj.tech}</span></div>
                          <p className="text-xs opacity-70">{proj.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ResumePortfolio;
