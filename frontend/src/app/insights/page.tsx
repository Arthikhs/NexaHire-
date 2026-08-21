"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { insights_service } from "@/context/AppContext";
import { useAppData } from "@/context/AppContext";
import Loading from "@/components/loading";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Building2, DollarSign, Star, Search, TrendingUp,
  MapPin, Briefcase, Users, ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";

interface SalaryRow {
  company_name: string;
  role: string;
  location: string;
  job_type: string;
  experience_years: number;
  salary: string;
  created_at: string;
}

interface SalaryTrend {
  experience_years: number;
  avg_salary: string;
  min_salary: string;
  max_salary: string;
  count: number;
}

const InsightsPage = () => {
  const { isAuth, user } = useAppData();
  const token = Cookies.get("token");
  const navigate = useNavigate();

  // Salary search
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");
  const [salaryRows, setSalaryRows] = useState<SalaryRow[]>([]);
  const [trends, setTrends] = useState<SalaryTrend[]>([]);
  const [salaryLoading, setSalaryLoading] = useState(false);

  // Submit salary
  const [submitForm, setSubmitForm] = useState({
    company_name: "", role: "", experience_years: "", salary: "", location: "", job_type: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitForm, setShowSubmitForm] = useState(false);

  async function searchSalaries() {
    setSalaryLoading(true);
    try {
      const params = new URLSearchParams();
      if (company) params.set("company", company);
      if (role) params.set("role", role);
      if (location) params.set("location", location);
      const [salRes, trendRes] = await Promise.all([
        axios.get(`${insights_service}/api/insights/salary?${params}`),
        (company || role)
          ? axios.get(`${insights_service}/api/insights/salary/trends?${params}`)
          : Promise.resolve({ data: [] }),
      ]);
      setSalaryRows(salRes.data);
      setTrends(trendRes.data);
    } catch (e) {
      console.log(e);
    } finally {
      setSalaryLoading(false);
    }
  }

  useEffect(() => { searchSalaries(); }, []);

  async function handleSubmitSalary() {
    if (!isAuth) { navigate("/login"); return; }
    if (!submitForm.company_name || !submitForm.role || !submitForm.salary || submitForm.experience_years === "") {
      toast.error("Please fill required fields"); return;
    }
    setSubmitting(true);
    try {
      await axios.post(`${insights_service}/api/insights/salary`, {
        ...submitForm,
        experience_years: Number(submitForm.experience_years),
        salary: Number(submitForm.salary),
      }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Salary data submitted!");
      setShowSubmitForm(false);
      setSubmitForm({ company_name: "", role: "", experience_years: "", salary: "", location: "", job_type: "" });
      searchSalaries();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">
              Company <span className="text-blue-600">Insights</span>
            </h1>
            <p className="text-sm opacity-60">Explore salary data and company reviews</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={() => setShowSubmitForm(!showSubmitForm)} className="gap-2">
              <DollarSign size={16} /> Share Salary
            </Button>
            <Link to="/insights/search">
              <Button variant="outline" className="gap-2">
                <Building2 size={16} /> Company Search
              </Button>
            </Link>
          </div>
        </div>

        {/* Submit Salary Form */}
        {showSubmitForm && (
          <Card className="border-2 p-6 mb-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <DollarSign size={16} className="text-green-600" /> Share Your Salary (Anonymous)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-xs font-medium opacity-60 mb-1 block">Company *</label>
                <Input placeholder="e.g. Google" value={submitForm.company_name}
                  onChange={(e) => setSubmitForm({ ...submitForm, company_name: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium opacity-60 mb-1 block">Role *</label>
                <Input placeholder="e.g. Software Engineer" value={submitForm.role}
                  onChange={(e) => setSubmitForm({ ...submitForm, role: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium opacity-60 mb-1 block">Annual Salary (₹) *</label>
                <Input type="number" placeholder="e.g. 1200000" value={submitForm.salary}
                  onChange={(e) => setSubmitForm({ ...submitForm, salary: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium opacity-60 mb-1 block">Experience (years) *</label>
                <Input type="number" placeholder="e.g. 2" value={submitForm.experience_years}
                  onChange={(e) => setSubmitForm({ ...submitForm, experience_years: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium opacity-60 mb-1 block">Location</label>
                <Input placeholder="e.g. Bangalore" value={submitForm.location}
                  onChange={(e) => setSubmitForm({ ...submitForm, location: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium opacity-60 mb-1 block">Job Type</label>
                <select value={submitForm.job_type}
                  onChange={(e) => setSubmitForm({ ...submitForm, job_type: e.target.value })}
                  className="w-full h-10 px-3 border-2 border-gray-300 rounded-lg bg-transparent text-sm focus:outline-none focus:border-blue-500">
                  <option value="">Select</option>
                  {["Full-time", "Part-time", "Contract", "Internship"].map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSubmitSalary} disabled={submitting} className="gap-2">
                {submitting ? "Submitting..." : "Submit"}
              </Button>
              <Button variant="outline" onClick={() => setShowSubmitForm(false)}>Cancel</Button>
            </div>
          </Card>
        )}

        {/* Salary Search */}
        <Card className="border-2 p-6 mb-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Search size={16} className="text-blue-600" /> Search Salary Data
          </h2>
          <div className="flex gap-3 flex-wrap">
            <Input placeholder="Company" value={company} onChange={(e) => setCompany(e.target.value)} className="w-48" />
            <Input placeholder="Role" value={role} onChange={(e) => setRole(e.target.value)} className="w-48" />
            <Input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} className="w-40" />
            <Button onClick={searchSalaries} className="gap-2"><Search size={14} /> Search</Button>
          </div>
        </Card>

        {/* Trends */}
        {trends.length > 0 && (
          <Card className="border-2 p-6 mb-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <TrendingUp size={16} className="text-purple-600" /> Salary Trends by Experience
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 opacity-60 font-medium">Experience</th>
                    <th className="text-left py-2 px-3 opacity-60 font-medium">Avg Salary</th>
                    <th className="text-left py-2 px-3 opacity-60 font-medium">Min</th>
                    <th className="text-left py-2 px-3 opacity-60 font-medium">Max</th>
                    <th className="text-left py-2 px-3 opacity-60 font-medium">Reports</th>
                  </tr>
                </thead>
                <tbody>
                  {trends.map((t) => (
                    <tr key={t.experience_years} className="border-b hover:bg-accent">
                      <td className="py-2 px-3 font-medium">{t.experience_years} yr{t.experience_years !== 1 ? "s" : ""}</td>
                      <td className="py-2 px-3 text-green-600 font-semibold">₹{Number(t.avg_salary).toLocaleString("en-IN")}</td>
                      <td className="py-2 px-3 opacity-70">₹{Number(t.min_salary).toLocaleString("en-IN")}</td>
                      <td className="py-2 px-3 opacity-70">₹{Number(t.max_salary).toLocaleString("en-IN")}</td>
                      <td className="py-2 px-3 opacity-60">{t.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Salary Table */}
        <Card className="border-2 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-5">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <DollarSign size={18} /> Salary Database
              {salaryRows.length > 0 && <span className="ml-auto text-green-200 text-xs">{salaryRows.length} entries</span>}
            </h2>
          </div>
          {salaryLoading ? (
            <div className="p-8 text-center opacity-50 text-sm">Loading...</div>
          ) : salaryRows.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium opacity-60">Company</th>
                    <th className="text-left py-3 px-4 font-medium opacity-60">Role</th>
                    <th className="text-left py-3 px-4 font-medium opacity-60">Salary (P.A)</th>
                    <th className="text-left py-3 px-4 font-medium opacity-60">Experience</th>
                    <th className="text-left py-3 px-4 font-medium opacity-60">Location</th>
                    <th className="text-left py-3 px-4 font-medium opacity-60">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {salaryRows.map((row, i) => (
                    <tr key={i} className="border-b hover:bg-accent transition-colors">
                      <td className="py-3 px-4">
                        <Link to={`/insights/${encodeURIComponent(row.company_name)}`}
                          className="font-medium text-blue-600 hover:underline flex items-center gap-1">
                          {row.company_name} <ChevronRight size={12} />
                        </Link>
                      </td>
                      <td className="py-3 px-4">{row.role}</td>
                      <td className="py-3 px-4 text-green-600 font-semibold">₹{Number(row.salary).toLocaleString("en-IN")}</td>
                      <td className="py-3 px-4">{row.experience_years} yr{row.experience_years !== 1 ? "s" : ""}</td>
                      <td className="py-3 px-4 opacity-70">{row.location || "—"}</td>
                      <td className="py-3 px-4 opacity-70">{row.job_type || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-16 text-center opacity-50">
              <DollarSign size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No salary data found. Be the first to contribute!</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default InsightsPage;
