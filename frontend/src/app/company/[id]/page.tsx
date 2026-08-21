"use client";
import { useParams } from "react-router-dom";
import Cookies from "js-cookie";
import React, { useEffect, useRef, useState } from "react";
import { job_service, useAppData } from "@/context/AppContext";
import { Company, CompanyReview, Job } from "@/type";
import axios from "axios";
import Loading from "@/components/loading";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  Building2,
  CheckCircle,
  Clock,
  DollarSign,
  Eye,
  FileText,
  Globe,
  Laptop,
  MapPin,
  Pencil,
  Plus,
  Star,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CompanyPage = () => {
  const { id } = useParams();
  const token = Cookies.get("token");
  const { user, isAuth } = useAppData();

  const [loading, setLoading] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [company, setCompany] = useState<Company | null>(null);

  // Reviews state
  const [reviews, setReviews] = useState<CompanyReview[]>([]);
  const [reviewStats, setReviewStats] = useState<{ total: number; avg_rating: string } | null>(null);
  const [reviewForm, setReviewForm] = useState({ rating: 0, title: "", pros: "", cons: "" });
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewBtnLoading, setReviewBtnLoading] = useState(false);

  async function fetchCompany() {
    try {
      setLoading(true);
      const { data } = await axios.get(`${job_service}/api/job/company/${id}`);
      setCompany(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchReviews() {
    try {
      const { data } = await axios.get(`${job_service}/api/job/company/${id}/reviews`);
      setReviews(data.reviews);
      setReviewStats(data.stats);
    } catch (error) {
      console.log(error);
    }
  }

  const submitReview = async () => {
    if (!reviewForm.rating) return toast.error("Please select a rating");
    if (!reviewForm.title || !reviewForm.pros || !reviewForm.cons)
      return toast.error("All fields are required");
    setReviewBtnLoading(true);
    try {
      await axios.post(`${job_service}/api/job/company/${id}/reviews`, reviewForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Review posted!");
      setReviewForm({ rating: 0, title: "", pros: "", cons: "" });
      fetchReviews();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to post review");
    } finally {
      setReviewBtnLoading(false);
    }
  };

  const deleteReviewHandler = async (reviewId: number) => {
    try {
      await axios.delete(`${job_service}/api/job/review/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Review deleted");
      fetchReviews();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed");
    }
  };

  useEffect(() => {
    fetchCompany();
    fetchReviews();
  }, [id]);

  const isRecruiterOwner = user && company && user.user_id === company.recruiter_id;

  const [isUpdatedModalOpen, setIsUpdatedModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const addModalRef = useRef<HTMLButtonElement>(null);

  const [title, settitle] = useState("");
  const [description, setdescription] = useState("");
  const [role, setrole] = useState("");
  const [salary, setsalary] = useState("");
  const [location, setlocation] = useState("");
  const [openings, setopenings] = useState("");
  const [job_type, setjob_type] = useState("");
  const [work_location, setwork_location] = useState("");
  const [is_active, setis_active] = useState(true);

  const clearInput = () => {
    settitle(""); setdescription(""); setrole(""); setsalary("");
    setlocation(""); setopenings(""); setjob_type(""); setwork_location(""); setis_active(true);
  };

  const addJobHandler = async () => {
    setBtnLoading(true);
    try {
      await axios.post(`${job_service}/api/job/new`, {
        title, description, role, salary: Number(salary), location,
        openings: Number(openings), job_type, work_location, company_id: id,
      }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("New job posted successfully");
      fetchCompany();
      clearInput();
      addModalRef.current?.click();
    } catch (error: any) {
      toast.error(error.response.data.message);
    } finally {
      setBtnLoading(false);
    }
  };

  const handleOpenUpdateModal = (job: Job) => {
    setSelectedJob(job);
    settitle(job.title); setdescription(job.description); setrole(job.role);
    setsalary(String(job.salary || "")); setlocation(job.location || "");
    setopenings(String(job.openings)); setjob_type(job.job_type);
    setwork_location(job.work_location); setis_active(job.is_active);
    setIsUpdatedModalOpen(true);
  };

  const updateJobHandler = async () => {
    if (!selectedJob) return;
    setBtnLoading(true);
    try {
      await axios.put(`${job_service}/api/job/${selectedJob.job_id}`, {
        title, description, role, salary: Number(salary), location,
        openings: Number(openings), job_type, work_location, is_active,
      }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Job updated successfully");
      fetchCompany();
      setIsUpdatedModalOpen(false);
      setSelectedJob(null);
      clearInput();
    } catch (error: any) {
      toast.error(error.response.data.message);
    } finally {
      setBtnLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-secondary/30">
      {company && (
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Company Header */}
          <Card className="overflow-hidden shadow-lg border-2 mb-8">
            <div className="h-32 bg-blue-600"></div>
            <div className="px-8 pb-8">
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-end -mt-16">
                <div className="w-32 h-32 rounded-2xl border-4 border-background overflow-hidden shadow-xl bg-background shrink-0">
                  <img src={company.logo} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 md:mb-4">
                  <h1 className="text-3xl font-bold mb-2">{company.name}</h1>
                  <p className="text-base leading-relaxed opacity-80 max-w-3xl">{company.description}</p>
                  {reviewStats && reviewStats.total > 0 && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={14} className={i < Math.round(Number(reviewStats.avg_rating)) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />
                        ))}
                      </div>
                      <span className="text-sm font-semibold">{reviewStats.avg_rating}</span>
                      <span className="text-sm opacity-60">({reviewStats.total} review{reviewStats.total !== 1 ? "s" : ""})</span>
                    </div>
                  )}
                </div>
                <a href={company.website} target="_blank" rel="noreferrer" className="md:mb-4">
                  <Button className="gap-2"><Globe size={18} /> Visit Website</Button>
                </a>
              </div>
            </div>
          </Card>

          {/* Jobs Section */}
          <Dialog>
            <Card className="shadow-lg border-2 overflow-hidden mb-8">
              <div className="bg-blue-600 border-b p-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <h2 className="text-2xl font-bold text-white">Open Positions</h2>
                  <p className="text-sm opacity-70 text-white">
                    {company.jobs?.length || 0} active job{company.jobs?.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {isRecruiterOwner && (
                <>
                  <div className="p-4 border-b">
                    <DialogTrigger asChild>
                      <Button className="gap-2"><Plus size={18} /> Post New Job</Button>
                    </DialogTrigger>
                  </div>
                  <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-2xl">Post a new Job</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-5 py-4">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2"><Briefcase size={16} /> Job Title</Label>
                        <Input placeholder="Enter Job title" className="h-11" value={title} onChange={(e) => settitle(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2"><FileText size={16} /> Description</Label>
                        <Input placeholder="Enter Description" className="h-11" value={description} onChange={(e) => setdescription(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2"><Building2 size={16} /> Role/Department</Label>
                        <Input placeholder="Enter Job Role" className="h-11" value={role} onChange={(e) => setrole(e.target.value)} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2"><DollarSign size={16} /> Salary</Label>
                          <Input type="number" placeholder="Enter salary" className="h-11" value={salary} onChange={(e) => setsalary(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2"><Users size={16} /> Openings</Label>
                          <Input type="number" placeholder="Eg. 5" className="h-11" value={openings} onChange={(e) => setopenings(e.target.value)} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2"><MapPin size={16} /> Location</Label>
                        <Input placeholder="Enter location" className="h-11" value={location} onChange={(e) => setlocation(e.target.value)} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="flex items-center gap-1"><Clock size={16} /> Job Type</Label>
                          <Select value={job_type} onValueChange={setjob_type}>
                            <SelectTrigger className="h-11"><SelectValue placeholder="Select job type" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Full-time">Full-time</SelectItem>
                              <SelectItem value="Part-time">Part-time</SelectItem>
                              <SelectItem value="Contract">Contract</SelectItem>
                              <SelectItem value="Internship">Internship</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="flex items-center gap-1"><Laptop size={16} /> Work Location</Label>
                          <Select value={work_location} onValueChange={setwork_location}>
                            <SelectTrigger className="h-11"><SelectValue placeholder="Select Work Location" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="On-site">On-site</SelectItem>
                              <SelectItem value="Remote">Remote</SelectItem>
                              <SelectItem value="Hybrid">Hybrid</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button ref={addModalRef} variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button disabled={btnLoading} onClick={addJobHandler} className="gap-2">
                        {btnLoading ? "Posting job..." : "Post Job"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </>
              )}

              <div className="p-6">
                {company.jobs && company.jobs.length > 0 ? (
                  <div className="space-y-4">
                    {company.jobs.map((j) => (
                      <div key={j.job_id} className="p-5 rounded-lg border-2 hover:border-blue-500 transition-all bg-background">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-3 flex-wrap">
                              <h3 className="text-xl font-semibold">{j.title}</h3>
                              <span className={`text-xs px-3 py-1 rounded-full flex items-center gap-1 ${j.is_active ? "bg-green-100 dark:bg-green-900/30 text-green-600" : "bg-gray-100 dark:bg-gray-800 text-gray-600"}`}>
                                {j.is_active ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                {j.is_active ? "Active" : "Inactive"}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
                              <div className="flex items-center gap-2 opacity-70"><Building2 size={16} /><span>{j.role}</span></div>
                              <div className="flex items-center gap-2 opacity-70"><DollarSign size={16} /><span>{j.salary ? `₹ ${j.salary.toLocaleString()}` : "Not Disclosed"}</span></div>
                              <div className="flex items-center gap-2 opacity-70"><MapPin size={16} /><span>{j.location}</span></div>
                              <div className="flex items-center gap-2 opacity-70"><Laptop size={16} /><span>{j.work_location} ({j.job_type})</span></div>
                              <div className="flex items-center gap-2 opacity-70"><Users size={16} /><span>{j.openings} openings</span></div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Link to={`/jobs/${j.job_id}`}>
                              <Button variant="outline" size="sm" className="gap-2"><Eye size={16} /> View</Button>
                            </Link>
                            {isRecruiterOwner && (
                              <Button onClick={() => handleOpenUpdateModal(j)} variant="outline" size="sm" className="gap-2">
                                <Pencil size={16} /> Edit
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                      <Briefcase size={32} className="opacity-40" />
                    </div>
                    <p className="text-base opacity-70">No jobs posted yet</p>
                  </div>
                )}
              </div>
            </Card>
          </Dialog>

          {/* Update Job Dialog */}
          <Dialog open={isUpdatedModalOpen} onOpenChange={setIsUpdatedModalOpen}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle className="text-2xl">Update Job</DialogTitle></DialogHeader>
              <div className="space-y-5 py-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Briefcase size={16} /> Job Title</Label>
                  <Input placeholder="Enter Job title" className="h-11" value={title} onChange={(e) => settitle(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><FileText size={16} /> Description</Label>
                  <Input placeholder="Enter Description" className="h-11" value={description} onChange={(e) => setdescription(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Building2 size={16} /> Role/Department</Label>
                  <Input placeholder="Enter Job Role" className="h-11" value={role} onChange={(e) => setrole(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><DollarSign size={16} /> Salary</Label>
                    <Input type="number" placeholder="Enter salary" className="h-11" value={salary} onChange={(e) => setsalary(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Users size={16} /> Openings</Label>
                    <Input type="number" placeholder="Eg. 5" className="h-11" value={openings} onChange={(e) => setopenings(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><MapPin size={16} /> Location</Label>
                  <Input placeholder="Enter location" className="h-11" value={location} onChange={(e) => setlocation(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1"><Clock size={16} /> Job Type</Label>
                    <Select value={job_type} onValueChange={setjob_type}>
                      <SelectTrigger className="h-11"><SelectValue placeholder="Select job type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Full-time">Full-time</SelectItem>
                        <SelectItem value="Part-time">Part-time</SelectItem>
                        <SelectItem value="Contract">Contract</SelectItem>
                        <SelectItem value="Internship">Internship</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1"><Laptop size={16} /> Work Location</Label>
                    <Select value={work_location} onValueChange={setwork_location}>
                      <SelectTrigger className="h-11"><SelectValue placeholder="Select Work Location" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="On-site">On-site</SelectItem>
                        <SelectItem value="Remote">Remote</SelectItem>
                        <SelectItem value="Hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">Status</Label>
                    <Select value={is_active ? "true" : "false"} onValueChange={(v) => setis_active(v === "true")}>
                      <SelectTrigger className="h-11"><SelectValue placeholder="select status" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Active</SelectItem>
                        <SelectItem value="false">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setIsUpdatedModalOpen(false); clearInput(); }}>Cancel</Button>
                <Button disabled={btnLoading} onClick={updateJobHandler} className="gap-2">
                  {btnLoading ? "Updating job..." : "Update Job"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Reviews Section */}
          <Card className="shadow-lg border-2 overflow-hidden">
            <div className="bg-blue-600 p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Star size={22} /> Company Reviews
                </h2>
                {reviewStats && reviewStats.total > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold text-white">{reviewStats.avg_rating}</span>
                    <div>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={14} className={i < Math.round(Number(reviewStats.avg_rating)) ? "fill-yellow-300 text-yellow-300" : "text-blue-300"} />
                        ))}
                      </div>
                      <p className="text-xs text-blue-200">{reviewStats.total} review{reviewStats.total !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Post Review Form */}
              {isAuth && !isRecruiterOwner && (
                <div className="p-5 rounded-xl border-2 border-dashed bg-background">
                  <h3 className="font-semibold mb-4">Write a Review</h3>
                  <div className="space-y-4">
                    {/* Star Rating */}
                    <div className="space-y-2">
                      <Label>Rating <span className="text-red-500">*</span></Label>
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setReviewForm((p) => ({ ...p, rating: i + 1 }))}
                            onMouseEnter={() => setReviewHover(i + 1)}
                            onMouseLeave={() => setReviewHover(0)}
                            className="transition-transform hover:scale-110"
                          >
                            <Star size={26} className={i < (reviewHover || reviewForm.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Review Title <span className="text-red-500">*</span></Label>
                      <Input placeholder="e.g., Great work culture" className="h-11"
                        value={reviewForm.title} onChange={(e) => setReviewForm((p) => ({ ...p, title: e.target.value }))} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-green-600"><ThumbsUp size={14} /> Pros <span className="text-red-500">*</span></Label>
                        <textarea rows={3} placeholder="What do you like about this company?"
                          value={reviewForm.pros} onChange={(e) => setReviewForm((p) => ({ ...p, pros: e.target.value }))}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-md bg-transparent text-sm resize-none focus:outline-none focus:border-blue-500" />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-red-500"><ThumbsDown size={14} /> Cons <span className="text-red-500">*</span></Label>
                        <textarea rows={3} placeholder="What could be improved?"
                          value={reviewForm.cons} onChange={(e) => setReviewForm((p) => ({ ...p, cons: e.target.value }))}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-md bg-transparent text-sm resize-none focus:outline-none focus:border-blue-500" />
                      </div>
                    </div>
                    <Button disabled={reviewBtnLoading} onClick={submitReview} className="gap-2">
                      {reviewBtnLoading ? "Posting..." : "Post Review"}
                    </Button>
                  </div>
                </div>
              )}

              {/* Reviews List */}
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((r) => (
                    <div key={r.review_id} className="p-5 rounded-xl border bg-background">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <div className="flex gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} size={13} className={i < r.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />
                              ))}
                            </div>
                            <span className="font-semibold text-sm">{r.title}</span>
                          </div>
                          <p className="text-xs opacity-50">by {r.user_name} · {new Date(r.created_at).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</p>
                        </div>
                        {user && user.user_id === r.user_id && (
                          <button onClick={() => deleteReviewHandler(r.review_id)} className="text-red-400 hover:text-red-600 transition-colors">
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
                          <p className="text-xs font-semibold text-green-600 flex items-center gap-1 mb-1"><ThumbsUp size={12} /> Pros</p>
                          <p className="text-sm">{r.pros}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
                          <p className="text-xs font-semibold text-red-500 flex items-center gap-1 mb-1"><ThumbsDown size={12} /> Cons</p>
                          <p className="text-sm">{r.cons}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Star size={36} className="opacity-20 mx-auto mb-3" />
                  <p className="opacity-60">No reviews yet — be the first to review!</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CompanyPage;
