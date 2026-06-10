"use client";
import CarrerGuide from "@/components/carrer-guide";
import Hero from "@/components/hero";
import Loading from "@/components/loading";
import ResumeAnalyzer from "@/components/resume-analyser";
import ResumeBuilder from "@/components/resume-builder";
import InterviewHub from "@/components/interview-hub";
import Rolesense from "@/components/rolesense";
import NCAT from "@/components/ncat";
import ExpertSpeak from "@/components/expert-speak";
import ExperiencesSection from "@/components/experiences-section";
import PersonalizedFeed from "@/components/personalized-feed";
import CareerDashboard from "@/components/career-dashboard";
import SkillGapAnalyzer from "@/components/skill-gap-analyzer";
import LearningRoadmaps from "@/components/learning-roadmaps";
import RemoteJobsHub from "@/components/remote-jobs-hub";
import CodingContest from "@/components/coding-contest";
import ResumePortfolio from "@/components/resume-portfolio";
import HiringChallenges from "@/components/hiring-challenges";
import OpenSourceHub from "@/components/open-source-hub";
import MessagingHub from "@/components/messaging-hub";
import JobAlerts from "@/components/job-alerts";
import { useAppData } from "@/context/AppContext";
import React from "react";
import Link from "next/link";
import {
  Brain, Briefcase, Code2, FileText, GitBranch, Bell,
  MessageSquare, Trophy, Target, TrendingUp, BookOpen,
  Wifi, Mic, Users, Star, ArrowRight, Sparkles, Zap,
  Shield, Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Feature showcase data ────────────────────────────────────────────────────
const FEATURES = [
  { icon: Brain, label: "AI Mock Interview", desc: "4-round full mock — Aptitude, Coding, Face-to-Face & HR with AI scoring", color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-950/30", border: "border-indigo-200" },
  { icon: Target, label: "RoleSense AI", desc: "Discover best-fit roles with skill matching, salary insights & growth paths", color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200" },
  { icon: FileText, label: "Resume Analyser", desc: "ATS score, keyword analysis & AI-powered resume improvement suggestions", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-200" },
  { icon: TrendingUp, label: "Skill Gap Analyzer", desc: "Compare your skills vs job requirements and get a personalized plan", color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-950/30", border: "border-purple-200" },
  { icon: BookOpen, label: "Learning Roadmaps", desc: "Step-by-step AI learning paths for any skill with resources & projects", color: "text-cyan-600", bg: "bg-cyan-50 dark:bg-cyan-950/30", border: "border-cyan-200" },
  { icon: Code2, label: "Coding Contest", desc: "Live code execution with Judge0, timer and AI-generated problems", color: "text-green-600", bg: "bg-green-50 dark:bg-green-950/30", border: "border-green-200" },
  { icon: Trophy, label: "Hiring Challenges", desc: "Real-world company challenges with interview invitation rewards", color: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-950/30", border: "border-yellow-200" },
  { icon: GitBranch, label: "Open Source Hub", desc: "Discover projects to contribute to and showcase your OSS work", color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-950/30", border: "border-violet-200" },
  { icon: Bell, label: "Job Alerts", desc: "Get notified in real-time when matching jobs are posted", color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-950/30", border: "border-orange-200" },
  { icon: MessageSquare, label: "Messaging", desc: "Direct recruiter-candidate chat with real-time WebSocket delivery", color: "text-sky-600", bg: "bg-sky-50 dark:bg-sky-950/30", border: "border-sky-200" },
  { icon: Mic, label: "Expert Speak", desc: "AI-delivered expert conference talks from top tech professionals", color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-950/30", border: "border-rose-200" },
  { icon: Award, label: "Skill Endorsements", desc: "Community-powered skill verification to boost your profile credibility", color: "text-pink-600", bg: "bg-pink-50 dark:bg-pink-950/30", border: "border-pink-200" },
];

const STATS = [
  { value: "20+", label: "AI Features", icon: Sparkles },
  { value: "10k+", label: "Active Jobs", icon: Briefcase },
  { value: "50k+", label: "Job Seekers", icon: Users },
  { value: "5k+", label: "Companies", icon: Shield },
];

// ─── Section wrapper ──────────────────────────────────────────────────────────
const Section = ({ children, alt = false, className = "" }: { children: React.ReactNode; alt?: boolean; className?: string }) => (
  <div className={`${alt ? "bg-secondary/40" : "bg-background"} ${className}`}>
    {children}
  </div>
);

// ─── Divider with label ───────────────────────────────────────────────────────
const SectionDivider = ({ label }: { label: string }) => (
  <div className="flex items-center gap-4 max-w-7xl mx-auto px-4 py-2">
    <div className="flex-1 h-px bg-border" />
    <span className="text-xs font-semibold tracking-widest uppercase opacity-40">{label}</span>
    <div className="flex-1 h-px bg-border" />
  </div>
);

// ─── CTA Banner ───────────────────────────────────────────────────────────────
const CTABanner = ({ title, sub, btnLabel, btnHref, gradient }: { title: string; sub: string; btnLabel: string; btnHref: string; gradient: string }) => (
  <div className={`${gradient} py-14`}>
    <div className="max-w-3xl mx-auto px-4 text-center text-white">
      <h2 className="text-2xl md:text-3xl font-bold mb-3">{title}</h2>
      <p className="opacity-85 mb-6 text-base">{sub}</p>
      <Link href={btnHref}>
        <Button size="lg" variant="secondary" className="gap-2 h-12 px-8 font-semibold">
          {btnLabel} <ArrowRight size={18} />
        </Button>
      </Link>
    </div>
  </div>
);

// ─── Stats bar ────────────────────────────────────────────────────────────────
const StatsBar = () => (
  <div className="border-y bg-background">
    <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
      {STATS.map(({ value, label, icon: Icon }) => (
        <div key={label} className="flex items-center gap-3 justify-center">
          <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
            <Icon size={18} className="text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold leading-tight">{value}</p>
            <p className="text-xs opacity-55">{label}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ─── Features grid ────────────────────────────────────────────────────────────
const FeaturesGrid = () => (
  <div className="max-w-7xl mx-auto px-4 py-16">
    <div className="text-center mb-12">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-blue-50 dark:bg-blue-950/30 mb-4">
        <Zap size={15} className="text-blue-600" />
        <span className="text-sm font-medium">Everything You Need</span>
      </div>
      <h2 className="text-3xl md:text-4xl font-bold mb-3">20 Powerful Features in One Platform</h2>
      <p className="text-lg opacity-65 max-w-2xl mx-auto">
        From AI resume analysis to real-time messaging — NexaHire is the only platform you need to land your dream job.
      </p>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {FEATURES.map(({ icon: Icon, label, desc, color, bg, border }) => (
        <div key={label} className={`p-5 rounded-2xl border-2 ${border} ${bg} hover:shadow-md transition-all hover:-translate-y-0.5 group`}>
          <div className={`h-10 w-10 rounded-xl bg-background flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform`}>
            <Icon size={20} className={color} />
          </div>
          <h3 className="font-bold text-sm mb-1">{label}</h3>
          <p className="text-xs opacity-60 leading-relaxed">{desc}</p>
        </div>
      ))}
    </div>
  </div>
);

// ─── Footer ───────────────────────────────────────────────────────────────────
const Footer = () => (
  <footer className="border-t bg-secondary/30">
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
        {/* Brand */}
        <div className="space-y-3">
          <div className="text-2xl font-bold">
            <span className="text-blue-600">Nexa</span>
            <span className="text-red-500">Hire</span>
          </div>
          <p className="text-sm opacity-60 leading-relaxed">
            AI-powered job portal connecting talent with opportunity. Your career journey starts here.
          </p>
          <div className="flex gap-2 flex-wrap">
            {["AI-Powered", "Free to Use", "Real-time"].map((t) => (
              <span key={t} className="text-xs px-2 py-0.5 rounded-full border bg-background opacity-70">{t}</span>
            ))}
          </div>
        </div>

        {/* Job Seekers */}
        <div>
          <h4 className="font-semibold text-sm mb-3">For Job Seekers</h4>
          <ul className="space-y-2">
            {[
              { label: "Browse Jobs", href: "/jobs" },
              { label: "My Profile", href: "/account" },
              { label: "Skill Gap Analyzer", href: "/skill-gap" },
              { label: "App Tracker", href: "/tracker" },
              { label: "Saved Jobs", href: "/saved" },
            ].map(({ label, href }) => (
              <li key={label}><Link href={href} className="text-sm opacity-60 hover:opacity-100 hover:text-blue-600 transition-colors">{label}</Link></li>
            ))}
          </ul>
        </div>

        {/* Tools */}
        <div>
          <h4 className="font-semibold text-sm mb-3">AI Tools</h4>
          <ul className="space-y-2">
            {[
              { label: "Resume Analyser", href: "/" },
              { label: "Mock Interview", href: "/" },
              { label: "Career Guide", href: "/" },
              { label: "Learning Roadmaps", href: "/" },
              { label: "Coding Contest", href: "/" },
            ].map(({ label, href }) => (
              <li key={label}><Link href={href} className="text-sm opacity-60 hover:opacity-100 hover:text-blue-600 transition-colors">{label}</Link></li>
            ))}
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="font-semibold text-sm mb-3">Company</h4>
          <ul className="space-y-2">
            {[
              { label: "About Us", href: "/about" },
              { label: "Company Insights", href: "/insights" },
              { label: "Interview Questions", href: "/questions" },
              { label: "Experiences", href: "/experiences" },
              { label: "Subscribe", href: "/subscribe" },
            ].map(({ label, href }) => (
              <li key={label}><Link href={href} className="text-sm opacity-60 hover:opacity-100 hover:text-blue-600 transition-colors">{label}</Link></li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
        <p className="text-xs opacity-50">© 2025 NexaHire. Built with ❤️ using Next.js, Node.js & Apache Kafka.</p>
        <div className="flex items-center gap-4">
          {["Privacy Policy", "Terms of Service", "Contact"].map((l) => (
            <span key={l} className="text-xs opacity-50 hover:opacity-100 cursor-pointer transition-opacity">{l}</span>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

// ─── Home Page ────────────────────────────────────────────────────────────────
const Home = () => {
  const { loading, user } = useAppData();
  if (loading) return <Loading />;

  return (
    <div className="min-h-screen">

      {/* 1. Hero */}
      <Hero />

      {/* Stats bar */}
      <StatsBar />

      {/* 2. Features Grid */}
      <Section>
        <FeaturesGrid />
      </Section>

      <SectionDivider label="Your Job Feed" />

      {/* 3. Personalized Feed */}
      <Section alt>
        <PersonalizedFeed />
      </Section>

      {/* CTA — for recruiters */}
      <CTABanner
        title="Are you a Recruiter? Post Jobs for Free"
        sub="Reach thousands of qualified candidates. Create your company profile and start posting jobs today."
        btnLabel="Post a Job"
        btnHref="/dashboard"
        gradient="bg-gradient-to-r from-blue-600 to-blue-800"
      />

      {/* 4. Career Dashboard (only if logged in) */}
      {user && (
        <Section>
          <SectionDivider label="Your Career" />
          <CareerDashboard />
        </Section>
      )}

      <SectionDivider label="AI Tools" />

      {/* 5. RoleSense */}
      <Section alt>
        <Rolesense />
      </Section>

      {/* 6. Skill Gap */}
      <Section>
        <SkillGapAnalyzer />
      </Section>

      {/* 7. Learning Roadmaps */}
      <Section alt>
        <LearningRoadmaps />
      </Section>

      <SectionDivider label="Practice & Compete" />

      {/* 8. NCAT */}
      <Section>
        <NCAT />
      </Section>

      {/* 9. Coding Contest */}
      <Section alt>
        <CodingContest />
      </Section>

      {/* 10. Hiring Challenges */}
      <Section>
        <HiringChallenges />
      </Section>

      {/* CTA — AI Interview */}
      <CTABanner
        title="Ready to Ace Your Next Interview?"
        sub="Practice with our 4-round AI mock interview — Aptitude, Coding, Face-to-Face & HR with real-time feedback."
        btnLabel="Start Mock Interview"
        btnHref="/"
        gradient="bg-gradient-to-r from-indigo-600 to-purple-700"
      />

      {/* 11. Interview Hub */}
      <Section>
        <InterviewHub />
      </Section>

      <SectionDivider label="Resume & Portfolio" />

      {/* 12. Resume Portfolio */}
      <Section alt>
        <ResumePortfolio />
      </Section>

      {/* 13. Resume Analyser */}
      <Section>
        <ResumeAnalyzer />
      </Section>

      {/* 14. Resume Builder */}
      <Section alt>
        <ResumeBuilder />
      </Section>

      <SectionDivider label="Career Growth" />

      {/* 15. Career Guide */}
      <Section>
        <CarrerGuide />
      </Section>

      {/* 16. Expert Speak */}
      <Section alt>
        <ExpertSpeak />
      </Section>

      <SectionDivider label="Community" />

      {/* 17. Open Source Hub */}
      <Section>
        <OpenSourceHub />
      </Section>

      {/* 18. Experiences */}
      <Section alt>
        <ExperiencesSection />
      </Section>

      {/* CTA — Subscribe */}
      <CTABanner
        title="Unlock Premium — Get Noticed First"
        sub="Subscribed applicants appear at the top of recruiter lists. Stand out from 1000s of applicants."
        btnLabel="View Plans"
        btnHref="/subscribe"
        gradient="bg-gradient-to-r from-yellow-500 to-orange-600"
      />

      <SectionDivider label="Stay Connected" />

      {/* 19. Job Alerts */}
      <Section>
        <JobAlerts />
      </Section>

      {/* 20. Messaging */}
      <Section alt>
        <MessagingHub />
      </Section>

      {/* 21. Remote Jobs */}
      <Section>
        <RemoteJobsHub />
      </Section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;
