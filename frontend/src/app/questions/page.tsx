"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { questions_service } from "@/context/AppContext";
import { useAppData } from "@/context/AppContext";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Loading from "@/components/loading";
import {
  BookOpen, Search, ThumbsUp, ThumbsDown, Plus,
  ChevronDown, ChevronUp, Filter, X,
} from "lucide-react";
import toast from "react-hot-toast";

interface Question {
  question_id: number;
  title: string;
  content: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  answer: string | null;
  companies: string[];
  tags: string[];
  created_at: string;
}

const difficultyColor: Record<string, string> = {
  Easy: "bg-green-100 dark:bg-green-900/30 text-green-600",
  Medium: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600",
  Hard: "bg-red-100 dark:bg-red-900/30 text-red-600",
};

const QuestionsPage = () => {
  const { isAuth, user } = useAppData();
  const token = Cookies.get("token");

  const [questions, setQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [companies, setCompanies] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [company, setCompany] = useState("");

  const [expanded, setExpanded] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({
    title: "", content: "", category: "", difficulty: "Medium",
    answer: "", companies: "", tags: "",
  });
  const [adding, setAdding] = useState(false);

  async function fetchQuestions() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (category) params.set("category", category);
      if (difficulty) params.set("difficulty", difficulty);
      if (company) params.set("company", company);
      const { data } = await axios.get(`${questions_service}/api/questions?${params}`);
      setQuestions(data);
    } catch (e) { console.log(e); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    async function fetchMeta() {
      try {
        const [cat, comp] = await Promise.all([
          axios.get(`${questions_service}/api/questions/categories`),
          axios.get(`${questions_service}/api/questions/companies`),
        ]);
        setCategories(cat.data);
        setCompanies(comp.data);
      } catch (e) { console.log(e); }
    }
    fetchMeta();
    fetchQuestions();
  }, []);

  useEffect(() => {
    const t = setTimeout(fetchQuestions, 400);
    return () => clearTimeout(t);
  }, [search, category, difficulty, company]);

  async function vote(questionId: number, vote: "up" | "down") {
    if (!isAuth) { toast.error("Login required"); return; }
    try {
      await axios.post(`${questions_service}/api/questions/${questionId}/vote`,
        { vote }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(`Vote recorded`);
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed");
    }
  }

  async function addQuestion() {
    if (!isAuth || user?.role !== "recruiter") { toast.error("Only recruiters can add questions"); return; }
    if (!addForm.title || !addForm.content || !addForm.category || !addForm.difficulty) {
      toast.error("Fill required fields"); return;
    }
    setAdding(true);
    try {
      await axios.post(`${questions_service}/api/questions`, {
        ...addForm,
        companies: addForm.companies ? addForm.companies.split(",").map(s => s.trim()).filter(Boolean) : [],
        tags: addForm.tags ? addForm.tags.split(",").map(s => s.trim()).filter(Boolean) : [],
      }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Question added!");
      setShowAddForm(false);
      setAddForm({ title: "", content: "", category: "", difficulty: "Medium", answer: "", companies: "", tags: "" });
      fetchQuestions();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed");
    } finally { setAdding(false); }
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">
              Interview <span className="text-blue-600">Question Bank</span>
            </h1>
            <p className="text-sm opacity-60">Browse and practice real interview questions</p>
          </div>
          {isAuth && user?.role === "recruiter" && (
            <Button onClick={() => setShowAddForm(!showAddForm)} className="gap-2">
              <Plus size={16} /> Add Question
            </Button>
          )}
        </div>

        {/* Add Form */}
        {showAddForm && (
          <Card className="border-2 p-6 mb-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2"><Plus size={16} className="text-blue-600" /> Add Question</h2>
            <div className="space-y-3">
              <Input placeholder="Title *" value={addForm.title}
                onChange={(e) => setAddForm({ ...addForm, title: e.target.value })} />
              <textarea placeholder="Question content *" value={addForm.content}
                onChange={(e) => setAddForm({ ...addForm, content: e.target.value })}
                className="w-full p-3 border-2 rounded-lg text-sm resize-none h-24 bg-background focus:outline-none focus:border-blue-500" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Input placeholder="Category *" value={addForm.category}
                  onChange={(e) => setAddForm({ ...addForm, category: e.target.value })} />
                <select value={addForm.difficulty}
                  onChange={(e) => setAddForm({ ...addForm, difficulty: e.target.value })}
                  className="h-10 px-3 border-2 border-gray-300 rounded-lg bg-transparent text-sm focus:outline-none focus:border-blue-500">
                  {["Easy", "Medium", "Hard"].map(d => <option key={d}>{d}</option>)}
                </select>
                <Input placeholder="Companies (comma-separated)" value={addForm.companies}
                  onChange={(e) => setAddForm({ ...addForm, companies: e.target.value })} />
                <Input placeholder="Tags (comma-separated)" value={addForm.tags}
                  onChange={(e) => setAddForm({ ...addForm, tags: e.target.value })} />
              </div>
              <textarea placeholder="Answer (optional)" value={addForm.answer}
                onChange={(e) => setAddForm({ ...addForm, answer: e.target.value })}
                className="w-full p-3 border-2 rounded-lg text-sm resize-none h-24 bg-background focus:outline-none focus:border-blue-500" />
              <div className="flex gap-2">
                <Button onClick={addQuestion} disabled={adding}>{adding ? "Adding..." : "Add Question"}</Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
              </div>
            </div>
          </Card>
        )}

        {/* Filters */}
        <Card className="border-2 p-4 mb-6">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-40">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
              <Input placeholder="Search questions..." value={search}
                onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="h-10 px-3 border-2 border-gray-300 rounded-lg bg-transparent text-sm focus:outline-none focus:border-blue-500">
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}
              className="h-10 px-3 border-2 border-gray-300 rounded-lg bg-transparent text-sm focus:outline-none focus:border-blue-500">
              <option value="">All Difficulties</option>
              {["Easy", "Medium", "Hard"].map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={company} onChange={(e) => setCompany(e.target.value)}
              className="h-10 px-3 border-2 border-gray-300 rounded-lg bg-transparent text-sm focus:outline-none focus:border-blue-500">
              <option value="">All Companies</option>
              {companies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {(search || category || difficulty || company) && (
              <Button variant="outline" size="sm" onClick={() => { setSearch(""); setCategory(""); setDifficulty(""); setCompany(""); }}>
                <X size={14} />
              </Button>
            )}
          </div>
        </Card>

        {/* Questions */}
        {loading ? <Loading /> : questions.length === 0 ? (
          <div className="text-center py-20 opacity-50">
            <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No questions found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {questions.map((q) => (
              <Card key={q.question_id} className="border-2 overflow-hidden">
                <button
                  onClick={() => setExpanded(expanded === q.question_id ? null : q.question_id)}
                  className="w-full p-5 text-left flex items-start gap-4 hover:bg-accent transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${difficultyColor[q.difficulty]}`}>
                        {q.difficulty}
                      </span>
                      <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">{q.category}</span>
                      {q.companies.slice(0, 2).map(c => (
                        <span key={c} className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 px-2 py-0.5 rounded-full">{c}</span>
                      ))}
                    </div>
                    <p className="font-medium text-sm">{q.title}</p>
                  </div>
                  {expanded === q.question_id ? <ChevronUp size={16} className="opacity-40 shrink-0 mt-0.5" /> : <ChevronDown size={16} className="opacity-40 shrink-0 mt-0.5" />}
                </button>

                {expanded === q.question_id && (
                  <div className="px-5 pb-5 border-t pt-4">
                    <p className="text-sm mb-4 leading-relaxed">{q.content}</p>
                    {q.answer && (
                      <div className="bg-green-50 dark:bg-green-950/20 border-2 border-green-200 dark:border-green-900 rounded-xl p-4 mb-4">
                        <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1">Answer</p>
                        <p className="text-sm text-green-800 dark:text-green-300 leading-relaxed">{q.answer}</p>
                      </div>
                    )}
                    {q.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {q.tags.map(t => (
                          <span key={t} className="text-xs bg-secondary px-2 py-0.5 rounded-full opacity-70">#{t}</span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <button onClick={() => vote(q.question_id, "up")}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border-2 hover:border-green-500 hover:text-green-600 transition-colors">
                        <ThumbsUp size={13} /> Helpful
                      </button>
                      <button onClick={() => vote(q.question_id, "down")}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border-2 hover:border-red-500 hover:text-red-600 transition-colors">
                        <ThumbsDown size={13} /> Not Helpful
                      </button>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionsPage;
