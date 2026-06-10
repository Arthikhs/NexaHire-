"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { job_service } from "@/context/AppContext";
import { InterviewExperience } from "@/type";
import { Button } from "./ui/button";
import {
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  MessageSquarePlus,
  Star,
  XCircle,
} from "lucide-react";

const difficultyColor: Record<string, string> = {
  Easy: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  Hard: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const ExperiencesSection = () => {
  const [experiences, setExperiences] = useState<InterviewExperience[]>([]);

  useEffect(() => {
    axios
      .get(`${job_service}/api/experience`)
      .then(({ data }) => setExperiences(data.slice(0, 3)))
      .catch(() => {});
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-purple-50 dark:bg-purple-950/30 mb-4">
          <MessageSquarePlus size={16} className="text-purple-600" />
          <span className="text-sm font-medium">Community</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Real Interview <span className="text-red-500">Experiences</span>
        </h2>
        <p className="text-lg opacity-70 max-w-2xl mx-auto">
          Thousands of interview stories shared by our community — learn what to
          expect before you walk in.
        </p>
      </div>

      {experiences.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {experiences.map((exp) => (
            <div
              key={exp.experience_id}
              className="bg-background rounded-xl border p-5 flex flex-col gap-3 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <Building2 size={14} className="opacity-50" />
                    <h3 className="font-bold text-sm">{exp.company_name}</h3>
                  </div>
                  <p className="text-xs opacity-60">{exp.role}</p>
                </div>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${difficultyColor[exp.difficulty]}`}
                >
                  {exp.difficulty}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={12}
                      className={
                        i < exp.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }
                    />
                  ))}
                </div>
                {exp.got_offer ? (
                  <span className="flex items-center gap-1 text-xs text-green-600">
                    <CheckCircle2 size={11} /> Got Offer
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-red-500">
                    <XCircle size={11} /> No Offer
                  </span>
                )}
              </div>

              <p className="text-sm opacity-70 line-clamp-3">{exp.rounds}</p>

              <div className="flex items-center justify-between mt-auto pt-2 border-t text-xs opacity-50">
                <span className="flex items-center gap-1">
                  <Calendar size={11} />
                  {new Date(exp.interview_date).toLocaleDateString("en-IN", {
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <span>by {exp.user_name}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 mb-10 rounded-xl border bg-background">
          <MessageSquarePlus size={36} className="opacity-20 mx-auto mb-3" />
          <p className="opacity-60">No experiences yet — be the first!</p>
        </div>
      )}

      <div className="flex justify-center gap-4 flex-wrap">
        <Link href="/experiences">
          <Button size="lg" className="gap-2 h-12 px-8">
            Browse All Experiences <ArrowRight size={18} />
          </Button>
        </Link>
        <Link href="/experiences/post">
          <Button size="lg" variant="outline" className="gap-2 h-12 px-8">
            <MessageSquarePlus size={18} /> Share Your Story
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ExperiencesSection;
