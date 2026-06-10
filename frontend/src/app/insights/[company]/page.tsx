"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useParams } from "next/navigation";
import Link from "next/link";
import { insights_service } from "@/context/AppContext";
import { useAppData } from "@/context/AppContext";
import Loading from "@/components/loading";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Building2, Star, DollarSign, Briefcase, MapPin,
  ThumbsUp, ThumbsDown, ChevronLeft,
} from "lucide-react";
import toast from "react-hot-toast";
import { Job } from "@/type";

interface CompanyData {
  company: { company_id?: number; name: string; description?: string; logo?: string; website?: string };
  salaryStats: { role: string; avg_salary: string; min_salary: string; max_salary: string; count: number }[];
  reviewStats: { avg_rating: string | null; total_reviews: number };
  openJobs: Job[];
}

interface Review {
  review_id: number;
  user_name: string;
  rating: number;
  title: string;
  pros: string;
  cons: string;
  created_at: string;
}

const CompanyInsightPage = () => {
  const { company } = useParams<{ company: string }>();
  const companyName = decodeURIComponent(company);
  const { isAuth, user } = useAppData();
  const token = Cookies.get("token");

  const [data, setData] = useState<CompanyData | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: "", pros: "", cons: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axios.get(`${insights_service}/api/insights/company/${encodeURIComponent(companyName)}`);
        setData(res.data);
        if (res.data.company?.company_id) {
          const rev = await axios.get(`${insights_service}/api/insights/company/${res.data.company.company_id}/reviews`);
          setReviews(rev.data);
        }
      } catch (e) { console.log(e); }
      finally { setLoading(false); }
    }
    fetchData();
  }, [companyName]);

  async function submitReview() {
    if (!isAuth || !data?.company?.company_id) { toast.error("Login required"); return; }
    setSubmitting(true);
    try {
      await axios.post(`${insights_service}/api/insights/company/${data.company.company_id}/review`,
        reviewForm, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Review submitted!");
      setShowReviewForm(false);
      const rev = await axios.get(`${insights_service}/api/insights/company/${data.company.company_id}/reviews`);
      setReviews(rev.data);
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed");
    } finally { setSubmitting(false); }
  }

  if (loading) return <Loading />;
  if (!data) return null;

  return (
    <div className="min-h-screen bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link href="/insights" className="flex items-center gap-1 text-sm opacity-60 hover:opacity-100 mb-6">
          <ChevronLeft size={16} /> Back to Insights
        </Link>

        {/* Company Header */}
        <Card className="border-2 p-6 mb-6 flex items-center gap-6 flex-wrap">
          {data.company.logo ? (
            <img src={data.company.logo} alt={data.company.name} className="w-20 h-20 rounded-2xl object-contain border-2" />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center">
              <Building2 size={32} className="text-blue-600" />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{data.company.name}</h1>
            {data.company.description && <p className="text-sm opacity-60 mt-1 max-w-xl">{data.company.description}</p>}
            {data.company.website && (
              <a href={data.company.website} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline mt-1 block">
                {data.company.website}
              </a>
            )}
          </div>
          <div className="flex items-center gap-6 text-center">
            {data.reviewStats.avg_rating && (
              <div>
                <div className="flex items-center gap-1 text-yellow-500 justify-center">
                  <Star size={18} fill="currentColor" />
                  <span className="text-2xl font-bold text-foreground">{data.reviewStats.avg_rating}</span>
                </div>
                <p className="text-xs opacity-50">{data.reviewStats.total_reviews} reviews</p>
              </div>
            )}
            <div>
              <p className="text-2xl font-bold text-blue-600">{data.openJobs.length}</p>
              <p className="text-xs opacity-50">Open Jobs</p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Salary Stats */}
            {data.salaryStats.length > 0 && (
              <Card className="border-2 overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-green-700 p-5">
                  <h2 className="text-white font-semibold flex items-center gap-2"><DollarSign size={16} /> Salary by Role</h2>
                </div>
                <div className="divide-y">
                  {data.salaryStats.map((s) => (
                    <div key={s.role} className="p-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium">{s.role}</p>
                        <p className="text-xs opacity-50">{s.count} report{s.count !== 1 ? "s" : ""}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-600 font-semibold">₹{Number(s.avg_salary).toLocaleString("en-IN")} avg</p>
                        <p className="text-xs opacity-50">₹{Number(s.min_salary).toLocaleString("en-IN")} – ₹{Number(s.max_salary).toLocaleString("en-IN")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Reviews */}
            <Card className="border-2 overflow-hidden">
              <div className="p-5 border-b flex items-center justify-between">
                <h2 className="font-semibold flex items-center gap-2"><Star size={16} className="text-yellow-500" /> Reviews</h2>
                {isAuth && data.company.company_id && (
                  <Button size="sm" variant="outline" onClick={() => setShowReviewForm(!showReviewForm)}>
                    Write a Review
                  </Button>
                )}
              </div>

              {showReviewForm && (
                <div className="p-5 border-b bg-accent/30">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium">Rating:</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((r) => (
                          <button key={r} onClick={() => setReviewForm({ ...reviewForm, rating: r })}>
                            <Star size={20} className={r <= reviewForm.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <Input placeholder="Title" value={reviewForm.title}
                      onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })} />
                    <textarea placeholder="Pros" value={reviewForm.pros}
                      onChange={(e) => setReviewForm({ ...reviewForm, pros: e.target.value })}
                      className="w-full p-3 border-2 rounded-lg text-sm resize-none h-20 bg-background focus:outline-none focus:border-blue-500" />
                    <textarea placeholder="Cons" value={reviewForm.cons}
                      onChange={(e) => setReviewForm({ ...reviewForm, cons: e.target.value })}
                      className="w-full p-3 border-2 rounded-lg text-sm resize-none h-20 bg-background focus:outline-none focus:border-blue-500" />
                    <div className="flex gap-2">
                      <Button onClick={submitReview} disabled={submitting}>{submitting ? "Submitting..." : "Submit"}</Button>
                      <Button variant="outline" onClick={() => setShowReviewForm(false)}>Cancel</Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="divide-y">
                {reviews.length > 0 ? reviews.map((r) => (
                  <div key={r.review_id} className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <p className="font-medium text-sm">{r.user_name}</p>
                        {r.title && <p className="text-sm opacity-80">{r.title}</p>}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={14} className={i < r.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-200"} />
                        ))}
                      </div>
                    </div>
                    {r.pros && (
                      <div className="flex items-start gap-2 mb-1">
                        <ThumbsUp size={12} className="text-green-500 mt-0.5 shrink-0" />
                        <p className="text-xs opacity-70">{r.pros}</p>
                      </div>
                    )}
                    {r.cons && (
                      <div className="flex items-start gap-2">
                        <ThumbsDown size={12} className="text-red-500 mt-0.5 shrink-0" />
                        <p className="text-xs opacity-70">{r.cons}</p>
                      </div>
                    )}
                    <p className="text-xs opacity-40 mt-2">{new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                  </div>
                )) : (
                  <div className="py-10 text-center opacity-50 text-sm">No reviews yet</div>
                )}
              </div>
            </Card>
          </div>

          {/* Open Jobs */}
          <div>
            <Card className="border-2 overflow-hidden sticky top-24">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-5">
                <h2 className="text-white font-semibold flex items-center gap-2"><Briefcase size={16} /> Open Jobs</h2>
              </div>
              <div className="divide-y">
                {data.openJobs.length > 0 ? data.openJobs.map((j) => (
                  <Link key={j.job_id} href={`/jobs/${j.job_id}`}
                    className="block p-4 hover:bg-accent transition-colors">
                    <p className="text-sm font-medium">{j.title}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {j.location && <span className="flex items-center gap-1 text-xs opacity-50"><MapPin size={10} />{j.location}</span>}
                      <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">{j.job_type}</span>
                    </div>
                  </Link>
                )) : (
                  <div className="py-10 text-center opacity-50 text-sm">No open jobs</div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyInsightPage;
