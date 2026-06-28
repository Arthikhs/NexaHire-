"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { utils_service, useAppData } from "@/context/AppContext";
import axios from "axios";
import toast from "react-hot-toast";
import { BrainCircuit, Sparkles, Loader2, TrendingUp, Building2, MapPin, Zap } from "lucide-react";

const demandColor: Record<string, string> = {
  High: "bg-green-100 dark:bg-green-900/30 text-green-600",
  Medium: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600",
  Low: "bg-red-100 dark:bg-red-900/30 text-red-600",
};

const SalaryPredictor = () => {
  const { user } = useAppData();

  const [form, setForm] = useState({
    role: "",
    skills: user?.skills?.join(", ") || "",
    experience: "",
    location: "Bangalore",
    education: "",
  });

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const predict = async () => {
    if (!form.role || !form.skills) {
      toast.error("Role and skills are required");
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.post(`${utils_service}/api/utils/salary-predictor`, form);
      setResult(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to predict salary");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => setResult(null);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-green-50 dark:bg-green-950/30 mb-4">
          <BrainCircuit size={16} className="text-green-500" />
          <span className="text-sm font-medium">AI-Powered</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-3">AI Salary Predictor</h1>
        <p className="opacity-60 max-w-xl mx-auto">
          Get an accurate salary estimate based on your skills, experience, role and location.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <Card className="p-6 border-2 space-y-4">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <BrainCircuit size={18} className="text-green-500" /> Your Profile
          </h2>

          {[
            { name: "role", label: "Job Role *", placeholder: "e.g. Full Stack Developer" },
            { name: "skills", label: "Skills *", placeholder: "e.g. React, Node.js, PostgreSQL" },
            { name: "experience", label: "Experience", placeholder: "e.g. 2 years or Fresher" },
            { name: "education", label: "Education", placeholder: "e.g. B.Tech Computer Science" },
          ].map(({ name, label, placeholder }) => (
            <div key={name}>
              <label className="text-sm font-medium opacity-70 mb-1 block">{label}</label>
              <input
                name={name}
                value={(form as any)[name]}
                onChange={handleChange}
                placeholder={placeholder}
                className="w-full px-3 py-2 rounded-lg border-2 bg-background text-sm focus:outline-none focus:border-green-500 transition-colors"
              />
            </div>
          ))}

          <div>
            <label className="text-sm font-medium opacity-70 mb-1 block">Location</label>
            <select
              name="location"
              value={form.location}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border-2 bg-background text-sm focus:outline-none focus:border-green-500 transition-colors"
            >
              {["Bangalore", "Hyderabad", "Mumbai", "Delhi NCR", "Pune", "Chennai", "Remote", "USA", "UK", "Canada"].map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          <Button onClick={predict} disabled={loading} className="w-full gap-2 bg-green-600 hover:bg-green-700">
            {loading
              ? <><Loader2 size={16} className="animate-spin" /> Predicting...</>
              : <><Sparkles size={16} /> Predict My Salary</>}
          </Button>
        </Card>

        {/* Result */}
        <div className="space-y-4">
          {!result ? (
            <Card className="p-6 border-2 flex flex-col items-center justify-center h-full min-h-64 opacity-40 space-y-3">
              <BrainCircuit size={48} />
              <p className="text-sm">Your salary prediction will appear here</p>
            </Card>
          ) : (
            <>
              {/* Main salary card */}
              <Card className="p-6 border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20">
                <div className="text-center space-y-2">
                  <p className="text-xs font-semibold opacity-50 uppercase tracking-wider">Predicted Salary Range</p>
                  <p className="text-4xl font-bold text-green-600">{result.formattedRange}</p>
                  <div className="flex items-center justify-center gap-3 flex-wrap pt-1">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${demandColor[result.marketDemand] || "bg-secondary"}`}>
                      {result.marketDemand} Demand
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-600">
                      {result.confidenceScore}% confidence
                    </span>
                  </div>
                  <p className="text-sm opacity-70 pt-1">{result.summary}</p>
                </div>
              </Card>

              {/* Salary by experience */}
              {result.salaryByExperience?.length > 0 && (
                <Card className="p-5 border-2">
                  <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <TrendingUp size={15} className="text-green-500" /> Salary by Experience
                  </h3>
                  <div className="space-y-2">
                    {result.salaryByExperience.map((s: any) => (
                      <div key={s.level} className="flex items-center justify-between text-sm">
                        <span className="opacity-70">{s.level}</span>
                        <span className="font-semibold text-green-600">{s.range}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Top paying companies */}
              {result.topPayingCompanies?.length > 0 && (
                <Card className="p-5 border-2">
                  <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <Building2 size={15} className="text-blue-500" /> Top Paying Companies
                  </h3>
                  <div className="space-y-2">
                    {result.topPayingCompanies.map((c: any) => (
                      <div key={c.company} className="flex items-center justify-between text-sm">
                        <span className="font-medium">{c.company}</span>
                        <span className="text-blue-600 font-semibold">{c.range}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Salary boosting skills */}
              {result.salaryBoostingSkills?.length > 0 && (
                <Card className="p-5 border-2">
                  <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <Zap size={15} className="text-yellow-500" /> Salary Boosting Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.salaryBoostingSkills.map((s: any) => (
                      <span key={s.skill} className="px-3 py-1.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-xs font-medium">
                        {s.skill} +{s.boostPercent}%
                      </span>
                    ))}
                  </div>
                </Card>
              )}

              {/* Location impact */}
              {result.locationImpact?.length > 0 && (
                <Card className="p-5 border-2">
                  <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <MapPin size={15} className="text-red-500" /> Location Impact
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {result.locationImpact.map((l: any) => (
                      <div key={l.city} className="text-center p-2 rounded-lg bg-secondary">
                        <p className="text-xs font-medium">{l.city}</p>
                        <p className="text-sm font-bold text-green-600">{l.multiplier}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Tip */}
              {result.tip && (
                <Card className="p-4 border-2 border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/20">
                  <p className="text-xs font-semibold text-purple-600 mb-1">💡 Pro Tip</p>
                  <p className="text-sm opacity-80">{result.tip}</p>
                </Card>
              )}

              <Button variant="outline" onClick={reset} className="w-full">Predict Again</Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalaryPredictor;
