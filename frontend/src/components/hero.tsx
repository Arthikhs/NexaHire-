"use client";
import { ArrowRight, Briefcase, Building2, MapPin, Search, Sparkles, TrendingUp, Users, Zap } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";

const roles = ["Frontend Developer", "Data Scientist", "Product Manager", "UI/UX Designer", "Backend Engineer", "DevOps Engineer"];

const Hero = () => {
  const [roleIndex, setRoleIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setRoleIndex((i) => (i + 1) % roles.length);
        setVisible(true);
      }, 400);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden bg-secondary min-h-[90vh] flex items-center">
      {/* Animated background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-80 h-80 bg-blue-500 opacity-10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500 opacity-10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-red-400 opacity-5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      <div className="container mx-auto px-5 py-16 md:py-24 relative">
        <div className="flex flex-col-reverse md:flex-row items-center gap-12 md:gap-16">

          {/* Left content */}
          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left space-y-6 animate-in fade-in slide-in-from-left-8 duration-700">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-background/80 backdrop-blur-sm shadow-sm">
              <Sparkles size={15} className="text-yellow-500" />
              <span className="text-sm font-medium">#1 AI-Powered Job Platform</span>
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            </div>

            {/* Main heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Land Your Dream Job as a{" "}
              <br className="hidden md:block" />
              <span
                className={`inline-block text-blue-600 transition-all duration-400 ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}`}
                style={{ minWidth: "320px" }}
              >
                {roles[roleIndex]}
              </span>
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl leading-relaxed opacity-75 max-w-xl">
              Connect with top employers, get AI-powered resume analysis, prepare with mock interviews, and discover opportunities that match your skills.
            </p>

            {/* Quick search bar */}
            <div className="w-full max-w-lg flex items-center gap-2 p-2 rounded-2xl border-2 bg-background shadow-lg">
              <Search size={18} className="ml-2 opacity-40 shrink-0" />
              <Link href="/jobs" className="flex-1 text-sm opacity-50 py-1 text-left">Search jobs, companies, roles...</Link>
              <Link href="/jobs">
                <Button size="sm" className="gap-1 rounded-xl h-9 px-4">
                  Search <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            {/* Popular searches */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs opacity-50 font-medium">Popular:</span>
              {["React Developer", "Python", "Remote", "Internship"].map((tag) => (
                <Link key={tag} href={`/jobs?title=${tag}`}>
                  <span className="text-xs px-3 py-1 rounded-full border hover:border-blue-500 hover:text-blue-600 transition-colors cursor-pointer bg-background">
                    {tag}
                  </span>
                </Link>
              ))}
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center md:justify-start gap-8 py-2">
              {[
                { value: "10k+", label: "Active Jobs", icon: Briefcase },
                { value: "5k+", label: "Companies", icon: Building2 },
                { value: "50k+", label: "Job Seekers", icon: Users },
              ].map(({ value, label, icon: Icon }) => (
                <div key={label} className="text-center md:text-left flex items-center gap-2">
                  <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600 leading-tight">{value}</p>
                    <p className="text-xs opacity-60">{label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <Link href="/jobs">
                <Button size="lg" className="text-base px-8 h-12 gap-2 group shadow-lg shadow-blue-500/20">
                  <Search size={18} /> Browse Jobs
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/experiences">
                <Button variant="outline" size="lg" className="text-base px-8 h-12 gap-2">
                  <Zap size={18} className="text-yellow-500" /> Interview Experiences
                </Button>
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex items-center gap-3 text-xs opacity-55 pt-1 flex-wrap">
              <span className="flex items-center gap-1">✔ Free to use</span>
              <span>•</span>
              <span className="flex items-center gap-1">✔ Verified employers</span>
              <span>•</span>
              <span className="flex items-center gap-1">✔ AI-powered tools</span>
            </div>
          </div>

          {/* Right image + floating cards */}
          <div className="flex-1 relative animate-in fade-in slide-in-from-right-8 duration-700">
            {/* Glow */}
            <div className="absolute -inset-4 bg-blue-400 opacity-15 blur-2xl rounded-full" />

            {/* Main image */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-background">
              <img
                src="/hero.jpeg"
                className="object-cover object-center w-full h-full transform transition-transform duration-700 hover:scale-105"
                alt="NexaHire"
              />
              {/* overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>

            {/* Floating card 1 — job match */}
            <div className="absolute -left-6 top-8 bg-background border shadow-xl rounded-2xl px-4 py-3 flex items-center gap-3 animate-in fade-in slide-in-from-left-4 duration-1000 delay-300">
              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <TrendingUp size={18} className="text-green-600" />
              </div>
              <div>
                <p className="text-xs font-bold">New Job Match!</p>
                <p className="text-xs opacity-60">Senior React Dev • Remote</p>
              </div>
            </div>

            {/* Floating card 2 — applicants */}
            <div className="absolute -right-4 bottom-12 bg-background border shadow-xl rounded-2xl px-4 py-3 flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-1000 delay-500">
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Users size={18} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-bold">1,240 Applied Today</p>
                <p className="text-xs opacity-60">Across 300+ companies</p>
              </div>
            </div>

            {/* Floating card 3 — location */}
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-4 bg-background border shadow-xl rounded-2xl px-4 py-2 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-700">
              <MapPin size={14} className="text-red-500" />
              <p className="text-xs font-medium">Jobs across all of India</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
