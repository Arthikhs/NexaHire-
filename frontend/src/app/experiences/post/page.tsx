"use client";
import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { job_service, useAppData } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, MessageSquarePlus, Star } from "lucide-react";
import Link from "next/link";

const PostExperiencePage = () => {
  const { isAuth, loading: authLoading } = useAppData();
  const router = useRouter();
  const token = Cookies.get("token");

  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const [form, setForm] = useState({
    company_name: "",
    role: "",
    interview_date: "",
    difficulty: "",
    rounds: "",
    questions_asked: "",
    got_offer: false,
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) return toast.error("Please select a rating");
    setLoading(true);
    try {
      await axios.post(
        `${job_service}/api/experience`,
        { ...form, rating },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Experience posted successfully!");
      router.push("/experiences");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to post experience");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return null;

  if (!isAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <MessageSquarePlus size={48} className="opacity-30" />
        <h2 className="text-xl font-semibold">Login required to post an experience</h2>
        <Link href="/login">
          <Button className="gap-2">Sign In</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <Link
          href="/experiences"
          className="inline-flex items-center gap-2 text-sm opacity-60 hover:opacity-100 mb-6"
        >
          <ArrowLeft size={16} /> Back to Experiences
        </Link>

        <div className="bg-background rounded-xl border p-6 md:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
              <MessageSquarePlus className="text-blue-600" size={24} />
              Share Your Experience
            </h1>
            <p className="text-sm opacity-60">
              Help others prepare by sharing your real interview story
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company_name">
                  Company Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="company_name"
                  name="company_name"
                  placeholder="e.g., Google, Amazon"
                  value={form.company_name}
                  onChange={handleChange}
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">
                  Role <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="role"
                  name="role"
                  placeholder="e.g., Software Engineer"
                  value={form.role}
                  onChange={handleChange}
                  required
                  className="h-11"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="interview_date">
                  Interview Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="interview_date"
                  name="interview_date"
                  type="date"
                  value={form.interview_date}
                  onChange={handleChange}
                  required
                  className="h-11"
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="difficulty">
                  Difficulty <span className="text-red-500">*</span>
                </Label>
                <select
                  id="difficulty"
                  name="difficulty"
                  value={form.difficulty}
                  onChange={handleChange}
                  required
                  className="w-full h-11 px-3 border-2 border-gray-300 rounded-md bg-transparent focus:outline-none"
                >
                  <option value="">Select difficulty</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rounds">
                Round-by-Round Experience <span className="text-red-500">*</span>
              </Label>
              <textarea
                id="rounds"
                name="rounds"
                value={form.rounds}
                onChange={handleChange}
                required
                rows={4}
                placeholder="e.g., Round 1 - Online Assessment (DSA problems)&#10;Round 2 - Technical Interview (System Design)&#10;Round 3 - HR Round"
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-md bg-transparent text-sm resize-none focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="questions_asked">Questions Asked (optional)</Label>
              <textarea
                id="questions_asked"
                name="questions_asked"
                value={form.questions_asked}
                onChange={handleChange}
                rows={3}
                placeholder="e.g., Two Sum, LRU Cache, Design a URL shortener..."
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-md bg-transparent text-sm resize-none focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Rating */}
            <div className="space-y-2">
              <Label>
                Overall Rating <span className="text-red-500">*</span>
              </Label>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setRating(i + 1)}
                    onMouseEnter={() => setHoverRating(i + 1)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-0.5 transition-transform hover:scale-110"
                  >
                    <Star
                      size={28}
                      className={
                        i < (hoverRating || rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }
                    />
                  </button>
                ))}
                {rating > 0 && (
                  <span className="text-sm opacity-60 ml-2">{rating}/5</span>
                )}
              </div>
            </div>

            {/* Got Offer */}
            <div className="flex items-center gap-3 p-4 rounded-lg border">
              <input
                id="got_offer"
                name="got_offer"
                type="checkbox"
                checked={form.got_offer}
                onChange={handleChange}
                className="h-4 w-4 accent-blue-600 cursor-pointer"
              />
              <Label htmlFor="got_offer" className="cursor-pointer font-medium">
                I received an offer 🎉
              </Label>
            </div>

            <Button type="submit" disabled={loading} className="w-full h-11 gap-2">
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <MessageSquarePlus size={16} />
              )}
              {loading ? "Posting..." : "Post Experience"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostExperiencePage;
